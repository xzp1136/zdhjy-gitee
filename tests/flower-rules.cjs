const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const source = path.join(__dirname, '../assets/scripts/FlowerRules.ts');
const typescript = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript');
const exportsObject = {};
if (fs.existsSync(source)) {
  const compiled = typescript.transpileModule(fs.readFileSync(source, 'utf8'), {
    compilerOptions: { target: typescript.ScriptTarget.ES2020, module: typescript.ModuleKind.CommonJS },
  });
  vm.runInNewContext(compiled.outputText, { exports: exportsObject, Object, Array, Map, Set, Math, Number, Error });
}
function create(level = 1, coins = 0) {
  assert.equal(typeof exportsObject.FlowerRules, 'function', 'The flower rules state machine exists');
  return new exportsObject.FlowerRules(level, coins);
}
const kinds = ['cdy_lxq', 'dy_zmj', 'cdcs_jyc'];
const ids = (game, kind) => game.flowers.filter(f => f.kind === kind).map(f => f.id);
const many = { level: 5, timeLimit: 180, flowers: kinds.map(kind => ({ kind, count: 9 })), orderSequence: [...Array(3).fill(kinds[0]), ...Array(3).fill(kinds[1]), ...Array(3).fill(kinds[2])] };

test('the observed first level begins with two orders and nine flowers', () => {
  const game = create();
  assert.equal(game.flowers.length, 9);
  assert.equal(game.orders.length, 4);
  assert.equal(game.orders[0].kind, kinds[0]);
  assert.equal(game.orders[1].kind, kinds[1]);
  assert.equal(game.orders[2], null);
  assert.equal(game.remainingSeconds, 180);
  assert.equal(game.bufferCapacity, 5);
  assert.equal(game.source, 'observed');
  assert.equal(game.flowers.every(f => f.status === 'pool'), true);
});

test('original interval placement interleaves bouquet groups through sparse slots before removing gaps', () => {
  const names = ['a', 'b', 'c', 'd', 'e'];
  const game = create({
    level: 7, timeLimit: 180,
    flowers: names.map(kind => ({ kind, count: 3 })),
    orderSequence: names,
    flowerIntervalRange: [3, 5],
  });
  // Original positions: a=0/4/10, b=1/5/11, c=2/6/12,
  // d=3/7/13, e=8/14/20. The vacant positions are then removed.
  assert.equal(game.flowers.map(piece => piece.kind).join(''), 'abcdabcdeabcdee');
  assert.equal(new Set(game.flowers.map(piece => piece.id)).size, 15);
  const first = JSON.stringify(game.flowers);
  game.restart();
  assert.equal(JSON.stringify(game.flowers), first);
});

test('without intervals the pool follows successive bouquet needs instead of aggregating species', () => {
  const game = create({
    level: 7, timeLimit: 180,
    flowers: [{ kind: 'a', count: 6 }, { kind: 'b', count: 3 }],
    orders: [{ needs: [{ kind: 'a', count: 3 }, { kind: 'b', count: 3 }] }, { needs: [{ kind: 'a', count: 3 }] }],
  });
  assert.equal(game.flowers.map(piece => piece.kind).join(''), 'aaabbbaaa');
  assert.equal(game.flowers.map(piece => piece.id).join(','), 'flower-0,flower-1,flower-2,flower-6,flower-7,flower-8,flower-3,flower-4,flower-5');
});

test('original layers split normal flowers first and special insertion preserves existing layer membership', () => {
  const game = create({
    level: 2, timeLimit: 180,
    flowers: [{ kind: 'a', count: 12 }],
    layerNumber: [[2, 2], [3, 3], [3, 3], [0, 0]],
    specials: [
      { specialId: 2000, kind: 'hd_01', insertAtPercent: 0 },
      { specialId: 2000, kind: 'hd_01', insertAtPercent: 100 },
    ],
  });
  assert.equal(JSON.stringify(game.layerCounts), JSON.stringify([3, 3, 3, 5]));
  assert.equal(JSON.stringify(game.layerMaxCounts), JSON.stringify([2, 3, 3, 0]));
  assert.equal(game.flowers.find(piece => piece.id === 'special-0').initialLayer, 0);
  assert.equal(game.flowers.find(piece => piece.id === 'special-1').initialLayer, 3);
  assert.equal(game.flowers.find(piece => piece.id === 'flower-1').initialLayer, 0);
  assert.equal(game.flowers.find(piece => piece.id === 'flower-2').initialLayer, 1);
  assert.equal(game.flowers.find(piece => piece.id === 'flower-5').initialLayer, 2);
  assert.equal(game.flowers.find(piece => piece.id === 'flower-8').initialLayer, 3);
  assert.equal(game.normalFlowerCount, 12);
});

