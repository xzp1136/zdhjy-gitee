const resourceFile = require('./resource-file.cjs');
// Headless input/motion regressions: actual FlowerPool and original shape fixtures.
// Cocos transforms/events are stubbed; rendered appearance still needs preview checks.
const test = require('node:test');
const path = require('node:path');
const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const ts = require('./typescript.cjs');
const project = path.join(__dirname, '..');
class Node {
  static EventType = { NODE_DESTROYED: 'destroyed', TOUCH_START:'touch-start', TOUCH_END:'touch-end' };
  constructor(name='Root') { this.name=name;this.layer=33554432;this.children=[];this.components=[];this.events=new Map();this.active=true;this.isValid=true;this.position={x:0,y:0,z:0};this.scale={x:1,y:1,z:1};this.angle=0; }
  addChild(n) {n.parent=this;this.children.push(n);}
  addComponent(Type) { const c=new Type();c.node=this;this.components.push(c);return c; }
  getComponent(Type) {return this.components.find(c=>c instanceof Type)||null;}
  setPosition(x,y,z=0) { this.position=typeof x==='object'?{...x}:{x,y,z}; }
  setScale(x,y,z=1) {this.scale={x,y,z};}
  setSiblingIndex(i) {if(!this.parent)return;const a=this.parent.children;a.splice(a.indexOf(this),1);a.splice(Math.max(0,Math.min(i,a.length)),0,this);}
  on(n,f) {if(!this.events.has(n))this.events.set(n,new Set());this.events.get(n).add(f);}
  off(n,f) {this.events.get(n)?.delete(f);}
  emit(n,...args) {for(const f of this.events.get(n)||[])f(...args);}
  getSiblingIndex(){return this.parent?this.parent.children.indexOf(this):0;}
  get activeInHierarchy(){return this.active&&(!this.parent||this.parent.activeInHierarchy);}
  destroy() {this.isValid=false;this.emit('destroyed');for(const n of this.children)n.destroy();}
}
class Button {static Transition={NONE:0};static EventType={CLICK:'click'};enabled=true;interactable=true;}
class Sprite {static SizeMode={CUSTOM:0};grayscale=false;}
class Vec3 {constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}}
class UITransform {setContentSize(width,height){this.contentSize={width,height};this.width=width;this.height=height;}setAnchorPoint(x,y){this.anchorPoint={x,y};}convertToNodeSpaceAR(v){let x=v.x,y=v.y;const chain=[];for(let n=this.node;n;n=n.parent)chain.unshift(n);for(const n of chain){x-=n.position.x;y-=n.position.y;const r=n.angle*Math.PI/180,xx=x*Math.cos(r)+y*Math.sin(r),yy=-x*Math.sin(r)+y*Math.cos(r);x=xx/n.scale.x;y=yy/n.scale.y;}return new Vec3(x,y,v.z);}}
class UIOpacity {opacity=255;}
class Graphics {moveTo(){}lineTo(){}stroke(){}}
class Color {constructor(r,g,b,a){Object.assign(this,{r,g,b,a});}}
function uiNode(parent,name,x=0,y=0,w=750,h=1334){const n=new Node(name);n.layer=parent.layer;n.addComponent(UITransform).setContentSize(w,h);n.setPosition(x,y);parent.addChild(n);return n;}
async function loadFrame(path) { const file=resourceFile(path+'.png');if(!fs.existsSync(file+'.meta')){const png=fs.readFileSync(file);return {originalSize:{width:png.readUInt32BE(16),height:png.readUInt32BE(20)}};}const meta=JSON.parse(fs.readFileSync(file+'.meta','utf8')); const d=Object.values(meta.subMetas).find(s=>s.importer==='sprite-frame').userData;return {originalSize:{width:d.rawWidth,height:d.rawHeight}}; }
const cc={Node,Button,Sprite,UITransform,UIOpacity,Graphics,Color,Vec3,JsonAsset:class{},resources:{load(path,type,done){done(null,{json:JSON.parse(fs.readFileSync(resourceFile(path+'.json'),'utf8'))});}},Tween:{stopAllByTarget(){}}};
const moduleCache={};
function moduleLoad(name){if(moduleCache[name])return moduleCache[name];const scope={exports:{},require(path){if(path==='cc')return cc;if(path==='./FlowerAssets')return {loadFlowerAsset:cc.resources.load};if(path==='./FlowerUI')return {loadFrame,uiNode};if(path.startsWith('./'))return moduleLoad(path.slice(2));throw Error(path);},console:{warn(){}}};moduleCache[name]=scope.exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(project+'/assets/scripts/'+name+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,scope);return scope.exports;}
const Pool=moduleLoad('FlowerPool').FlowerPoolView;
Node.prototype.getChildByName=function(name){return this.children.find(n=>n.name===name)||null;};
test('original flower shapes pass transparent corners, prioritize the foreground and keep butterfly bubble hits stable', async () => {
 const shapeContains=moduleLoad('FlowerPool').flowerShapeContains;
 const picked=[];const flowers=[{id:'front',kind:'cdcs_jyc',variant:1,status:'pool',initialLayer:0},{id:'rear',kind:'cdy_lxq',variant:1,status:'pool',initialLayer:1},{id:'down',kind:'dy_zmj',variant:1,status:'pool',initialLayer:3}];
 const p=await Pool.create(new Node(),flowers,2,id=>picked.push(id),[1,1,0,0]);
 const front=p.inLayer(0)[0],rear=p.inLayer(1)[0];
 for(const e of p.ordered){e.node.setPosition(0,-200);e.node.angle=0;e.node.setScale(1,1,1);assert.equal(e.node.getComponent(Button),null);}
 const hit=(e,x,y)=>{const art=e.image.node.getComponent(UITransform);return shapeContains(e.hitShape,{x:x/art.width,y:y/art.height});};
 const frontArt=front.image.node.getComponent(UITransform);let transparent=null,solid=null;
 for(let y=-110;y<=110;y+=2)for(let x=-95;x<=95;x+=2){if(Math.abs(x)>frontArt.width/2||Math.abs(y)>frontArt.height/2)continue;if(hit(rear,x,y)&&!hit(front,x,y))transparent??={x,y};if(hit(rear,x,y)&&hit(front,x,y))solid??={x,y};}
 assert(transparent,'original front PNG rectangular corner contains a real rear polygon');assert(solid,'original polygons overlap');
 const touch=point=>p.root.emit(Node.EventType.TOUCH_END,{getUILocation:()=>point});
 touch({x:transparent.x,y:transparent.y-200});assert.equal(picked.pop(),'rear','transparent foreground angle passes through to grey flower');
 touch({x:solid.x,y:solid.y-200});assert.equal(picked.pop(),'front','highest sibling wins an overlap');assert.equal(p.nodeMap.size,3,'router does not auto-take');
 front.node.angle=47;front.node.setScale(.7,.7);const angle=47*Math.PI/180;touch({x:(solid.x*Math.cos(angle)-solid.y*Math.sin(angle))*.7,y:-200+(solid.x*Math.sin(angle)+solid.y*Math.cos(angle))*.7});assert.equal(picked.pop(),'front','entry inverse transform handles rotation and scale');
 touch({x:1000,y:1000});assert.equal(picked.length,0);
 p.dispose();assert.equal(p.root.events.get(Node.EventType.TOUCH_END)?.size,0,'dispose removes listener');
 const butterflies=[{id:'bubble',kind:'hd_01',variant:1,specialId:2000,status:'pool',initialLayer:0}];const q=await Pool.create(new Node(),butterflies,2,id=>picked.push(id),[1,0,0,0]);const e=q.inLayer(0)[0];e.node.setPosition(100,-250);e.node.angle=31;e.node.setScale(.8,.8);e.image.node.setScale(.2,1,1);
 const art=e.image.node.getComponent(UITransform),shape=e.hitShape;assert.equal(shape.type,'ellipse');const x=(shape.center[0]+.85*shape.axisX[0])*art.width,y=(shape.center[1]+.85*shape.axisX[1])*art.height,a=31*Math.PI/180;
 q.root.emit(Node.EventType.TOUCH_END,{getUILocation:()=>({x:100+.8*(x*Math.cos(a)-y*Math.sin(a)),y:-250+.8*(x*Math.sin(a)+y*Math.cos(a))})});assert.equal(picked.pop(),'bubble','bubble circle is independent of wing flap width');q.dispose();
 console.log('PASS: real original polygon transparent-corner passthrough, foreground priority, grey-layer hits, transform scaling/rotation, fixed butterfly bubble circle, no Button interception, no auto-take, disposal.');console.log('Original overlap sample:',JSON.stringify({transparent,solid}));
});

