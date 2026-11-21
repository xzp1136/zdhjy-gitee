const resourceFile = require('./resource-file.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('./typescript.cjs');
const root = path.join(__dirname, '..');
class Vec3 {
  constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
  clone() { return new Vec3(this.x, this.y, this.z); }
}
class Node {
  static EventType = { NODE_DESTROYED: 'destroyed' };
  constructor(name = '') { this.name = name; this.children = []; this.isValid = true; this.active = true; this.events = new Map(); this.position = new Vec3(); this.scale = new Vec3(1, 1, 1); this.angle = 0; this.components = []; }
  addChild(node) { node.parent = this; this.children.push(node); }
  addComponent(Type) { const value = new Type(); value.node = this; this.components.push(value); return value; }
  getComponent(Type) { return this.components.find(value => value instanceof Type) || null; }
  getChildByName(name) { return this.children.find(node => node.name === name) || null; }
  getSiblingIndex() { return this.parent.children.indexOf(this); }
  setSiblingIndex(index) { const nodes = this.parent.children; nodes.splice(nodes.indexOf(this), 1); nodes.splice(Math.min(index, nodes.length), 0, this); }
  setPosition(x, y, z = 0) { this.position = typeof x === 'object' ? new Vec3(x.x, x.y, x.z) : new Vec3(x, y, z); }
  setScale(x, y, z = 1) { this.scale = typeof x === 'object' ? new Vec3(x.x, x.y, x.z) : new Vec3(x, y, z); }
  on(event, callback) { if (!this.events.has(event)) this.events.set(event, new Set()); this.events.get(event).add(callback); }
  off(event, callback) { const list = this.events.get(event); list?.delete(callback); if (!list?.size) this.events.delete(event); }
  emit(event) { for (const callback of [...(this.events.get(event) || [])]) callback(); }
  removeFromParent() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; }
  destroy() { if (!this.isValid) return; this.isValid = false; this.emit(Node.EventType.NODE_DESTROYED); for (const child of [...this.children]) child.destroy(); }
}
class UITransform {
  width = 100; height = 100;
  setContentSize(width, height) { this.width = width; this.height = height; }
  setAnchorPoint() {}
  convertToWorldSpaceAR(point) {
    const out = new Vec3(point.x, point.y, point.z);
    for (let node = this.node; node; node = node.parent) { out.x += node.position.x; out.y += node.position.y; }
    return out;
  }
  convertToNodeSpaceAR(point) {
    const origin = this.convertToWorldSpaceAR(new Vec3()); return new Vec3(point.x - origin.x, point.y - origin.y, point.z);
  }
}
class Mask { static Type = { GRAPHICS_RECT: 0 }; }
class Component {
  constructor() { this.isValid = true; this.scheduled = new Set(); }
  scheduleOnce(callback) { this.scheduled.add(callback); }
  unschedule(callback) { this.scheduled.delete(callback); }
}
const animationTweens = [];
const cc = {
  _decorator: { ccclass: () => value => value, property: () => () => {} }, Component, Node, Vec3, UITransform, Mask,
  Sprite: class { static SizeMode = {CUSTOM: 0}; isValid = true; customMaterial = null; },
  UIOpacity: class { opacity = 255; }, EffectAsset: class {},
  Graphics: class {
    static LineCap = {ROUND: 1};
    clears = 0;
    fills = 0;
    rects = [];
    clear() { this.clears++; this.fills = 0; this.rects = []; }
    fill() { this.fills++; }
    roundRect(x, y, width) { this.rects.push(x + width / 2); }
    ellipse() {}
    moveTo() {}
    lineTo() {}
    quadraticCurveTo() {}
    bezierCurveTo() {}
    close() {}
    stroke() {}
  },
  Color: class { set() { return this; } },
  SpriteFrameEvent: { UV_UPDATED: 'uv_updated' },
  Vec4: class {
    constructor(x = 0, y = 0, z = 0, w = 0) { this.set(x, y, z, w); }
    set(x, y, z, w) { Object.assign(this, {x, y, z, w}); }
  },
  Material: class {
    properties = new Map();
    initialize() {}
    setProperty(name, value) { this.properties.set(name, {...value}); }
    destroy() { this.destroyed = true; }
  },
  Tween: { stopAllByTarget(target) { for (const value of animationTweens) if (value.target === target) value.stopped = true; } },
  tween(target) { return { target, steps: [], delay() { return this; }, to(duration, properties, options) { this.steps.push({duration, properties, options}); return this; }, call(callback) { this.callback = callback; return this; }, start() { animationTweens.push(this); return this; } }; },
  JsonAsset: class {},
  resources: { load(name, Type, callback) { callback(null, { json: JSON.parse(fs.readFileSync(resourceFile(name + '.json'), 'utf8')) }); } },
};
const uiNode = (parent, name, x = 0, y = 0, width = 750, height = 1334) => {
  const node = new Node(name); Object.assign(node, { x, y, width, height });
  node.addComponent(UITransform).setContentSize(width, height); parent.addChild(node); return node;
};
const rewardDialogs = [];
const pauseDialogs = [];
const ui = { uiNode, sprite: async (...args) => { const node = uiNode(...args); node.resource = args[2]; return node; },
  loadFrame: async resource => resource === 'greenhouse/clear-brush' ? {originalSize: {width: 125, height: 162}} : {},
  message: async (parent, title, body, action, onAction) => { rewardDialogs.push({title, body, action, onAction}); return new Node('Message'); } };