test('difficulty rows hide the earliest matching flower once per bouquet while retaining the normal goal', () => {
  const game = create({
    level: 2, timeLimit: 180,
    flowers: [{ kind: 'a', count: 6 }, { kind: 'b', count: 3 }],
    orderSequence: ['a', 'b', 'a'], diffRange: [[100, 2], [100, 8]],
  });
  const hidden = game.flowers.filter(piece => piece.status === 'hidden');
  assert.equal(hidden.length, 1);
  assert.equal(hidden[0].id, 'flower-0');
  assert.equal(game.normalFlowerCount, 9);
  assert.equal(game.flowers.filter(piece => piece.status === 'pool').length, 8);
  assert.equal(game.select(hidden[0].id).length, 0);
  assert.equal(game.progress, 0);
});

test('a mixed difficulty bouquet starts its delay only when its final group becomes active', () => {
  const game = create({
    level: 2, timeLimit: 180,
    flowers: ['a', 'b', 'c'].map(kind => ({ kind, count: 3 })),
    orders: [{ needs: [{ kind: 'a', count: 3 }, { kind: 'b', count: 3 }] }, { needs: [{ kind: 'c', count: 3 }] }],
    diffRange: [[50, 2]],
  });
  const hidden = game.flowers.find(piece => piece.status === 'hidden');
  assert.equal(hidden.kind, 'b');
  assert.equal(game.tick(5).length, 0);
  ids(game, 'a').forEach(id => game.select(id));
  assert.equal(game.tick(1).length, 0);
  const events = game.tick(1);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'flower-revealed');
  assert.equal(events[0].flowerId, hidden.id);
  assert.equal(events[0].layer, 2);
  assert.equal(hidden.status, 'pool');
  assert.equal(hidden.initialLayer, 2);
  assert.equal(game.progress, 1 / 3);
  assert.equal(game.tick(5).length, 0);
});

test('difficulty checks wait for the one-second poll and zero pool supply before beginning the delay', () => {
  const game = create({
    level: 2, timeLimit: 180, flowers: [{ kind: 'a', count: 6 }],
    orderSequence: ['a', 'a'], diffRange: [[50, 2]],
  });
  const hidden = game.flowers.find(piece => piece.status === 'hidden');
  game.flowers.filter(piece => piece.status === 'pool').forEach(piece => game.select(piece.id));
  assert.equal(game.completedOrders, 1);
  assert.equal(game.tick(0.5).length, 0);
  assert.equal(game.tick(0.5).length, 0);
  assert.equal(game.tick(1).length, 0);
  assert.equal(hidden.status, 'hidden');
  assert.equal(game.tick(1)[0].flowerId, hidden.id);
  game.select(hidden.id);
  assert.equal(game.status, 'won');
});

test('compose rejects an incomplete group when the missing hidden flower belongs to another bouquet', () => {
  const game = create({
    level: 2, timeLimit: 180, flowers: [{ kind: 'a', count: 6 }],
    orderSequence: ['a', 'a'], diffRange: [[50, 2]],
  });
  game.collectMatchingOrder();
  assert.equal(game.completedOrders, 1);
  assert.equal(game.collectMatchingOrder().length, 0);
  assert.equal(game.flowers.filter(piece => piece.status === 'pool').length, 2);
  assert.equal(game.orders.find(Boolean).filled, 0);
  assert.equal(game.flowers.filter(piece => piece.status === 'hidden').length, 1);
});

test('compose reveals the current final group early and its old delay cannot reveal it twice', () => {
  const game = create({
    level: 2, timeLimit: 180,
    flowers: ['a', 'b', 'c'].map(kind => ({ kind, count: 3 })),
    orders: [{ needs: [{ kind: 'a', count: 3 }, { kind: 'b', count: 3 }] }, { needs: [{ kind: 'c', count: 3 }] }],
    diffRange: [[50, 10]],
  });
  const hidden = game.flowers.find(piece => piece.status === 'hidden');
  assert.equal(game.collectMatchingOrder().some(event => event.type === 'flower-revealed'), false);
  const events = game.collectMatchingOrder();
  const revealIndex = events.findIndex(event => event.type === 'flower-revealed' && event.flowerId === hidden.id);
  const moveIndex = events.findIndex(event => event.type === 'move' && event.flowerId === hidden.id);
  assert.ok(revealIndex >= 0 && moveIndex > revealIndex);
  assert.equal(hidden.status, 'collected');
  assert.equal(game.completedOrders, 1);
  assert.equal(game.status, 'playing');
  assert.equal(game.tick(20).some(event => event.type === 'flower-revealed'), false);
  game.restart();
  assert.equal(game.flowers.filter(piece => piece.status === 'hidden').length, 1);
});

test('a flower matching an active order bypasses the buffer and cannot be counted twice', () => {
  const game = create();
  const id = ids(game, kinds[0])[0];
  const events = game.select(id);
  assert.equal(events[0].type, 'move');
  assert.equal(events[0].to, 'order');
  assert.equal(events[0].slot, 0);
  assert.equal(game.orders[0].filled, 1);
  assert.equal(game.buffer.length, 0);
  assert.equal(game.select(id).length, 0);
  assert.equal(game.orders[0].filled, 1);
});

