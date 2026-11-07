const resourceFile = require('./resource-file.cjs');
// Runs the real startup, catalog, rules and asset caches against an async Cocos loader.
// Render-heavy entry points are reduced to their real asset-consuming helpers.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript');
const project = path.join(__dirname, '..');
const compiled = new Map();
const flush = () => new Promise(resolve => setImmediate(resolve));

function harness() {
  const modules = new Map(), requests = [], downloads = [], bundleRequests = [], cached = new Map(), failures = new Map(), delayed = new Map(), logs = [];
  class Vec3 { constructor(x = 0, y = 0, z = 0) { Object.assign(this, {x, y, z}); } }
  class Node {
    static EventType = {NODE_DESTROYED: 'destroyed'};
    constructor(name = '') { Object.assign(this, {name, isValid: true, active: true, layer: 1, children: [], components: [], events: new Map(), position: new Vec3(), scale: new Vec3(1, 1, 1)}); }
    addChild(node) { node.parent = this; this.children.push(node); }
    addComponent(Type) { const value = new Type(); value.node = this; this.components.push(value); return value; }
    getComponent(Type) { return this.components.find(value => value instanceof Type) || null; }
    getChildByName(name) { return this.children.find(value => value.name === name) || null; }
    setPosition(x, y, z = 0) { this.position = typeof x === 'object' ? new Vec3(x.x, x.y, x.z) : new Vec3(x, y, z); }
    setScale(x, y, z = 1) { this.scale = typeof x === 'object' ? new Vec3(x.x, x.y, x.z) : new Vec3(x, y, z); }
    setSiblingIndex(index) { const siblings = this.parent.children; siblings.splice(siblings.indexOf(this), 1); siblings.splice(Math.min(index, siblings.length), 0, this); }
    on(event, callback) { if (!this.events.has(event)) this.events.set(event, new Set()); this.events.get(event).add(callback); }
    off(event, callback) { this.events.get(event)?.delete(callback); }
    removeFromParent() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null; }
    destroy() { if (!this.isValid) return; this.isValid = false; for (const cb of [...(this.events.get('destroyed') || [])]) cb(); for (const child of [...this.children]) child.destroy(); this.removeFromParent(); }
  }
  class Component { isValid = true; scheduleOnce() {} unschedule() {} }
  class UITransform { setContentSize(width, height) { Object.assign(this, {width, height}); } setAnchorPoint() {} }
  class SpriteFrame { constructor(width = 100, height = 100) { this.originalSize = {width, height}; this.isValid = true; } clone() { return new SpriteFrame(this.originalSize.width, this.originalSize.height); } destroy() { this.isValid = false; } }
  class Sprite { static SizeMode = {CUSTOM: 0}; static Type = {SLICED: 1}; }
  class Color { fromHEX() { return this; } }
  class Graphics { clear() {} roundRect() {} fill() {} }
  class Mask { static Type = {GRAPHICS_RECT: 0, GRAPHICS_STENCIL: 1}; subComp = new Graphics(); }
  class AudioSource { stop() { this.playing = false; } play() { this.playing = true; } playOneShot() {} }
  class JsonAsset {} class Font {} class AudioClip {} class SkeletonData {}
  const storage = new Map();
  const cc = {
    _decorator: {ccclass: () => value => value, property: () => () => {}},
    Component, Node, Vec3, UITransform, SpriteFrame, Sprite, Color, Graphics, Mask, AudioSource, AudioClip, JsonAsset, Font,
    sp: {SkeletonData}, BlockInputEvents: class {}, UIOpacity: class {},
    game: {on() {}, off() {}}, Tween: {stopAllByTarget() {}},
    sys: {isBrowser: false, platform: 'web', Platform: {WECHAT_GAME: 'wechat'}, localStorage: {getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value)}},
    resources: {load(resource, Type, callback) {
      requests.push(resource);
      const complete = () => {
        const remaining = failures.get(resource) || 0;
        if (remaining) { failures.set(resource, remaining - 1); callback(new Error('Injected asset failure: ' + resource)); return; }
        if (!cached.has(resource)) {
          let value;
          if (resource === 'bundle-routes' && !fs.existsSync(path.join(project, 'assets/resources/bundle-routes.json'))) value = {json: {routes: {}, bundles: {}}};
          else if (Type === JsonAsset) value = {json: JSON.parse(fs.readFileSync(resourceFile(resource + '.json'), 'utf8'))};
          else if (Type === SpriteFrame) {
            const png = fs.readFileSync(resourceFile(resource.replace(/\/spriteFrame$/, '') + '.png'));
            value = new SpriteFrame(png.readUInt32BE(16), png.readUInt32BE(20));
          } else value = new Type();
          cached.set(resource, value); downloads.push(resource);
        }
        callback(null, cached.get(resource));
      };
      if (delayed.has(resource)) delayed.get(resource).push(complete); else queueMicrotask(complete);
    }},
  };
  const liveBundles = new Map();
  cc.assetManager = {downloader: {remoteServerAddress: ''}, getBundle: name => liveBundles.get(name), loadBundle(name, callback) {
    bundleRequests.push(name);
    const bundle = {load: cc.resources.load}; liveBundles.set(name, bundle); queueMicrotask(() => callback(null, bundle));
  }};
  function load(name) {
    if (modules.has(name)) return modules.get(name);
    const exports = {}; modules.set(name, exports);
    if (!compiled.has(name)) compiled.set(name, ts.transpileModule(fs.readFileSync(path.join(project, 'assets/scripts', name + '.ts'), 'utf8'), {
      compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, experimentalDecorators: true},
    }).outputText);
    vm.runInNewContext(compiled.get(name), {exports, console: {warn: (...args) => logs.push(args), error: (...args) => logs.push(args), info() {}}, setTimeout, clearTimeout,
      require(request) {
        if (request === 'cc') return cc;
        if (request === 'cc/env') return {DEBUG: false, PREVIEW: true};
        if (request === './FlowerButtonMotion') return {FlowerButtonMotion: class {}};
        if (request.startsWith('./')) return load(request.slice(2));
        throw new Error(request);
      }});
    return exports;
  }
  const {FlowerGame} = load('FlowerGame');
  const {FlowerBouquetView} = load('FlowerBouquet');
  const {FlowerPoolView} = load('FlowerPool');
  const game = new FlowerGame(); game.node = new Node('Scene');
  game.music = new AudioSource(); game.effects = new AudioSource();
  const ui = load('FlowerUI'), dialogs = [];
  ui.message = async (parent, title, body, action, callback) => { dialogs.push({title, body, action, callback}); return new Node('Dialog'); };
  // Exercise the same preloaded vase/image paths without the unrelated HUD/tween machinery.
  game.buildHUD = async () => {};
  game.renderOrders = async () => {
    for (const order of game.rules.orders.filter(Boolean)) await FlowerBouquetView.create(game.ordersRoot, order);
  };
  game.renderTray = async () => {};
  game.spawnFlowers = async () => { await FlowerPoolView.preload(game.rules.flowers); game.pool = {entering: false, playEntrance() {}, dispose() {}}; };
  game.buildTools = async () => {}; game.updateHUD = () => {}; game.showGuide = async () => {};
  game.enterBouquet = async () => true;
  const homeState = {builds: 0};
  game.showHome = async () => { homeState.builds++; game.clear('home'); game.ready = true; game.busy = false; game.bgm('bgm_home'); };
  const loadingRoot = new Node('StartupLoading'); game.node.addChild(loadingRoot);
  const loading = {root: loadingRoot, reports: [], finishes: 0, errors: 0, disposed: false,
    setProgress(value) { this.reports.push(value); }, async finish() { this.finishes++; this.root.destroy(); return true; },
    setError(retry) { this.errors++; this.retry = retry; }, dispose() { this.disposed = true; this.root.destroy(); }};
  game.startupLoading = loading;
  return {game, loading, homeState, load, requests, downloads, bundleRequests, cached, failures, delayed, dialogs, logs, Node, storage,
    release(resource) { const jobs = delayed.get(resource); delayed.delete(resource); jobs.forEach(callback => queueMicrotask(callback)); }};
}

