#!/usr/bin/env node
'use strict';
// Read-only verification of the running editor's actual imported dependency chain.
const fs = require('node:fs');
const path = require('node:path');
const {call} = require('./cocos_mcp.cjs');
const project = path.resolve(__dirname, '..');

async function main() {
    const plan = JSON.parse(fs.readFileSync(path.join(project, 'docs/reference/bundle-migration-plan.json'), 'utf8'));
    const entries = plan.moves.filter(entry => entry.target.includes('/effects/spine/') && entry.target.endsWith('.json'));
    const result = await call('execute_javascript', {context: 'editor', args: {project, entries}, code: `
async function run({Editor,args}) {
    const zfs=require('fs'),zpath=require('path');
    if(Editor.Project.path!==args.project)throw Error('Wrong project');
    const results=[];
    for(const entry of args.entries){
        const info=await Editor.Message.request('asset-db','query-asset-info',entry.target);
        if(!info||info.uuid!==entry.uuid)throw Error('Skeleton UUID mismatch');
        const data=JSON.parse(zfs.readFileSync(info.library['.json'],'utf8'));
        const atlas=zfs.readFileSync(info.file.replace(/\\.json$/,'.atlas'),'utf8');
        if(data.__type__!=='sp.SkeletonData'||data._atlasText!==atlas)throw Error('Skeleton atlas mismatch '+info.name);
        if(!data.textures.length||data.textures.length!==data.textureNames.length)throw Error('Missing Spine textures '+info.name);
        const dependencies=await Editor.Message.request('asset-db','query-asset-dependencies',entry.target);
        const textures=[];
        for(let i=0;i<data.textures.length;i++){
            const uuid=data.textures[i].__uuid__;
            if(!dependencies.includes(uuid))throw Error('Missing asset-db dependency '+info.name);
            const tex=await Editor.Message.request('asset-db','query-asset-info',uuid);
            if(!tex||tex.invalid||tex.type!=='cc.Texture2D')throw Error('Invalid Texture2D '+info.name);
            const textureData=JSON.parse(zfs.readFileSync(tex.library['.json'],'utf8'));
            const imageUuid=textureData.content.mipmaps[0];
            const imageInfo=await Editor.Message.request('asset-db','query-asset-info',imageUuid);
            if(!imageInfo||imageInfo.invalid||imageInfo.file!==zpath.join(zpath.dirname(info.file),data.textureNames[i]))throw Error('Wrong texture image '+info.name);
            if(!Object.values(imageInfo.library).some(file=>file.endsWith('.png')&&zfs.existsSync(file)))throw Error('Missing imported image bytes '+info.name);
            textures.push({name:data.textureNames[i],textureUuid:uuid,imageUuid,imageUrl:imageInfo.url});
        }
        results.push({name:info.name,uuid:info.uuid,atlasBytes:Buffer.byteLength(atlas),dependencies,textures});
    }
    return {passed:true,checkedAt:new Date().toISOString(),count:results.length,results};
}`});
    console.log(JSON.stringify(result, null, 2));
}
main().catch(error => {console.error(error.message); process.exitCode=1;});