function layeredFlowers(counts) {
 const flowers=[];
 for(let layer=0;layer<counts.length;layer++)for(let i=0;i<counts[layer];i++)flowers.push({id:`layer-${layer}-${i}`,kind:['cdcs_jyc','cdy_lxq','dy_zmj'][i%3],variant:i%3+1,status:'pool',initialLayer:layer});
 return flowers;
}

test('sprite dimensions preserve variant differences and submerged flowers remain visible', async () => {
 const flowers=[1,2,3].map(variant=>({id:'size-'+variant,kind:'cdy_lxq',variant,status:'pool',initialLayer:variant-1}));
 const p=await Pool.create(new Node(),flowers,2,()=>{},[1,1,1,0]);
 const entries=p.ordered;
 assert.equal(entries[0].width/entries[1].width,300/259);
 assert(entries[0].width<200);assert(entries[1].alpha>=128);assert(entries[2].alpha>=90);
 p.dispose();
});

test('the last delayed difficulty flower floats to an empty surface without another tap', async () => {
 const flower={id:'last-hidden',kind:'dy_zmj',variant:1,status:'hidden',initialLayer:2};
 const p=await Pool.create(new Node(),[flower],3,()=>{},[21,16,16,0]);
 flower.status='pool';await p.reveal(flower);
 for(let i=0;i<150;i++)p.update(1/60);
 const entry=p.entries.get(flower.id);assert.equal(entry.band,0);assert.equal(entry.visualBand,0);
 assert.equal(entry.opacity.opacity,255);assert.equal(entry.node.active,true);
 p.take(flower.id);p.update(10);assert.equal(p.nodeMap.size,0);p.dispose();
});

