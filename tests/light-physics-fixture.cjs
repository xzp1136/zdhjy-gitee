'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('./typescript.cjs');
const resource=require('./resource-file.cjs');
class Node {
 constructor(name='Root'){Object.assign(this,{name,children:[],active:true,isValid:true,components:[]});}
 addChild(node){node.parent=this;this.children.push(node);}
 addComponent(){throw Error('Lightweight solver must not create engine components');}
 destroy(){this.isValid=false;for(const child of this.children)child.destroy();}
}
function random(){let seed=123456;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function loadPhysics(options={}){
 const cc=new Proxy({Node,JsonAsset:class{}},{get(target,key){if(key in target)return target[key];throw Error('Unexpected engine dependency: '+String(key));}});
 const exports={},source=fs.readFileSync(options.sourceFile||path.join(__dirname,'../assets/scripts/FlowerPhysics.ts'),'utf8');
 let code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
 if(options.production)code=require('./creator-production.cjs')(code);
 vm.runInNewContext(code,{exports,require(name){if(name==='cc')return cc;if(name==='./FlowerAssets')return {loadFlowerAsset(logical,_type,done){done(null,{json:JSON.parse(fs.readFileSync(resource(logical+'.json')))});}};throw Error(name);}});
 return {...exports,Node,original:JSON.parse(fs.readFileSync(resource('original/data/flower-runtime-physics.json'))),random};
}
module.exports={loadPhysics,Node,random};
