// Actual loading helper with a deterministic Cocos tween/timer clock.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript');
const project = path.join(__dirname, '..');
const source = ts.transpileModule(fs.readFileSync(path.join(project, 'assets/scripts/FlowerLoading.ts'), 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS},
}).outputText;

function harness(options = {}) {
  const timers = new Map(), tweens = new Set(), loads = [], clones = [], pendingLoads = [];
  let now = 0, timerId = 0;
  const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
  const clock = {
    get now() { return now; }, get timers() { return timers.size; }, get tweens() { return tweens.size; },
    async advance(milliseconds) {
      const end = now + milliseconds;
      do {
        const next = Math.min(end, ...[...timers.values()].map(timer => timer.at), ...[...tweens].map(t => t.startAt + t.duration * 1000));
        now = next;
        for (const t of [...tweens]) {
          const ratio = now >= t.startAt + t.duration * 1000 - 1e-7
            ? 1 : Math.max(0, Math.min(1, (now - t.startAt) / (t.duration * 1000)));
          const eased = t.options?.easing === 'sineOut' ? Math.sin(ratio * Math.PI / 2) : ratio;
          for (const key of Object.keys(t.props)) t.target[key] = t.from[key] + (t.props[key] - t.from[key]) * eased;
          t.options?.onUpdate?.();
          if (ratio >= 1) { tweens.delete(t); t.callback?.(); }
        }
        for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.callback(); }
        await flush();
      } while (now < end);
    },
  };
  class Node {
    static EventType = {NODE_DESTROYED: 'destroyed'};
    constructor(name = 'Root') { Object.assign(this, {name, children: [], components: [], events: new Map(), isValid: true, active: true, layer: 1, position: {x: 0, y: 0, z: 0}}); }
    addChild(node) { node.parent = this; this.children.push(node); }
    addComponent(Type) { const component = new Type(); component.node = this; Object.defineProperty(component, 'isValid', {get: () => this.isValid}); this.components.push(component); return component; }
    getComponent(Type) { return this.components.find(component => component instanceof Type) || null; }
    getChildByName(name) { return this.children.find(node => node.name === name) || null; }
    setPosition(x, y, z = 0) { this.position = {x, y, z}; }
    on(name, callback) { if (!this.events.has(name)) this.events.set(name, new Set()); this.events.get(name).add(callback); }
    off(name, callback) { this.events.get(name)?.delete(callback); }
    emit(name) { for (const callback of [...(this.events.get(name) || [])]) callback(); }
    removeFromParent() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null; }
    destroy() { if (!this.isValid) return; this.isValid = false; this.emit('destroyed'); for (const child of [...this.children]) child.destroy(); this.removeFromParent(); }
  }
  class UITransform { setContentSize(width, height) { Object.assign(this, {width, height}); } setAnchorPoint(x, y) { this.anchorPoint = {x, y}; } }
  class Sprite { static SizeMode = {CUSTOM: 0}; static Type = {SLICED: 1}; }
  class Label { static HorizontalAlign = {CENTER: 0}; static VerticalAlign = {CENTER: 0}; static Overflow = {CLAMP: 1, SHRINK: 2}; }
  class Button { static Transition = {NONE: 0}; static EventType = {CLICK: 'click'}; }
  class Color { constructor(r, g, b, a) { Object.assign(this, {r, g, b, a}); } }
  class UIOpacity { opacity = 255; }
  class BlockInputEvents {}
  class SpriteFrame {
    constructor(resource, size) { this.resource = resource; this.isValid = true; this.originalSize = size; this.insetLeft = this.insetRight = this.insetTop = this.insetBottom = 0; this.destroyCount = 0; }
    clone() { const clone = new SpriteFrame(this.resource, this.originalSize); clones.push(clone); return clone; }
    destroy() { this.isValid = false; this.destroyCount++; }
  }
  function frame(resource) {
    const png = fs.readFileSync(path.join(project, 'assets/resources', resource + '.png'));
    return new SpriteFrame(resource, {width: png.readUInt32BE(16), height: png.readUInt32BE(20)});
  }
  const cc = {Node, UITransform, Sprite, Label, Button, Color, UIOpacity, BlockInputEvents, SpriteFrame,
    Tween: {stopAllByTarget(target) { for (const t of [...tweens]) if (t.target === target) tweens.delete(t); }},
    tween(target) {
      return {target, to(duration, props, options) { Object.assign(this, {duration, props, options}); return this; }, call(callback) { this.callback = callback; return this; }, start() { this.startAt = now; this.from = {...target}; tweens.add(this); return this; }};
    },
  };
  const ui = {
    uiNode(parent, name, x = 0, y = 0, width = 750, height = 1334) { const node = new Node(name); node.addComponent(UITransform).setContentSize(width, height); node.setPosition(x, y); parent.addChild(node); return node; },
    loadFrame(resource) { loads.push(resource); return options.deferLoads ? new Promise(resolve => pendingLoads.push(() => resolve(frame(resource)))) : Promise.resolve(frame(resource)); },
  };
  const scope = {exports: {}, Date: class extends Date { static now() { return now; } },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, {callback, at: now + delay}); return id; },
    clearTimeout(id) { timers.delete(id); }, require(name) { if (name === 'cc') return cc; if (name === './FlowerUI') return ui; throw new Error(name); },
  };
  vm.runInNewContext(source, scope);
  return {...scope.exports, ...cc, clock, loads, clones, pendingLoads, flush, frame};
}