test('the observed first level awards one star only when an order is completed', () => {
  const game = create();
  const blue = ids(game, kinds[0]);
  game.select(blue[0]);
  assert.equal(game.stars, 0);
  game.select(blue[1]);
  assert.equal(game.stars, 0);
  game.select(blue[2]);
  assert.equal(game.stars, 1);
  assert.equal(game.orders[0].kind, kinds[2]);
});

test('a newly opened order automatically takes its matching flowers from temporary storage', () => {
  const game = create();
  const buffered = ids(game, kinds[2]);
  buffered.forEach(id => game.select(id));
  assert.equal(game.buffer.length, 3);
  const blue = ids(game, kinds[0]);
  game.select(blue[0]); game.select(blue[1]);
  const events = game.select(blue[2]);
  assert.equal(game.buffer.length, 0);
  assert.equal(game.completedOrders, 2);
  assert.equal(events.filter(e => e.type === 'order-completed').length, 2);
  assert.equal(events.filter(e => e.type === 'move' && e.from === 'buffer').length, 3);
  assert.equal(game.status, 'playing');
  assert.equal(game.progress, 2 / 3);
});

test('all flowers collected wins once, and terminal games reject more input and timer updates', () => {
  const game = create();
  let victoryEvents = 0;
  kinds.forEach(kind => ids(game, kind).forEach(id => {
    victoryEvents += game.select(id).filter(event => event.type === 'won').length;
  }));
  assert.equal(game.status, 'won');
  assert.equal(game.progress, 1);
  assert.equal(victoryEvents, 1);
  const before = game.remainingSeconds;
  assert.equal(game.tick(180).length, 0);
  assert.equal(game.remainingSeconds, before);
  assert.equal(game.select('unknown').length, 0);
});

test('the observed first victory grants ten coins once and exposes the actual reward', () => {
  const game = create(1, 27);
  assert.equal(game.coinReward, 0);
  assert.equal(game.coins, 27);
  const allEvents = [];
  kinds.forEach(kind => ids(game, kind).forEach(id => allEvents.push(...game.select(id))));
  assert.equal(game.status, 'won');
  assert.equal(game.coinReward, 10);
  assert.equal(game.coins, 37);
  assert.equal(allEvents.find(event => event.type === 'won').coins, 10);
  assert.equal(allEvents.find(event => event.type === 'won').stars, 3);
  game.select(game.flowers[0].id);
  game.tick(180);
  assert.equal(game.coins, 37);
});

test('restarting preserves the wallet and cannot grant the same board reward twice', () => {
  const game = create(1, 80);
  game.buyExtraBufferSlot();
  kinds.forEach(kind => ids(game, kind).forEach(id => game.select(id)));
  assert.equal(game.coins, 30);
  game.restart();
  assert.equal(game.coins, 30);
  assert.equal(game.coinReward, 0);
  let victory;
  kinds.forEach(kind => ids(game, kind).forEach(id => {
    victory = game.select(id).find(event => event.type === 'won') || victory;
  }));
  assert.equal(game.status, 'won');
  assert.equal(game.coins, 30);
  assert.equal(game.coinReward, 0);
  assert.equal(victory.coins, 0);
});

test('a custom win reward is granted only after a successful retry, never on failure', () => {
  const game = create({ level: 2, timeLimit: 1, flowers: [{ kind: kinds[0], count: 3 }], coinsOnWin: 25 }, 5);
  game.tick(1);
  assert.equal(game.status, 'lost');
  assert.equal(game.coins, 5);
  assert.equal(game.coinReward, 0);
  game.restart();
  ids(game, kinds[0]).forEach(id => game.select(id));
  assert.equal(game.coins, 30);
  assert.equal(game.coinReward, 25);
});

test('filling all temporary slots loses without silently deleting any flower', () => {
  const game = create(many);
  const pink = ids(game, kinds[2]);
  pink.slice(0, 4).forEach(id => game.select(id));
  assert.equal(game.status, 'playing');
  const events = game.select(pink[4]);
  assert.equal(game.status, 'lost');
  assert.equal(game.failureReason, 'buffer');
  assert.equal(game.buffer.length, 5);
  assert.equal(events.some(e => e.type === 'lost' && e.reason === 'buffer'), true);
  assert.equal(game.flowers.filter(f => f.status === 'buffer').length, 5);
});

test('the sixth storage slot costs sixty coins and cannot be bought twice', () => {
  const poor = create(many, 59);
  assert.equal(poor.buyExtraBufferSlot().length, 0);
  assert.equal(poor.coins, 59);
  const game = create(many, 100);
  assert.equal(game.buyExtraBufferSlot().length, 1);
  assert.equal(game.bufferCapacity, 6);
  assert.equal(game.coins, 40);
  assert.equal(game.buyExtraBufferSlot().length, 0);
  ids(game, kinds[2]).slice(0, 5).forEach(id => game.select(id));
  assert.equal(game.status, 'playing');
  game.select(ids(game, kinds[2])[5]);
  assert.equal(game.status, 'lost');
});