test('idle promotion respects its clock and surface overflow limit', async () => {
 const p=await Pool.create(new Node(),layeredFlowers([2,5,5,5]),3,()=>{},[2,5,5,5]);
 p.motionRandom=()=>0;
 p.nextAutoPromotion=p.clock+5.2;
 p.update(5);assert.equal(p.inLayer(0).length,2);
 p.update(.21);assert.equal(p.inLayer(0).length,3);
 for(let i=0;i<3000;i++)p.update(1/60);
 assert.equal(p.inLayer(0).length,5,'no more than the original three extra surface flowers');p.dispose();
});
function snapshot(pool) {
 return pool.ordered.map(e=>({id:e.flower.id,x:e.node.position.x,y:e.node.position.y,angle:e.node.angle,scale:e.node.scale.x,alpha:e.alpha,rippleAngle:e.ripple.angle}));
}
function assertMotionClose(actual,expected,message) {
 assert.equal(actual.length,expected.length);
 for(let i=0;i<actual.length;i++)for(const key of ['x','y','angle','scale','alpha','rippleAngle'])assert(Math.abs(actual[i][key]-expected[i][key])<1e-6,`${message}: ${actual[i].id}.${key}: ${actual[i][key]} vs ${expected[i][key]}`);
}

test('floating and layer transitions keep real-time speed at 15, 30 and 60 fps', async () => {
 const samples=[];
 for(const fps of [15,30,60]){
  const p=await Pool.create(new Node(),layeredFlowers([2,2,2,2]),2,()=>{},[2,2,2,2]);
  p.take('layer-0-0');
  for(let frame=0;frame<fps*2;frame++)p.update(1/fps);
  samples.push(snapshot(p));p.dispose();
 }
 assertMotionClose(samples[0],samples[2],'15 fps retains elapsed time');
 assertMotionClose(samples[1],samples[2],'30 fps retains elapsed time');
});

