#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');

/** Repair the current Creator preview's generated cc barrel from source config.
 * Dependencies use the engine's own canonical IDs, so an independently rebuilt
 * project import-map cannot strand numbered __unresolved_N references.
 * Never modifies an import-map, scene, prefab, .meta, or installed engine file.
 */
function refreshPhysicsPreview(project,engine){
 const config=JSON.parse(fs.readFileSync(path.join(project,'settings/v2/packages/engine.json'),'utf8')).modules.configs.defaultConfig;
 if(!config.includeModules.includes('physics-2d-box2d'))throw Error('Project physics feature is not enabled: physics-2d-box2d');
 const features=JSON.parse(fs.readFileSync(path.join(engine,'cc.config.json'),'utf8')).features;
 const engineMap=JSON.parse(fs.readFileSync(path.join(engine,'bin/.cache/dev/preview/import-map.json'),'utf8')).imports;
 const units=[];
 for(const feature of config.includeModules){
  if(!features[feature])throw Error('Unknown configured engine feature: '+feature);
  for(const unit of features[feature].modules){
   const id='cce:/internal/x/cc-fu/'+unit;
   if(!engineMap[id])throw Error('Engine does not provide configured module: '+unit);
   if(!units.includes(id))units.push(id);
  }
 }
 // Creator's Box2D feature already expands to the shared physics framework.
 // Validate the effective exports rather than requiring a duplicate feature.
 for(const unit of ['physics-2d-box2d','physics-2d-framework'])
  if(!units.includes('cce:/internal/x/cc-fu/'+unit))throw Error('Engine physics module is missing: '+unit);
 const root=path.join(project,'temp/programming/packer-driver/targets/preview'),file=path.join(root,'import-map.json');
 const map=JSON.parse(fs.readFileSync(file,'utf8')),id=map.imports['cce:/internal/x/cc'];
 if(typeof id!=='string')throw Error('Creator preview cc export module was not found.');
 const source=path.resolve(root,id);
 if(!source.startsWith(root+path.sep))throw Error('Preview module path is outside its generated directory.');
 const previous=fs.readFileSync(source,'utf8');
 const setter="function(module){var values={};for(var key in module)if(key!=='default'&&key!=='__esModule')values[key]=module[key];exports(values);}";
 const body='System.register('+JSON.stringify(units)+',function(exports){return {setters:['+units.map(()=>setter).join(',')+'],execute:function(){}};});\n';
 if(body===previous)return {changed:false,source,units};
 const backup=fs.mkdtempSync(path.join(os.tmpdir(),'zdhjy-physics-preview-'));
 fs.copyFileSync(source,path.join(backup,path.basename(source)));
 fs.writeFileSync(source,body);
 return {changed:true,source,units,backup};
}
module.exports={refreshPhysicsPreview};
if(require.main===module){
 const project=path.resolve(__dirname,'..');
 const engine=[process.env.COCOS_ENGINE,'/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine','C:/ProgramData/cocos/editors/Creator/3.8.7/resources/resources/3d/engine'].filter(Boolean).find(root=>fs.existsSync(path.join(root,'cc.config.json')));
 if(!engine)throw Error('Set COCOS_ENGINE to the installed Creator 3.8.7 engine.');
 const result=refreshPhysicsPreview(project,engine);
 console.log(result.changed?'Rebuilt preview exports using stable engine module IDs. Backup: '+result.backup:'Preview exports already match the configured engine modules.');
}
