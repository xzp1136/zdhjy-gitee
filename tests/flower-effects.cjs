// Original Spine fixtures with a small Cocos lifecycle/transform stub.
// These tests cover ownership/timing; the real Spine renderer is verified in preview.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript');
const project = path.join(__dirname, '..');
const resourceFile = require('./resource-file.cjs');
const manifest = JSON.parse(fs.readFileSync(resourceFile('original/data/order-spine-effects.json'), 'utf8'));
const source = ts.transpileModule(fs.readFileSync(path.join(project, 'assets/scripts/FlowerEffects.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;

function harness(options = {}) {
  const loads = [], skeletons = [];
  let failed = false;
  class Vec3 { constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); } }
  class Node {
    static EventType = { NODE_DESTROYED: 'destroyed' };
    constructor(name = 'Root') { this.name = name; this.children = []; this.components = []; this.events = new Map(); this.isValid = true; this.active = true; this.position = new Vec3(); this.scale = new Vec3(1, 1, 1); this.angle = 0; }
    addChild(node) { node.parent = this; this.children.push(node); }
    addComponent(Type) { const component = new Type(); component.node = this; component.isValid = true; this.components.push(component); return component; }
    getComponent(Type) { return this.components.find(component => component instanceof Type) || null; }
    setPosition(x, y, z = 0) { this.position = new Vec3(x, y, z); }
    setScale(x, y, z = 1) { this.scale = new Vec3(x, y, z); }
    on(name, callback) { if (!this.events.has(name)) this.events.set(name, new Set()); this.events.get(name).add(callback); }
    off(name, callback) { this.events.get(name)?.delete(callback); }
    destroy() {
      if (!this.isValid) return; this.isValid = false;
      for (const callback of [...(this.events.get('destroyed') || [])]) callback();
      for (const node of [...this.children]) node.destroy();
      for (const component of this.components) component.isValid = false;
      if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this);
    }
  }
  class UITransform {
    setContentSize(width, height) { Object.assign(this, { width, height }); }
    convertToWorldSpaceAR(point) {
      let x = point.x, y = point.y;
      for (let node = this.node; node; node = node.parent) {
        x *= node.scale.x; y *= node.scale.y;
        const angle = node.angle * Math.PI / 180, xx = x * Math.cos(angle) - y * Math.sin(angle);
        y = x * Math.sin(angle) + y * Math.cos(angle); x = xx;
        x += node.position.x; y += node.position.y;
      }
      return new Vec3(x, y, 0);
    }
    convertToNodeSpaceAR(point) {
      let x = point.x, y = point.y; const chain = [];
      for (let node = this.node; node; node = node.parent) chain.unshift(node);
      for (const node of chain) {
        x -= node.position.x; y -= node.position.y;
        const angle = node.angle * Math.PI / 180, xx = x * Math.cos(angle) + y * Math.sin(angle);
        y = (-x * Math.sin(angle) + y * Math.cos(angle)) / node.scale.y; x = xx / node.scale.x;
      }
      return new Vec3(x, y, 0);
    }
  }
  class SkeletonData { constructor(resource) { this.resource = resource; this.scale = options.importedScale || 1; this.json = JSON.parse(fs.readFileSync(resourceFile(resource + '.json'), 'utf8')); } }
  class Skeleton {
    static AnimationCacheMode = { REALTIME: 0 };
    constructor() { this.paused = false; this.elapsed = 0; skeletons.push(this); }
    set skeletonData(asset) { if (options.failInitialization) throw new Error('runtime initialization failed'); this.asset = asset; }
    setAnimationCacheMode(mode) { this.cacheMode = mode; }
    setCompleteListener(callback) { this.complete = callback; }
    setInterruptListener(callback) { this.interrupt = callback; }
    setEndListener(callback) { this.end = callback; }
    clearTracks() { this.track = null; this.end?.(); }
    setAnimation(track, name, loop) {
      assert(this.asset.json.animations[name]);
      const choice = Object.values(manifest.roles).flatMap(role => role.choices).find(choice => choice.resource === this.asset.resource);
      this.track = { trackIndex: track, animation: { name }, loop, duration: choice.duration };
      return this.track;
    }
    advance(dt) {
      if (this.paused || !this.isValid || !this.track) return;
      this.elapsed += dt;
      if (this.elapsed >= this.track.duration) { this.elapsed %= this.track.duration; this.complete?.(this.track); }
    }
  }
  function uiNode(parent, name, x = 0, y = 0, width = 750, height = 1334) {
    const node = new Node(name); node.addComponent(UITransform).setContentSize(width, height); node.setPosition(x, y); parent.addChild(node); return node;
  }
  const cc = { Node, UITransform, Vec3, JsonAsset: class {}, sp: { Skeleton, SkeletonData }, resources: {
    load(resource, Type, callback) {
      loads.push({ resource, Type });
      queueMicrotask(() => {
        if (options.failFirstSkeleton && !failed && Type === SkeletonData) { failed = true; callback(new Error('temporary load failure')); return; }
        callback(null, Type === SkeletonData ? new SkeletonData(resource) : { json: manifest });
      });
    },
  } };
  const scope = { exports: {}, require(name) { if (name === 'cc') return cc; if (name === './FlowerAssets') return {loadFlowerAsset: cc.resources.load}; if (name === './FlowerUI') return { uiNode }; throw new Error(name); } };
  vm.runInNewContext(source, scope);
  return { FlowerEffects: scope.exports.FlowerEffects, Node, UITransform, Vec3, Skeleton, SkeletonData, uiNode, loads, skeletons };
}

