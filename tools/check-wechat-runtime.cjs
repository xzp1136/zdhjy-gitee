#!/usr/bin/env node
'use strict';
// Execute emitted System.register modules and their emitted Babel helpers.
// No TypeScript transpilation, source-function substitution, rendering or network.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const PROJECT = path.resolve(__dirname, '..');

function walk(root) {
    return fs.readdirSync(root, {withFileTypes: true}).flatMap(entry => entry.isDirectory()
        ? walk(path.join(root, entry.name)) : entry.isFile() ? [path.join(root, entry.name)] : []);
}
function single(root, pattern) {
    const files = fs.readdirSync(root).filter(name => pattern.test(name));
    if (files.length !== 1) throw Error(`Expected one ${pattern} in ${root}, found ${files.length}`);
    return path.join(root, files[0]);
}

function loadRuntime(buildRoot) {
    buildRoot = path.resolve(buildRoot);
    const registry = new Map(), namespaces = new Map(), executed = [], warnings = [], requests = [], openedBundles = new Map();
    const bundleConfigs = new Map(), jsonIndexes = new Map();
    const settingsPath = single(path.join(buildRoot, 'src'), /^settings(?:\.[^.]+)?\.json$/);
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    function bundleRoot(name) {
        const candidates = ['assets', 'subpackages', 'remote'].map(folder => path.join(buildRoot, folder, name)).filter(folder => fs.existsSync(folder));
        if (candidates.length !== 1) throw Error(`Ambiguous or missing emitted bundle: ${name}`);
        return candidates[0];
    }
    function config(name) {
        if (!bundleConfigs.has(name)) bundleConfigs.set(name, JSON.parse(fs.readFileSync(single(bundleRoot(name), /^config(?:\.[^.]+)?\.json$/), 'utf8')));
        return bundleConfigs.get(name);
    }
    function declared(name, logical) {
        const data = config(name), found = Object.values(data.paths).find(row => row[0] === logical);
        if (!found) throw Error(`Compiled asset request is absent from emitted ${name}: ${String(logical)}`);
        return data.types[found[1]];
    }
    function jsonAsset(name, logical) {
        assert.equal(declared(name, logical), 'cc.JsonAsset');
        if (!jsonIndexes.has(name)) {
            const index = new Map();
            for (const file of walk(path.join(bundleRoot(name), config(name).importBase || 'import')).filter(file => file.endsWith('.json'))) {
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                // These emitted, unpacked Creator 3.8 JsonAssets describe _name/json
                // in their serialization table. Refuse an unknown packed format.
                if (!Array.isArray(data) || !data[3]?.some(row => Array.isArray(row) && row[0] === 'cc.JsonAsset')) continue;
                for (const row of data[5] || []) {
                    if (!Array.isArray(row) || typeof row[1] !== 'string' || row.length < 3) throw Error(`Unexpected emitted JsonAsset layout: ${file}`);
                    if (index.has(row[1])) throw Error(`Ambiguous JsonAsset basename in ${name}: ${row[1]}`);
                    index.set(row[1], row[2]);
                }
            }
            jsonIndexes.set(name, index);
        }
        const basename = logical.split('/').at(-1), index = jsonIndexes.get(name);
        if (!index.has(basename)) throw Error(`Cannot decode emitted JsonAsset ${logical}`);
        return {json: index.get(basename)};
    }

    class Component {}
    class Node {
        static EventType = {NODE_DESTROYED: 'destroyed'};
        constructor(name = '') { Object.assign(this, {name, layer: 1, isValid: true, children: [], components: [], position: {x: 0, y: 0, z: 0}}); }
        addChild(node) { this.children.push(node); node.parent = this; }
        addComponent(Type) { const value = new Type(); value.node = this; this.components.push(value); return value; }
        getComponent(Type) { return this.components.find(value => value instanceof Type) || null; }
        setPosition(x, y, z = 0) { this.position = {x, y, z}; }
    }
    class UITransform { setContentSize(width, height) { Object.assign(this, {width, height}); } }
    class Label {
        static HorizontalAlign = {CENTER: 0}; static VerticalAlign = {CENTER: 0}; static Overflow = {NONE: 0};
        useSystemFont = true;
    }
    class Color { fromHEX() { return this; } }
    class JsonAsset {} class Font {} class SpriteFrame {} class SkeletonData {} class AudioClip {}
    const storage = new Map();
    const owner = name => ({load(logical, Type, callback) {
        requests.push({bundle: name, logical});
        queueMicrotask(() => {
            try {
                declared(name, logical);
                callback(null, Type === JsonAsset ? jsonAsset(name, logical) : Object.assign(new Type(), {resource: logical, isValid: true}));
            } catch (error) { callback(error); }
        });
    }});
    const cc = {
        cclegacy: {_RF: {push() {}, pop() {}}},
        _decorator: {ccclass: () => value => value, property: () => () => {}},
        Component, Node, UITransform, Label, Color, JsonAsset, Font, SpriteFrame, AudioClip,
        Vec3: class {constructor(x = 0, y = 0, z = 0) { Object.assign(this, {x, y, z}); }},
        sp: {SkeletonData},
        sys: {isBrowser: false, platform: 'wechat', Platform: {WECHAT_GAME: 'wechat'},
            // wx.getStorageSync returns an empty string for an absent key.
            localStorage: {getItem: key => storage.get(key) ?? '', setItem: (key, value) => storage.set(key, String(value))}},
        resources: owner('resources'),
        assetManager: {downloader: {remoteServerAddress: settings.assets.server}, getBundle: name => openedBundles.get(name),
            loadBundle(name, callback) { queueMicrotask(() => { try { config(name); const value = owner(name); openedBundles.set(name, value); callback(null, value); } catch (error) { callback(error); } }); }},
    };
    const context = vm.createContext({console: {warn: (...args) => warnings.push(args.join(' ')), error: (...args) => warnings.push(args.join(' ')), info() {}},
        System: {register(name, dependencies, declare) {
            if (Array.isArray(name)) {
                // Creator's common chunk is an anonymous shell registering named modules.
                if (name.length) throw Error('Unexpected external dependencies in anonymous bundle shell');
                dependencies(() => {}, {}).execute(); return;
            }
            if (registry.has(name)) throw Error(`Duplicate emitted module: ${name}`);
            registry.set(name, {dependencies, declare});
        }}});
    // No window, URLSearchParams, wx, timers or network APIs enter the VM.
    const common = walk(path.join(buildRoot, 'src/chunks')).filter(file => file.endsWith('.js')).sort();
    const entry = single(path.join(buildRoot, 'assets/start-scene'), /^index(?:\.[^.]+)?\.js$/);
    for (const file of [...common, entry]) vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename: file, timeout: 10000});
    function load(name) {
        if (name === 'cc') return cc;
        if (namespaces.has(name)) return namespaces.get(name);
        const record = registry.get(name);
        if (!record) throw Error(`Missing emitted dependency: ${name}`);
        const exports = {}; namespaces.set(name, exports);
        const declaration = record.declare((key, value) => {
            if (typeof key === 'string') exports[key] = value; else Object.assign(exports, key);
            return value;
        }, {id: name});
        record.dependencies.forEach((dependency, index) => declaration.setters?.[index]?.(load(dependency.startsWith('.') ? new URL(dependency, name).href : dependency)));
        declaration.execute(); executed.push(name); return exports;
    }
    return {load: name => load(`chunks:///_virtual/${name}`), entry, requests, executed, warnings, cc, storage,
        artifacts: [...common, entry].map(file => ({file: path.relative(buildRoot, file), sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))};
}

