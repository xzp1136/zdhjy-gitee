// Native input dispatch and rendering still need the Cocos preview. These tests
// exercise the actual helpers with transform/event stubs and original clip data.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript');
const project = path.join(__dirname, '..');
class Vec3 { constructor(x = 0, y = 0, z = 0) { Object.assign(this, {x, y, z}); } }
class Component { enabled = true; get enabledInHierarchy() { return this.enabled && this.node.activeInHierarchy; } }
class Node {
  static EventType = {NODE_DESTROYED: 'destroyed', TOUCH_START: 'start', TOUCH_MOVE: 'move', TOUCH_END: 'end', TOUCH_CANCEL: 'cancel'};
  constructor(name = '') { Object.assign(this, {name, children: [], components: [], events: new Map(), isValid: true, active: true, layer: 1, position: new Vec3(), scale: new Vec3(1, 1, 1), angle: 0}); }
  get activeInHierarchy() { return this.active && (!this.parent || this.parent.activeInHierarchy); }
  addChild(node) { node.setParent(this); }
  setParent(parent) { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = parent; parent?.children.push(this); }
  removeFromParent() { this.setParent(null); }
  setPosition(x, y, z = 0) { this.position = typeof x === 'object' ? new Vec3(x.x, x.y, x.z) : new Vec3(x, y, z); }
  setScale(x, y, z = 1) { this.scale = typeof x === 'object' ? new Vec3(x.x, x.y, x.z) : new Vec3(x, y, z); }
  getSiblingIndex() { return this.parent?.children.indexOf(this) || 0; }
  setSiblingIndex(index) { const p = this.parent; if (p) { p.children.splice(p.children.indexOf(this), 1); p.children.splice(index, 0, this); } }
  getChildByName(name) { return this.children.find(child => child.name === name) || null; }
  addComponent(Type) { const component = new Type(); component.node = this; this.components.push(component); component.onLoad?.(); return component; }
  getComponent(Type) { return this.components.find(c => c instanceof Type) || null; }
  on(type, callback, context) { if (!this.events.has(type)) this.events.set(type, []); this.events.get(type).push({callback, context}); }
  off(type, callback, context) { this.events.set(type, (this.events.get(type) || []).filter(item => item.callback !== callback || item.context !== context)); }
  emit(type, ...args) { for (const item of [...(this.events.get(type) || [])]) item.callback.apply(item.context, args); }
  destroy() { if (!this.isValid) return; this.isValid = false; for (const c of this.components) { c.onDisable?.(); c.onDestroy?.(); } this.emit('destroyed'); for (const child of [...this.children]) child.destroy(); }
}
class UITransform {
  anchorPoint = {x: .5, y: .5}; width = 0; height = 0;
  setContentSize(width, height) { if (typeof width === 'object') ({width, height} = width); Object.assign(this, {width, height}); }
  setAnchorPoint(x, y) { this.anchorPoint = typeof x === 'object' ? {...x} : {x, y}; }
  get contentSize() { return {width: this.width, height: this.height}; }
  hitTest(p) { return Math.abs(p.x - this.node.position.x) <= this.width / 2 && Math.abs(p.y - this.node.position.y) <= this.height / 2; }
}
class Button extends Component {
  static Transition = {NONE: 0}; static EventType = {CLICK: 'click'}; interactable = true;
  onLoad() {
    this.node.on('start', () => { this.pressed = this.interactable && this.enabledInHierarchy; });
    this.node.on('end', () => { if (this.pressed && this.interactable && this.enabledInHierarchy) this.node.emit('click', this); this.pressed = false; });
    this.node.on('cancel', () => { this.pressed = false; });
  }
}
class Sprite { static Type = {SLICED: 1, FILLED: 2}; static SizeMode = {CUSTOM: 0}; static FillType = {HORIZONTAL: 0}; }
class Label { static HorizontalAlign = {CENTER: 0}; static VerticalAlign = {CENTER: 0}; static Overflow = {NONE: 0, CLAMP: 1}; }
class Color { fromHEX(value) { this.value = value; return this; } }
class UIOpacity { opacity = 255; }
const tweens = [];
const sounds = [];
const storage = new Map();
const cc = { _decorator: {ccclass: () => value => value}, Component, Node, Vec3, UITransform, Button, Sprite, Label, Color, UIOpacity,
  game: {emit(type, value) { sounds.push([type, value]); }},
  Font: class {}, JsonAsset: class {}, SpriteFrame: class {}, BlockInputEvents: class {}, Graphics: class {rect() {} roundRect() {} fill() {}},
  sys: {localStorage: {getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value)}},
  resources: {load(_path, _type, done) { done(null, {originalSize: {width: 100, height: 100}, clone() {return {destroy() {}};}}); }},
  Tween: {stopAllByTarget(target) { for (const t of tweens) if (t.target === target) t.stopped = true; }},
  tween(target) { const value = {target, steps: [], to(duration, props, options) { this.steps.push({duration, props, options}); return this; }, call(callback) {this.callback = callback; return this;}, start() {tweens.push(this); return this;}}; return value; },
};
const cache = {};
function load(name) {
  if (cache[name]) return cache[name];
  const exports = {}; cache[name] = exports;
  const output = ts.transpileModule(fs.readFileSync(path.join(project, 'assets/scripts', name + '.ts'), 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, experimentalDecorators: true},
  }).outputText;
  vm.runInNewContext(output, {exports, console, Map, WeakMap, Set, WeakSet, Math, Number, Date, Object, Array, Promise, require(request) {
    if (request === 'cc') return cc;
    if (request === './FlowerPause') return {createPause: async () => {}};
    return load(request.slice(2));
  }});
  return exports;
}
const motion = {...load('FlowerMotion'), ...load('FlowerButtonMotion'), ...load('FlowerHomeMotion')}, ui = load('FlowerUI');
const near = (actual, expected, message) => assert(Math.abs(actual - expected) < 1e-5, `${message}: ${actual} vs ${expected}`);
const touch = (x = 0, y = 0) => ({touch: {getLocation: () => ({x, y})}, windowId: 0});