test('original water sprites start after a delay, switch on promotion and stop on take', async () => {
 const p=await Pool.create(new Node(),layeredFlowers([2,2,2,8]),2,()=>{},[2,2,2,8]);
 const graphicsCount=()=>p.ordered.reduce((count,e)=>count+e.ripple.components.filter(c=>c instanceof Graphics).length,0);
 assert.equal(graphicsCount(),0,'no approximate Graphics water arcs remain');
 assert(p.ordered.every(e=>!e.ripple.active),'original initial water delay has not elapsed');
 p.update(.5);
 assert(p.inLayer(0).every(e=>e.ripplePlayers.length===e.rippleProfile.up.length),'Up uses its original per-flower water points');
 assert(p.inLayer(1).every(e=>e.ripplePlayers.length===1),'Middle plays its own narrow water animation');
 assert(p.inLayer(2).concat(p.inLayer(3)).every(e=>!e.ripple.active),'Bottom and Down have no water animator');
 const originalMiddle=p.inLayer(1).map(e=>({entry:e,alpha:e.alpha}));
 const removed=p.take('layer-0-0');
 const promoted=originalMiddle.find(item=>item.entry.band===0);
 assert(promoted,'a middle flower rises into the freed surface position');
 assert.equal(promoted.entry.alpha,promoted.alpha,'promotion keeps its current brightness instead of flashing darker');
 let alpha=promoted.entry.alpha;
 for(let i=0;i<20;i++){p.update(.025);assert(promoted.entry.alpha>=alpha,'brightness rises monotonically');alpha=promoted.entry.alpha;}
 assert.equal(promoted.entry.image.grayscale,true,'Middle appearance remains until the original depth-switch point');
 p.update(.1);
 assert.equal(promoted.entry.rippleStage,'promotion','Up promotion plays the original short bowen clip');
 assert.equal(promoted.entry.ripplePlayers[0].player.clip.loop,false);
 p.update(1);assert.equal(promoted.entry.rippleStage,'steady','bowen ends before returning to the Up sequence');
 const players=promoted.entry.ripplePlayers.slice();p.refreshBands();p.refreshBands();
 assert.deepEqual(promoted.entry.ripplePlayers,players,'unchanged layers keep their water phase');
 assert.equal(removed.getChildByName('Ripple').active,false,'click removes water instead of carrying a synthetic trail');
 p.dispose();
});

test('entrance uses staggered OutCubic scale, pauses with the pool clock and cancels cleanly', async () => {
 const picked=[];
 const p=await Pool.create(new Node(),layeredFlowers([8,4,4,6]),2,id=>picked.push(id),[8,4,4,6]);
 const duration=p.playEntrance();assert(duration>.35&&p.entering);
 const first=p.ordered.find(e=>e.entranceAt===0),later=p.ordered.find(e=>e.entranceAt>0);
 assert(first&&later);assert.equal(first.node.scale.x,0);assert.equal(later.node.active,false);
 const initial=snapshot(p);p.update(0);assert.deepEqual(snapshot(p),initial,'paused zero-dt does not advance entrance');
 p.root.emit(Node.EventType.TOUCH_END,{getUILocation:()=>({x:first.x,y:first.y})});assert.equal(picked.length,0,'zero-scale flowers are not clickable');
 p.update(.035);assert(Math.abs(first.node.scale.x-([1,.9,.8][first.band]*(1-.9**3)))<1e-8,'original .35-second OutCubic scale');
 const flight=p.take(later.flower.id);assert(flight);const flightPosition={...flight.position};
 p.update(duration);assert.equal(p.entering,false);assert.deepEqual(flight.position,flightPosition,'cancelled delayed piece never returns');
 assert(p.inLayer(3).every(e=>!e.node.active),'Down stays hidden after entrance');
 assert(p.ordered.filter(e=>e.band<3).every(e=>e.entranceAt===null&&e.node.active));
 assert.equal(p.playEntrance(),0,'entrance cannot restart on the same live board');
 p.dispose();p.update(10);assert.equal(p.playEntrance(),0);
 const q=await Pool.create(new Node(),layeredFlowers([8,4,4,6]),2,()=>{},[8,4,4,6]);
 assert.equal(q.playEntrance(),duration,'a fresh level gets its own reproducible entrance');q.dispose();
 const samples=[];
 for(const fps of [15,60]){const board=await Pool.create(new Node(),layeredFlowers([8,4,4,6]),2,()=>{},[8,4,4,6]);board.playEntrance();for(let i=0;i<fps*.4;i++)board.update(1/fps);samples.push(snapshot(board));board.dispose();}
 assertMotionClose(samples[0],samples[1],'entrance progress is independent of frame rate');
});