test('a failed bouquet JSON preload is evicted so the same session can retry', async () => {
  const h = harness(), resource = 'original/data/bouquet-layouts'; h.failures.set(resource, 1);
  const {preloadBouquets} = h.load('FlowerBouquet');
  await assert.rejects(preloadBouquets([1301]), /Injected asset failure/);
  const [layouts] = await preloadBouquets([1301]);
  assert(layouts['1301']); assert.equal(h.requests.filter(path => path === resource).length, 2);
  const downloads = h.downloads.length; await preloadBouquets([1301]); assert.equal(h.downloads.length, downloads);
});

test('startup prepares the first board once and entering it reuses frames, data, effects and audio', async () => {
  const h = harness(); await h.game.loadStartup();
  assert.equal(h.loading.finishes, 1, h.logs.flat().map(String).join('\n')); assert.equal(h.homeState.builds, 1); assert.equal(h.game.startupLoading, null);
  assert.equal(h.loading.reports.at(-1), 1); assert.equal(h.game.rules, null);
  const routes = h.cached.get('bundle-routes').json;
  for (const name of h.bundleRequests) assert.equal(routes.bundles[name].remote, false, `startup must work without CDN: ${name}`);
  // Disable optional level 2 background warmup solely to measure entry's own I/O.
  h.game.catalog.levels.delete(2);
  const before = h.downloads.length; await h.game.startLevel(1); await flush();
  assert.equal(h.game.rules.level, 1); assert.equal(h.game.ready, true);
  assert.deepEqual(h.downloads.slice(before), [], 'first entry has no cold asset fetch after startup preparation');
  assert.equal(h.requests.filter(path => path === 'original/background/poor/spriteFrame').length, 1, 'UI cache avoids even a second frame loader call');
  assert.equal(h.requests.filter(path => path === 'original/data/bouquet-layouts').length, 1);
});