test('a level can start with all four order slots unlocked and preserves that on restart', () => {
  const game = create({ ...many, initialUnlockedOrderSlots: 4 });
  assert.equal(game.unlockedOrderSlots, 4);
  assert.equal(game.orders.filter(Boolean).length, 4);
  assert.equal(game.orders[0].kind, kinds[0]);
  assert.equal(game.orders[1].kind, kinds[0]);
  assert.equal(game.orders[2].kind, kinds[0]);
  assert.equal(game.orders[3].kind, kinds[1]);
  assert.equal(game.isOrderSlotUnlocked(3), true);
  assert.equal(game.unlockOrderSlot(3).length, 0);
  game.restart();
  assert.equal(game.unlockedOrderSlots, 4);
  assert.equal(game.orders.filter(Boolean).length, 4);
});

test('a level can start with three slots and unlock only its remaining fourth slot', () => {
  const game = create({ ...many, initialUnlockedOrderSlots: 3 });
  assert.equal(game.unlockedOrderSlots, 3);
  assert.equal(game.orders.filter(Boolean).length, 3);
  assert.equal(game.isOrderSlotUnlocked(2), true);
  assert.equal(game.isOrderSlotUnlocked(3), false);
  assert.equal(game.unlockOrderSlot(2).length, 0);
  assert.equal(game.unlockOrderSlot(3)[0].type, 'order-unlocked');
  assert.equal(game.unlockedOrderSlots, 4);
});

test('unlocking a selected order slot settles buffered flowers without unlocking the other slot', () => {
  const game = create();
  ids(game, kinds[2]).forEach(id => game.select(id));
  const events = game.unlockOrderSlot(3);
  assert.equal(game.isOrderSlotUnlocked(3), true);
  assert.equal(game.isOrderSlotUnlocked(2), false);
  assert.equal(game.unlockedOrderSlots, 3);
  assert.equal(game.buffer.length, 0);
  assert.equal(game.completedOrders, 1);
  assert.equal(events.some(e => e.type === 'order-completed' && e.order.slot === 3), true);
  assert.equal(game.unlockOrderSlot(3).length, 0);
});

test('one order tool use completes only the first red-rose order and settles the new lotus order from storage', () => {
  const redRose = 'red_rose', lily = 'pink_lily', lotus = 'pale_lotus';
  const game = create({
    level: 2, timeLimit: 400, initialUnlockedOrderSlots: 4,
    flowers: [
      { kind: redRose, count: 6 }, { kind: kinds[2], count: 3 }, { kind: kinds[1], count: 3 },
      { kind: lily, count: 3 }, { kind: lotus, count: 3 },
    ],
    orderSequence: [redRose, redRose, kinds[2], kinds[1], lotus, lily],
  });
  ids(game, kinds[1]).slice(0, 2).forEach(id => game.select(id));
  const lilyId = ids(game, lily)[0], lotusId = ids(game, lotus)[0];
  game.select(lilyId);
  game.select(lotusId);
  const firstOrderId = game.orders[0].id, secondOrderId = game.orders[1].id;
  assert.equal(typeof game.collectMatchingOrder, 'function');
  const events = game.collectMatchingOrder();
  const redMoves = events.filter(event => event.type === 'move' && event.orderId === firstOrderId);
  assert.equal(redMoves.length, 3);
  assert.equal(events.filter(event => event.type === 'order-completed').length, 1);
  assert.equal(events.filter(event => event.type === 'order-added').length, 1);
  assert.equal(events.some(event => event.type === 'move' && event.orderId === secondOrderId), false);
  assert.equal(game.stars, 1);
  assert.equal(game.orders[0].kind, lotus);
  assert.equal(game.orders[0].filled, 1);
  assert.equal(game.orders[1].kind, redRose);
  assert.equal(game.orders[1].filled, 0);
  assert.equal(game.orders[2].filled, 0);
  assert.equal(game.orders[3].filled, 2);
  assert.equal(JSON.stringify(game.buffer), JSON.stringify([lilyId]));
  assert.equal(events.some(event => event.type === 'move' && event.flowerId === lotusId && event.from === 'buffer'), true);
  assert.equal(game.flowers.filter(flower => flower.kind === redRose && flower.status === 'pool').length, 3);
  assert.equal(game.status, 'playing');
});