test('Cocos scripts declare at most one Component per source file', () => {
  for (const filename of fs.readdirSync(path.join(project, 'assets/scripts')).filter(name => name.endsWith('.ts'))) {
    const file = ts.createSourceFile(filename, fs.readFileSync(path.join(project, 'assets/scripts', filename), 'utf8'), ts.ScriptTarget.Latest, true);
    const components = file.statements.filter(node => ts.isClassDeclaration(node) && node.heritageClauses?.some(clause =>
      clause.token === ts.SyntaxKind.ExtendsKeyword && clause.types.some(type => type.expression.getText(file) === 'Component')));
    assert(components.length <= 1, `${filename}: multiple components fail Cocos runtime registration even when tsc succeeds`);
  }
});

test('pressing preserves hit geometry, uses original 0.9/0.1s InOutQuad, and cancellation never clicks', () => {
  const parent = new Node(), visual = ui.uiNode(parent, 'Button', 30, 40, 100, 80);
  let clicks = 0;
  const button = ui.tap(visual, () => clicks++), hit = button.node, feedback = hit.getComponent(motion.FlowerButtonMotion);
  assert.notEqual(hit, visual); assert.equal(hit.getComponent(UITransform).width, 100);
  assert.equal(hit.position.x, 30); assert.equal(visual.position.x, 0);
  hit.emit('start', touch(30, 40)); feedback.update(.025); near(visual.scale.x, .9875, 'quarter time follows quadratic ease');
  feedback.update(.075); near(visual.scale.x, .9, 'full press scale');
  near(hit.scale.x, 1, 'hit root never scales');
  hit.emit('cancel'); feedback.update(.1); near(visual.scale.x, 1, 'cancel restores'); assert.equal(clicks, 0);
  hit.emit('start', touch(30, 40)); feedback.update(.1); hit.emit('end', touch(30, 40)); feedback.update(.1);
  assert.equal(clicks, 1); near(visual.scale.x, 1, 'release restores');
});

