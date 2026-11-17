const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ts=require('./typescript.cjs'),resource=require('./resource-file.cjs');
class Node {
 constructor(name='Root'){Object.assign(this,{name,children:[],active:true,isValid:true});}
 addChild(node){node.parent=this;this.children.push(node);}
 destroy(){this.isValid=false;for(const node of this.children)node.destroy();}
}
const cc={Node,JsonAsset:class{}},source=fs.readFileSync(process.env.FLOWER_PHYSICS_SOURCE||path.join(__dirname,'../assets/scripts/FlowerPhysics.ts'),'utf8');
const scope={exports:{},require(name){if(name==='cc')return cc;if(name==='./FlowerAssets')return {};throw Error(name);}};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,scope);
const {FlowerPhysics:Physics,FLOWER_WORLD_UNIT:UNIT}=scope.exports;
const original=JSON.parse(fs.readFileSync(resource('original/data/flower-runtime-physics.json'),'utf8'));
const flowerPath='original/flower/cdy_lxq_01';
const random=()=>{let seed=123456;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
function create(data=original){return new Physics(new Node(),data,random());}
function add(world,id,x,y,band=0,scale=1,impulse={x:0,y:0},key=flowerPath){world.add(id,key,x*UNIT,y*UNIT,0,1,band,impulse);world.sync(id,band,scale,true);}
function circleData(){
 const data=JSON.parse(JSON.stringify(original));
 data.flowers={test:{mass:1,autoMass:false,gravityScale:0,constraints:0,fixtures:[{kind:'CircleCollider2D',matrix:[1,0,0,1,0,0],offset:{x:0,y:0},m_Radius:.5,density:1,friction:.1,restitution:0}]}};
 return data;
}

test('all source fixtures become logical AABBs without native physics components',()=>{
 assert(!/\b(PhysicsSystem2D|RigidBody2D|BoxCollider2D|CircleCollider2D|PolygonCollider2D)\b[^'"`]/.test(source.split('\n')[0]),'cc import must not link a physics class');
 const world=create();let index=0;
 for(const key of Object.keys(original.flowers)){
  const id=String(index++);add(world,id,(index%25)*8,Math.floor(index/25)*8,0,1,{x:0,y:0},key);
  const state=world.states.get(id);assert(state.local.maxX>state.local.minX);assert(state.local.maxY>state.local.minY);
 }
 assert.equal(index,442);assert.equal(world.root.children.length,0,'flowers do not allocate hidden simulation nodes');world.dispose();
});

test('fixed-step AABB motion is identical at 15, 30 and 60 render fps and pauses exactly',()=>{
 const samples=[];
 for(const fps of [15,30,60]){
  const world=create();add(world,'a',-1,-2,0);add(world,'b',1,-3,1);add(world,'c',0,-5,2);add(world,'hidden',0,-2,3);
  for(let i=0;i<fps*4;i++)world.update(1/fps);
  const snapshot=()=>[...world.states.values()].map(s=>[s.x,s.y,s.angle,s.vx,s.vy]);
  const before=snapshot();world.update(0);assert.deepEqual(snapshot(),before);samples.push(before);
  for(const state of world.states.values())if(state.active)assert(Math.hypot(state.vx,state.vy)<=original.flow.layers[state.band].maxSpeed+1e-6);
  assert.equal(world.states.get('hidden').active,false);world.dispose();
 }
 for(const sample of samples.slice(0,2))for(let i=0;i<sample.length;i++)for(let k=0;k<sample[i].length;k++)assert(Math.abs(sample[i][k]-samples[2][i][k])<1e-7);
});

test('same-depth AABBs separate, different depths overlap, and static AABB walls contain flowers',()=>{
 function overlap(band){const world=create(circleData());add(world,'a',-.2,-2,0,1,{x:0,y:0},'test');add(world,'b',.2,-2,band,1,{x:0,y:0},'test');for(let i=0;i<10;i++)world.update(.02);const a=world.pose('a'),b=world.pose('b'),distance=Math.hypot(a.x-b.x,a.y-b.y)/UNIT;world.dispose();return distance;}
 assert(overlap(0)>.95);assert(overlap(1)<.5,'different visual depths do not collide');
 const world=create(circleData());add(world,'wall',3.7,-2,0,1,{x:1,y:0},'test');for(let i=0;i<300;i++)world.update(.02);
 assert(world.pose('wall').x/UNIT<=3.76);world.remove('wall');assert.equal(world.pose('wall'),null);world.dispose();
});

test('animated and unborn flowers stay outside the collision world until their resume time',()=>{
 const world=create();world.add('a',flowerPath,0,-2*UNIT,0,1,0,{x:0,y:0});world.sync('a',0,1,true,undefined,undefined,.2);
 world.update(.1);assert.equal(world.pose('a'),null);world.sync('a',0,1,true,undefined,undefined,.2);world.update(.14);
 const state=world.states.get('a');assert(state.active);assert(Math.hypot(state.vx,state.vy)>=.049);
 world.sync('a',0,1,true,{x:0,y:-2*UNIT,angle:0});world.update(.1);assert.equal(world.pose('a'),null);assert.equal(state.active,false);world.dispose();
});

test('project excludes Box2D and the complete 2D physics feature from builds',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../settings/v2/packages/engine.json'),'utf8')).modules.configs.defaultConfig;
 assert.equal(config.cache['physics-2d']._value,false);assert.equal(config.cache['physics-2d-box2d']._value,false);
 assert(!config.includeModules.some(name=>name.startsWith('physics-2d')));
});

test('large active sets use depth-aware spatial hashing and remain bounded',()=>{
 const data=circleData(),world=create(data),count=300;
 for(let i=0;i<count;i++)add(world,String(i),(i%20)*.32-3,(Math.floor(i/20)%12)*.32-5,i%3,1,{x:0,y:0},'test');
 for(let i=0;i<30;i++)world.update(.02);
 for(const state of world.states.values()){
  assert(Number.isFinite(state.x)&&Number.isFinite(state.y));
  const pose=world.pose(state.id);assert(Math.abs(pose.x/UNIT)<5.2);assert(pose.y/UNIT>-8&&pose.y/UNIT<3);
 }
 world.dispose();
});

test('a crowded AABB group settles without visible solver jitter',()=>{
 const data=circleData();data.flow.torqueImpulse=0;
 data.walls=[];for(const [x,y,w,h] of [[-1.6,-2,.2,3.2],[1.6,-2,.2,3.2],[0,-3.6,3.4,.2],[0,-.4,3.4,.2]])
  data.walls.push({kind:'BoxCollider2D',matrix:[1,0,0,1,x,y],offset:{x:0,y:0},m_Size:{x:w,y:h},density:1,friction:.4,restitution:0});
 const world=create(data);let id=0;
 for(let row=0;row<3;row++)for(let column=0;column<3;column++)add(world,String(id++),(column-1)*.88,-2+(row-1)*.88,0,1,{x:0,y:0},'test');
 for(let frame=0;frame<600;frame++)world.update(.02);
 let travel=0,previous=[...world.states.values()].map(state=>({x:state.x,y:state.y}));
 for(let frame=0;frame<150;frame++){
  world.update(.02);const current=[...world.states.values()];
  current.forEach((state,index)=>travel+=Math.hypot(state.x-previous[index].x,state.y-previous[index].y));
  previous=current.map(state=>({x:state.x,y:state.y}));
 }
 assert(travel*UNIT<1,'settled crowded flowers should not visibly vibrate');
 assert([...world.states.values()].every(state=>state.resting));world.dispose();
});