test('new-vase state survives initial orders, queued events, independent snapshots and restart', () => {
  const config = {
    level: 2, timeLimit: 400,
    flowers: [{kind: 'a', count: 3}, {kind: 'b', count: 3}, {kind: 'c', count: 3}],
    orders: [
      {vaseId: 1, isNew: true, needs: [{kind: 'a', count: 3}]},
      {vaseId: 2, isNew: false, needs: [{kind: 'b', count: 3}]},
      {vaseId: 3, isNew: true, needs: [{kind: 'c', count: 3}]},
    ],
  };
  const game = create(config);
  assert.equal(game.orders[0].isNew, true); assert.equal(game.orders[1].isNew, false);
  const events = game.collectMatchingOrder();
  const completed = events.find(event => event.type === 'order-completed');
  const added = events.find(event => event.type === 'order-added');
  assert.equal(completed.order.isNew, true); assert.equal(added.order.isNew, true);
  added.order.isNew = false; completed.order.isNew = false;
  assert.equal(game.orders[0].isNew, true, 'event snapshots cannot change the live order');
  assert.equal(config.orders[2].isNew, true);
  game.restart();
  assert.equal(game.orders[0].vaseId, 1); assert.equal(game.orders[0].isNew, true);
  assert.equal(game.orders[1].isNew, false);
  const repeated = game.collectMatchingOrder();
  assert.equal(repeated.find(event => event.type === 'order-added').order.isNew, true);
  assert(create().orders.filter(Boolean).every(order => order.isNew === false), 'legacy/numeric configuration defaults to ordinary orders');
});

test('a mixed bouquet stores its later flower kind until the current group is complete and awards one star for the whole bouquet', () => {
  const game = create({
    level: 2, timeLimit: 400, source: 'extracted',
    flowers: [{ kind: 'rose', count: 3 }, { kind: 'leaf', count: 3 }],
    orders: [{ vaseId: 5201, needs: [{ kind: 'rose', count: 3 }, { kind: 'leaf', count: 3 }] }],
  });
  assert.equal(game.orders[0].vaseId, 5201);
  assert.equal(game.orders[0].kind, 'rose');
  assert.equal(game.orders[0].required, 6);
  assert.equal(game.orders[0].needs.length, 2);
  ids(game, 'leaf').forEach(id => game.select(id));
  assert.equal(game.buffer.length, 3);
  assert.equal(game.orders[0].filled, 0);
  assert.equal(game.orders[0].needs[1].filled, 0);
  assert.equal(game.stars, 0);
  assert.equal(game.status, 'playing');
  let completed;
  ids(game, 'rose').forEach(id => {
    completed = game.select(id).find(event => event.type === 'order-completed') || completed;
  });
  assert.equal(game.status, 'won');
  assert.equal(game.stars, 1);
  assert.equal(game.completedOrders, 1);
  assert.equal(completed.order.vaseId, 5201);
  assert.equal(completed.order.required, 6);
  assert.equal(completed.order.filled, 6);
  assert.equal(completed.order.needs.every(need => need.filled === need.required), true);
});

test('a mixed bouquet takes its current stored kind first and event need snapshots remain independent', () => {
  const lily = 'lily';
  const game = create({
    level: 2, timeLimit: 400,
    flowers: [...kinds.map(kind => ({ kind, count: 3 })), { kind: lily, count: 3 }],
    orders: [
      { needs: [{ kind: kinds[0], count: 3 }] }, { needs: [{ kind: kinds[1], count: 3 }] },
      { vaseId: 5201, needs: [{ kind: kinds[2], count: 3 }, { kind: lily, count: 3 }] },
    ],
  });
  ids(game, kinds[2]).slice(0, 2).forEach(id => game.select(id));
  game.select(ids(game, lily)[0]);
  assert.equal(game.buffer.length, 3);
  const allEvents = [];
  ids(game, kinds[0]).forEach(id => allEvents.push(...game.select(id)));
  assert.equal(game.buffer.length, 1);
  assert.equal(game.orders[0].required, 6);
  assert.equal(game.orders[0].filled, 2);
  assert.equal(game.orders[0].needs[0].filled, 2);
  assert.equal(game.orders[0].needs[1].filled, 0);
  const added = allEvents.find(event => event.type === 'order-added');
  assert.equal(added.order.filled, 0);
  assert.equal(added.order.needs.every(need => need.filled === 0), true);
  game.select(ids(game, kinds[2])[2]);
  ids(game, lily).slice(1).forEach(id => game.select(id));
  assert.equal(game.stars, 2);
  assert.equal(added.order.needs.every(need => need.filled === 0), true);
});

test('the compose tool completes only the current group of a mixed bouquet per use', () => {
  const game = create({
    level: 2, timeLimit: 400,
    flowers: [{ kind: 'rose', count: 6 }, { kind: 'leaf', count: 6 }],
    orders: [
      { vaseId: 5201, needs: [{ kind: 'rose', count: 3 }, { kind: 'leaf', count: 3 }] },
      { vaseId: 5201, needs: [{ kind: 'rose', count: 3 }, { kind: 'leaf', count: 3 }] },
    ],
  });
  game.select(ids(game, 'rose')[0]);
  const firstId = game.orders[0].id, secondId = game.orders[1].id;
  const firstUse = game.collectMatchingOrder();
  assert.equal(firstUse.filter(event => event.type === 'move').length, 2);
  assert.equal(firstUse.filter(event => event.type === 'order-completed').length, 0);
  assert.equal(game.orders[0].id, firstId);
  assert.equal(game.orders[0].filled, 3);
  assert.equal(game.orders[0].needs[0].filled, 3);
  assert.equal(game.orders[0].needs[1].filled, 0);
  assert.equal(game.stars, 0);
  const secondUse = game.collectMatchingOrder();
  assert.equal(secondUse.filter(event => event.type === 'move').length, 3);
  assert.equal(secondUse.filter(event => event.type === 'order-completed').length, 1);
  assert.equal(game.stars, 1);
  assert.equal(game.orders[0], null);
  assert.equal(game.orders[1].id, secondId);
  assert.equal(game.orders[1].filled, 0);
  assert.equal(game.flowers.filter(flower => flower.status === 'pool').length, 6);
});

