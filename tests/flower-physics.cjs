'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadPhysics}=require('./light-physics-fixture.cjs');
const h=loadPhysics(),{FlowerPhysics:Physics,FLOWER_WORLD_UNIT:UNIT,FLOWER_PHYSICS_STEP:STEP,FLOWER_PHYSICS_MAX_STEPS:MAX_STEPS,FLOWER_PHYSICS_PAIR_BUDGET:PAIR_BUDGET}=h;
const original=h.original,flowerPath='original/flower/cdy_lxq_01';
function create(data=original){return new Physics(new h.Node(),data,h.random());}
function add(p,id,x,y,band=0,scale=1,impulse={x:0,y:0},key=flowerPath,angle=0){
 p.add(id,key,x*UNIT,y*UNIT,angle,scale,band,impulse);p.sync(id,band,1,true);
}
function circleData(radius=.5){
 return {...original,walls:[],flow:{...original.flow,torqueImpulse:0,layers:original.flow.layers.map(l=>({...l,strength:0}))},
  flowers:{test:{mass:1,autoMass:false,gravityScale:0,constraints:0,fixtures:[{kind:'CircleCollider2D',matrix:[1,0,0,1,0,0],offset:{x:0,y:0},m_Radius:radius,density:1,friction:.1,restitution:0}]}}};
}
function stop(p){for(const s of p.states.values())s.vx=s.vy=s.spin=0;}
function advance(p,seconds,fps=30){for(let i=0;i<Math.round(seconds*fps);i++)p.update(1/fps);}
function capsuleDistance(a,b){
 // Independent sampled geometric check, not the solver's segment algorithm.
 let best=Infinity;const vx=b[2]-b[0],vy=b[3]-b[1],vv=vx*vx+vy*vy;
 for(let k=0;k<=256;k++){const x=a[0]+(a[2]-a[0])*k/256,y=a[1]+(a[3]-a[1])*k/256;
  const t=vv?Math.max(0,Math.min(1,((x-b[0])*vx+(y-b[1])*vy)/vv)):0;best=Math.min(best,Math.hypot(x-b[0]-t*vx,y-b[1]-t*vy));}
 return best;
}

test('all 442 source profiles compile to cached numeric shapes without engine bodies, colliders or per-flower Nodes',()=>{
 const p=create();let count=0;
 for(const [key,profile]of Object.entries(original.flowers)){
  add(p,'shape',0,-2,0,.5,{x:0,y:0},key);const state=p.states.get('shape');
  assert.equal(state.shapes.length,profile.fixtures.length);assert.equal(state.mass,profile.mass);
  assert([...state.world].every(Number.isFinite));const shapes=state.shapes,world=state.world;
  for(let i=0;i<8;i++)p.sync('shape',0,.2+i*.1,true);
  assert.equal(state.world,world,'scale-in changes numbers, never rebuilds a shape array');
  p.remove('shape');add(p,'shape',0,-2,0,.5,{x:0,y:0},key);
  assert.equal(p.states.get('shape').shapes,shapes,'one compiled profile is shared between instances');
  p.remove('shape');count++;
 }
 assert.equal(count,442);assert.equal(p.root.children.length,0);assert.equal(p.root.components.length,0);p.dispose();
});

test('fixed-step flow and interpolated full-circle rotation are consistent at 15, 30 and 60 fps',()=>{
 const samples=[];
 for(const fps of [15,30,60]){
  const data=circleData(.2);data.flow=original.flow;const p=create(data);
  for(let i=0;i<3;i++)add(p,'flow-'+i,i*4,-2,i,1,{x:.2,y:0},'test',i?155:-179);
  for(const s of p.states.values())s.spin=.05;
  advance(p,4,fps);
  const snapshot=()=>[...p.states.values()].map(s=>[s.x,s.y,s.angle,s.vx,s.vy,s.spin]);
  const before=snapshot();p.update(0);p.update(NaN);assert.deepEqual(snapshot(),before);samples.push(before);
  for(const s of p.states.values())assert(Math.hypot(s.vx,s.vy)<=original.flow.layers[s.band].maxSpeed+1e-8);
  p.dispose();
 }
 for(const sample of samples.slice(0,2))for(let i=0;i<sample.length;i++)for(let k=0;k<sample[i].length;k++)assert(Math.abs(sample[i][k]-samples[2][i][k])<1e-8);
});