test('entrance accepts born flowers while ignoring future births and never resurrects a clicked flower', async () => {
 const picked=[];let accepted=null,p;
 p=await Pool.create(new Node(),layeredFlowers([8,4,4,6]),2,id=>{picked.push(id);accepted=p.take(id);},[8,4,4,6]);
 p.playEntrance();const first=p.ordered.find(e=>e.entranceAt===0),later=p.ordered.find(e=>e.entranceAt>0);
 const contains=moduleLoad('FlowerPool').flowerShapeContains;
 const touchOnly=entry=>{
  for(const other of p.ordered)other.node.setPosition(10000,10000);
  entry.node.setPosition(0,-200);entry.node.angle=0;
  const art=entry.image.node.getComponent(UITransform);let point=null;
  for(let y=-.4;y<=.4&&!point;y+=.04)for(let x=-.4;x<=.4;x+=.04)if(contains(entry.hitShape,{x,y})){point={x:x*art.width*entry.node.scale.x,y:-200+y*art.height*entry.node.scale.y};break;}
  assert(point,'original collider contains a reachable sample');
  p.root.emit(Node.EventType.TOUCH_END,{getUILocation:()=>point});
 };
 touchOnly(first);assert.equal(picked.length,0,'a born node at scale zero is ignored');
 touchOnly(later);assert.equal(picked.length,0,'an inactive scheduled birth is ignored');
 p.update(later.entranceAt+.01);assert.equal(p.entering,true,'the rest of the entrance is still running');
 assert(later.node.active&&later.node.scale.x>0);touchOnly(later);
 assert.deepEqual(picked,[later.flower.id],'the visible growing flower is immediately selectable');assert(accepted);
 assert.equal(p.nodeMap.has(later.flower.id),false);accepted.setPosition(75,25);const position={...accepted.position},scale={...accepted.scale};
 p.update(2);assert.deepEqual(accepted.position,position);assert.deepEqual(accepted.scale,scale,'entrance no longer owns an accepted flower');
 assert.equal(p.nodeMap.has(later.flower.id),false);assert.equal(await p.reveal(later.flower),null,'a delayed spawn cannot resurrect the clicked ID');p.dispose();
});

test('early vacancies only promote flowers from batches that have already spawned', async () => {
 for(const reserveBornLower of [false,true]){
  const p=await Pool.create(new Node(),layeredFlowers([8,8,8,8]),2,()=>{},[8,8,8,8]);p.playEntrance();
  const up=p.inLayer(0)[0];p.update(up.bornAt+.01);
  const future=p.ordered.filter(e=>e.band>0&&e.bornAt>p.clock),bornLower=p.ordered.filter(e=>e.band>0&&e.bornAt<=p.clock);
  assert(future.some(e=>e.band===1)&&future.some(e=>e.band===3));assert(bornLower.length);
  for(const e of bornLower){e.anchorX=900;e.anchorY=900;if(reserveBornLower)e.flower.status='collected';}
  // A future Middle is geometrically closest; it must not win the near search.
  for(const e of future){e.anchorX=up.anchorX;e.anchorY=up.anchorY;}
  const before=new Map(future.map(e=>[e,e.band]));p.take(up.flower.id);
  assert(future.every(e=>e.band===before.get(e)&&!e.promotion),'neither the near search nor fallback can pull an unborn Middle/Bottom/Down');
  if(reserveBornLower)assert(!p.ordered.some(e=>e.promotion),'an empty live lower layer waits instead of borrowing from future batches');
  else assert(bornLower.some(e=>e.band===0),'an already-born lower flower can still fill the vacancy');
  p.dispose();
 }
});