async function checkRuntime(buildRoot = path.join(PROJECT, 'build/wechatgame')) {
    const runtime = loadRuntime(buildRoot), results = [];
    const check = async (name, run) => {
        try { await run(); results.push({name, passed: true}); }
        catch (error) { results.push({name, passed: false, error: error.message}); }
    };
    const load = name => runtime.load(name + '.ts');
    await check('emitted environment is production WeChat without browser-only globals', () => {
        const env = runtime.load('env'); assert.equal(env.DEBUG, false); assert.equal(env.PREVIEW, false);
        assert.equal(runtime.cc.sys.platform, runtime.cc.sys.Platform.WECHAT_GAME);
    });
    await check('compiled startup completes real jobs before finalize and reports the final count', async () => {
        const events = [], progress = [];
        const finished = await load('FlowerStartup').runStartupTasks([
            async () => { events.push('a'); }, async () => { events.push('b'); },
        ], (done, total) => progress.push([done, total]), () => true, async () => { events.push('final'); });
        assert.equal(finished, true); assert.deepEqual(events, ['a', 'b', 'final']); assert.deepEqual(progress.at(-1), [3, 3]);
    });
    await check('compiled level normalization consumes Map.keys and clamps legacy level 86 to 85', () => {
        const normalize = load('FlowerGame').normalizePlayableLevel;
        assert.equal(normalize(86, new Map([[1, {}], [85, {}]]).keys()), 85);
        assert.equal(normalize(NaN, new Map([[1, {}], [85, {}]]).keys()), 1);
    });
    await check('compiled save reader defaults missing WeChat empty strings, preserves saved zero and rejects invalid numbers', () => {
        const read = load('FlowerGame').FlowerGame.prototype.read, key = 'runtime-check', stored = 'zdhjy.' + key;
        runtime.storage.delete(stored);
        assert.equal(runtime.cc.sys.localStorage.getItem(stored), '');
        assert.equal(read.call({}, key, 2), 2);
        runtime.storage.set(stored, '0'); assert.equal(read.call({}, key, 2), 0);
        runtime.storage.set(stored, 'invalid-number'); assert.equal(read.call({}, key, 2), 2);
        runtime.storage.delete(stored);
    });
    await check('compiled Catalog filters real flower Map values and generates all 85 emitted level configurations', async () => {
        const catalog = await load('FlowerCatalog').FlowerCatalog.load();
        assert.equal(catalog.levels.size, 85); assert.equal(catalog.flowers.size, 151);
        const second = catalog.level(2);
        assert.equal(second.flowers.reduce((total, group) => total + group.count, 0), 99); assert.equal(second.orders.length, 31);
        for (const level of catalog.levels.keys()) {
            const config = catalog.level(level);
            assert(config.flowers.length > 0); assert(config.orders.length > 0);
            for (const group of config.flowers) assert.equal(typeof group.kind, 'string');
            assert.equal(config.flowers.reduce((total, group) => total + group.count, 0),
                config.orders.reduce((total, order) => total + order.needs.reduce((sum, need) => sum + need.count, 0), 0));
        }
    });
    await check('compiled Rules exposes nine real Map.values pieces and completes the first three-flower order', () => {
        const rules = new (load('FlowerRules').FlowerRules)();
        assert.equal(rules.flowers.length, 9); assert(rules.flowers.every(flower => typeof flower.id === 'string'));
        for (const flower of rules.flowers.filter(flower => flower.kind === 'cdy_lxq')) rules.select(flower.id);
        assert.equal(rules.stars, 1); assert.equal(rules.flowers.filter(flower => flower.status === 'collected').length, 3);
    });
    await check('compiled bouquet preload expands and deduplicates Set resource paths', async () => {
        const before = runtime.requests.length;
        await load('FlowerBouquet').preloadBouquets([1301, 1301, 1601]);
        const frames = runtime.requests.slice(before).filter(request => request.logical.endsWith('/spriteFrame'));
        assert(frames.length > 0); assert.equal(new Set(frames.map(request => request.logical)).size, frames.length);
    });
    await check('compiled Spine preload expands seven real effect resource names from its Set', async () => {
        const before = runtime.requests.length; await load('FlowerEffects').FlowerEffects.preload();
        const skeletons = runtime.requests.slice(before).filter(request => request.logical.startsWith('original/effects/spine/'));
        assert.equal(skeletons.length, 7); assert(skeletons.every(request => typeof request.logical === 'string'));
    });
    await check('compiled pool preload expands original frame and ripple Sets', async () => {
        const before = runtime.requests.length;
        await load('FlowerPool').FlowerPoolView.preload([{kind: 'cdy_lxq', variant: 1}, {kind: 'cdy_lxq', variant: 1}]);
        const frames = runtime.requests.slice(before).filter(request => request.logical.endsWith('/spriteFrame'));
        assert(frames.length > 0); assert.equal(new Set(frames.map(request => request.logical)).size, frames.length);
    });
    await check('compiled cancellation invokes every callback in a Set before clearing it', () => {
        const calls = [], pendingAnimations = new Set([() => calls.push(1), () => calls.push(2)]);
        load('FlowerGame').FlowerGame.prototype.cancelAnimations.call({pendingAnimations});
        assert.deepEqual(calls, [1, 2]); assert.equal(pendingAnimations.size, 0);
    });
    await check('compiled typography checks each character in a multi-character covered string', async () => {
        const ui = load('FlowerUI'); await ui.preloadTypography();
        const node = ui.label(new runtime.cc.Node('Parent'), 'Covered', '加载中', 0, 0, 32);
        assert.equal(node.getComponent(runtime.cc.Label).useSystemFont, false);
    });
    await check('compiled reward handling grants once for simultaneous claims and releases its pending Set', async () => {
        const video = new (load('FlowerRewardedVideo').FlowerRewardedVideo)({adsEnabled: false}); let grants = 0;
        const results = await Promise.all([video.claim('compose', () => { grants++; }), video.claim('compose', () => { grants++; })]);
        assert.deepEqual(results, [true, false]); assert.equal(grants, 1);
        assert.equal(await video.claim('compose', () => { grants++; }), true); assert.equal(grants, 2);
    });
    return {buildRoot: path.resolve(buildRoot), passed: results.filter(result => result.passed).length,
        failed: results.filter(result => !result.passed).length, results, artifacts: runtime.artifacts,
        executedModules: runtime.executed, assetRequests: runtime.requests.length, catalogWarnings: runtime.warnings.length,
        boundary: 'Executes emitted minified code/helpers and reads emitted JsonAssets/config paths. cc stubs do not render or load native fonts; this is not a WeChat device or network test.'};
}

module.exports = {loadRuntime, checkRuntime};
if (require.main === module) checkRuntime(process.argv[2]).then(report => {
    console.log(JSON.stringify(report, null, 2)); if (report.failed) process.exitCode = 1;
}).catch(error => { console.error('[wechat-runtime] ' + error.message); process.exitCode = 1; });
