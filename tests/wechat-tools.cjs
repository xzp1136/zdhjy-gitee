'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { auditPackage, outputDirectory, readConfig, unwrapEditorResult } = require('../tools/build-wechat.cjs');
const { publicTarget, createPlan, validatePlan, loadCredentials, uploadPlan, contentType, assertPrefixUnused } = require('../tools/upload-wechat-cdn.cjs');
const { EventEmitter } = require('node:events');
const server = 'https://game2cdn.chujinggamefun.com/zdhjy/wechat/v0001/';

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdhjy-package-'));
    t.after(() => fs.rmSync(root, { recursive:true, force:true }));
    const write = (name, body) => { const file=path.join(root,name); fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,body); return file; };
    write('game.json', JSON.stringify({subpackages:[{name:'core',root:'subpackages/core'}]}));
    write('project.config.json', JSON.stringify({miniprogramRoot:'./',setting:{urlCheck:true},packOptions:{ignore:[{type:'folder',value:'remote'}],include:[]}}));
    write('game.js', 'game();');
    write('subpackages/core/index.js', 'bundle();');
    write('src/settings.json', JSON.stringify({assets:{server,remoteBundles:['flowers']}}));
    write('remote/flowers/config.abc.json', '{}');
    write('remote/flowers/native/flower.png', 'not-a-real-png');
    return {root,write};
}

test('package audit separates emitted main/subpackage/remote bytes and enforces actual 4/30 MiB thresholds', t => {
    const {root,write}=fixture(t);
    let report=auditPackage(root);
    assert.equal(report.passed,true);
    assert.equal(report.subpackages[0].bytes,Buffer.byteLength('bundle();'));
    assert.equal(report.remoteBytes,2+Buffer.byteLength('not-a-real-png'));
    assert.equal(report.totalBytes,report.mainBytes+report.subpackages[0].bytes);
    write('big.bin',Buffer.alloc(4*1024*1024));
    assert.equal(auditPackage(root).passed,false);
    fs.unlinkSync(path.join(root,'big.bin'));
    write('subpackages/core/big.bin',Buffer.alloc(30*1024*1024));
    report=auditPackage(root);assert.ok(report.mainBytes<4*1024*1024);assert.equal(report.passed,false);
});

test('package audit refuses to discount remote assets unless the emitted WeChat project truly excludes them', t => {
    const {root,write}=fixture(t);
    write('project.config.json',JSON.stringify({setting:{urlCheck:true}}));
    assert.throws(()=>auditPackage(root),/must exclude remote/);
    const config={setting:{urlCheck:true},packOptions:{ignore:[{type:'file',value:'remote'}]}};
    write('project.config.json',JSON.stringify(config));assert.throws(()=>auditPackage(root),/must exclude remote/);
    config.packOptions.ignore[0].type='folder';config.packOptions.include=[{type:'folder',value:'remote'}];
    write('project.config.json',JSON.stringify(config));assert.throws(()=>auditPackage(root),/cannot reinclude/);
    config.packOptions.include=[];config.setting.urlCheck=false;
    write('project.config.json',JSON.stringify(config));assert.throws(()=>auditPackage(root),/urlCheck=true/);
    const template=JSON.parse(fs.readFileSync(path.join(__dirname,'../build-templates/wechatgame/project.config.json'),'utf8'));
    write('project.config.json',JSON.stringify({...template,miniprogramRoot:'./'}));
    assert.equal(auditPackage(root).remoteExcludedByProjectConfig,true);
});

test('build config selects the intended app and scene without launching an editor', t => {
    const {root,write}=fixture(t), config={platform:'wechatgame',buildPath:'project://build',outputName:'wechatgame',startScene:'scene',scenes:[{uuid:'scene'}],packages:{wechatgame:{appid:'wx3ef66f850d873a67'}}};
    const file=write('build.json',JSON.stringify(config));assert.deepEqual(readConfig(file),config);
    assert.equal(outputDirectory(config,root),path.join(root,'build/wechatgame'));
    assert.equal(unwrapEditorResult(1),1);assert.equal(unwrapEditorResult({ok:true,result:1}),1);
    assert.throws(()=>unwrapEditorResult({ok:false,message:'failed'}),/failed/);
    write('build.json',JSON.stringify({...config,startScene:'missing'}));assert.throws(()=>readConfig(file),/scene/);
});