test('all seven original Spine assets have compatible headers, atlas pages and animation names', () => {
  const choices = Object.values(manifest.roles).flatMap(role => role.choices); assert.equal(choices.length, 7);
  for (const choice of choices) {
    const file = resourceFile(choice.resource), json = JSON.parse(fs.readFileSync(file + '.json', 'utf8'));
    assert.equal(json.skeleton.spine, '3.8.99'); assert(json.animations[choice.animation]); assert.equal(choice.track, 0);
    assert.equal(choice.alphaMode, 'straight');
    const page = fs.readFileSync(file + '.atlas', 'utf8').split(/\r?\n/).find(line => line.trim());
    assert(fs.existsSync(path.join(path.dirname(file), page)), 'the original atlas page is present');
  }
});

test('landing selects the three original variants and captures the original anchor independently of order exit', async () => {
  const h = harness(), scene = new h.Node(), owner = h.uiNode(scene, 'EffectsOwner', 25, 10), anchor = h.uiNode(scene, 'FlowerPivot', -40, 100);
  owner.setScale(.8, .8); anchor.setScale(1.2, .9); anchor.angle = 30;
  const random = [0, .4, .99], effects = await h.FlowerEffects.create(owner, () => random.shift());
  const handles = random.slice().map(() => effects.play('landing', anchor, { x: 12, y: -8 }));
  assert.equal(new Set(h.skeletons.map(skeleton => skeleton.asset.resource)).size, 3);
  assert.equal(h.loads.filter(load => load.Type === h.SkeletonData).length, 7, 'Spine data is preloaded exactly once');
  const expected = effects.root.getComponent(h.UITransform).convertToNodeSpaceAR(anchor.getComponent(h.UITransform).convertToWorldSpaceAR(new h.Vec3(12, -8)));
  for (const handle of handles) {
    assert.deepEqual(handle.node.position, expected); assert(Math.abs(handle.node.scale.x - 750 / 1080) < 1e-7);
    const skeleton = handle.node.getComponent(h.Skeleton); assert.equal(skeleton.premultipliedAlpha, false); assert.equal(skeleton.track.loop, false);
  }
  anchor.destroy(); assert(handles.every(handle => handle.node.isValid), 'order destruction does not cut off its independent effect');
  h.skeletons.forEach(skeleton => skeleton.advance(2)); assert.deepEqual(await Promise.all(handles.map(handle => handle.finished)), [true, true, true]);
  assert.equal(effects.activeCount, 0); effects.dispose();
});

test('pause freezes Spine playback and the special new-vase tip has a five-second bound', async () => {
  const h = harness(), parent = new h.Node(), anchor = h.uiNode(parent, 'Anchor');
  const effects = await h.FlowerEffects.create(parent); effects.setPaused(true);
  const once = effects.play('complete', anchor), loop = effects.play('order-tip', anchor, undefined, { newVaseTip: true });
  assert(h.skeletons.every(skeleton => skeleton.paused)); assert.equal(h.skeletons[1].track.loop, true);
  h.skeletons.forEach(skeleton => skeleton.advance(10)); effects.update(10); assert.equal(effects.activeCount, 2);
  effects.setPaused(false); h.skeletons[0].advance(2); assert.equal(await once.finished, true);
  h.skeletons[1].advance(2); effects.update(4.9); assert.equal(loop.node.isValid, true, 'one loop completion does not end the bounded tip');
  effects.update(.1); assert.equal(await loop.finished, true); assert.equal(loop.node.isValid, false); effects.dispose();
});

test('clear, node destruction and scene replacement settle once and cannot affect the next playback', async () => {
  const h = harness(), parent = new h.Node(), anchor = h.uiNode(parent, 'Anchor'), effects = await h.FlowerEffects.create(parent);
  const first = effects.play('complete', anchor), staleComplete = h.skeletons[0].complete;
  effects.clear(); assert.equal(await first.finished, false);
  const second = effects.play('new-order', anchor); staleComplete(); assert.equal(effects.activeCount, 1);
  assert(Math.abs(second.node.scale.x - .2 * 750 / 1080) < 1e-7);
  second.node.destroy(); assert.equal(await second.finished, false); assert.equal(effects.activeCount, 0);
  const third = effects.play('group-switch', anchor); parent.destroy(); assert.equal(await third.finished, false);
  effects.dispose(); effects.clear(); assert.equal(effects.play('complete', anchor), null);
});

test('cancelled loading, retryable resource errors and runtime initialization failure leave no effect nodes', async () => {
  const h = harness(), parent = new h.Node(), pending = h.FlowerEffects.create(parent); parent.destroy();
  await assert.rejects(pending, /parent was destroyed/); assert.equal(parent.children.length, 0);
  const retry = harness({ failFirstSkeleton: true }); await assert.rejects(retry.FlowerEffects.preload(), /temporary load failure/); await retry.FlowerEffects.preload();
  const broken = harness({ failInitialization: true }), owner = new broken.Node(), anchor = broken.uiNode(owner, 'Anchor'), effects = await broken.FlowerEffects.create(owner);
  assert.throws(() => effects.play('complete', anchor), /initialization failed/); assert.equal(effects.root.children.length, 0); assert.equal(effects.activeCount, 0); effects.dispose();
});
