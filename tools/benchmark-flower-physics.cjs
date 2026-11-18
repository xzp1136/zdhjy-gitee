#!/usr/bin/env node
'use strict';
// CPU-only comparison. The optional old solver uses Creator's actual Box2D JS
// package with test component plumbing; these numbers are not phone frame rates.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{performance}=require('node:perf_hooks');
const ts=require('../tests/typescript.cjs'),{loadPhysics}=require('../tests/light-physics-fixture.cjs');
const light=loadPhysics(),data=light.original;
function oldPhysics(file){
 class Node{
  constructor(name='Root'){Object.assign(this,{name,children:[],components:[],active:true,isValid:true,position:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},angle:0});}
  addChild(n){n.parent=this;this.children.push(n);}addComponent(T){const c=new T();c.node=this;this.components.push(c);return c;}
  getComponent(T){return this.components.find(c=>c instanceof T)||null;}
  get activeInHierarchy(){return this.active&&(!this.parent||this.parent.activeInHierarchy);}
  setPosition(x,y,z=0){this.position={x,y,z};}setScale(x,y,z=1){this.scale={x,y,z};}
  destroy(){this.isValid=false;for(const n of this.children)n.destroy();}
 }
 const cc={...require('../tests/physics-cc.cjs')(Node),JsonAsset:class{}},exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,
  {exports,require(name){if(name==='cc')return cc;if(name==='./FlowerAssets')return {};throw Error(name);}});
 return {...exports,Node};
}
function layout(total,counts){
 const rng=light.random(),keys=['original/flower/cdy_lxq_01','original/flower/dy_zmj_01','original/flower/cdcs_jyc_01','original/flower/zy_lmg_01'];
 return Array.from({length:total},(_,i)=>({id:String(i),key:keys[i%keys.length],x:(rng()-.5)*6.4*light.FLOWER_WORLD_UNIT,
  y:(-2.51+(rng()-.5)*8)*light.FLOWER_WORLD_UNIT,angle:(rng()-.5)*360,band:i<counts[0]?0:i<counts[0]+counts[1]?1:i<counts[0]+counts[1]+counts[2]?2:3}));
}
function run(engine,items){
 const p=new engine.FlowerPhysics(new engine.Node(),data,light.random()),start=performance.now();
 for(const item of items)p.add(item.id,item.key,item.x,item.y,item.angle,.48,item.band,{x:.1,y:0});
 const creationMs=performance.now()-start,all=[],steady=[];let maxPairs=0,maxSteps=0;
 try{
  for(let frame=0;frame<300;frame++){
   const begin=performance.now(),scale=Math.min(1,(frame+1)/21);
   for(const item of items)p.sync(item.id,item.band,scale,true);
   p.update(1/60);
   for(const item of items)p.pose(item.id);
   const elapsed=performance.now()-begin;all.push(elapsed);if(frame>=60)steady.push(elapsed);
   if(p.diagnostics){maxPairs=Math.max(maxPairs,p.diagnostics.pairChecks);maxSteps=Math.max(maxSteps,p.diagnostics.steps);}
  }
 }finally{p.dispose();}
 const sorted=steady.slice().sort((a,b)=>a-b),round=v=>Math.round(v*1000)/1000;
 return {creationMs:round(creationMs),first21FrameMaxMs:round(Math.max(...all.slice(0,21))),steadyMedianMs:round(sorted[Math.floor(sorted.length*.5)]),
  steadyP95Ms:round(sorted[Math.floor(sorted.length*.95)]),steadyMeanMs:round(steady.reduce((a,b)=>a+b,0)/steady.length),maxPairs,maxSteps};
}
const baselineArg=process.argv.indexOf('--baseline'),baseline=baselineArg>=0?oldPhysics(path.resolve(process.argv[baselineArg+1])):null;
const report={measurement:'Desktop JS CPU time for sync/update/pose; excludes rendering/network and does not represent phone FPS.',
 scenarios:[{name:'102 pieces / 53 visible',total:102,counts:[21,16,16]},{name:'300 pieces / 53 visible',total:300,counts:[21,16,16]},
 {name:'180 visible stress',total:180,counts:[60,60,60]}].map(s=>{const items=layout(s.total,s.counts);return {...s,lightweight:run(light,items),...(baseline?{box2d:run(baseline,items)}:{})};})};
console.log(JSON.stringify(report,null,2));
