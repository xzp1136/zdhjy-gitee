const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript');
const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../assets/scripts/FlowerAssets.ts'), 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS},
}).outputText;

function harness(options = {}) {
  const routes = {routes: {'original/flower/a': 'flowers-01', 'original/flower/b': 'flowers-01', 'original/data/board': 'core-data'},
    bundles: {'flowers-01': {remote: true}, 'core-data': {remote: false}}};
  const requests = [], bundleRequests = [], live = new Map();
  let routeFails = options.routeFails || 0, bundleFails = options.bundleFails || 0, assetFails = options.assetFails || 0;
  class JsonAsset {} class SpriteFrame {} class Font {}
  const read = (owner, resource, type, callback) => {
    requests.push({owner, resource, type});
    queueMicrotask(() => {
      if (resource === 'bundle-routes') {
        if (routeFails-- > 0) callback(new Error('routing unavailable')); else callback(null, {json: routes});
      } else if (assetFails-- > 0) callback(new Error('asset unavailable'));
      else callback(null, {owner, resource, type});
    });
  };
  const cc = {JsonAsset, SpriteFrame, Font,
    sys: {platform: options.wechat ? 'wechat' : 'web', Platform: {WECHAT_GAME: 'wechat'}},
    resources: {load: (resource, type, callback) => read('resources', resource, type, callback)},
    assetManager: {downloader: {remoteServerAddress: options.server || ''},
      getBundle: name => live.get(name),
      loadBundle(name, callback) {
        bundleRequests.push(name);
        queueMicrotask(() => {
          if (bundleFails-- > 0) { callback(new Error('bundle unavailable')); return; }
          const bundle = {load: (resource, type, done) => read(name, resource, type, done)};
          live.set(name, bundle); callback(null, bundle);
        });
      }},
  };
  const scope = {exports: {}, require(name) { if (name === 'cc') return cc; if (name === 'cc/env') return {PREVIEW: !!options.preview}; throw Error(name); }};
  vm.runInNewContext(source, scope);
  const load = (resource, Type = SpriteFrame) => new Promise((resolve, reject) => scope.exports.loadFlowerAsset(resource, Type,
    (error, asset) => error ? reject(error) : resolve(asset)));
  return {load, requests, bundleRequests, routes, cc, JsonAsset, SpriteFrame, Font};
}

test('concurrent original paths share the route table and named bundle, keeping spriteFrame suffix and type', async () => {
  const h = harness({preview: true});
  const result = await Promise.all([h.load('original/flower/a/spriteFrame'), h.load('original/flower/b/spriteFrame'), h.load('original/data/board', h.JsonAsset)]);
  assert.equal(h.requests.filter(r => r.resource === 'bundle-routes').length, 1);
  assert.deepEqual(h.bundleRequests, ['flowers-01', 'core-data']);
  assert.equal(result[0].resource, 'original/flower/a/spriteFrame'); assert.equal(result[0].type, h.SpriteFrame);
  assert.equal(result[2].owner, 'core-data'); assert.equal(result[2].type, h.JsonAsset);
  await h.load('original/flower/a/spriteFrame'); assert.equal(h.bundleRequests.length, 2);
});

test('unrouted first-paint assets stay in resources and never open a bundle', async () => {
  const h = harness(); const value = await h.load('original/extras/bgLoad_8/spriteFrame');
  assert.equal(value.owner, 'resources'); assert.deepEqual(h.bundleRequests, []);
});

test('route failure and bundle failure both evict pending promises and permit retry', async () => {
  const h = harness({routeFails: 1, bundleFails: 1, preview: true});
  await assert.rejects(h.load('original/flower/a/spriteFrame'), /routing unavailable/);
  await assert.rejects(h.load('original/flower/a/spriteFrame'), /bundle unavailable/);
  assert.equal((await h.load('original/flower/a/spriteFrame')).owner, 'flowers-01');
  assert.equal(h.requests.filter(r => r.resource === 'bundle-routes').length, 2);
  assert.deepEqual(h.bundleRequests, ['flowers-01', 'flowers-01']);
});

test('individual asset errors do not poison a loaded bundle or strand its next callback', async () => {
  const h = harness({assetFails: 1, preview: true});
  await assert.rejects(h.load('original/flower/a/spriteFrame'), /asset unavailable/);
  assert.equal((await h.load('original/flower/a/spriteFrame')).owner, 'flowers-01');
  assert.equal(h.bundleRequests.length, 1);
});

test('WeChat without a configured CDN reports the missing server while local core and editor preview remain usable', async () => {
  const h = harness({wechat: true});
  await assert.rejects(h.load('original/flower/a/spriteFrame'), /尚未配置远程资源地址/);
  assert.equal(h.bundleRequests.length, 0);
  assert.equal((await h.load('original/data/board', h.JsonAsset)).owner, 'core-data');
  h.cc.assetManager.downloader.remoteServerAddress = 'https://configured.example/';
  await h.load('original/flower/a/spriteFrame'); assert.deepEqual(h.bundleRequests, ['core-data', 'flowers-01'], 'use Creator bundle names, never forge URLs');
  const preview = harness({wechat: true, preview: true}); await preview.load('original/flower/a/spriteFrame');
  assert.deepEqual(preview.bundleRequests, ['flowers-01']);
});