test('same-depth overlaps separate; flowers at different depths do not collide',()=>{
 function separation(band){const p=create(circleData());add(p,'a',-.2,-2,0,1,{x:0,y:0},'test');add(p,'b',.2,-2,band,1,{x:0,y:0},'test');stop(p);advance(p,1);const distance=Math.hypot(p.pose('a').x-p.pose('b').x,p.pose('a').y-p.pose('b').y)/UNIT;p.dispose();return distance;}
 assert(separation(0)>.99);assert(Math.abs(separation(1)-.4)<1e-8);
});

test('rectangular pool walls contain complete shapes and a resting boundary contact sleeps',()=>{
 const data=circleData();data.walls=original.walls;
 const p=create(data);add(p,'wall',3.7,-2,0,1,{x:.3,y:0},'test');advance(p,5);
 const s=p.states.get('wall');assert(s.maxX<=4.25+1e-6);assert(s.minY>=-7.15-1e-6);assert(s.sleeping);
 const before=p.pose('wall');advance(p,3);assert.deepEqual(p.pose('wall'),before);p.dispose();
});

test('unborn, animated, disabled and deep-layer flowers cannot participate in collisions',()=>{
 const p=create(circleData());p.add('future','test',0,-2*UNIT,0,1,0,{x:.1,y:0});
 p.sync('future',0,1,true,undefined,undefined,.2);p.update(.1);assert.equal(p.pose('future'),null);
 p.update(.1);assert(p.pose('future'));
 p.sync('future',0,1,true,{x:2*UNIT,y:-3*UNIT,angle:155});p.update(.1);assert.equal(p.pose('future'),null);
 p.sync('future',1,1,true,undefined,{x:2*UNIT,y:-3*UNIT,angle:155});p.update(STEP);
 assert(p.pose('future'));assert(Math.abs(p.pose('future').angle-155)<1e-8);
 p.sync('future',3,1,true);p.update(STEP);assert.equal(p.pose('future'),null);
 p.sync('future',0,1,false);p.update(STEP);assert.equal(p.pose('future'),null);p.dispose();
});

test('sleeping contact pairs remain exactly still and removing a neighbour wakes its local contact',()=>{
 const p=create(circleData());add(p,'a',-.2,-2,0,1,{x:0,y:0},'test');add(p,'b',.2,-2,0,1,{x:0,y:0},'test');stop(p);advance(p,3);
 assert([...p.states.values()].every(s=>s.sleeping));const before=[p.pose('a'),p.pose('b')];advance(p,3);
 assert.deepEqual([p.pose('a'),p.pose('b')],before);assert.equal(p.diagnostics.pairChecks,0,'sleeping pairs skip the solver');
 p.remove('b');assert(!p.states.get('a').sleeping);assert.equal(p.pose('b'),null);
 p.data.flow={...p.data.flow,layers:original.flow.layers};p.states.get('a').direction={x:1,y:0};p.states.get('a').nextDirection=Infinity;
 const start=p.pose('a');advance(p,1);assert(p.pose('a').x>start.x+.1);p.dispose();
});

test('collection wakes local neighbours without broadcasting to a distant part of the layer',()=>{
 const p=create(circleData());
 for(let i=0;i<12;i++)add(p,String(i),i*.98,-2,0,1,{x:0,y:0},'test');
 stop(p);advance(p,8);assert([...p.states.values()].every(s=>s.sleeping));
 p.remove('5');
 assert(!p.states.get('4').sleeping&&!p.states.get('6').sleeping);
 assert(p.states.get('0').sleeping&&p.states.get('11').sleeping,'unrelated ends stay asleep');
 for(let i=0;i<30;i++){
  p.update(STEP);
  for(const s of p.states.values())assert(s.wakeDepth<=2,'ordinary wake propagation is bounded');
  assert(p.states.get('0').sleeping&&p.states.get('11').sleeping);
 }
 p.dispose();
});

