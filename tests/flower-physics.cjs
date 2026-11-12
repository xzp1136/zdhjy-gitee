const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ts=require('./typescript.cjs'),resource=require('./resource-file.cjs');
class Node {
 constructor(name='Root'){Object.assign(this,{name,children:[],components:[],active:true,isValid:true,position:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},angle:0});}
 addChild(n){n.parent=this;this.children.push(n);}
 addComponent(T){const c=new T();c.node=this;this.components.push(c);return c;}
 getComponent(T){return this.components.find(c=>c instanceof T)||null;}
 get activeInHierarchy(){return this.active&&(!this.parent||this.parent.activeInHierarchy);}
 setPosition(x,y,z=0){this.position={x,y,z};}
 setScale(x,y,z=1){this.scale={x,y,z};}
 destroy(){this.isValid=false;for(const n of this.children)n.destroy();}
}
const cc=require('./physics-cc.cjs')(Node),scope={exports:{},require(n){if(n==='cc')return cc;if(n==='./FlowerAssets')return {};throw Error(n);}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(process.env.FLOWER_PHYSICS_SOURCE||path.join(__dirname,'../assets/scripts/FlowerPhysics.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,scope);
const {FlowerPhysics:Physics,FLOWER_WORLD_UNIT:UNIT}=scope.exports,original=JSON.parse(fs.readFileSync(resource('original/data/flower-runtime-physics.json'),'utf8'));
const flowerPath='original/flower/cdy_lxq_01';
const random=()=>{let s=123456;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
function create(data=original){return new Physics(new Node(),data,random());}
function add(p,id,x,y,band=0,scale=1,impulse={x:0,y:0},key=flowerPath){p.add(id,key,x*UNIT,y*UNIT,0,1,band,impulse);p.sync(id,band,scale,true);}
const circleData=()=>({...original,flowers:{test:{mass:1,autoMass:false,gravityScale:0,constraints:0,fixtures:[{kind:'CircleCollider2D',matrix:[1,0,0,1,0,0],offset:{x:0,y:0},m_Radius:.5,density:1,friction:.1,restitution:0}]}}});
test('every exported collider attaches to its own native body and keeps explicit original mass',()=>{
 const p=create();let i=0,total=0;
 for(const [key,profile] of Object.entries(original.flowers)){
  const id=String(i++);add(p,id,(i%25)*8,Math.floor(i/25)*8,0,1,{x:.2,y:0},key);p.update(.02);
  const state=p.states.get(id);const components=profile.fixtures.reduce((count,f)=>{
   if(f.kind!=='CapsuleCollider2D')return count+1;
   const [a,b,c,d]=f.matrix,w=f.m_Size.x*Math.hypot(a,b),h=f.m_Size.y*Math.hypot(c,d);
   return count+((f.m_Direction===0?h>w:w>h)?3:1);
  },0);assert.equal(state.colliders.length,components);
  for(const c of state.colliders){assert.equal(c.node,state.body.node);assert.equal(c.rb,state.body);assert(c.fixtures.length);assert(Math.abs(c.friction-.1)<1e-7);}
  assert(Math.abs(state.body.getMass()-1)<1e-5);total+=profile.fixtures.length;p.remove(id);
 }
 assert.equal(i,442);assert.equal(total,480);p.dispose();assert.equal(cc.bodies.size,0);
});
test('fixed-step native flow is stable at 15, 30 and 60 render fps and pauses exactly',()=>{
 const samples=[];
 for(const fps of [15,30,60]){
  const p=create();add(p,'a',-1,-2,0);add(p,'b',1,-3,1);add(p,'c',0,-5,2);add(p,'hidden',0,-2,3);
  for(let i=0;i<fps*4;i++)p.update(1/fps);
  const snapshot=()=>[...p.states.values()].map(s=>[s.node.position.x,s.node.position.y,s.node.angle,s.body.linearVelocity.x,s.body.linearVelocity.y]);
  const before=snapshot();p.update(0);assert.deepEqual(snapshot(),before);samples.push(before);
  for(const s of p.states.values())if(s.active){assert(Math.abs(s.body.getMass()-1)<1e-5);assert(Math.hypot(s.body.linearVelocity.x,s.body.linearVelocity.y)<=original.flow.layers[s.band].maxSpeed+1e-6);}
  assert.equal(p.states.get('hidden').active,false);p.dispose();
 }
 for(const sample of samples.slice(0,2))for(let i=0;i<sample.length;i++)for(let k=0;k<sample[i].length;k++)assert(Math.abs(sample[i][k]-samples[2][i][k])<1e-7);
});
test('original layer masks separate depths; same-depth bodies resolve contact and walls contain bodies',()=>{
 function overlap(band){const p=create(circleData());add(p,'a',-.2,-2,0,1,{x:0,y:0},'test');add(p,'b',.2,-2,band,1,{x:0,y:0},'test');for(let i=0;i<10;i++)p.update(.02);const a=p.pose('a'),b=p.pose('b'),d=Math.hypot(a.x-b.x,a.y-b.y)/UNIT;p.dispose();return d;}
 assert(overlap(0)>.95);assert(overlap(1)<.5,'different depth bodies may overlap');
 const p=create(circleData());add(p,'wall',3.7,-2,0,1,{x:1,y:0},'test');for(let i=0;i<300;i++)p.update(.02);const pose=p.pose('wall');assert(pose.x/UNIT<=3.76);p.remove('wall');p.update(.02);assert.equal(p.pose('wall'),null);p.dispose();
});
test('animated or unborn bodies cannot collide; registration restores the source minimum drift once',()=>{
 const p=create();p.add('a',flowerPath,0,-2*UNIT,0,1,0,{x:0,y:0});p.sync('a',0,1,true,undefined,undefined,.2);p.update(.1);assert.equal(p.pose('a'),null);
 p.sync('a',0,1,true,undefined,undefined,.2);p.update(.14);const s=p.states.get('a');assert(s.active);const speed=Math.hypot(s.body.linearVelocity.x,s.body.linearVelocity.y);assert(speed>=.049&&speed<=.12);
 p.sync('a',0,1,true,{x:0,y:-2*UNIT,angle:0});p.update(.1);assert.equal(p.pose('a'),null);assert.equal(s.body.impl.IsActive(),false);p.dispose();
});

test('project enables both the Box2D selector and the actual exported physics modules',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../settings/v2/packages/engine.json'),'utf8')).modules.configs.defaultConfig;
 assert.equal(config.cache['physics-2d']._value,true);
 assert.equal(config.cache['physics-2d']._option,'physics-2d-box2d');
 assert.equal(config.cache['physics-2d-box2d']._value,true);
 assert(config.includeModules.includes('physics-2d-framework'),'PhysicsSystem2D must be exported to cc');
 assert(config.includeModules.includes('physics-2d-box2d'),'native Box2D implementation must be linked');
});

function confinedData(){
 const data=circleData();data.walls=[];
 for(const [x,y,w,h] of [[-.61,-2,.2,1.42],[.61,-2,.2,1.42],[0,-2.61,1.42,.2],[0,-1.39,1.42,.2]])
  data.walls.push({kind:'BoxCollider2D',matrix:[1,0,0,1,x,y],offset:{x:0,y:0},m_Size:{x:w,y:h},density:1,friction:.4,restitution:0});
 return data;
}
test('a flower confined by contacts settles instead of being re-kicked forever; removing a blocker wakes it',()=>{
 const p=create(confinedData());add(p,'jammed',0,-2,0,1,{x:.2,y:0},'test');
 for(let i=0;i<600;i++)p.update(.02);
 const s=p.states.get('jammed');assert.equal(s.body.isAwake(),false,'constrained flower must reach a real native sleep state');
 const before=p.pose('jammed');for(let i=0;i<150;i++)p.update(.02);const after=p.pose('jammed');
 assert(Math.hypot(after.x-before.x,after.y-before.y)<1e-6,'sleeping flower does not visibly vibrate');
 const boundary=p.root.children.find(n=>n.name==='OriginalWaterBoundary');boundary.active=false;
 p.update(.02);assert.equal(s.body.isAwake(),true,'the contact ending releases a resting flower');
 const released=p.pose('jammed');for(let i=0;i<100;i++)p.update(.02);const moved=p.pose('jammed');
 assert(Math.hypot(moved.x-released.x,moved.y-released.y)>.1,'water flow resumes when there is space');p.dispose();
});

function crowdedGroup(){
 const data={...original,walls:[]};
 for(const [x,y,w,h] of [[-3.6,-2,.2,2.7],[3.6,-2,.2,2.7],[0,-3.35,7.4,.2],[0,-.65,7.4,.2]])
  data.walls.push({kind:'BoxCollider2D',matrix:[1,0,0,1,x,y],offset:{x:0,y:0},m_Size:{x:w,y:h},density:1,friction:.4,restitution:0});
 const p=create(data);
 for(let i=0;i<3;i++)add(p,'sun-'+i,(i-1)*2.3,-2,0,1,{x:.2,y:0},'original/flower/cdtx_xrk_01');
 return p;
}
test('crowded near-round capsules settle without sustained positional-solver rocking at 15, 30 and 60 fps',()=>{
 for(const fps of [15,30,60]){
  const p=crowdedGroup();let variation=0,previous=[];
  for(let frame=0;frame<fps*18;frame++){
   p.update(1/fps);const poses=[0,1,2].map(n=>p.pose('sun-'+n));
   if(frame>fps*15)for(let n=0;n<3;n++)variation+=Math.abs(poses[n].angle-previous[n].angle);
   previous=poses;
  }
  assert(variation<1,`${fps}fps: last three seconds must not accumulate back-and-forth rotation (${variation})`);
  assert([...p.states.values()].every(s=>!s.body.isAwake()),'native rigid bodies sleep, rather than freezing only the pictures');p.dispose();
 }
});
test('removing a flower releases its resting neighbours, and incoming motion cancels rest',()=>{
 const p=crowdedGroup();for(let i=0;i<900;i++)p.update(.02);
 assert([...p.states.values()].every(s=>s.resting));
 const left=p.states.get('sun-0'),right=p.states.get('sun-2');p.remove('sun-1');
 left.direction=new cc.Vec2(1,0);left.nextDirection=Infinity;right.direction=new cc.Vec2(-1,0);right.nextDirection=Infinity;p.update(.02);
 assert(!left.resting&&!right.resting,'contact topology change clears their rest state');
 const start=p.pose('sun-0');for(let i=0;i<200;i++)p.update(.02);const end=p.pose('sun-0');
 assert(Math.hypot(end.x-start.x,end.y-start.y)>.1,'released neighbour resumes actual movement');
 right.resting=true;right.quietTime=2;right.body.linearVelocity=new cc.Vec2(-.4,0);p.update(.02);
 assert(!right.resting,'meaningful physical motion cancels rest even if neighbours are unchanged');p.dispose();
});

test('native sleeping bodies are not awakened by the periodic water impulse',()=>{
 const p=create(circleData());add(p,'sleeping',0,-2,0,1,{x:0,y:0},'test');p.update(.02);
 const state=p.states.get('sleeping');state.body.sleep();state.resting=false;state.direction=new cc.Vec2(1,0);
 p.update(.02);const before=p.pose('sleeping');
 for(let i=0;i<100;i++)p.update(.02);
 assert.equal(state.body.isAwake(),false,'call the Creator isAwake() method; a function reference is always truthy');
 assert.deepEqual(p.pose('sleeping'),before);p.dispose();
});
test('render interpolation follows native world rotation even with an old angle cache',()=>{
 const p=create(circleData());add(p,'turning',0,-2,0,1,{x:0,y:0},'test');p.update(.02);
 const state=p.states.get('turning');state.body.angularVelocity=.8;const start=state.node.eulerAngles.z;
 p.update(.03);const native=state.body.impl.GetAngle()*180/Math.PI;
 assert(native>start+.5,'native body actually rotates');
 assert.equal(state.node.angle,start,'Creator angle getter retains its old Euler cache after world-rotation writes');
 const visual=p.pose('turning');
 assert(Math.abs(visual.angle-(start+native)/2)<1e-7,'rendered angle interpolates the real collision-body rotation');
 assert(Math.abs(state.node.eulerAngles.z-native)<1e-7);p.dispose();
});

test('full-circle native rotation stays aligned with art across both Euler folds and the 180-degree seam',()=>{
 const difference=(a,b)=>Math.abs(((a-b+540)%360)-180);
 for(const angle of [-179,-155,-91,-89,89,91,155,179]){
  const p=create(circleData());p.add('turn','test',0,-2*UNIT,angle,1,0,{x:0,y:0});p.sync('turn',0,1,true);p.update(.02);
  const state=p.states.get('turn');state.body.angularVelocity=1;
  for(let frame=0;frame<90;frame++){
   p.update(1/30);const actual=state.body.impl.GetAngle()*180/Math.PI,alpha=p.accumulator/.02;
   const expected=state.previous.angle+(((actual-state.previous.angle+540)%360)-180)*alpha;
   assert(difference(p.pose('turn').angle,expected)<1e-6,`${angle}: art must follow native quaternion, without an Euler fold`);
  }
  p.dispose();
 }
});
test('original linear impulses act through the real mass centre of an offset collider, without incidental torque',()=>{
 const data=circleData();data.flowers.test.fixtures[0].matrix[4]=.4;
 const p=create(data);p.add('offset','test',0,-2*UNIT,155,1,0,{x:0,y:.3});p.sync('offset',0,1,true);p.update(.02);
 const state=p.states.get('offset');assert(Math.abs(state.body.angularVelocity)<1e-10,'spawn AddForce impulse produces no torque');
 state.body.angularVelocity=0;state.body.linearVelocity=new cc.Vec2();state.direction=new cc.Vec2(0,1);state.nextDirection=Infinity;
 // Bypass the separately intentional random torque; inspect only the flow force.
 p.random=()=>1;p.flowIndex=1;p.flow();
 assert(state.body.linearVelocity.y>0,'original water force is still applied');
 assert(Math.abs(state.body.angularVelocity)<1e-10,'water force also goes through the actual mass centre');p.dispose();
});

test('overlapping original blue rose and water-lily bodies separate and settle at pool corner without locking rotation',()=>{
 const data={...original,flow:{...original.flow,torqueImpulse:0,layers:original.flow.layers.map(layer=>({...layer,strength:0}))}};
 for(const fps of [15,30,60])for(const variant of [1,2,3]){
  const p=create(data);
  p.add('rose',`original/flower/zy_lmg_0${variant}`,-2.8*UNIT,-5.8*UNIT,155,1.1,0,{x:0,y:0});p.sync('rose',0,1,true);
  p.add('lily',`original/flower/cdtx_sl_0${variant}`,-2.7*UNIT,-5.7*UNIT,-155,1,0,{x:0,y:0});p.sync('lily',0,1,true);
  for(let i=0;i<fps*30;i++)p.update(1/fps);
  const a=p.states.get('rose'),b=p.states.get('lily'),separation=Math.hypot(a.node.position.x-b.node.position.x,a.node.position.y-b.node.position.y)/32;
  assert(separation>1.5,`${fps}fps variant ${variant}: original same-depth fixtures must separate (${separation})`);
  for(const s of [a,b]){
   assert.equal(s.body.fixedRotation,false,'natural collision rotation remains enabled');
   assert.equal(s.body.isAwake(),false,`${fps}fps variant ${variant} must eventually sleep without an external force`);
  }
  const before=[p.pose('rose'),p.pose('lily')];for(let i=0;i<fps*3;i++)p.update(1/fps);
  assert.deepEqual([p.pose('rose'),p.pose('lily')],before,'the settled pair does not continue spinning');p.dispose();
 }
});