test('scene-bound art builds before the create promise yields and preserves original loading geometry', async () => {
  const h = harness(), parent = new h.Node(), frames = h.LOADING_ART_PATHS.map(h.frame);
  const pending = h.FlowerLoadingView.create(parent, frames);
  const root = parent.getChildByName('StartupLoading'); assert(root.getChildByName('Background'), 'cold-start art is built synchronously');
  const view = await pending; assert.equal(h.loads.length, 0); assert(root.getComponent(h.BlockInputEvents));
  const title = root.getChildByName('Title'); assert.equal(title.position.y, 337); assert.equal(title.getComponent(h.UITransform).width, 1112 * .67);
  const back = root.getChildByName('ProgressBackground').getComponent(h.Sprite), fill = root.getChildByName('ProgressFill').getComponent(h.Sprite);
  assert.equal(back.spriteFrame.insetLeft, 35); assert.equal(fill.spriteFrame.insetLeft, 41); assert.equal(fill.spriteFrame.insetRight, 38);
  assert.deepEqual(fill.spriteFrame.originalSize, {width: 202, height: 72}, 'transparent padding is kept, not cropped to the green alpha bounds');
  assert.equal(root.getChildByName('ProgressCaption').getComponent(h.Label).overflow, h.Label.Overflow.SHRINK);
  view.dispose(); assert(h.clones.every(frame => frame.destroyCount === 1)); assert(frames.every(frame => frame.isValid && frame.destroyCount === 0));
});

test('progress only follows real reports, remains monotonic and cannot show 100 before finish', async () => {
  const h = harness(), view = await h.FlowerLoadingView.create(new h.Node());
  const percent = view.root.getChildByName('ProgressText').getComponent(h.Label);
  await h.clock.advance(10000); assert.equal(view.displayedProgress, 0, 'elapsed time alone creates no progress');
  view.setProgress(.4); await h.clock.advance(70); assert(view.displayedProgress > 0 && view.displayedProgress < .4);
  await h.clock.advance(300); assert.equal(percent.string, '40%');
  view.setProgress(.2); await h.clock.advance(300); assert.equal(percent.string, '40%', 'out-of-order reports do not move backward');
  view.setProgress(1); await h.clock.advance(300); assert.equal(percent.string, '99%'); assert.equal(view.displayedProgress, .99);
  view.setProgress(NaN); await h.clock.advance(5000); assert.equal(percent.string, '99%'); view.dispose();
});