test('leaving bounds, disabling and destroying restore visuals without accumulating tween work', () => {
  const visual = ui.uiNode(new Node(), 'Button', 0, 0, 100, 80), button = ui.tap(visual, () => {});
  const hit = button.node, feedback = hit.getComponent(motion.FlowerButtonMotion), count = tweens.length;
  hit.emit('start', touch()); feedback.update(.1); hit.emit('move', touch(90, 0)); feedback.update(.1); near(visual.scale.x, 1, 'outside');
  hit.emit('move', touch()); feedback.update(.05); assert(visual.scale.x < 1);
  button.interactable = false; feedback.update(.001); near(visual.scale.x, 1, 'disabled');
  button.interactable = true;
  for (let i = 0; i < 20; i++) { hit.emit('start', touch()); feedback.update(.02); hit.emit('cancel'); feedback.update(.02); }
  feedback.update(.1); near(visual.scale.x, 1, 'rapid cancellation finishes'); assert.equal(tweens.length, count, 'one state machine, no queued tweens');
  hit.emit('start', touch()); feedback.update(.1); feedback.onDisable(); near(visual.scale.x, 1, 'ancestor disabled');
  hit.emit('start', touch()); feedback.update(.1); hit.destroy(); near(visual.scale.x, 1, 'destroyed');
});

test('start button uses serialized 0.94 scale and 1.6 second yoyo, restarting after release', () => {
  const visual = ui.uiNode(new Node(), 'Play'), button = ui.tap(visual, () => {}, {pressScale: .94, idlePulse: true});
  const feedback = button.node.getComponent(motion.FlowerButtonMotion);
  feedback.update(.8); near(visual.scale.x, .97, 'pulse halfway'); feedback.update(.8); near(visual.scale.x, .94, 'pulse low');
  feedback.update(1.6); near(visual.scale.x, 1, 'pulse high');
  button.node.emit('start', touch()); feedback.update(.1); near(visual.scale.x, .94, 'start press');
  button.node.emit('end', touch()); feedback.update(.1); near(visual.scale.x, 1, 'release');
  feedback.update(.8); near(visual.scale.x, .97, 'idle restarts from zero');
});

test('home motion samples the extracted Unity cubic coefficients, not a replacement sine wave', () => {
  const data = JSON.parse(fs.readFileSync(path.join(project, 'docs/reference/ui-animation-keyframes.json')));
  for (const [name, channels] of [['StartIconAni', [0, 1]], ['boxAni', [2]]]) {
    const clip = data[name];
    for (let i = 0; i < clip.frames.length - 1; i++) {
      // The diagnostic JSON rounds timestamps to six decimals; the Unity frames
      // lie at exact 1/12 s multiples. Compare coefficients on those frame times.
      const frame = clip.frames[i], time = Math.round(frame.time * 12) / 12;
      const next = Math.round(clip.frames[i + 1].time * 12) / 12, dt = (next - time) / 2;
      for (const channel of channels) {
        const [a, b, c, d] = frame.channels[channel].cubicCoefficients;
        near(motion.sampleOriginalMotion(name, time + dt, channel), ((a * dt + b) * dt + c) * dt + d, `${name} segment ${i}/${channel}`);
      }
    }
  }
});

test('icon waits use one sampled 2–4s interval and ready-state/disable reset transforms', () => {
  const target = new Node(), anim = target.addComponent(motion.FlowerHomeMotion); let ready = true;
  anim.configure('StartIconAni', () => ready, () => .9999);
  anim.update(1 / 6); near(target.scale.x, 1.08, 'first squash key');
  anim.update(5 / 6); near(target.scale.x, 1, 'clip finishes');
  anim.update(3.9); near(target.scale.x, 1, 'four-second selected delay');
  anim.update(.1 + 1 / 6); near(target.scale.x, 1.08, 'next clip');
  ready = false; anim.update(.01); near(target.scale.x, 1, 'claim disables pulse');
  ready = true; anim.update(1 / 6); near(target.scale.x, 1.08, 'available restarts');
  anim.onDisable(); near(target.scale.x, 1, 'ancestor disable');
  const chest = new Node(), box = chest.addComponent(motion.FlowerHomeMotion); box.configure('boxAni', () => ready);
  box.update(1 / 6); near(chest.angle, 4.79, 'original chest rotation'); ready = false; box.update(.01); near(chest.angle, 0, 'unavailable chest rests');
});