test('explicit bouquet requirements validate exact per-kind quantities without assuming multiples of three', () => {
  const config = {
    level: 2, timeLimit: 400,
    flowers: [{ kind: 'rose', count: 2 }, { kind: 'leaf', count: 1 }],
    orders: [{ needs: [{ kind: 'rose', count: 2 }, { kind: 'leaf', count: 1 }] }],
  };
  const game = create(config);
  assert.equal(game.orders[0].required, 3);
  while (game.status === 'playing') game.collectMatchingOrder();
  assert.equal(game.status, 'won');
  assert.throws(() => create({ ...config, flowers: [{ kind: 'rose', count: 1 }, { kind: 'leaf', count: 2 }] }), /orders/);
  assert.throws(() => create({ ...config, orders: [{ needs: [] }] }), /needs/);
  assert.throws(() => create({ ...config, orders: [{ needs: [{ kind: 'rose', count: 0 }] }] }), /needs/);
});

test('tutorial display progress matches the original 25, 56 and 77 percent readings without changing true progress', () => {
  const game = create();
  assert.equal(game.displayProgressPercent, 0);
  const blue = ids(game, kinds[0]);
  game.select(blue[0]);
  assert.equal(game.displayProgressPercent, 25);
  assert.equal(game.progress, 1 / 9);
  game.select(blue[1]); game.select(blue[2]);
  assert.equal(game.displayProgressPercent, 56);
  assert.equal(game.progress, 3 / 9);
  ids(game, kinds[1]).forEach(id => game.select(id));
  assert.equal(game.displayProgressPercent, 77);
  ids(game, kinds[2]).forEach(id => game.select(id));
  assert.equal(game.displayProgressPercent, 100);
  assert.equal(game.progress, 1);
});

test('99-flower display progress matches all six observed second-level readings', () => {
  const game = create({ level: 2, timeLimit: 400, flowers: [{ kind: 'flower', count: 99 }] });
  const pieces = ids(game, 'flower');
  const expected = [7, 14, 21, 27, 32, 37];
  expected.forEach((percent, index) => {
    pieces.slice(index * 3, index * 3 + 3).forEach(id => game.select(id));
    assert.equal(game.displayProgressPercent, percent);
    assert.equal(game.progress, (index + 1) * 3 / 99);
  });
});

test('paired butterflies share one storage slot and trigger one bouquet without counting as normal flowers', () => {
  const game = create({
    level: 1, timeLimit: 180, flowers: kinds.map(kind => ({ kind, count: 3 })),
    specials: [
      { specialId: 2000, kind: 'hd_01', insertAtPercent: 8 },
      { specialId: 2000, kind: 'hd_01', insertAtPercent: 12 },
    ],
  });
  assert.equal(game.normalFlowerCount, 9);
  assert.equal(game.flowers.length, 11);
  const butterflies = game.flowers.filter(flower => flower.specialId === 2000);
  const first = game.select(butterflies[0].id);
  assert.equal(first[0].to, 'buffer');
  assert.equal(game.buffer.length, 1);
  assert.equal(game.progress, 0);
  assert.equal(game.displayProgressPercent, 0);
  const second = game.select(butterflies[1].id);
  assert.equal(second[0].to, 'buffer');
  assert.equal(second[0].slot, first[0].slot);
  const paired = second.find(event => event.type === 'special-paired');
  assert.equal(paired.specialId, 2000);
  assert.equal(paired.flowerIds.length, 2);
  assert.equal(paired.delaySeconds, 0.12);
  assert.equal(game.buffer.length, 0);
  assert.equal(game.stars, 1);
  assert.equal(game.completedOrders, 1);
  assert.equal(game.progress, 3 / 9);
  assert.equal(game.displayProgressPercent, 56);
  assert.equal(butterflies.every(flower => flower.status === 'collected'), true);
});

test('different butterfly ids occupy separate slots and a single butterfly counts toward a full tray', () => {
  const game = create({ ...many, specials: [
    { specialId: 2000, kind: 'hd_01', insertAtPercent: 0 },
    { specialId: 2001, kind: 'hd_02', insertAtPercent: 0 },
    { specialId: 2000, kind: 'hd_01', insertAtPercent: 100 },
    { specialId: 2001, kind: 'hd_02', insertAtPercent: 100 },
  ] });
  const green = game.flowers.find(flower => flower.specialId === 2000);
  const pink = game.flowers.find(flower => flower.specialId === 2001);
  game.select(green.id); game.select(pink.id);
  assert.equal(game.buffer.length, 2);
  assert.equal(game.stars, 0);
  ids(game, kinds[2]).slice(0, 3).forEach(id => game.select(id));
  assert.equal(game.buffer.length, 5);
  assert.equal(game.status, 'lost');
  assert.equal(game.failureReason, 'buffer');
});

