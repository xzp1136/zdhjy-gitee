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
class UITransform { width = 100; height = 100; }
class Mask { static Type = { GRAPHICS_RECT: 0 }; }
class Component {
  constructor() { this.isValid = true; this.scheduled = new Set(); }
  scheduleOnce(callback) { this.scheduled.add(callback); }
  unschedule(callback) { this.scheduled.delete(callback); }
}
const animationTweens = [];
const cc = {
  _decorator: { ccclass: () => value => value }, Component, Node, Vec3, UITransform, Mask,
  Tween: { stopAllByTarget(target) { for (const value of animationTweens) if (value.target === target) value.stopped = true; } },
  tween(target) { return { target, steps: [], to(duration, properties, options) { this.steps.push({duration, properties, options}); return this; }, call(callback) { this.callback = callback; return this; }, start() { animationTweens.push(this); return this; } }; },
  JsonAsset: class {},
  resources: { load(name, Type, callback) { callback(null, { json: JSON.parse(fs.readFileSync(path.join(root, 'assets/resources', name + '.json'), 'utf8')) }); } },
};
const uiNode = (parent, name, x = 0, y = 0, width = 750, height = 1334) => {
  const node = new Node(name); Object.assign(node, { x, y, width, height }); parent.addChild(node); return node;
};
const ui = { uiNode, sprite: async (...args) => uiNode(...args), loadFrame: async () => ({}) };
const catalog = { flowerSpritePath: (kind, variant = 1) => 'original/flower/' + kind + '_0' + variant };
const modules = {};
function load(name) {
  if (modules[name]) return modules[name];
  const exports = {}; modules[name] = exports;
  const text = ts.transpileModule(fs.readFileSync(path.join(root, 'assets/scripts', name + '.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
  }).outputText;
  vm.runInNewContext(text, { exports, console, Map, Set, Math, Number, Object, Array, Promise, require(request) {
    if (request === 'cc') return cc;
    if (request === 'cc/env') return { DEBUG: false };
    if (request === './FlowerUI') return ui;
    if (request === './FlowerCatalog') return catalog;
    if (['./FlowerRules', './FlowerBouquet'].includes(request)) return load(request.slice(2));
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
