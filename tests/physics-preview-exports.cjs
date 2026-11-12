const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const {refreshPhysicsPreview}=require('../tools/refresh-physics-preview.cjs');
function fixture(){
 const project=fs.mkdtempSync(path.join(os.tmpdir(),'flower-preview-exports-test-')),engine=path.join(project,'engine');
 const write=(relative,value)=>{const file=path.join(project,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,typeof value==='string'?value:JSON.stringify(value));return file;};
 write('settings/v2/packages/engine.json',{modules:{configs:{defaultConfig:{includeModules:['base','physics-2d-box2d','physics-2d-framework']}}}});
 const features={base:{modules:['base']},'physics-2d-framework':{modules:['physics-2d-framework']},'physics-2d-box2d':{modules:['physics-2d-box2d','physics-2d-framework']}};
 write('engine/cc.config.json',{features});
 const imports={};for(const unit of ['base','physics-2d-box2d','physics-2d-framework'])imports['cce:/internal/x/cc-fu/'+unit]='q-bundled:///exports/'+unit+'.js';
 write('engine/bin/.cache/dev/preview/import-map.json',{imports});
 const id='./chunks/cc.js',map={imports:{'cce:/internal/x/cc':id},scopes:{[id]:{__unresolved_0:'cce:/internal/x/cc-fu/base'}}};
 const mapFile=write('temp/programming/packer-driver/targets/preview/import-map.json',map);
 const moduleFile=write('temp/programming/packer-driver/targets/preview/chunks/cc.js','System.register(["__unresolved_0","__unresolved_16"],function(){return {setters:[],execute(){}};});');
 return {project,engine,write,map,mapFile,moduleFile,imports};
}
function inspect(moduleFile){let dependencies,declare;vm.runInNewContext(fs.readFileSync(moduleFile,'utf8'),{System:{register(d,f){dependencies=d;declare=f;}}});return {dependencies,declare};}
test('repair recovers mismatched numbered dependencies without modifying the project import-map',()=>{
 const f=fixture();try{
  const mapBefore=fs.readFileSync(f.mapFile,'utf8'),result=refreshPhysicsPreview(f.project,f.engine),module=inspect(f.moduleFile),exports={};
  assert(result.changed);assert.equal(fs.readFileSync(f.mapFile,'utf8'),mapBefore,'generated project mappings stay owned by Creator');
  assert.equal(new Set(module.dependencies).size,module.dependencies.length,'shared framework is linked once');
  const registration=module.declare(values=>Object.assign(exports,values));
  module.dependencies.forEach((id,i)=>{assert(f.imports[id],`engine import-map resolves ${id}`);registration.setters[i](id.endsWith('/physics-2d-framework')?{PhysicsSystem2D:'real engine class'}:{baseValue:true});});
  registration.execute();assert.equal(exports.PhysicsSystem2D,'real engine class');
  assert(!module.dependencies.some(id=>id.startsWith('__unresolved_')));
 }finally{fs.rmSync(f.project,{recursive:true,force:true});}
});
test('reloading after Creator regenerates all numbered scopes still resolves every engine dependency',()=>{
 const f=fixture();try{
  refreshPhysicsPreview(f.project,f.engine);const code=fs.readFileSync(f.moduleFile,'utf8');
  f.map.scopes={'./chunks/cc.js':{__unresolved_0:'cce:/internal/x/cc-fu/base'}};fs.writeFileSync(f.mapFile,JSON.stringify(f.map));
  for(let reload=0;reload<3;reload++){
   const module=inspect(f.moduleFile);assert(module.dependencies.every(id=>f.imports[id]),'fresh startup needs no stale scope entries');
  }
  const result=refreshPhysicsPreview(f.project,f.engine);assert.equal(result.changed,false);assert.equal(fs.readFileSync(f.moduleFile,'utf8'),code);
 }finally{fs.rmSync(f.project,{recursive:true,force:true});}
});
test('unknown or disabled project features fail without changing generated files',()=>{
 const f=fixture();try{
  const previous=fs.readFileSync(f.moduleFile,'utf8');f.write('settings/v2/packages/engine.json',{modules:{configs:{defaultConfig:{includeModules:['base']}}}});
  assert.throws(()=>refreshPhysicsPreview(f.project,f.engine),/not enabled/);assert.equal(fs.readFileSync(f.moduleFile,'utf8'),previous);
 }finally{fs.rmSync(f.project,{recursive:true,force:true});}
});