test('remaining butterflies are not required to complete all normal bouquets', () => {
  const game = create({ level: 1, timeLimit: 180, flowers: [{ kind: 'rose', count: 3 }], specials: [
    { specialId: 2000, kind: 'hd_01', insertAtPercent: 0 },
    { specialId: 2000, kind: 'hd_01', insertAtPercent: 100 },
  ] });
  ids(game, 'rose').forEach(id => game.select(id));
  assert.equal(game.status, 'won');
  assert.equal(game.progress, 1);
  assert.equal(game.displayProgressPercent, 100);
  assert.equal(game.flowers.filter(flower => flower.specialId && flower.status === 'pool').length, 2);
  game.restart();
  assert.equal(game.normalFlowerCount, 3);
  assert.equal(game.flowers.length, 5);
});

test('clearing moves every ordinary stored flower into waiting while preserving the butterfly slot and total progress', () => {
  const game = create({
    level: 2, timeLimit: 400, flowers: kinds.map(kind => ({ kind, count: 3 })),
    specials: [
      { specialId: 2000, kind: 'hd_01', insertAtPercent: 0 },
      { specialId: 2000, kind: 'hd_01', insertAtPercent: 100 },
    ],
  });
  const butterfly = game.flowers.find(piece => piece.specialId === 2000);
  const storedFlowers = ids(game, kinds[2]);
  game.select(butterfly.id);
  storedFlowers.forEach(id => game.select(id));
  assert.equal(game.buffer.length, 4);
  assert.equal(typeof game.clearBuffer, 'function');
  const events = game.clearBuffer();
  assert.equal(events.length, 3);
  assert.equal(events.every(event => event.type === 'move' && event.from === 'buffer' && event.to === 'waiting'), true);
  assert.equal(JSON.stringify(game.buffer), JSON.stringify([butterfly.id]));
  assert.equal(JSON.stringify(game.waiting), JSON.stringify(storedFlowers));
  assert.equal(game.flowers.filter(piece => piece.status === 'waiting').length, 3);
  assert.equal(game.normalFlowerCount, 9);
  assert.equal(game.progress, 0);
  assert.equal(game.clearBuffer().length, 0);
  const complete = game.collectMatchingOrder();
  assert.equal(complete.filter(event => event.type === 'move' && event.from === 'waiting').length, 3);
  assert.equal(game.waiting.length, 0);
  assert.equal(game.completedOrders, 2);
  assert.equal(game.progress, 6 / 9);
  game.collectMatchingOrder();
  assert.equal(game.status, 'won');
  assert.equal(game.progress, 1);
  assert.equal(game.clearBuffer().length, 0);
});

test('a new order consumes waiting flowers before ordinary tray flowers and retains every uncollected piece', () => {
  const game = create({
    level: 2, timeLimit: 400,
    flowers: [{ kind: 'A', count: 3 }, { kind: 'B', count: 3 }, { kind: 'C', count: 6 }],
    orders: [
      { needs: [{ kind: 'A', count: 3 }] }, { needs: [{ kind: 'B', count: 3 }] },
      { needs: [{ kind: 'C', count: 6 }] },
    ],
  });
  const c = ids(game, 'C');
  c.slice(0, 2).forEach(id => game.select(id));
  assert.equal(typeof game.clearBuffer, 'function');
  game.clearBuffer();
  c.slice(2, 4).forEach(id => game.select(id));
  const events = game.collectMatchingOrder();
  const storedMoves = events.filter(event => event.type === 'move' && event.from !== 'pool');
  assert.equal(JSON.stringify(storedMoves.map(event => event.from)), JSON.stringify(['waiting', 'waiting', 'buffer', 'buffer']));
  assert.equal(JSON.stringify(storedMoves.map(event => event.flowerId)), JSON.stringify(c.slice(0, 4)));
  assert.equal(game.waiting.length, 0);
  assert.equal(game.buffer.length, 0);
  assert.equal(game.orders[0].filled, 4);
  assert.equal(game.flowers.filter(piece => piece.status === 'collected').length, 7);
  assert.equal(game.flowers.length, 12);
  while (game.status === 'playing') game.collectMatchingOrder();
  assert.equal(game.status, 'won');
});

test('the timer ignores invalid deltas and reports timeout exactly once', () => {
  const game = create();
  [-5, NaN, Infinity].forEach(dt => assert.equal(game.tick(dt).length, 0));
  assert.equal(game.remainingSeconds, 180);
  game.tick(179.75);
  assert.equal(game.status, 'playing');
  assert.equal(game.remainingSeconds, 0.25);
  assert.equal(game.tick(1)[0].reason, 'time');
  assert.equal(game.remainingSeconds, 0);
  assert.equal(game.tick(1).length, 0);
});