test('popup uses serialized BaseView scale timing, cancellation, and optional OverUI timing', () => {
  const overlay = ui.modal(new Node(), 'Popup'); ui.uiNode(overlay, 'Paper'); ui.presentPopup(overlay);
  const content = overlay.getChildByName('PopupContent'); near(content.scale.x, 0, 'original zero scale');
  let opening = tweens.findLast(t => t.target === content); assert.equal(opening.steps[0].duration, .4); assert.equal(opening.steps[0].options.easing, 'backOut');
  ui.dismissPopup(overlay); assert(opening.stopped); const close = tweens.findLast(t => t.target === content);
  assert.equal(close.steps[0].duration, .4); assert.equal(close.steps[0].options.easing, 'backIn');
  const over = ui.modal(new Node(), 'Over'); ui.presentPopup(over, {openDuration: .5, closeDuration: .3});
  ui.dismissPopup(over); assert.equal(tweens.findLast(t => t.target === over.getChildByName('PopupContent')).steps[0].duration, .3);
});

test('home binds motion only to original illustration targets and keeps local reward labels reachable after hit wrapping', async () => {
  storage.clear();
  const home = await load('FlowerHome').createHome(new Node(), () => {}, 1);
  const visual = name => home.getChildByName(name + 'Hit').getChildByName(name);
  const daily = visual('DailyReward'), welcome = visual('WelcomeGift');
  const dailyMotion = daily.getChildByName('Illustration').getComponent(motion.FlowerHomeMotion);
  const welcomeMotion = welcome.getChildByName('Illustration').getComponent(motion.FlowerHomeMotion);
  dailyMotion.update(1 / 6); welcomeMotion.update(1 / 6);
  near(daily.getChildByName('Illustration').scale.x, 1.08, 'available daily reward animates');
  near(daily.getChildByName('Text').scale.x, 1, 'label does not squash');
  const play = home.getChildByName('PlayHit'); play.getComponent(motion.FlowerButtonMotion).update(1.6);
  near(play.getChildByName('Play').scale.x, .94, 'home opts into original start-button idle');
  assert.equal(visual('Welfare').getChildByName('Illustration').getComponent(motion.FlowerHomeMotion), null);
  assert.equal(visual('GameCommunity').getChildByName('Illustration').getComponent(motion.FlowerHomeMotion), null);
  storage.set('zdhjy.welcome', '1'); welcomeMotion.update(.01); near(welcome.getChildByName('Illustration').scale.x, 1, 'claimed welcome reward rests');
  const share = visual('ShareReward').getChildByName('Illustration'); share.getComponent(motion.FlowerHomeMotion).update(1 / 6);
  near(share.scale.x, 1, 'unconnected share service does not suggest a claim is ready');
});

test('verified popup sounds emit once per transition and generic tap never invents a click sound', () => {
  sounds.length = 0;
  const overlay = ui.modal(new Node(), 'Pause');
  ui.presentPopup(overlay, {openSound: true, closeSound: true}); ui.presentPopup(overlay, {openSound: true});
  ui.dismissPopup(overlay); ui.dismissPopup(overlay);
  assert.deepEqual(sounds, [['flower-ui-sound', 'open'], ['flower-ui-sound', 'close']]);
  const unknown = ui.modal(new Node(), 'LocalMessage'); ui.presentPopup(unknown); ui.dismissPopup(unknown);
  const button = ui.tap(ui.uiNode(new Node(), 'Button'), () => {});
  button.node.emit('start', touch()); button.node.emit('end', touch());
  assert.equal(sounds.length, 2, 'unverified click/common-message triggers remain silent');
  const over = ui.modal(new Node(), 'Over'); ui.presentPopup(over, {openSound: true}); ui.dismissPopup(over);
  assert.deepEqual(sounds[2], ['flower-ui-sound', 'open']); assert.equal(sounds.length, 3);
});