const originalFlowerSpritePath = (kind, variant = 1) => 'original/flower/' + kind + '_0' + variant;
const catalog = { flowerSpritePath: originalFlowerSpritePath, originalFlowerSpritePath };
const modules = {};
let hapticTaps = 0;
function load(name) {
  if (modules[name]) return modules[name];
  const exports = {}; modules[name] = exports;
  const text = ts.transpileModule(fs.readFileSync(path.join(root, 'assets/scripts', name + '.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
  }).outputText;
  vm.runInNewContext(text, { exports, console, Map, Set, Math, Number, Object, Array, Promise, require(request) {
    if (request === 'cc') return cc;
    if (request === './FlowerAssets') return {loadFlowerAsset(resource, Type, callback) {
      if (Type === cc.EffectAsset) callback(null, new Type());
      else cc.resources.load(resource, Type, callback);
    }};
    if (request === 'cc/env') return { DEBUG: false };
    if (request === './FlowerUI') return ui;
    if (request === './FlowerViewport') return require('./viewport-fixture.cjs');
    if (request === './FlowerHaptics') return {vibrateFlowerTap() { hapticTaps++; }};
    if (request === './FlowerPause') return {createPause: async (_parent, actions) => { pauseDialogs.push(actions); }};
    if (request === './FlowerCatalog') return catalog;
    if (['./FlowerRules', './FlowerBoardSkin', './FlowerBouquet', './FlowerBouquetFinish', './FlowerCollectionFeedback', './FlowerClearSweep',
      './FlowerPetalBloom', './FlowerRewardedVideo'].includes(request)) return load(request.slice(2));
    return {};
  } });
  return exports;
}
const { FlowerRules } = load('FlowerRules');
const { FlowerPresentationState } = load('FlowerGame');
const { FlowerGame, flowerFlightPhase } = load('FlowerGame');
const { FlowerBouquetView } = load('FlowerBouquet');
const apply = (view, rules, event) => {
  if (event.type === 'move') view.move(event, rules.flowers.find(piece => piece.id === event.flowerId));
  if (event.type === 'order-completed') view.complete(event.order, 1);
  if (event.type === 'order-added') view.add(event.order);
};

test('the visual order, progress and stars stay behind model mutations until each landing and completion event', () => {
  const rules = new FlowerRules();
  const view = new FlowerPresentationState(rules), events = [], checkpoints = [];
  for (const flower of rules.flowers.filter(piece => piece.kind === 'cdy_lxq')) {
    events.push(...rules.select(flower.id)); checkpoints.push(rules.displayProgressPercent);
  }
  assert.equal(rules.stars, 1);
  assert.equal(view.stars, 0);
  assert.equal(view.percent, 0);
  assert.equal(view.orders[0].kind, 'cdy_lxq');
  let landings = 0;
  for (const event of events) {
    apply(view, rules, event);
    if (event.type === 'move') {
      assert.equal(view.percent, checkpoints[landings++]);
      assert.equal(view.stars, 0);
    }
    if (event.type === 'order-completed') assert.equal(view.stars, 1);
  }
  assert.equal(view.orders[0].kind, 'cdcs_jyc');
  assert.equal(view.orders[0].filled, 0);
  assert.equal(view.percent, rules.displayProgressPercent);
});

test('a newly added bouquet is visible before buffered flowers land in it', () => {
  const rules = new FlowerRules(), view = new FlowerPresentationState(rules);
  for (const flower of rules.flowers.filter(piece => piece.kind === 'cdcs_jyc')) {
    for (const event of rules.select(flower.id)) apply(view, rules, event);
  }
  assert.equal(view.buffer.length, 3);
  const sequence = [];
  for (const flower of rules.flowers.filter(piece => piece.kind === 'cdy_lxq')) {
    for (const event of rules.select(flower.id)) {
      if (event.type === 'move' && event.to === 'order') {
        assert.equal(view.orders[event.slot].id, event.orderId);
        if (event.from === 'buffer') assert.equal(view.orders[event.slot].kind, 'cdcs_jyc');
      }
      sequence.push(event.type); apply(view, rules, event);
    }
  }
  assert.ok(sequence.indexOf('order-added') < sequence.lastIndexOf('move'));
  assert.equal(view.buffer.length, 0);
  assert.equal(view.stars, 2);
  assert.equal(JSON.stringify(view.orders), JSON.stringify(rules.orders));
});

test('mixed-bouquet visual needs change only after the current group lands', () => {
  const rules = new FlowerRules({ level: 2, timeLimit: 100, flowers: [{ kind: 'a', count: 3 }, { kind: 'b', count: 3 }],
    orders: [{ needs: [{ kind: 'a', count: 3 }, { kind: 'b', count: 3 }] }] });
  const view = new FlowerPresentationState(rules), events = rules.collectMatchingOrder();
  assert.equal(rules.orders[0].needs[0].filled, 3);
  assert.equal(view.orders[0].needs[0].filled, 0);
  for (const [index, event] of events.entries()) {
    apply(view, rules, event);
    assert.equal(view.orders[0].needs.find(need => need.filled < need.required).kind, index < 2 ? 'a' : 'b');
  }
  assert.equal(view.stars, 0);
});

test('original vessel art, foreground masks and landing points follow each order', async () => {
  const order = { id: 'order-0', kind: 'cdy_lxq', required: 3, filled: 0, slot: 0, vaseId: 1301,
    needs: [{ kind: 'cdy_lxq', required: 3, filled: 0 }] };
  const view = await FlowerBouquetView.create(new Node('Parent'), order);
  assert.equal(view.artwork.parent, view.root);
  assert.equal(view.artwork.children.map(node => node.name).join(','), 'VaseLayer0,PlacedFlowers,VaseLayer100');
  assert.equal(view.artwork.getChildByName('VaseLayer0').resource, 'original/vase/bkt1_3cdy_01');
  const vase = await FlowerBouquetView.create(new Node('Parent'), {...order, vaseId: 1601});
  assert.equal(vase.artwork.getChildByName('VaseLayer0').resource, 'original/vase/bkt1_3dy_01');
  assert.notDeepEqual(vase.landing(order), view.landing(order));
  const flowers = view.artwork.getChildByName('PlacedFlowers');
  const points = new Set();
  for (let filled = 1; filled <= 3; filled++) {
    const landing = view.landing(order);
    assert.deepEqual(FlowerBouquetView.landingFor(order), landing);
    points.add(JSON.stringify(landing.position));
    order.filled = order.needs[0].filled = filled; await view.sync(order);
  }
  assert.equal(points.size, 3);
  assert.equal(view.artwork.getChildByName('PlacedFlowers'), flowers);
  assert.equal(view.landing(order), null);
  await view.sync(order);
  assert.equal(flowers.children.length, 3);
});

test('changing scene cancels pending flight and tool waits instead of leaving async interactions locked', async () => {
  const game = new FlowerGame(), node = new Node('Flying');
  const flight = game.animate(node, 0.3, { scale: new Vec3(1, 1, 1) });
  const wait = game.waitFor(0.8);
  assert.equal(game.pendingAnimations.size, 2);
  game.revision++; game.cancelAnimations();
  assert.equal(await flight, false);
  assert.equal(await wait, false);
  assert.equal(game.pendingAnimations.size, 0);
  assert.equal(game.scheduled.size, 0);
  assert.equal(node.events.size, 0);
});

test('entrance pauses with the pool but the original countdown begins after the first frame', async () => {
  const game = new FlowerGame();
  let elapsed = 0, gameTime = 0;
  game.sceneMode = 'game'; game.ready = true; game.busy = true; game.firstPlayFrame = true;
  game.rules = { status: 'playing', tick(dt) { gameTime += dt; return []; } };
  game.updateHUD = () => {};
  game.pool = { entering: true, update(dt) { elapsed += dt; this.entering = elapsed < 1; } };
  const entrance = game.waitForPoolEntrance();
  game.update(0.4);
  assert.equal(gameTime, 0);
  game.paused = true; game.update(5);
  assert.equal(elapsed, 0.4);
  game.paused = false; game.update(0.7);
  assert.equal(await entrance, true);
  assert.equal(gameTime, 0.7);
  assert.equal(game.pendingAnimations.size, 0);
  game.update(0.1);
  assert.ok(Math.abs(gameTime - 0.8) < 1e-12);
});

test('abandoning an entrance resolves its waiter and clears the completion hook', async () => {
  const game = new FlowerGame(); game.pool = { entering: true };
  const entrance = game.waitForPoolEntrance();
  game.revision++; game.cancelAnimations();
  assert.equal(await entrance, false);
  assert.equal(game.finishEntrance, null);
  assert.equal(game.pendingAnimations.size, 0);
});

test('original flower flight picks up during the first fifth before settling and rotating into the bouquet', () => {
  const start = flowerFlightPhase(0), picked = flowerFlightPhase(0.2), middle = flowerFlightPhase(0.6), end = flowerFlightPhase(1);
  assert.equal(start.travel, 0); assert.equal(start.pickup, 0); assert.equal(start.rotation, 0);
  assert.equal(picked.pickup, 1); assert.equal(picked.settle, 0); assert.equal(picked.rotation, 0);
  assert.ok(Math.abs(picked.travel - 0.104) < 1e-12);
  assert.ok(Math.abs(middle.settle - 0.5) < 1e-12);
  assert.equal(middle.rotation, middle.travel);
  assert.equal(end.travel, 1); assert.equal(end.settle, 1); assert.equal(end.rotation, 1);
  assert.equal(flowerFlightPhase(-1).travel, 0); assert.equal(flowerFlightPhase(2).travel, 1);
});

test('custom flight cancels its phase tween on scene revision and ignores late callbacks', async () => {
  const game = new FlowerGame(), node = new Node('Flying');
  node.setPosition(10, 20); node.setScale(.8, .9, 1); node.angle = 15;
  const promise = game.flyFlower(node, new Vec3(110, 220), new Vec3(.3, .4, 1), 45);
  const value = animationTweens.at(-1), step = value.steps[0];
  assert.notEqual(value.target, node, 'flight tweens the progress object rather than the render node');
  assert.equal(step.duration, .58);
  value.target.progress = .2; step.options.onUpdate();
  assert.ok(Math.abs(node.scale.x - 1) < 1e-12);
  const beforeCancel = JSON.stringify({position: node.position, scale: node.scale, angle: node.angle});
  game.revision++; game.cancelAnimations();
  assert.equal(await promise, false); assert.equal(value.stopped, true);
  value.target.progress = 1; step.options.onUpdate(); value.callback();
  assert.equal(JSON.stringify({position: node.position, scale: node.scale, angle: node.angle}), beforeCancel, 'late old-scene callback cannot move a render node');
  assert.equal(game.pendingAnimations.size, 0); assert.equal(node.events.size, 0);
});

test('destroying a flower resolves its custom flight once and normal completion detaches cancellation listeners', async () => {
  const game = new FlowerGame(), removed = new Node('Removed');
  const cancelled = game.flyFlower(removed, new Vec3(50, 80), new Vec3(.5, .5, 1), 30);
  const deadTween = animationTweens.at(-1);
  removed.destroy(); assert.equal(await cancelled, false); assert(deadTween.stopped);
  deadTween.callback(); assert.equal(game.pendingAnimations.size, 0); assert.equal(removed.events.size, 0);
  const landed = new Node('Landed'); landed.angle = 170;
  const completed = game.flyFlower(landed, new Vec3(60, 90), new Vec3(.5, .4, 1), -170);
  const liveTween = animationTweens.at(-1); liveTween.callback();
  assert.equal(await completed, true); assert.equal(landed.position.x, 60); assert.equal(landed.position.y, 90);
  assert.equal(landed.scale.x, .5); assert.ok(Math.abs(landed.scale.y - .4) < 1e-12);
  assert.equal(landed.angle, 190, 'shortest arc ends at the equivalent target orientation');
  assert.equal(landed.events.size, 0); assert.equal(game.pendingAnimations.size, 0);
});

test('clearing a scene mid-flight prevents the old event stream from landing or changing new UI', async () => {
  const game = new FlowerGame(), rules = new FlowerRules();
  game.node = new Node('Scene'); game.content = new Node('OldContent'); game.node.addChild(game.content);
  game.flowerRoot = new Node('FloatingFlowers'); game.content.addChild(game.flowerRoot);
  game.trayRoot = new Node('Tray'); game.content.addChild(game.trayRoot);
  const flying = new Node('Flying'); flying.addComponent(UITransform); game.flowerRoot.addChild(flying);
  let disposed = 0, hudUpdates = 0;
  game.pool = {take: () => flying, dispose: () => disposed++};
  game.rules = rules; game.visual = new FlowerPresentationState(rules);
  const oldPresentation = game.visual;
  game.updateHUD = () => hudUpdates++; game.sound = () => {};
  const flower = rules.flowers.find(item => item.kind === 'cdy_lxq');
  const events = rules.select(flower.id), work = game.animateEvents(events);
  await flush();
  const flight = animationTweens.at(-1);
  assert.equal(game.pendingAnimations.size, 2, 'the flight and its pickup ripple are both cancellable');
  game.clear('home');
  await work;
  flight.target.progress = 1; flight.steps[0].options.onUpdate(); flight.callback();
  assert.equal(oldPresentation.collected, 0); assert.equal(oldPresentation.orders[0].filled, 0);
  assert.equal(hudUpdates, 0); assert.equal(disposed, 1); assert.equal(flying.isValid, false);
  assert.equal(game.sceneMode, 'home'); assert.equal(game.visual, null); assert.equal(game.pendingAnimations.size, 0);
  assert.equal(game.content.name, 'GameContent'); assert.equal(game.content.isValid, true);
});

test('the order-slot reward keeps its dialog and applies unlock/add events without a coin charge or duplicate grant', async () => {
  const game = new FlowerGame(), rules = new FlowerRules(); game.rules = rules; game.content = new Node();
  game.visual = new FlowerPresentationState(rules);
  let renders = 0, streams = 0;
  game.renderOrder = async () => {renders++;};
  game.animateEvents = async events => {streams++; for (const event of events) apply(game.visual, rules, event);};
  await game.unlockOrderWithVideo(2);
  const dialog = rewardDialogs.at(-1); assert.equal(dialog.title, '解锁花束位'); assert.equal(dialog.action, '解锁');
  dialog.onAction(); dialog.onAction();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(rules.isOrderSlotUnlocked(2), true); assert.equal(rules.coins, 0);
  assert.equal(streams, 1); assert.equal(renders, 1); assert.equal(game.visual.orders[2].kind, 'cdcs_jyc');
  assert.equal(game.busy, false); assert.equal(game.paused, false);
  const count = rewardDialogs.length; await game.unlockOrderWithVideo(2); assert.equal(rewardDialogs.length, count);
});

test('an exhausted tool dialog grants exactly one original use, does not auto-use it, and ignores an abandoned dialog', async () => {
  const game = new FlowerGame(), rules = new FlowerRules(2), inventory = new Map([['compose', 0]]);
  game.rules = rules; game.content = new Node();
  game.read = (key, fallback) => inventory.has(key) ? inventory.get(key) : fallback;
  game.write = (key, value) => inventory.set(key, value);
  let refreshed = 0; game.buildTools = async () => {refreshed++;};
  await game.useTool(0);
  const dialog = rewardDialogs.at(-1); assert.equal(dialog.title, '道具已用完'); assert.match(dialog.body, /合成.*1/);
  dialog.onAction(); dialog.onAction();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(inventory.get('compose'), 1); assert.equal(refreshed, 1); assert.equal(rules.progress, 0);
  assert.equal(game.busy, false); assert.equal(game.paused, false);
  inventory.set('compose', 0); await game.useTool(0); const abandoned = rewardDialogs.at(-1);
  game.revision++; abandoned.onAction();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(inventory.get('compose'), 0); assert.equal(refreshed, 1);
});

test('a flower flight follows its live destination after a viewport resize without restarting progress', async () => {
  const game = new FlowerGame(), node = new Node('Flying');
  let destination = new Vec3(100, 200);
  const work = game.flyFlower(node, () => destination, new Vec3(.5, .5, 1), 0);
  const flight = animationTweens.at(-1), update = flight.steps[0].options.onUpdate;
  flight.target.progress = .5; update();
  assert.equal(node.position.y, 100);
  destination = new Vec3(100, 340);
  update(); assert.equal(node.position.y, 170);
  flight.callback(); assert.equal(await work, true); assert.equal(node.position.y, 340);
});

test('a completed bouquet pulses with the petal bloom, then exits after the gold effect', async () => {
  const { BOUQUET_BLOOM_SECONDS, preloadFlowerPetals } = load('FlowerPetalBloom');
  await preloadFlowerPetals();
  const game = new FlowerGame(), root = uiNode(new Node('Orders'), 'Order');
  const bouquet = uiNode(root, 'Bouquet');
  const art = uiNode(bouquet, 'BouquetArtwork');
  const label = uiNode(bouquet, 'OrderTag');
  art.setScale(.9, .95, 1);
  const artwork = [['cdy_lxq_01', 120, 120], ['dy_zmj_01', 120, 100], ['cdcs_jyc_01', 80, 160]];
  const slots = artwork.map(([name, width, height], index) => {
    const node = uiNode(art, `Flower${index}`);
    node.setPosition(index * 30, 0);
    node.addComponent(cc.Sprite).spriteFrame = {
      name, texture: {}, rect: {width, height}, uv: [0, 1, 1, 1, 0, 0, 1, 0], on() {}, off() {},
    };
    return {node, path: 'original/flower/' + name};
  });
  let stoppedLanding = false;
  game.orderViews.set(0, {root, bouquet: {root: bouquet, artwork: art, placedFlowers: slots},
    landingEffects: new Set([{cancel() { stoppedLanding = true; }}])});
  const completionEffects = [];
  game.orderEffects = {play(kind, anchor, point) {
    assert.equal(stoppedLanding, true);
    completionEffects.push([kind, anchor, point.x, point.y]);
    return {finished: new Promise(() => {})};
  }};
  let finishGold;
  game.playBouquetGold = () => new Promise(resolve => { finishGold = resolve; });
  game.animate = async (_node, _seconds, properties) => { assert.ok(properties.position); return true; };
  game.waitFor = async () => true;
  const work = game.removeBouquet(0);
  const tween = animationTweens.at(-1);
  const materials = slots.map(({node}) => node.getComponent(cc.Sprite).customMaterial);
  assert.deepEqual(completionEffects, [['complete', bouquet, 0, 145 * 750 / 1080]]);
  assert.deepEqual(materials.map(mat => mat.properties.get('timing').x), [0, 0, 0]);
  assert.deepEqual(materials.map(mat => mat.properties.get('flower').w), [1, 0, 2]);
  tween.target.progress = 0.12 / BOUQUET_BLOOM_SECONDS;
  tween.steps[0].options.onUpdate();
  assert.equal(art.scale.x, .9 * 1.07);
  assert.equal(art.scale.y, .95 * 1.07);
  assert.deepEqual(bouquet.scale, new Vec3(1, 1, 1));
  assert.deepEqual(label.scale, new Vec3(1, 1, 1));
  tween.target.progress = 0.52;
  tween.steps[0].options.onUpdate();
  const phases = materials.map(mat => mat.properties.get('timing').x);
  assert.ok(phases[0] > phases[1] && phases[1] > phases[2]);
  assert.ok(art.scale.x > .9 && art.scale.x < .9 * 1.07);
  assert.ok(slots.every(({node}) => node.scale.x === 1 && node.scale.y === 1));
  tween.callback();
  assert.deepEqual(art.scale, new Vec3(.9, .95, 1));
  assert.ok(slots.every(({node}) => node.getComponent(cc.Sprite).customMaterial === null));
  assert.ok(materials.every(mat => mat.destroyed));
  assert.equal(root.isValid, true);
  finishGold(true);
  assert.equal(await work, true);
  assert.equal(completionEffects.length, 1);
  assert.equal(root.isValid, false);
  assert.equal(game.orderViews.has(0), false);
});

test('the completion spiral redraws both layers from scratch and releases its own layers', async () => {
  const game = new FlowerGame(), board = uiNode(new Node('Scene'), 'Board');
  game.ordersRoot = uiNode(board, 'Orders');
  const bouquet = uiNode(game.ordersRoot, 'Bouquet');
  uiNode(board, 'OrderEffects');
  game.hud = uiNode(board, 'HUD');
  game.waitFor = async () => true;
  const work = game.playBouquetGold(bouquet);
  await flush();
  const rear = board.getChildByName('BouquetGoldBack'), front = board.getChildByName('BouquetGoldFront');
  assert.deepEqual(board.children.map(child => child.name), ['BouquetGoldBack', 'Orders', 'OrderEffects', 'BouquetGoldFront', 'HUD']);
  const graphics = [rear, front].map(node => node.getComponent(cc.Graphics));
  const gold = animationTweens.at(-1);
  gold.target.progress = .30;
  gold.steps[0].options.onUpdate();
  assert.ok(graphics.every(art => art.clears === 1 && art.fills > 0));
  const fills = graphics.map(art => art.fills);
  gold.steps[0].options.onUpdate();
  assert.deepEqual(graphics.map(art => art.fills), fills);
  assert.ok(graphics.every(art => art.clears === 2));
  gold.callback();
  assert.equal(await work, true);
  assert.ok(!rear.isValid && !front.isValid);
});

test('tray, tool and order points map through their actual translated parents into the flight layer', () => {
  const game = new FlowerGame(), board = new Node('Board'); board.setPosition(375, 800);
  const tray = uiNode(board, 'Tray'), tools = uiNode(board, 'Tools'), flight = uiNode(board, 'Flight');
  tray.setPosition(0, 135); tools.setPosition(0, -95); flight.setPosition(0, 20);
  assert.deepEqual(game.mapPoint(tray, new Vec3(-243, 252), flight), new Vec3(-243, 367));
  assert.deepEqual(game.mapPoint(tools, new Vec3(234, -585), flight), new Vec3(234, -700));
  tray.setPosition(0, 200); flight.setPosition(0, 50);
  assert.deepEqual(game.mapPoint(tray, new Vec3(-280, 443), flight), new Vec3(-280, 593));
});

function collectingGame(config) {
  const game = new FlowerGame(), rules = new FlowerRules(config);
  game.node = new Node('Scene'); game.content = uiNode(game.node, 'Content');
  game.flowerRoot = uiNode(game.content, 'FlyingFlowers');
  game.ordersRoot = uiNode(game.content, 'Orders');
  game.trayRoot = uiNode(game.content, 'Tray');
  const poolNodes = new Map(rules.flowers.map(flower => [flower.id, uiNode(game.flowerRoot, flower.id)]));
  game.pool = {take(id) { const node = poolNodes.get(id); poolNodes.delete(id); return node; },
    ensureOrdersReachable() {}, update() {}, dispose() {}};
  game.rules = rules; game.visual = new FlowerPresentationState(rules);
  game.ready = true; game.sceneMode = 'game';
  const flights = [], sounds = [];
  let ended = 0;
  game.sound = name => sounds.push(name); game.updateHUD = () => {};
  game.renderOrder = async () => {}; game.renderTray = async () => {};
  game.endLevel = async () => { ended++; game.finished = true; };
  const flyFlower = game.flyFlower.bind(game);
  game.flyFlower = (node, destination, scale, angle, courier, landInOrder) => {
    const flight = flyFlower(node, destination, scale, angle, courier, landInOrder);
    const motion = animationTweens.at(-1);
    flights.push({id: node.name, node, destination: destination(), scale, motion, complete: motion.callback});
    return flight;
  };
  return {game, rules, flights, sounds, get ended() { return ended; }};
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('the clear prop sweeps each stored flower on contact and keeps the butterfly in the tray', async () => {
  const {game, rules, sounds} = collectingGame({level: 4, timeLimit: 180,
    flowers: [{kind: 'cdy_lxq', count: 3}, {kind: 'dy_zmj', count: 3}, {kind: 'cdcs_jyc', count: 3}],
    orders: [{needs: [{kind: 'cdy_lxq', count: 3}]}, {needs: [{kind: 'dy_zmj', count: 3}]},
      {needs: [{kind: 'cdcs_jyc', count: 3}]}],
    specials: [{specialId: 2000, kind: 'hd_01', insertAtPercent: 0}, {specialId: 2000, kind: 'hd_01', insertAtPercent: 100}]});
  const {TRAY_X, TRAY_Y, TOOL_X, TOOL_Y} = load('FlowerBoardSkin');
  const [left, right] = rules.flowers.filter(flower => flower.kind === 'cdcs_jyc');
  const butterfly = rules.flowers.find(flower => flower.specialId === 2000);
  for (const flower of [left, butterfly, right]) rules.select(flower.id);
  game.visual = new FlowerPresentationState(rules);
  const stored = [left, butterfly, right].map((flower, slot) => {
    const node = uiNode(game.trayRoot, 'Buffered-' + flower.id);
    node.setPosition(TRAY_X[slot], TRAY_Y);
    return node;
  });
  game.hud = uiNode(game.content, 'HUD');
  game.toolsRoot = uiNode(game.hud, 'Tools');
  const button = uiNode(game.toolsRoot, 'Tool2Hit');
  button.setPosition(TOOL_X[2], TOOL_Y);
  const sprite = uiNode(button, 'Tool2').addComponent(cc.Sprite), original = {};
  sprite.spriteFrame = original;
  let inventory = 2, trayRenders = 0;
  game.read = () => inventory;
  game.write = (key, value) => { assert.equal(key, 'clear'); inventory = value; };
  game.buildTools = async () => {};
  game.renderTray = async () => { trayRenders++; };

  const work = game.useTool(2);
  await flush();
  const motion = animationTweens.at(-1);
  const sweep = game.hud.getChildByName('ClearSweep');
  assert.notEqual(sprite.spriteFrame, original);
  assert.ok(sweep.isValid);
  assert.deepEqual(Array.from(rules.waiting), [left.id, right.id]);
  assert.equal(trayRenders, 0);

  motion.target.progress = 0.54;
  motion.steps[0].options.onUpdate();
  assert.equal(stored[0].position.x, TRAY_X[0]);
  assert.equal(stored[1].position.x, TRAY_X[1]);
  assert.ok(stored[2].position.x < TRAY_X[2]);
  assert.equal(game.visual.buffer.length, 3);
  assert.deepEqual(sounds, ['level_qinsao']);

  motion.target.progress = 0.9;
  motion.steps[0].options.onUpdate();
  const graphics = sweep.getChildByName('SweepDust').getComponent(cc.Graphics);
  assert.deepEqual([...new Set(graphics.rects)], [TRAY_X[0], TRAY_X[2]]);
  assert.equal(stored[1].position.x, TRAY_X[1]);
  motion.callback();
  await work;

  assert.deepEqual(Array.from(game.visual.buffer), [butterfly.id]);
  assert.equal(trayRenders, 1);
  assert.equal(inventory, 1);
  assert.equal(sprite.spriteFrame, original);
  assert.equal(game.hud.getChildByName('ClearSweep').isValid, false);
});

test('compose casts one star per missing flower and lets subsequent tray refills use the normal flight', async () => {
  const {game, rules} = collectingGame({level: 2, timeLimit: 180,
    flowers: [{kind: 'cdy_lxq', count: 3}, {kind: 'dy_zmj', count: 3}, {kind: 'cdcs_jyc', count: 3}],
    orders: [{vaseId: 1301, needs: [{kind: 'cdy_lxq', count: 3}]}, {vaseId: 1601, needs: [{kind: 'dy_zmj', count: 3}]},
      {vaseId: 1201, needs: [{kind: 'cdcs_jyc', count: 3}]}]});
  const blue = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const stored = rules.flowers.find(flower => flower.kind === 'cdcs_jyc');
  rules.select(blue[0].id);
  rules.select(stored.id);
  game.visual = new FlowerPresentationState(rules);
  let inventory = 2;
  game.read = () => inventory;
  game.write = (key, value) => { assert.equal(key, 'compose'); inventory = value; };
  game.buildTools = async () => {};
  const deliveryPlan = new Map();
  let castMoves = [];
  game.animateCompose = async moves => { castMoves = moves; return deliveryPlan; };
  game.animateEvents = async (events, _rev, _flight, _stars, deliveries) => {
    assert.equal(deliveries, deliveryPlan);
    assert.ok(castMoves.every(move => events.includes(move)));
    assert.ok(events.some(event => event.type === 'move' && event.flowerId === stored.id && event.from === 'buffer'));
    for (const event of events) apply(game.visual, rules, event);
  };

  await game.useTool(0);
  assert.deepEqual(Array.from(castMoves, move => move.flowerId), Array.from(blue.slice(1), flower => flower.id));
  assert.equal(game.visual.orders[0].filled, 1);
  assert.equal(game.visual.stars, 1);
  assert.equal(inventory, 1);
});

test('three rapid order flights each rebound at their own arrival before queued effects', async () => {
  const {game, rules, flights} = collectingGame({level: 1, timeLimit: 180,
    flowers: [{kind: 'cdy_lxq', count: 3}], orders: [{vaseId: 1301, needs: [{kind: 'cdy_lxq', count: 3}]}]});
  const root = uiNode(game.ordersRoot, 'Order');
  const bouquet = await FlowerBouquetView.create(root, game.visual.orders[0]);
  game.orderViews.set(0, {root, bouquet});
  let completions = 0;
  game.removeBouquet = async () => { completions++; return true; };
  const work = rules.flowers.map(flower => game.collect(flower.id));
  assert.equal(flights.length, 3);

  for (const {node, destination, scale, motion} of flights) {
    const [{duration, options}] = motion.steps;
    assert.equal(duration, 0.62);
    motion.target.progress = 0.42 / duration;
    options.onUpdate();
    assert.deepEqual(node.position, destination);
    assert.ok(Math.abs(node.scale.x - scale.x) < 1e-12);
    motion.target.progress = 0.47 / duration;
    options.onUpdate();
    assert.deepEqual(node.position, destination);
    assert.ok(Math.abs(node.scale.x / scale.x - 1.16) < 1e-12);
    assert.ok(Math.abs(node.scale.y / scale.y - 1.16) < 1e-12);
  }

  assert.equal(bouquet.placedFlowers.length, 0);
  assert.equal(completions, 0);
  for (const flight of flights) flight.complete();
  assert.ok(flights.every(({node, scale}) => Math.abs(node.scale.x - scale.x) < 1e-12));
  await Promise.all(work);
  assert.equal(bouquet.placedFlowers.length, 3);
  assert.equal(completions, 1);
  assert.ok(flights.every(({node}) => !node.isValid));
});

test('a guided order flight plays its arrival cue once at contact, before the rebound finishes', async () => {
  const game = new FlowerGame();
  const node = uiNode(new Node('FlightParent'), 'Flower');
  const destination = new Vec3(48, 200, 0);
  let arrivals = 0;
  const guide = {root: new Node('Guide'), carry() {}, onArrival() {
    arrivals++;
    assert.deepEqual(node.position, destination);
  }};
  const work = game.flyFlower(node, destination, new Vec3(1, 1, 1), 0, guide, true);
  const motion = animationTweens.at(-1);
  for (const [time, expected] of [[0.40, 0], [0.42, 1], [0.50, 1]]) {
    motion.target.progress = time / motion.steps[0].duration;
    motion.steps[0].options.onUpdate();
    assert.equal(arrivals, expected);
  }
  motion.callback();
  assert.equal(await work, true);
  assert.equal(arrivals, 1);
});

test('rapid taps start every flight immediately and settle each vase in its own tap order', async () => {
  const {game, rules, flights, sounds} = collectingGame({level: 1, timeLimit: 180,
    flowers: [{kind: 'cdy_lxq', count: 3}, {kind: 'dy_zmj', count: 3}],
    orders: [{vaseId: 1301, needs: [{kind: 'cdy_lxq', count: 3}]}, {vaseId: 1601, needs: [{kind: 'dy_zmj', count: 3}]}]});
  await load('FlowerBouquet').preloadBouquets([1301, 1601]);
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const before = hapticTaps;
  const work = Array.from(flowers, flower => game.collect(flower.id));
  const other = rules.flowers.find(flower => flower.kind === 'dy_zmj');
  work.push(game.collect(other.id));
  await game.collect(flowers[0].id); await game.collect(flowers[1].id);
  assert.equal(hapticTaps - before, 4); assert.equal(sounds.length, 4);
  assert.deepEqual(flights.map(flight => flight.id), [...Array.from(flowers, flower => flower.id), other.id]);
  assert.equal(new Set(flights.slice(0, 3).map(flight => JSON.stringify(flight.destination))).size, 3);
  assert.equal(rules.stars, 1); assert.equal(game.visual.orders[0].filled, 0);
  assert.equal(game.busy, true);
  await game.useTool(0);
  for (const flight of flights.slice(1)) flight.complete();
  await flush();
  assert.equal(game.visual.orders[0].filled, 0); assert.equal(game.visual.stars, 0);
  assert.equal(game.visual.orders[1].filled, 1);
  flights[0].complete();
  // The fixture has no live bouquet nodes but still runs the group pause.
  await flush();
  for (const callback of game.scheduled) { game.scheduled.delete(callback); callback(); }
  await Promise.all(work);
  assert.equal(game.visual.stars, rules.stars); assert.equal(game.visual.stars, 1);
  assert.equal(game.visual.orders[1].filled, 1);
  assert.equal(game.busy, false); assert.equal(game.collectionWork, null);
});

test('a full vase clears and refills independently of a vase whose flowers are still landing', async () => {
  const kinds = ['cdy_lxq', 'dy_zmj', 'cdcs_jyc'];
  const vaseIds = [1301, 1601, 1301];
  const {game, rules, flights} = collectingGame({level: 2, timeLimit: 180,
    flowers: kinds.map(kind => ({kind, count: 3})),
    orders: kinds.map((kind, i) => ({vaseId: vaseIds[i], needs: [{kind, count: 3}]}))});
  await load('FlowerBouquet').preloadBouquets(vaseIds);
  const [left, right, replacement] = kinds.map(kind => rules.flowers.filter(flower => flower.kind === kind));
  const departures = new Map(), replacedSlots = [];
  game.removeBouquet = slot => new Promise(resolve => departures.set(slot, resolve));
  game.renderOrder = async slot => { replacedSlots.push(slot); };
  function tap(flower) {
    const work = game.collect(flower.id);
    assert.equal(flights.at(-1).id, flower.id);
    return {work, land: flights.at(-1).complete};
  }
  for (const flower of [left[0], right[0], right[1]]) {
    const {work, land} = tap(flower);
    land(); await work;
  }
  const delayed = tap(left[1]);
  const rightLast = tap(right[2]);
  const leftLast = tap(left[2]);
  const next = tap(replacement[0]);
  rightLast.land(); next.land();
  await flush();
  assert.deepEqual(Array.from(departures.keys()), [1]);
  assert.equal(game.visual.orders[0].filled, 1);
  assert.equal(game.visual.orders[1], null);
  assert.deepEqual(replacedSlots, []);

  delayed.land(); leftLast.land();
  await flush();
  assert.deepEqual(Array.from(departures.keys()), [1, 0]);
  assert.equal(game.visual.stars, 2);

  departures.get(1)(true);
  await flush();
  assert.deepEqual(replacedSlots, [1]);
  assert.equal(game.visual.orders[1].needs[0].kind, kinds[2]);
  assert.equal(game.visual.orders[1].filled, 1);
  assert.equal(game.busy, true);

  departures.get(0)(true);
  await Promise.all([delayed.work, rightLast.work, leftLast.work, next.work]);
  assert.equal(game.busy, false);
});

test('a full buffer ends once after its accepted flights land and rejects further taps', async () => {
  const session = collectingGame({level: 2, timeLimit: 120, flowers: [{kind: 'a', count: 3}, {kind: 'b', count: 6}],
    orders: [{needs: [{kind: 'a', count: 3}, {kind: 'b', count: 6}]}]}), {game, rules, flights} = session;
  const flowers = rules.flowers.filter(flower => flower.kind === 'b');
  const work = Array.from(flowers, flower => game.collect(flower.id));
  assert.equal(rules.status, 'lost'); assert.equal(rules.buffer.length, 5);
  assert.equal(flowers[5].status, 'pool'); assert.equal(flights.length, 5);
  assert.equal(new Set(flights.map(flight => flight.destination.x)).size, 5);
  assert.equal(game.visual.buffer.length, 0); assert.equal(session.ended, 0);
  for (const flight of flights) flight.complete();
  await Promise.all(work);
  assert.equal(game.visual.buffer.length, 5); assert.equal(session.ended, 1);
  assert.equal(game.collectionWork, null);
});

test('pause blocks new taps while the flowers already in flight finish landing', async () => {
  const session = collectingGame(), {game, rules, flights} = session;
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const work = [game.collect(flowers[0].id), game.collect(flowers[1].id)];
  const before = pauseDialogs.length;
  await game.pauseGame();
  await game.collect(flowers[2].id);
  assert.equal(pauseDialogs.length, before + 1); assert.equal(game.paused, true);
  assert.equal(flights.length, 2); assert.equal(flowers[2].status, 'pool');
  for (const flight of flights) flight.complete();
  await Promise.all(work);
  assert.equal(game.busy, false); assert.equal(session.ended, 0);
  assert.equal(game.visual.orders[0].filled, 2);
  pauseDialogs.at(-1).onResume(); game.update(0);
  assert.equal(session.ended, 0); assert.equal(game.paused, false);
});

test('terminal flights reject pause so home or restart cannot bypass the one-time result settlement', async () => {
  for (const outcome of ['won', 'lost']) {
    const kind = 'cdy_lxq';
    const session = collectingGame({level: 2, timeLimit: 120, flowers: [{kind, count: 3}],
      orders: [{vaseId: 1301, needs: [{kind, count: 3}]}]}), {game, rules, flights} = session;
    const flowers = rules.flowers;
    if (outcome === 'won') {
      for (const flower of flowers.slice(0, 2)) {
        const work = game.collect(flower.id); flights.at(-1).complete(); await work;
      }
    }
    const work = game.collect(flowers[outcome === 'won' ? 2 : 0].id);
    if (outcome === 'lost') rules.tick(999);
    assert.equal(rules.status, outcome);
    const before = pauseDialogs.length;
    await game.pauseGame(); await game.pauseGame();
    assert.equal(pauseDialogs.length, before); assert.equal(game.paused, false);
    flights.at(-1).complete();
    await flush();
    for (const callback of game.scheduled) { game.scheduled.delete(callback); callback(); }
    await work;
    assert.equal(session.ended, 1); assert.equal(game.finished, true);
    await game.pauseGame(); assert.equal(pauseDialogs.length, before);
    assert.equal(game.collectionWork, null);
  }
});

test('scene replacement cancels overlapping flights and the old collector cannot unlock the new scene', async () => {
  const session = collectingGame(), {game, rules, flights} = session;
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const oldView = game.visual;
  const work = [game.collect(flowers[0].id), game.collect(flowers[1].id)];
  assert.equal(game.pendingAnimations.size, 4, 'each overlapping flight has a corresponding pickup ripple');
  game.clear('home'); game.busy = true;
  await Promise.all(work);
  for (const flight of flights) flight.complete();
  assert.equal(oldView.orders[0].filled, 0); assert.equal(game.pendingAnimations.size, 0);
  assert.equal(game.busy, true); assert.equal(game.collectionWork, null); assert.equal(session.ended, 0);
});

test('unavailable flowers and non-collection busy states reject input', async () => {
  const {game, rules, flights} = collectingGame();
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const before = hapticTaps; game.busy = true;
  await game.collect(flowers[0].id);
  game.busy = false;
  flowers[1].status = 'hidden';
  await game.collect(flowers[1].id);
  assert.equal(flights.length, 0); assert.equal(hapticTaps, before); assert.equal(game.collectionWork, null);
});