test('a timed-out game spends exactly 100 coins to resume for 120 seconds with its board intact', () => {
  const game = create(1, 100);
  game.select(game.flowers[0].id);
  const board = JSON.stringify({ flowers: game.flowers, orders: game.orders, buffer: game.buffer });
  game.tick(180);
  assert.equal(typeof game.reviveTime, 'function');
  const events = game.reviveTime();
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'time-revived');
  assert.equal(events[0].cost, 100);
  assert.equal(events[0].seconds, 120);
  assert.equal(game.status, 'playing');
  assert.equal(game.failureReason, null);
  assert.equal(game.remainingSeconds, 120);
  assert.equal(game.coins, 0);
  assert.equal(JSON.stringify({ flowers: game.flowers, orders: game.orders, buffer: game.buffer }), board);
  assert.equal(game.reviveTime().length, 0);
  assert.equal(game.coins, 0);
  while (game.status === 'playing') game.collectMatchingOrder();
  assert.equal(game.status, 'won');
  assert.equal(game.coins, 10);
});

test('rewarded time revival adds the original 120 seconds without coins and cannot award twice', () => {
  const game = create();
  const flower = game.flowers.find(item => item.kind === game.orders[0].kind);
  game.select(flower.id); game.tick(game.remainingSeconds);
  const before = JSON.stringify({flowers: game.flowers, orders: game.orders, buffer: game.buffer, stars: game.stars});
  const events = game.reviveTimeWithReward();
  assert.equal(events.length, 1); assert.equal(events[0].type, 'time-revived');
  assert.equal(events[0].seconds, 120); assert.equal(events[0].cost, 0);
  assert.equal(game.coins, 0); assert.equal(game.status, 'playing'); assert.equal(game.remainingSeconds, 120);
  assert.equal(JSON.stringify({flowers: game.flowers, orders: game.orders, buffer: game.buffer, stars: game.stars}), before);
  assert.equal(game.reviveTimeWithReward().length, 0);
  game.status = 'lost'; game.failureReason = 'buffer';
  assert.equal(game.reviveTimeWithReward().length, 0);
});

test('time revival rejects insufficient funds and all states other than timeout without side effects', () => {
  const poor = create(1, 99);
  poor.tick(180);
  const before = JSON.stringify(poor);
  assert.equal(typeof poor.reviveTime, 'function');
  assert.equal(poor.reviveTime().length, 0);
  assert.equal(JSON.stringify(poor), before);
  const active = create(1, 200);
  assert.equal(active.reviveTime().length, 0);
  while (active.status === 'playing') active.collectMatchingOrder();
  assert.equal(active.reviveTime().length, 0);
  const blocked = create(many, 200);
  ids(blocked, kinds[2]).slice(0, 5).forEach(id => blocked.select(id));
  assert.equal(blocked.failureReason, 'buffer');
  assert.equal(blocked.reviveTime().length, 0);
  assert.equal(blocked.coins, 200);
});

test('restart restores flowers, timer and orders while preserving already spent wallet coins', () => {
  const game = create(1, 80);
  game.buyExtraBufferSlot();
  game.select(game.flowers[0].id);
  game.tick(180);
  game.restart();
  assert.equal(game.status, 'playing');
  assert.equal(game.remainingSeconds, 180);
  assert.equal(game.buffer.length, 0);
  assert.equal(game.completedOrders, 0);
  assert.equal(game.coins, 20);
  assert.equal(game.bufferCapacity, 5);
  assert.equal(game.flowers.every(f => f.status === 'pool'), true);
});

test('generated later levels are deterministic and are identified as generated', () => {
  const a = create(4), b = create(4);
  assert.equal(a.source, 'generated');
  assert.equal(JSON.stringify(a.flowers), JSON.stringify(b.flowers));
  assert.ok(a.flowers.length > 9);
  for (let i = 0; i < 100 && a.status === 'playing'; i++) {
    const order = a.orders.find(Boolean);
    assert.ok(order, 'At least one order remains while there are uncollected flowers');
    const flower = a.flowers.find(f => f.status === 'pool' && f.kind === order.kind);
    assert.ok(flower);
    a.select(flower.id);
  }
  assert.equal(a.status, 'won');
});

test('malformed levels are rejected before they can create unsolvable boards', () => {
  assert.throws(() => create({ level: 1, timeLimit: 180, flowers: [{ kind: kinds[0], count: 4 }] }), /multiple of 3/);
  assert.throws(() => create({ level: 1, timeLimit: 180, flowers: [{ kind: kinds[0], count: 3 }], orderSequence: [kinds[1]] }), /orders/);
  assert.throws(() => create({ level: 1, timeLimit: 180, flowers: [{ kind: kinds[0], count: 3 }], coinsOnWin: -1 }), /coinsOnWin/);
  [1, 5, 2.5].forEach(count => assert.throws(() => create({ ...many, initialUnlockedOrderSlots: count }), /initialUnlockedOrderSlots/));
});
