const resourceFile = require('./resource-file.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript');
const root = path.join(__dirname, '..');
class Vec3 { constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); } }
class Node {
  static EventType = { NODE_DESTROYED: 'destroyed' };
  constructor(name = '') { this.name = name; this.children = []; this.isValid = true; this.active = true; this.events = new Map(); this.position = new Vec3(); this.scale = new Vec3(1, 1, 1); this.angle = 0; this.components = []; }
  addChild(node) { node.parent = this; this.children.push(node); }
  addComponent(Type) { const value = new Type(); value.node = this; this.components.push(value); return value; }
  getComponent(Type) { return this.components.find(value => value instanceof Type) || null; }
  getChildByName(name) { return this.children.find(node => node.name === name) || null; }
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
  Tween: { stopAllByTarget(target) { for (const value of animationTweens) if (value.target === target) value.stopped = true; } },
  tween(target) { return { target, steps: [], to(duration, properties, options) { this.steps.push({duration, properties, options}); return this; }, call(callback) { this.callback = callback; return this; }, start() { animationTweens.push(this); return this; } }; },
  JsonAsset: class {},
  resources: { load(name, Type, callback) { callback(null, { json: JSON.parse(fs.readFileSync(resourceFile(name + '.json'), 'utf8')) }); } },
};
const uiNode = (parent, name, x = 0, y = 0, width = 750, height = 1334) => {
  const node = new Node(name); Object.assign(node, { x, y, width, height });
  node.addComponent(UITransform).setContentSize(width, height); parent.addChild(node); return node;
};
const rewardDialogs = [];
const pauseDialogs = [];
const ui = { uiNode, sprite: async (...args) => uiNode(...args), loadFrame: async () => ({}),
  message: async (parent, title, body, action, onAction) => { rewardDialogs.push({title, body, action, onAction}); return new Node('Message'); } };
const catalog = { flowerSpritePath: (kind, variant = 1) => 'original/flower/' + kind + '_0' + variant };
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
    if (request === './FlowerAssets') return {loadFlowerAsset: cc.resources.load};
    if (request === 'cc/env') return { DEBUG: false };
    if (request === './FlowerUI') return ui;
    if (request === './FlowerViewport') return require('./viewport-fixture.cjs');
    if (request === './FlowerHaptics') return {vibrateFlowerTap() { hapticTaps++; }};
    if (request === './FlowerPause') return {createPause: async (_parent, actions) => { pauseDialogs.push(actions); }};
    if (request === './FlowerCatalog') return catalog;
    if (['./FlowerRules', './FlowerBouquet', './FlowerRewardedVideo'].includes(request)) return load(request.slice(2));
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