test('next-level preparation deduplicates concurrent requests without changing the active rules or presentation', async () => {
  const h = harness(); const {FlowerRules} = h.load('FlowerRules');
  const {FlowerPresentationState} = h.load('FlowerGame');
  h.game.rules = new FlowerRules(); h.game.rules.select(h.game.rules.flowers[0].id);
  h.game.visual = new FlowerPresentationState(h.game.rules);
  const rules = h.game.rules, visual = h.game.visual, before = JSON.stringify({rules, visual});
  const first = h.game.prepareLevelAssets(2), second = h.game.prepareLevelAssets(2);
  assert.equal(first, second); const config = await first;
  assert.equal(config.level, 2); assert.equal(h.game.rules, rules); assert.equal(h.game.visual, visual);
  assert.equal(JSON.stringify({rules, visual}), before); assert.equal(h.storage.size, 0);
  const requests = h.requests.length; await h.game.prepareLevelAssets(2); assert.equal(h.requests.length, requests);
});

test('startup failure is visible and retry can complete without rebuilding successful frame downloads', async () => {
  const h = harness(), resource = 'original/background/poor/spriteFrame'; h.failures.set(resource, 1);
  await h.game.loadStartup(); await flush();
  assert.equal(h.loading.errors, 1); assert.equal(h.loading.finishes, 0); assert.equal(h.homeState.builds, 0);
  assert.equal(h.game.preparedLevels.has(1), false);
  const alreadyLoaded = new Set(h.downloads); await h.loading.retry();
  assert.equal(h.loading.finishes, 1); assert.equal(h.homeState.builds, 1); assert.equal(h.game.startupLoading, null);
  for (const path of alreadyLoaded) assert.equal(h.downloads.filter(value => value === path).length, 1, path);
});

test('destroying the owner while startup waits prevents late UI creation and completion', async () => {
  const h = harness(), resource = 'original/background/poor/spriteFrame'; h.delayed.set(resource, []);
  const pending = h.game.loadStartup(); await flush(); assert.equal(h.delayed.get(resource).length, 1);
  h.game.isValid = false; h.game.onDestroy(); h.release(resource); await pending;
  assert.equal(h.loading.disposed, true); assert.equal(h.loading.finishes, 0); assert.equal(h.homeState.builds, 0);
  assert.equal(h.game.rules, null); assert.equal(h.game.node.children.length, 0);
});