test('water playback uses original sprite keys, cubic opacity and cropped sprite pivots', async () => {
 const data=JSON.parse(fs.readFileSync(resourceFile('original/data/water-ripple-animations.json'),'utf8'));
 const sample=moduleLoad('FlowerPool').sampleRippleTrack;
 const clip=data.clips.effect_lianyi_1,track=clip.tracks.find(t=>t.property==='sprite');
 assert.equal(sample(track,.099),track.keys[0].value);assert.equal(sample(track,.101),track.keys[1].value);
 const opacity=data.clips.bowen.tracks.find(t=>t.nodePath==='New Sprite'&&t.property==='m_Color.a');
 const c=opacity.keys[0].coefficients,t=.15;
 assert(Math.abs(sample(opacity,t)-(((c[0]*t+c[1])*t+c[2])*t+c[3]))<1e-12,'decoded cubic coefficients are absolute values');
 const p=await Pool.create(new Node(),[{id:'geometry',kind:'cdy_lxq',variant:1,status:'pool',initialLayer:0}],2,()=>{},[1,0,0,0]);
 p.update(.5);const entry=p.inLayer(0)[0],player=entry.ripplePlayers[0].player;
 player.sample(.101);const state=player.nodes.get('New Sprite');assert.equal(state.frame,track.keys[1].value);
 player.sample(clip.duration+.101);assert.equal(state.frame,track.keys[1].value,'loop wraps by original clip length');
 const geometry=data.sprites[state.frame],size=state.art.getComponent(UITransform);
 assert.equal(size.width,geometry.width/geometry.ppu);
 assert.equal(state.art.position.x,(geometry.trimOffset[0]+geometry.width/2-geometry.pivot[0]*geometry.logicalSize[0])/geometry.ppu,'trimmed frame keeps the original pivot');
 entry.node.setPosition(0,0);entry.node.angle=0;entry.node.setScale(1,1,1);
 const matrix=entry.rippleProfile.up[0].transform,artSize=entry.image.node.getComponent(UITransform),basis=player.root.children[0].getComponent(UITransform);
 for(const [x,y] of [[1,0],[0,1],[-.4,.7]]){
  const world=new Vec3((matrix[0]*x+matrix[2]*y+matrix[4])*artSize.width,(matrix[1]*x+matrix[3]*y+matrix[5])*artSize.height);
  const local=basis.convertToNodeSpaceAR(world);assert(Math.abs(local.x-x)<1e-7&&Math.abs(local.y-y)<1e-7,'original point matrix survives the Cocos transform hierarchy');
 }
 const before=state.frame;p.update(0);assert.equal(state.frame,before,'pause does not advance sprite frames');
 p.take(entry.flower.id);assert.equal(entry.ripplePlayers.length,0);assert.equal(player.root.isValid,false,'taking a flower disposes its animation nodes');p.dispose();
});

test('Bottom promotion honors serialized delay, depth-switch and scale overshoot, and is cancellable', async () => {
 const motion=JSON.parse(fs.readFileSync(resourceFile('original/data/original-motion-settings.json'),'utf8')).flowerManager.values;
 const p=await Pool.create(new Node(),layeredFlowers([1,0,2,2]),2,()=>{},[1,0,2,2]);
 const surfaces=[];p.setSurfaceListener(flower=>surfaces.push(flower.id));
 p.take('layer-0-0');const rising=p.inLayer(0)[0],transition=rising.promotion;assert(transition);
 assert(Math.abs(transition.start-(motion.vacancyStartDelay+motion.bottomToUpDelay))<1e-8);
 assert.equal(transition.duration,motion.bottomToUpDuration);
 p.update(transition.start/2);assert.equal(rising.scale,.8);assert.equal(rising.image.grayscale,true);
 p.update(transition.start/2+transition.duration*(motion.bottomToUpDepthSwitchProgress-.01));
 assert.equal(rising.image.grayscale,true);assert.equal(rising.rippleStage,'none');assert.equal(surfaces.length,0);
 p.update(transition.duration*.02);assert.equal(rising.image.grayscale,false);assert.equal(rising.rippleStage,'promotion');assert.deepEqual(surfaces,[rising.flower.id],'surface event is emitted at the depth-switch point');
 p.update(transition.start+transition.duration*.76-p.clock);
 assert(Math.abs(rising.scale-motion.bottomToUpOvershoot)<1e-7,'original 76% overshoot point is preserved');
 const paused=snapshot(p);p.update(0);assert.deepEqual(snapshot(p),paused);
 const flight=p.take(rising.flower.id),position={...flight.position},scale={...flight.scale};
 p.update(2);assert.deepEqual(flight.position,position);assert.deepEqual(flight.scale,scale,'accepted click interrupts promotion without later tween writes');assert.equal(surfaces.filter(id=>id===rising.flower.id).length,1);
 p.shuffle();assert(p.ordered.every(e=>e.promotion===null),'shuffle cancels outstanding promotion motion');
 p.dispose();p.update(5);assert.equal(p.nodeMap.size,0);
});