test('bouquet landings use original attachment coordinates and incremental flowers preserve draw order', async () => {
  const order = { id: 'order-0', kind: 'cdy_lxq', required: 3, filled: 0, slot: 0, vaseId: 1301,
    needs: [{ kind: 'cdy_lxq', required: 3, filled: 0 }] };
  const view = await FlowerBouquetView.create(new Node('Parent'), order);
  const vase = view.root.getChildByName('VaseLayer0');
  const first = view.landing(order);
  assert.ok(Math.abs(first.position.x - 4.375) < 1e-8);
  assert.ok(Math.abs(first.position.y - 114.65277777777777) < 1e-8);
  assert.ok(Math.abs(first.width - 104.16666666666667) < 1e-8);
  for (let filled = 1; filled <= 3; filled++) {
    order.filled = order.needs[0].filled = filled; await view.sync(order);
  }
  assert.equal(view.root.getChildByName('VaseLayer0'), vase);
  assert.equal(view.root.getChildByName('PlacedFlowers').children.map(node => node.name).join(','), 'PlacedFlower0-1,PlacedFlower0-2,PlacedFlower0-0');
  assert.equal(view.landing(order), null);
  await view.sync(order);
  assert.equal(view.root.getChildByName('PlacedFlowers').children.length, 3);
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
  const flight = animationTweens.at(-1);
  assert.equal(game.pendingAnimations.size, 1);
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

test('tray, tool and order points map through their actual translated parents into the flight layer', () => {
  const game = new FlowerGame(), board = new Node('Board'); board.setPosition(375, 800);
  const tray = uiNode(board, 'Tray'), tools = uiNode(board, 'Tools'), flight = uiNode(board, 'Flight');
  tray.setPosition(0, 135); tools.setPosition(0, -95); flight.setPosition(0, 20);
  assert.deepEqual(game.mapPoint(tray, new Vec3(-243, 252), flight), new Vec3(-243, 367));
  assert.deepEqual(game.mapPoint(tools, new Vec3(234, -585), flight), new Vec3(234, -700));
  tray.setPosition(0, 200); flight.setPosition(0, 50);
  assert.deepEqual(game.mapPoint(tray, new Vec3(-280, 443), flight), new Vec3(-280, 593));
});

function queuedGame(config) {
  const game = new FlowerGame(), rules = new FlowerRules(config);
  game.node = new Node('Scene'); game.content = uiNode(game.node, 'Content');
  game.rules = rules; game.visual = new FlowerPresentationState(rules);
  game.ready = true; game.sceneMode = 'game';
  const pending = [], started = [], sounds = [];
  let ended = 0;
  game.sound = name => sounds.push(name); game.updateHUD = () => {};
  game.animateEvents = async (events, rev) => {
    const view = game.visual;
    started.push(events.filter(event => event.type === 'move')[0]?.flowerId);
    await new Promise(resolve => pending.push(resolve));
    if (game.current(rev)) for (const event of events) apply(view, rules, event);
  };
  game.endLevel = async () => { ended++; game.clearFlowerTaps(); game.finished = true; };
  return {game, rules, pending, started, sounds, get ended() { return ended; }};
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('rapid distinct flower taps queue immediately, reject duplicates and finish rule streams in FIFO order', async () => {
  const session = queuedGame(), {game, rules, pending, started, sounds} = session;
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const before = hapticTaps, first = game.collect(flowers[0].id);
  await game.collect(flowers[1].id); await game.collect(flowers[2].id);
  await game.collect(flowers[0].id); await game.collect(flowers[1].id);
  assert.equal(hapticTaps - before, 3); assert.equal(sounds.length, 3);
  assert.deepEqual(started, [flowers[0].id]);
  assert.equal(rules.orders[0].filled, 1); assert.equal(game.visual.orders[0].filled, 0);
  assert.equal(game.tapQueue.length, 2); assert.equal(game.busy, true);
  await game.useTool(0); assert.equal(started.length, 1, 'tools cannot interleave with the queued rule stream');
  for (let i = 0; i < flowers.length; i++) { pending.shift()(); await flush(); }
  await first;
  assert.deepEqual(started, Array.from(flowers, flower => flower.id));
  assert.equal(game.visual.stars, rules.stars); assert.equal(game.visual.stars, 1);
  assert.equal(game.busy, false); assert.equal(game.collecting, false);
  assert.equal(game.tapQueue.length, 0); assert.equal(game.queuedTaps.size, 0);
});

test('a full buffer ends once and discards queued taps without overwriting its last slot', async () => {
  const session = queuedGame({level: 2, timeLimit: 120, flowers: [{kind: 'a', count: 3}, {kind: 'b', count: 6}],
    orders: [{needs: [{kind: 'a', count: 3}, {kind: 'b', count: 6}]}]}), {game, rules, pending, started} = session;
  const flowers = rules.flowers.filter(flower => flower.kind === 'b');
  const work = game.collect(flowers[0].id);
  for (const flower of flowers.slice(1)) await game.collect(flower.id);
  for (let i = 0; i < 5; i++) { pending.shift()(); await flush(); }
  await work;
  assert.equal(rules.status, 'lost'); assert.equal(rules.buffer.length, 5);
  assert.equal(flowers[5].status, 'pool'); assert.equal(started.length, 5);
  assert.equal(game.visual.buffer.length, 5); assert.equal(session.ended, 1);
  assert.equal(game.tapQueue.length, 0); assert.equal(game.queuedTaps.size, 0);
});

test('pause accepts a click during a playing collection and drops pending taps while the current flower lands', async () => {
  const session = queuedGame(), {game, rules, pending, started} = session;
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const work = game.collect(flowers[0].id); await game.collect(flowers[1].id);
  const before = pauseDialogs.length;
  await game.pauseGame();
  assert.equal(pauseDialogs.length, before + 1); assert.equal(game.paused, true); assert.equal(game.tapQueue.length, 0);
  pending.shift()(); await work;
  assert.equal(started.length, 1); assert.equal(game.busy, false); assert.equal(session.ended, 0);
  assert.equal(game.visual.orders[0].filled, 1);
  pauseDialogs.at(-1).onResume(); game.update(0);
  assert.equal(session.ended, 0); assert.equal(game.paused, false);
});

test('terminal flights reject pause so home or restart cannot bypass the one-time result settlement', async () => {
  for (const outcome of ['won', 'lost']) {
    const session = queuedGame({level: 2, timeLimit: 120, flowers: [{kind: 'a', count: 3}],
      orders: [{needs: [{kind: 'a', count: 3}]}]}), {game, rules, pending} = session;
    const flowers = rules.flowers;
    if (outcome === 'won') {
      for (const flower of flowers.slice(0, 2)) {
        const work = game.collect(flower.id); pending.shift()(); await work;
      }
    }
    const work = game.collect(flowers[outcome === 'won' ? 2 : 0].id);
    if (outcome === 'lost') rules.tick(999);
    assert.equal(rules.status, outcome);
    const before = pauseDialogs.length;
    await game.pauseGame(); await game.pauseGame();
    assert.equal(pauseDialogs.length, before); assert.equal(game.paused, false);
    pending.shift()(); await work;
    assert.equal(session.ended, 1); assert.equal(game.finished, true);
    await game.pauseGame(); assert.equal(pauseDialogs.length, before);
    assert.equal(game.tapQueue.length, 0); assert.equal(game.queuedTaps.size, 0);
  }
});

test('scene replacement cancels queued taps and the old collector cannot unlock the new scene', async () => {
  const session = queuedGame(), {game, rules, pending, started} = session;
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const work = game.collect(flowers[0].id); await game.collect(flowers[1].id);
  game.clear('home'); game.busy = true;
  pending.shift()(); await work;
  assert.equal(started.length, 1); assert.equal(game.busy, true); assert.equal(game.collecting, false);
  assert.equal(game.tapQueue.length, 0); assert.equal(game.queuedTaps.size, 0); assert.equal(session.ended, 0);
});

test('a queued flower that is no longer available is skipped, while non-collection busy states reject input', async () => {
  const {game, rules, pending, started} = queuedGame();
  const flowers = rules.flowers.filter(flower => flower.kind === 'cdy_lxq');
  const before = hapticTaps; game.busy = true;
  await game.collect(flowers[0].id); assert.equal(hapticTaps, before); assert.equal(game.tapQueue.length, 0);
  game.busy = false;
  const work = game.collect(flowers[0].id); await game.collect(flowers[1].id);
  flowers[1].status = 'hidden';
  pending.shift()(); await work;
  assert.equal(started.length, 1); assert.equal(game.busy, false); assert.equal(game.queuedTaps.size, 0);
});