test('foreground work retains its own budget when the lower layer is overloaded',()=>{
 const p=create(circleData(.3)),budgets=h.FLOWER_PHYSICS_FINE_BUDGETS;
 add(p,'front-a',-.1,-2,0,1,{x:0,y:0},'test');add(p,'front-b',.1,-2,0,1,{x:0,y:0},'test');
 for(let i=0;i<120;i++)add(p,'background-'+i,0,-2,2,1,{x:0,y:0},'test');stop(p);
 for(let frame=0;frame<60;frame++){
  p.update(1/30);const d=p.diagnostics;
  d.fineByBand.forEach((n,band)=>assert(n<=budgets[band]*d.steps));
  assert(d.pairChecks<=PAIR_BUDGET*d.steps);
 }
 assert(Math.abs(p.pose('front-a').x-p.pose('front-b').x)/UNIT>.59,'foreground separates while background remains bounded');
 p.dispose();
});

test('pure translation reuses local geometry and defers world coordinates until narrow phase needs them',()=>{
 const p=create(circleData(.2));add(p,'moving',0,-2,0,1,{x:.2,y:0},'test');
 const s=p.states.get('moving'),local=s.local,world=s.world,oldMin=s.minX;
 p.update(STEP);
 assert(s.minX>oldMin);assert.equal(p.diagnostics.geometryBuilds,0);assert.equal(p.diagnostics.worldSyncs,0);
 assert(s.worldDirty);p.ensureWorld(s);assert.equal(s.world[0],s.local[0]+s.x);
 assert.equal(s.local,local);assert.equal(s.world,world);
 s.spin=.05;p.update(STEP);assert.equal(p.diagnostics.geometryBuilds,1,'rotation invalidates cached geometry');
 p.dispose();
});

test('idle lower contact work is staggered while motion still integrates every fixed step',()=>{
 const p=create(circleData(.1));
 for(let band=0;band<3;band++)add(p,String(band),0,band*4,band,1,{x:.1,y:0},'test');
 advance(p,1);const starts=[...p.states.values()].map(s=>s.x),visits=[0,0,0];
 for(let i=0;i<6;i++){p.update(STEP);p.diagnostics.sourcesByBand.forEach((count,band)=>{if(count)visits[band]++;});}
 assert.deepEqual(visits,[6,3,2]);[...p.states.values()].forEach((s,i)=>assert(s.x>starts[i]));p.dispose();
});

test('a tiny allowed overlap rests unchanged but a visible interpenetration still separates',()=>{
 const p=create(circleData());add(p,'a',-.497,-2,0,1,{x:0,y:0},'test');add(p,'b',.497,-2,0,1,{x:0,y:0},'test');stop(p);
 const before=[p.pose('a'),p.pose('b')];advance(p,2);assert.deepEqual([p.pose('a'),p.pose('b')],before);
 assert([...p.states.values()].every(s=>s.sleeping));p.dispose();
});

test('display smoothing follows collision corrections without feeding back into logical positions',()=>{
 const p=create(circleData());add(p,'a',-.2,-2,0,1,{x:0,y:0},'test');add(p,'b',.2,-2,0,1,{x:0,y:0},'test');stop(p);
 p.update(STEP);const s=p.states.get('a'),logic=s.x,start=p.pose('a').x;
 p.update(STEP/2);const target=(s.previous.x+s.x)/2*UNIT,display=p.pose('a');
 assert.equal(s.x,logic,'render-only update cannot alter collision coordinates');
 assert(display.x<start&&display.x>target,'display gradually follows the discrete correction');
 assert.deepEqual(p.pose('a'),display,'reading a pose does not advance its filter');
 advance(p,3);assert(Math.abs(p.pose('a').x-s.x*UNIT)<1e-8);p.dispose();
});

test('crossing, collinear and coincident capsules separate without seam torque or NaN normals',()=>{
 for(const angles of [[0,0],[45,-45],[90,90]]){
  const data=circleData();data.flowers.test.fixtures=[{kind:'CapsuleCollider2D',matrix:[1,0,0,1,0,0],offset:{x:0,y:0},m_Size:{x:3,y:.4},m_Direction:1,density:1,friction:.1,restitution:0}];
  const p=create(data);add(p,'a',0,-2,0,1,{x:0,y:0},'test',angles[0]);add(p,'b',0,-2,0,1,{x:0,y:0},'test',angles[1]);stop(p);advance(p,3);
  const a=p.states.get('a'),b=p.states.get('b');p.ensureWorld(a);p.ensureWorld(b);assert([...a.world,...b.world].every(Number.isFinite));
  assert(capsuleDistance(a.world,b.world)>=.39);assert.equal(a.angle,angles[0]);assert.equal(b.angle,angles[1]);p.dispose();
 }
});

