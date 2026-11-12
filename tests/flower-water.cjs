const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('./typescript.cjs'),resourceFile=require('./resource-file.cjs');
const sourceData=JSON.parse(fs.readFileSync(resourceFile('original/data/flower-water-materials.json')));
function harness(){
 class Node{constructor(name='Root'){Object.assign(this,{name,children:[],components:[],isValid:true,active:true,position:{x:0,y:0},scale:{x:1,y:1},angle:0});}addChild(n){n.parent=this;this.children.push(n);}addComponent(T){const c=new T();c.node=this;this.components.push(c);return c;}getComponent(T){return this.components.find(c=>c instanceof T);}setPosition(x,y){this.position={x,y};}setScale(x,y){this.scale={x,y};}setSiblingIndex(i){if(!this.parent)return;const a=this.parent.children;a.splice(a.indexOf(this),1);a.splice(i,0,this);}destroy(){this.isValid=false;for(const c of this.children)c.destroy();}}
 class UITransform{setContentSize(width,height){Object.assign(this,{width,height});}}
 class Frame{constructor(){this.packable=true;this.uv=[0,1,1,1,0,0,1,0];}clone(){const f=new Frame();f.uv=this.uv.slice();return f;}destroy(){this.destroyed=true;}}
 class Sprite{static SizeMode={CUSTOM:0};grayscale=true;customMaterial=null;}
 class Vec4{constructor(x,y,z,w){Object.assign(this,{x,y,z,w});}}
 class Material{constructor(){this.properties={};}initialize(v){this.effect=v.effectAsset;}setProperty(k,v){this.properties[k]=v;}destroy(){this.destroyed=true;}}
 class EffectAsset{}class JsonAsset{}class Texture2D{static WrapMode={REPEAT:0,CLAMP_TO_EDGE:1,MIRRORED_REPEAT:2};static Filter={NEAREST:0,LINEAR:1};setWrapMode(u,v){this.wrap=[u,v];}setFilters(a,b){this.filters=[a,b];}}
 const uiNode=(parent,name,x=0,y=0,width=1,height=1)=>{const n=new Node(name);parent.addChild(n);n.setPosition(x,y);n.addComponent(UITransform).setContentSize(width,height);return n;};
 const cc={Node,UITransform,Sprite,Vec4,Material,EffectAsset,JsonAsset,Texture2D};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../assets/scripts/FlowerWater.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports,Math,Map,Promise,require(p){if(p==='cc')return cc;if(p==='./FlowerUI')return {uiNode};if(p==='./FlowerAssets')return {loadFlowerAsset(path,Type,done){done(null,Type===JsonAsset?{json:sourceData}:new Type());}};throw Error(p);}});
 return {...cc,...exports,uiNode,Frame};
}

test('original half-submerged shader preserves complementary alpha and the original curved waterline',()=>{
 const h=harness(),p={...sourceData.half,waveStrength:0};
 for(const x of [0,.2,.5,.8,1])for(const y of [0,.2,.45,.5,.8,1])assert(Math.abs(h.originalWaterMask({x,y},0,p,false)+h.originalWaterMask({x,y},0,p,true)-1)<1e-12);
 assert.equal(h.originalWaterMask({x:.5,y:.4},0,p,false),0);assert.equal(h.originalWaterMask({x:.5,y:.6},0,p,false),1);
 assert(Math.abs(h.originalWaterMask({x:.5,y:.45},0,p,false)-.5)<1e-6,'source -0.05 curvature moves the center cut to .45');
 assert.equal(p.cutSoftness,.004);assert.equal(p.curvePower,1.5);
});

test('Middle uses independent RGB copies on both sides of water; Bottom remains below water',async()=>{
 const h=harness(),board=new h.Node(),below=h.uiNode(board,'Underwater'),above=h.uiNode(board,'Above');
 const entry=h.uiNode(above,'Flower',24,-180),art=h.uiNode(entry,'Image',0,0,208,205),image=art.addComponent(h.Sprite);
 const original=new h.Frame();image.spriteFrame=original;entry.setScale(.9,.9);entry.angle=31;
 const renderer=await h.FlowerWaterRenderer.create(below);renderer.sync('flower',image,1,true);
 const copy=below.children[0],down=copy.getComponent(h.Sprite);
 assert(copy.active);assert(art.active);assert.equal(image.grayscale,false);assert.equal(down.grayscale,false);
 assert.deepEqual(copy.position,entry.position);assert.equal(copy.angle,31);assert.equal(copy.scale.x,.9);
 assert.equal(image.customMaterial.properties.cut.w,0);assert.equal(down.customMaterial.properties.cut.w,1);
 assert.equal(image.spriteFrame.packable,false);assert.equal(original.packable,true,'shared original frame is not mutated');
 renderer.sync('flower',image,0,true);assert.equal(image.customMaterial,null);assert.equal(copy.active,false);
 renderer.sync('flower',image,1,true);assert(image.customMaterial,'cached waterline material is restored after returning to Middle');
 renderer.sync('flower',image,2,true);assert.equal(art.active,false);assert(copy.active);assert.equal(down.customMaterial,null,'Bottom uses the full RGB sprite behind the water');
 renderer.take('flower',image);assert.equal(copy.isValid,false);assert(art.active);assert.equal(image.customMaterial,null);
 renderer.dispose();assert.equal(image.spriteFrame,original,'in-flight sprite keeps the shared source frame after the pool is disposed');assert(!original.destroyed);
});

test('surface material uses original textures, alpha and UV bases rather than opacity/sine approximations',async()=>{
 const h=harness(),root=new h.Node(),below=h.uiNode(root,'Below'),water=h.uiNode(root,'Water').addComponent(h.Sprite);water.spriteFrame=new h.Frame();
 const renderer=await h.FlowerWaterRenderer.create(below);renderer.applySurface(water);const p=water.customMaterial.properties;
 assert(Math.abs(p.scalars3.y-.86)<1e-7);assert(Math.abs(p.inputs0.w-182/255)<1e-7);
 assert.equal(p.uvOriginX.y,1);assert.equal(p.uvAxisY.y,-1,'Cocos PNG UV orientation maps back to Unity upward Y');
 assert.deepEqual(p.flowTexture.wrap,[0,0]);assert.deepEqual(p.detailTexture.wrap,[0,0]);
 assert.deepEqual(p.flowTexture.filters,[1,1]);
 const files=['flower-half-water','flower-water-surface'].map(name=>fs.readFileSync(resourceFile('original/materials/'+name)+'.effect','utf8'));
 assert(files.every(text=>!text.includes('IS_GRAY')));assert(files[1].includes('0.680000007'),'source arithmetic is retained');
 const material=water.customMaterial;renderer.dispose();assert(material.destroyed);
});