test('leaving a waiting level preserves the replacement screen and a later retry uses the completed cache', async () => {
  const h = harness(), resource = 'original/background/poor/spriteFrame'; h.game.startupLoading = null;
  h.game.clear('home'); h.delayed.set(resource, []);
  const pending = h.game.startLevel(1); await flush(); assert.equal(h.delayed.get(resource).length, 1);
  h.game.clear('home'); const replacement = h.game.content;
  h.release(resource); await pending;
  assert.equal(h.game.content, replacement); assert.equal(h.game.sceneMode, 'home'); assert.equal(h.game.rules, null);
  h.game.catalog.levels.delete(2); const downloads = h.downloads.length;
  await h.game.startLevel(1); assert.equal(h.game.rules.level, 1); assert.equal(h.game.ready, true);
  // Sound is normally covered by startup; this direct-call fixture bypassed it.
  assert(h.downloads.slice(downloads).every(path => path.startsWith('original/audio/')));
});

test('saved levels normalize to real catalog entries, including old 86 and malformed values', () => {
  const {normalizePlayableLevel} = harness().load('FlowerGame');
  const levels = [1, 2, 3, 85];
  for (const [value, expected] of [[86, 85], [99999, 85], [NaN, 1], [-8, 1], [0, 1], [2.9, 2], [84, 3]]) {
    assert.equal(normalizePlayableLevel(value, levels), expected);
  }
  assert.throws(() => normalizePlayableLevel(1, []), /没有可用关卡/);
});

test('startup repairs old over-limit progress before preparing a board and still reaches home', async () => {
  const h = harness(), prepared = []; h.storage.set('zdhjy.level', '86');
  h.game.prepareLevelAssets = async level => { prepared.push(level); return h.game.catalog.level(level); };
  await h.game.loadStartup();
  assert.deepEqual(prepared, [85]); assert.equal(h.storage.get('zdhjy.level'), '85');
  assert.equal(h.homeState.builds, 1); assert.equal(h.loading.finishes, 1); assert.equal(h.loading.errors, 0);
});

test('invalid saved progress falls back to the first available board', async () => {
  for (const saved of ['NaN', '-3', '0']) {
    const h = harness(), prepared = []; h.storage.set('zdhjy.level', saved);
    h.game.prepareLevelAssets = async level => { prepared.push(level); return h.game.catalog.level(level); };
    await h.game.loadStartup();
    assert.deepEqual(prepared, [1]); assert.equal(h.storage.get('zdhjy.level'), '1'); assert.equal(h.loading.finishes, 1);
  }
});

test('an early catalog download error retains startup retry instead of stranding old progress', async () => {
  const h = harness(), resource = 'original/data/original-level-info-tables';
  h.storage.set('zdhjy.level', '86'); h.failures.set(resource, 1);
  h.game.prepareLevelAssets = async level => h.game.catalog.level(level);
  await h.game.loadStartup();
  assert.equal(h.loading.errors, 1); assert.equal(h.loading.finishes, 0); assert.equal(h.homeState.builds, 0);
  assert.equal(h.storage.get('zdhjy.level'), '86', 'no repair based on an unavailable catalog');
  await h.loading.retry();
  assert.equal(h.storage.get('zdhjy.level'), '85'); assert.equal(h.homeState.builds, 1); assert.equal(h.loading.finishes, 1);
});

test('winning the last known board caps progress and offers a replay without ever requesting 86', async () => {
  const h = harness(), results = [], started = [];
  h.game.catalog = await h.load('FlowerCatalog').FlowerCatalog.load();
  h.load('FlowerResults').createWinResult = async (...args) => { results.push(args); return new h.Node(); };
  h.game.startLevel = async level => { started.push(level); }; h.game.sound = () => {};
  h.game.rules = {status:'won',level:85,stars:3,coins:10,coinReward:10}; h.storage.set('zdhjy.level','86');
  await h.game.endLevel();
  assert.equal(h.storage.get('zdhjy.level'),'85'); assert.equal(results[0][6],'再玩一次');
  results[0][4](); assert.deepEqual(started,[85]); assert.equal(typeof results[0][5],'function');
  h.game.finished = false; h.game.rules = {status:'won',level:84,stars:3,coins:10,coinReward:10};
  await h.game.endLevel();
  assert.equal(results[1][6],'下一关'); results[1][4](); assert.deepEqual(started,[85,85]);
});