test('projection does not repeatedly wake resting neighbours, but scale growth still wakes and separates them',()=>{
 const p=create(circleData());add(p,'a',-.2,-2,0,1,{x:0,y:0},'test');add(p,'b',.2,-2,0,1,{x:0,y:0},'test');stop(p);advance(p,3);
 const a=p.states.get('a'),b=p.states.get('b');assert(a.sleeping&&b.sleeping);
 const rest=p.pose('a');p.wake(b);p.translate(b,-.03,0);p.update(STEP);
 assert(a.sleeping,'constraint correction alone cannot restart a settled contact');
 assert.deepEqual(p.pose('a'),rest);advance(p,2);assert(b.sleeping);
 p.sync('b',0,1.5,true);p.update(STEP);
 assert(!a.sleeping,'real shape growth wakes the resting neighbour');advance(p,4);
 assert(Math.hypot(a.x-b.x,a.y-b.y)>=1.24,'the larger shape still separates');
 assert(a.sleeping&&b.sleeping);p.dispose();
});

test('a compressed contact group balances opposite neighbours and rests without seesawing',()=>{
 const p=create(circleData());
 for(const [id,x]of [['left',-.6],['centre',0],['right',.6]])add(p,id,x,-2,0,1,{x:0,y:0},'test');
 stop(p);advance(p,5);
 assert([...p.states.values()].every(s=>s.sleeping));
 const poses=['left','centre','right'].map(id=>p.pose(id));
 assert(Math.abs(poses[1].x/UNIT)<.02,'opposite contacts balance instead of kicking the centre between them');
 assert((poses[1].x-poses[0].x)/UNIT>.94&&(poses[2].x-poses[1].x)/UNIT>.94,'dense allowance cannot hide a large overlap');
 for(let i=0;i<90;i++){p.update(STEP);assert.deepEqual(['left','centre','right'].map(id=>p.pose(id)),poses);}
 p.dispose();
});

test('the original rose/lily overlap regression separates and settles at the pool corner at every tested fps',()=>{
 const data={...original,flow:{...original.flow,torqueImpulse:0,layers:original.flow.layers.map(l=>({...l,strength:0}))}};
 for(const fps of [15,30,60])for(const variant of [1,2,3]){
  const p=create(data);add(p,'rose',-2.8,-5.8,0,1.1,{x:0,y:0},'original/flower/zy_lmg_0'+variant,155);
  add(p,'lily',-2.7,-5.7,0,1,{x:0,y:0},'original/flower/cdtx_sl_0'+variant,-155);stop(p);advance(p,6,fps);
  const a=p.states.get('rose'),b=p.states.get('lily');assert(a.sleeping&&b.sleeping);
  assert(Math.hypot(a.x-b.x,a.y-b.y)>1.5);const before=[p.pose('rose'),p.pose('lily')];advance(p,3,fps);
  assert.deepEqual([p.pose('rose'),p.pose('lily')],before);p.dispose();
 }
});

test('compound flower heads and stems separate without alternating ownership in 435 original shape pairs',()=>{
 const keys=Object.keys(original.flowers),pairs=keys.filter(k=>original.flowers[k].fixtures.length>1).map(k=>[k,k]),random=h.random();
 for(let i=0;i<400;i++)pairs.push([keys[Math.floor(random()*keys.length)],keys[Math.floor(random()*keys.length)]]);
 for(const pair of pairs){
  const p=create();try{
   for(let j=0;j<2;j++)add(p,String(j),-2.5+j*.01,-5+j*.01,0,1,{x:0,y:0},pair[j],j?155:-155);
   let reversals=0,maxJump=0,last;
   for(let frame=0;frame<600;frame++){
    const before=[p.pose('0'),p.pose('1')];p.update(STEP);
    if(frame<510)continue;
    const a=p.pose('0'),b=p.pose('1'),dx=(a.x-b.x)-(before[0].x-before[1].x),dy=(a.y-b.y)-(before[0].y-before[1].y),jump=Math.hypot(dx,dy);
    maxJump=Math.max(maxJump,jump);if(last&&last.dx*dx+last.dy*dy<0&&jump>.1)reversals++;last={dx,dy};
   }
   assert(!(reversals>5&&maxJump>1),'sustained pair jitter: '+pair.join(' / '));
   const a=p.states.get('0'),b=p.states.get('1');p.ensureWorld(a);p.ensureWorld(b);
   for(let i=0;i<a.world.length;i+=5)for(let j=0;j<b.world.length;j+=5)
    assert(capsuleDistance(a.world.subarray(i,i+5),b.world.subarray(j,j+5))>=a.world[i+4]+b.world[j+4]-.01,
     'must separate the actual fixtures, rather than freeze interpenetration: '+pair.join(' / '));
  }finally{p.dispose();}
 }
 assert.equal(pairs.length,435);
});