test('finish shows the exact completion text and honors the minimum display before fading', async () => {
  const h = harness(), view = await h.FlowerLoadingView.create(new h.Node(), h.LOADING_ART_PATHS.map(h.frame));
  const finished = view.finish(); assert.equal(view.finish(), finished, 'concurrent finish calls share one result');
  await h.clock.advance(120); assert.equal(view.root.getChildByName('ProgressText').getComponent(h.Label).string, '100%');
  assert.equal(view.root.getChildByName('ProgressCaption').getComponent(h.Label).string, '加载完成，即将进入游戏');
  await h.clock.advance(1079); assert(view.root.isValid, 'a cached startup does not flash away');
  await h.clock.advance(1); assert.equal(await finished, true); assert.equal(h.clock.now, 1200); assert.equal(view.root.isValid, false);
  assert.equal(h.clock.timers, 0); assert.equal(h.clock.tweens, 0); assert(h.clones.every(frame => frame.destroyCount === 1));
});

test('errors cancel pending finish, retry once per click and restore genuine loading state', async () => {
  const h = harness(), view = await h.FlowerLoadingView.create(new h.Node());
  view.setProgress(.6); await h.clock.advance(300); const finishing = view.finish(); await h.clock.advance(120);
  let retries = 0; view.setError(() => { retries++; view.setProgress(.25); });
  assert.equal(await finishing, false); assert.equal(h.clock.timers, 0); assert.equal(view.root.getComponent(h.UIOpacity).opacity, 255);
  const retry = view.root.getChildByName('RetryHit'); assert.equal(retry.getComponent(h.Button).interactable, true);
  retry.emit(h.Button.EventType.CLICK); retry.emit(h.Button.EventType.CLICK); assert.equal(retries, 1);
  assert.equal(view.root.getChildByName('ProgressCaption').getComponent(h.Label).string, '加载中...请稍后');
  await h.clock.advance(300); assert.equal(view.root.getChildByName('ProgressText').getComponent(h.Label).string, '25%');
  view.setError(() => Promise.reject(new Error('retry failed'))); retry.emit(h.Button.EventType.CLICK); await h.flush();
  assert.equal(retry.getComponent(h.Button).interactable, true, 'failed async retries can be attempted again'); view.dispose();
});

test('disposing during smoothing, completion hold or fade resolves false and cancels all owned work', async () => {
  for (const elapsed of [0, 120, 1050]) {
    const h = harness(), parent = new h.Node(), view = await h.FlowerLoadingView.create(parent);
    const pending = view.finish(); await h.clock.advance(elapsed); view.dispose(); view.dispose();
    assert.equal(await pending, false); assert.equal(h.clock.timers, 0); assert.equal(h.clock.tweens, 0); assert.equal(parent.children.length, 0);
    assert(h.clones.every(frame => frame.destroyCount === 1)); await h.clock.advance(10000); assert.equal(parent.children.length, 0);
  }
});

test('missing art alone is loaded and destroyed parents cannot acquire late children', async () => {
  const h = harness(), frames = h.LOADING_ART_PATHS.map(h.frame); frames[3] = undefined;
  const view = await h.FlowerLoadingView.create(new h.Node(), frames); assert.deepEqual(h.loads, [h.LOADING_ART_PATHS[3]]); view.dispose();
  const delayed = harness({deferLoads: true}), parent = new delayed.Node(), pending = delayed.FlowerLoadingView.create(parent);
  parent.destroy(); delayed.pendingLoads.forEach(resolve => resolve()); await assert.rejects(pending, /disposed while artwork loaded/);
  assert.equal(parent.children.length, 0); assert.equal(delayed.clock.timers, 0); assert.equal(delayed.clones.length, 0);
});
