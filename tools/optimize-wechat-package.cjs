#!/usr/bin/env node
'use strict';
// Optimize a COPY of emitted assets. No source art, importer metadata or scripts
// are regenerated. Keep image geometry/PNG alpha and update Creator cache keys.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const md5=b=>crypto.createHash('md5').update(b).digest('hex').slice(0,5);
function walk(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>{if(e.isSymbolicLink())throw Error('Symlinks are not supported');return e.isDirectory()?walk(path.join(root,e.name)):[path.join(root,e.name)];});}
function decodeUuid(value){const [id,...rest]=value.split('@');if(id.length!==22)return value;const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let hex=id.slice(0,2);for(let i=2;i<22;i+=2){const n=(alphabet.indexOf(id[i])<<6)|alphabet.indexOf(id[i+1]);hex+=n.toString(16).padStart(3,'0');}return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-')+(rest.length?'@'+rest.join('@'):'');}
function score(a,b){if(a.length!==b.length)throw Error('Image dimensions/channels changed');let sum=0,weight=0,alpha=true;for(let i=0;i<a.length;i+=4){alpha&&=a[i+3]===b[i+3];const w=(a[i+3]/255)**2;for(let c=0;c<3;c++){sum+=(a[i+c]-b[i+c])**2*w;weight+=w;}}return {psnr:sum===0?Infinity:10*Math.log10(255**2/(sum/Math.max(weight,1))),alphaExact:alpha};}
async function compressImage(input,ext,sharp){
 const meta=await sharp(input).metadata();if(meta.orientation&&meta.orientation!==1)return null;
 const source=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true}),raw=source.data;
 const {width,height}=source.info;let best=input,quality=null,method='original';
 const consider=async(candidate,name,min,alpha)=>{
  if(candidate.length>=best.length)return;
  const decoded=await sharp(candidate).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(decoded.info.width!==width||decoded.info.height!==height)throw Error('Image resize is not permitted');
  const metric=score(raw,decoded.data);
  if(metric.psnr>=min&&(!alpha||metric.alphaExact)){best=candidate;quality=metric;method=name;}
 };
 if(ext==='.png'){
  await consider(await sharp(input).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer(),'lossless-png',Infinity,true);
  await consider(await sharp(input).png({compressionLevel:9,adaptiveFiltering:false}).toBuffer(),'lossless-png-filter-none',Infinity,true);
  await consider(await sharp(input).png({palette:true,colours:256,quality:95,dither:0,effort:5}).toBuffer(),'indexed-png-alpha-preserved',42,true);
  // Quantize colour only, then restore every original alpha byte. Sprite masks,
  // trimmed edges and particle textures retain their exact transparency.
  const palette=await sharp(input).removeAlpha().png({palette:true,colours:256,quality:92,dither:0,effort:5}).toBuffer();
  const rgb=await sharp(palette).removeAlpha().raw().toBuffer(),merged=Buffer.from(raw);
  for(let i=0,j=0;i<merged.length;i+=4,j+=3){merged[i]=rgb[j];merged[i+1]=rgb[j+1];merged[i+2]=rgb[j+2];}
  await consider(await sharp(merged,{raw:{width,height,channels:4}}).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer(),'png-colour-alpha-preserved',42,true);
  await consider(await sharp(merged,{raw:{width,height,channels:4}}).png({compressionLevel:9,adaptiveFiltering:false}).toBuffer(),'png-colour-alpha-preserved-filter-none',42,true);
 }else{
  for(const q of [82,88,94]){await consider(await sharp(input).jpeg({quality:q,mozjpeg:true}).toBuffer(),'jpeg-'+q,36,false);if(method!=='original')break;}
 }
 return best===input?null:{bytes:best,width,height,method,psnr:Number.isFinite(quality.psnr)?Math.round(quality.psnr*100)/100:null,alphaExact:quality.alphaExact};
}
function rewriteReferences(file,replacements){let body=fs.readFileSync(file,'utf8'),next=body;for(const [oldName,newName]of replacements)next=next.split(oldName).join(newName);if(next!==body)fs.writeFileSync(file,next);return next!==body;}
function renameVersioned(file,replacements,hash){const name=path.basename(file),match=name.match(/^(.*)\.([a-f0-9]{5})\.(json|js)$/);if(!match)throw Error('Expected a Creator versioned file: '+file);const next=match[1]+'.'+hash+'.'+match[3],target=path.join(path.dirname(file),next);if(target!==file){if(fs.existsSync(target))throw Error('Versioned destination exists');fs.renameSync(file,target);replacements.set(name,next);}return target;}
function verifyCacheReferences(root){
 const files=walk(root),sf=files.find(f=>/^settings\.[a-f0-9]{5}\.json$/.test(path.basename(f))),settings=JSON.parse(fs.readFileSync(sf));
 const configs=files.filter(f=>/^config\.[a-f0-9]{5}\.json$/.test(path.basename(f)));let nativeEntries=0;
 for(const configFile of configs){
  const config=JSON.parse(fs.readFileSync(configFile)),version=settings.assets.bundleVers[config.name];
  if(path.basename(configFile)!=='config.'+version+'.json')throw Error('Bundle version is inconsistent: '+config.name);
  const dir=path.dirname(configFile),native=files.filter(f=>f.startsWith(dir+path.sep+(config.nativeBase||'native')+path.sep)).flatMap(f=>path.relative(path.join(dir,config.nativeBase||'native'),f).split(path.sep)),versions=config.versions?.native||[];
  for(let i=0;i<versions.length;i+=2){const uuid=decodeUuid(typeof versions[i]==='number'?config.uuids[versions[i]]:versions[i]),stem=uuid+'.'+versions[i+1];if(!native.some(n=>n===stem||n.startsWith(stem+'.')))throw Error('Native cache key has no file: '+config.name+'/'+stem);nativeEntries++;}
  if(config.hasPreloadScript){const script=dir.includes(path.sep+'remote'+path.sep)?path.join(root,'src/bundle-scripts',config.name,'index.'+version+'.js'):dir.includes(path.sep+'subpackages'+path.sep)?path.join(dir,'game.js'):path.join(dir,'index.'+version+'.js');if(!fs.existsSync(script))throw Error('Bundle preload script is missing: '+script);}
 }
 const application=files.find(f=>/^application\.[a-f0-9]{5}\.js$/.test(path.basename(f))),map=files.find(f=>/^import-map\.[a-f0-9]{5}\.js$/.test(path.basename(f))),game=fs.readFileSync(path.join(root,'game.js'),'utf8');
 if(!fs.readFileSync(application,'utf8').includes(path.basename(sf)))throw Error('Application points to a missing settings version');
 if(!game.includes(path.basename(map)))throw Error('game.js points to a missing import-map version');
 return {bundles:configs.length,nativeEntries};
}
async function optimizePackage(source,output,{sharp,server,onProgress=()=>{}}={}){
 source=path.resolve(source);output=path.resolve(output);
 if(source===output||output.startsWith(source+path.sep)||source.startsWith(output+path.sep))throw Error('Input/output must be separate sibling directories');
 if(fs.existsSync(output))throw Error('Output directory already exists; preserve it or choose another output');
 if(!fs.existsSync(path.join(source,'project.config.json')))throw Error('Input is not an emitted WeChat package');
 if(!sharp)sharp=require(process.env.ZDHJY_SHARP_MODULE||'sharp');sharp.concurrency(2);
 const files=walk(source);fs.cpSync(source,output,{recursive:true,errorOnExist:true,force:false});
 const images=files.filter(f=>/\.(png|jpe?g)$/i.test(f)),changes=[];let cursor=0,done=0;
 await Promise.all([0,1].map(async()=>{while(cursor<images.length){const original=images[cursor++],relative=path.relative(source,original),file=path.join(output,relative),input=fs.readFileSync(original);if(input.length>=1024){const result=await compressImage(input,path.extname(original).toLowerCase(),sharp);if(result&&result.bytes.length<input.length*.98){const oldName=path.basename(file),version=oldName.match(/^(.*)\.([a-f0-9]{5})\.(png|jpe?g)$/i),hash=md5(result.bytes),newName=version?version[1]+'.'+hash+'.'+version[3]:oldName,target=path.join(path.dirname(file),newName);fs.writeFileSync(target,result.bytes);if(target!==file)fs.unlinkSync(file);changes.push({path:relative.split(path.sep).join('/'),output:path.relative(output,target).split(path.sep).join('/'),before:input.length,after:result.bytes.length,oldName,newName,uuid:version?.[1],oldVersion:version?.[2],newVersion:version?hash:undefined,width:result.width,height:result.height,method:result.method,psnr:result.psnr,alphaExact:result.alphaExact});}}onProgress(++done,images.length);}}));
 const replacements=new Map(changes.filter(c=>c.oldName!==c.newName).map(c=>[c.oldName,c.newName])),bundleVersions=new Map(),covered=new Set();
 for(const configFile of walk(output).filter(f=>/^config\.[a-f0-9]{5}\.json$/.test(path.basename(f)))){
  const config=JSON.parse(fs.readFileSync(configFile,'utf8')),native=config.versions?.native||[],nativeChanges=changes.filter(c=>c.path.startsWith(path.relative(output,path.dirname(configFile)).split(path.sep).join('/')+'/native/'));let changed=false;
  for(let i=0;i<native.length;i+=2){const uuid=decodeUuid(typeof native[i]==='number'?config.uuids[native[i]]:native[i]),item=nativeChanges.find(c=>c.uuid===uuid&&c.oldVersion===native[i+1]);if(item){native[i+1]=item.newVersion;covered.add(item.path);changed=true;}}
  if(!changed)continue;
  fs.writeFileSync(configFile,JSON.stringify(config));const version=md5(fs.readFileSync(configFile)),oldVersion=path.basename(configFile).split('.')[1];
  renameVersioned(configFile,replacements,version);bundleVersions.set(config.name,version);
  for(const script of new Set([path.join(path.dirname(configFile),'index.'+oldVersion+'.js'),path.join(output,'src/bundle-scripts',config.name,'index.'+oldVersion+'.js')]))if(fs.existsSync(script))renameVersioned(script,replacements,version);
 }
 for(const item of changes)if(item.path.includes('/native/')&&!covered.has(item.path))throw Error('A changed native texture has no matching bundle UUID/version: '+item.path);
 const settings=walk(output).filter(f=>/^settings\.[a-f0-9]{5}\.json$/.test(path.basename(f)));if(settings.length!==1)throw Error('Expected one settings file');
 const settingsFile=settings[0],data=JSON.parse(fs.readFileSync(settingsFile,'utf8'));for(const [name,version]of bundleVersions){if(!Object.hasOwn(data.assets.bundleVers,name))throw Error('Bundle missing from settings: '+name);data.assets.bundleVers[name]=version;}
 if(server){const before=new URL(data.assets.server),after=new URL(server);if(before.origin!==after.origin||!after.pathname.startsWith('/zdhjy/')||after.username||after.password||after.search||after.hash)throw Error('Optimized CDN must use the existing origin and an isolated game version');data.assets.server=server;}
 fs.writeFileSync(settingsFile,JSON.stringify(data));renameVersioned(settingsFile,replacements,md5(fs.readFileSync(settingsFile)));
 // settings -> application -> import-map -> unversioned game.js is a DAG.
 for(const kind of ['application','import-map'])for(const file of walk(output).filter(f=>new RegExp('^'+kind+'\\.[a-f0-9]{5}\\.js$').test(path.basename(f))))if(rewriteReferences(file,replacements))renameVersioned(file,replacements,md5(fs.readFileSync(file)));
 for(const file of walk(output).filter(f=>/\.(js|json|atlas)$/.test(f)))rewriteReferences(file,replacements);
 for(const file of walk(output).filter(f=>/^(settings|application|import-map)\.[a-f0-9]{5}\.(json|js)$/.test(path.basename(f))))if(path.basename(file).split('.')[1]!==md5(fs.readFileSync(file)))throw Error('Final fingerprint is stale: '+file);
 verifyCacheReferences(output);
 const {auditPackage}=require('./build-wechat.cjs');return {source,output,server:data.assets.server,imagesExamined:images.length,imagesChanged:changes.length,savedImageBytes:changes.reduce((s,c)=>s+c.before-c.after,0),before:auditPackage(source),after:auditPackage(output),changes};
}
module.exports={optimizePackage,compressImage,score,decodeUuid,verifyCacheReferences};
if(require.main===module){const [source,output,server]=process.argv.slice(2);if(!source||!output)throw Error('Usage: node tools/optimize-wechat-package.cjs <source-build> <new-output> [new-cdn-server]');optimizePackage(source,output,{server,onProgress:(n,total)=>{if(n%40===0||n===total)console.log('[images] '+n+'/'+total);}}).then(report=>{const dest=path.resolve(output)+'.optimization.json';fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({report:dest,imagesChanged:report.imagesChanged,mainMiB:report.after.mainBytes/1048576,totalMiB:report.after.totalBytes/1048576,remoteMiB:report.after.remoteBytes/1048576,passed:report.after.passed},null,2));}).catch(error=>{console.error('[optimize] '+error.message);process.exitCode=1;});}