test('large frame stalls cannot cause an unbounded catch-up or ignore birth deadlines',()=>{
 const p=create(circleData(.15));for(let i=0;i<200;i++)add(p,'pile-'+i,0,-2,0,1,{x:0,y:0},'test');
 p.add('deadline','test',2*UNIT,-2*UNIT,0,1,1,{x:0,y:0});p.sync('deadline',1,1,true,undefined,undefined,4);
 p.update(5);assert(p.pose('deadline'),'birth readiness uses elapsed time even when integration is capped');
 assert.equal(p.diagnostics.steps,MAX_STEPS);assert(p.diagnostics.pairChecks<=PAIR_BUDGET*MAX_STEPS);
 for(const s of p.states.values())assert([s.x,s.y,s.angle,s.vx,s.vy].every(Number.isFinite));p.dispose();
});

test('spatial hashing culls distant pairs and keeps allocated body arrays during repeated updates',()=>{
 const p=create(circleData(.1)),n=400;
 for(let i=0;i<n;i++)add(p,String(i),(i%20)*1.5,Math.floor(i/20)*1.5,0,1,{x:.05,y:0},'test');
 const arrays=[...p.states.values()].map(s=>s.world);p.update(STEP);
 assert(p.diagnostics.pairChecks<n*20,'distributed scene must not scan the quadratic body-pair table');
 assert.equal(p.diagnostics.shapeChecks,0,'non-overlapping AABBs skip capsule distance tests');
 advance(p,1);[...p.states.values()].forEach((s,i)=>assert.equal(s.world,arrays[i]));p.dispose();
});

test('linear impulses do not spin offset shapes and projection preserves the centre of mass',()=>{
 const data=circleData();data.flowers.test.mass=2;data.flowers.test.fixtures[0].matrix[4]=.4;
 const p=create(data);add(p,'a',-.2,-2,0,1,{x:0,y:.3},'test');add(p,'b',.2,-2,0,1,{x:0,y:0},'test');
 assert.equal(p.states.get('a').spin,0);assert(Math.abs(p.states.get('a').vy-.15)<1e-9);stop(p);
 const x=p.states.get('a').x+p.states.get('b').x;advance(p,1);
 assert(Math.abs(p.states.get('a').x+p.states.get('b').x-x)<1e-8);assert.equal(p.states.get('a').spin,0);p.dispose();
});

test('Creator production transforms retain the numeric Map iteration and full-circle pose interpolation',()=>{
 const production=loadPhysics({production:true}),p=new production.FlowerPhysics(new production.Node(),circleData(),production.random());
 p.add('turn','test',0,-2*UNIT,179,1,0,{x:.1,y:0});p.sync('turn',0,1,true);const s=p.states.get('turn');s.spin=.1;
 p.update(STEP*1.5);const pose=p.pose('turn'),delta=((s.angle-s.previous.angle+540)%360)-180;
 assert(Math.abs(pose.angle-(s.previous.angle+delta*.5))<1e-8);assert(pose.x!==0);p.dispose();
});

test('scene disposal and repeated removal leave no simulated objects or engine components',()=>{
 const p=create(circleData());add(p,'x',0,-2,0,1,{x:0,y:0},'test');p.update(STEP);p.remove('x');p.remove('x');
 assert.equal(p.pose('x'),null);p.dispose();p.update(1);assert.equal(p.root.isValid,false);assert.equal(p.diagnostics.bodies,0);
 assert.throws(()=>add(p,'x',0,-2,0,1,{x:0,y:0},'test'),/disposed/);
});

test('the effective project feature set excludes the engine physics implementation',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../settings/v2/packages/engine.json'))).modules.configs.defaultConfig;
 assert.equal(config.cache['physics-2d']._value,false);assert.equal(config.cache['physics-2d-box2d']._value,false);
 assert(!config.includeModules.some(name=>name.startsWith('physics-2d')));
});