test('CDN plan stays in the new game namespace and refuses stale final artifacts', t => {
    const {root,write}=fixture(t), plan=createPlan(root,server);
    assert.equal(plan.files.length,2);assert.equal(plan.prefix,'zdhjy/wechat/v0001');
    assert.ok(plan.files.every(file=>file.objectKey.startsWith('zdhjy/wechat/v0001/remote/')));
    assert.equal(validatePlan(plan),plan);
    assert.throws(()=>publicTarget(server.replace('zdhjy','ndll')),/namespace/);
    assert.throws(()=>publicTarget(server.replace('game2cdn.chujinggamefun.com','other.example')),/CDN/);
    write('remote/flowers/config.abc.json','changed');
    assert.throws(()=>validatePlan(plan),/changed/);
});

test('credential loader keeps secrets out of plans and upload consumes only the validated manifest', async t => {
    const {root,write}=fixture(t), plan=createPlan(root,server);
    const env=write('test.env','OSS_BUCKET=yaocheng-2\nOSS_ENDPOINT=oss-cn-shenzhen.aliyuncs.com\nOSS_ACCESS_KEY_ID="test-id"\nOSS_ACCESS_KEY_SECRET=\'test-secret\'\nUNRELATED=ignored\n');
    const credentials=loadCredentials(env,{});
    assert.equal(credentials.OSS_ACCESS_KEY_SECRET,'test-secret');assert.equal(credentials.UNRELATED,undefined);
    assert.equal(JSON.stringify(plan).includes('test-secret'),false);
    assert.equal(contentType('sound.m4a'),'audio/mp4');
    const sent=[],progress=[];
    const result=await uploadPlan(plan,credentials,{ensureUnused:async()=>{},put:async file=>{sent.push(file.objectKey);},onProgress:n=>progress.push(n)});
    assert.equal(result.files,2);assert.deepEqual(sent.sort(),plan.files.map(file=>file.objectKey).sort());assert.deepEqual(progress,[1,2]);
    await assert.rejects(uploadPlan(plan,credentials,{ensureUnused:async()=>{throw Error('occupied');},put:async()=>assert.fail('must not overwrite')}),/occupied/);
});

test('prefix preflight lists only the new namespace and rejects any occupied or unverifiable destination', async () => {
    const credentials={OSS_BUCKET:'yaocheng-2',OSS_ENDPOINT:'oss-cn-shenzhen.aliyuncs.com',OSS_ACCESS_KEY_ID:'fake',OSS_ACCESS_KEY_SECRET:'fake'};
    const respond=(body,status=200)=>(options,callback)=>{
        assert.equal(options.method,'GET');assert.equal(options.path,'/?prefix=zdhjy%2Fwechat%2Fv0001%2F&max-keys=1');
        const request=new EventEmitter();request.end=()=>{const response=new EventEmitter();response.statusCode=status;callback(response);response.emit('data',Buffer.from(body));response.emit('end');};return request;
    };
    await assertPrefixUnused({server},credentials,respond('<ListBucketResult><Prefix>zdhjy/wechat/v0001/</Prefix></ListBucketResult>'));
    await assert.rejects(assertPrefixUnused({server},credentials,respond('<ListBucketResult><Contents><Key>occupied</Key></Contents></ListBucketResult>')),/already contains/);
    await assert.rejects(assertPrefixUnused({server},credentials,respond('secret response is not logged',403)),error=>error.message.includes('403')&&!error.message.includes('secret'));
});

test('package audit rejects symlinks and missing declared subpackages', t => {
    const {root,write}=fixture(t);
    write('game.json',JSON.stringify({subpackages:[{name:'missing',root:'absent'}]}));
    assert.throws(()=>auditPackage(root),/empty or absent/);
    write('game.json','{}');fs.symlinkSync(os.tmpdir(),path.join(root,'outside'));
    assert.throws(()=>auditPackage(root),/symlink/);
});