test('released hidden flowers use the original scale-in and async disposal cannot resurrect them', async () => {
 const hidden={id:'released',kind:'dy_zmj',variant:1,status:'hidden',initialLayer:2};
 const p=await Pool.create(new Node(),[hidden],2,()=>{},[1,1,1,1]);assert.equal(p.nodeMap.size,0);
 hidden.status='pool';const node=await p.reveal(hidden);assert(node);assert.equal(node.scale.x,0);
 p.update(.175);assert(Math.abs(node.scale.x-.8*.875)<1e-8,'difficulty release uses .35-second OutCubic');
 p.take(hidden.id);const position={...node.position};p.update(1);assert.deepEqual(node.position,position);assert.equal(await p.reveal(hidden),null,'taken release does not return');
 const pending=p.reveal({id:'cancelled',kind:'cdy_lxq',variant:1,status:'pool',initialLayer:2});p.dispose();assert.equal(await pending,null,'dispose cancels a release while its frame is loading');assert.equal(p.nodeMap.size,0);
});

test('shuffle scatters in small batches, preserves frame-rate timing and releases taken entries', async () => {
 const samples=[];
 for(const fps of [15,30,60]){
  const p=await Pool.create(new Node(),layeredFlowers([22,6,22,10]),2,()=>{},[22,6,22,10]);
  const downBefore=p.inLayer(3).map(e=>({id:e.flower.id,x:e.node.position.x,y:e.node.position.y}));
  const duration=p.shuffle();
  assert(duration>0.63,'returned duration covers gather, multiple scatter batches and settling');
  for(let frame=0;frame<fps*2;frame++)p.update(1/fps);
  samples.push(snapshot(p));
  assert.equal(p.scatterTargets.size,0,'every scheduled flower scatters');
  assert.deepEqual(p.inLayer(3).map(e=>({id:e.flower.id,x:e.node.position.x,y:e.node.position.y})),downBefore,'Down flowers do not participate');
  p.dispose();
 }
 assertMotionClose(samples[0],samples[2],'15 fps does not skip scatter batches');
 assertMotionClose(samples[1],samples[2],'30 fps does not shift scatter timing');
 const p=await Pool.create(new Node(),layeredFlowers([22,6,22,10]),2,()=>{},[22,6,22,10]);
 p.shuffle();const gathered=new Map(p.ordered.map(e=>[e,{x:e.anchorX,y:e.anchorY}]));
 const scattered=()=>p.ordered.filter(e=>e.band<3&&(e.anchorX!==gathered.get(e).x||e.anchorY!==gathered.get(e).y)).length;
 p.update(.29);const first=scattered();assert(first>=4&&first<=6,'first scatter batch has four to six flowers');
 p.update(.05);const second=scattered()-first;assert(second>=4&&second<=6,'next batch starts fifty milliseconds later');
 const waiting=[...p.scatterTargets.keys()][0];assert(waiting);
 const flight=p.take(waiting.flower.id),position={...flight.position};
 assert(!p.scatterTargets.has(waiting),'taken flower is removed from scheduled animation immediately');
 p.update(2);assert.deepEqual(flight.position,position,'pool no longer animates the handed-off flight node');
 p.dispose();p.update(1);assert.equal(p.scatterTargets.size,0,'dispose clears pending animation state');
});
