const resourceFile = require('./resource-file.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const typescript = require('./typescript.cjs');
const root = path.join(__dirname, '..');
const originalTables = JSON.parse(fs.readFileSync(resourceFile('original/data/original-order-flower-vase-tables.json'), 'utf8'));
const levelTables = JSON.parse(fs.readFileSync(resourceFile('original/data/original-level-info-tables.json'), 'utf8'));

function loadModule(file, requireFunction, consoleObject = console) {
  const exports = {};
  const compiled = typescript.transpileModule(fs.readFileSync(path.join(root, 'assets/scripts', file), 'utf8'), {
    compilerOptions: { target: typescript.ScriptTarget.ES2020, module: typescript.ModuleKind.CommonJS },
  });
  vm.runInNewContext(compiled.outputText, { exports, require: requireFunction, console: consoleObject, Object, Array, Map, Set, Math, Number, Error, Promise });
  return exports;
}
const { FlowerRules } = loadModule('FlowerRules.ts');
async function loadCatalog(transform, warnings = []) {
  const tables = JSON.parse(JSON.stringify(originalTables));
  const levels = JSON.parse(JSON.stringify(levelTables));
  if (transform) transform(tables, levels);
  const loads = [];
  class JsonAsset {}
  const cc = {
    JsonAsset,
    resources: {
      load(name, type, callback) {
        loads.push(name);
        assert.equal(type, JsonAsset);
        const json = name.endsWith('original-order-flower-vase-tables') ? tables
          : name.endsWith('original-level-info-tables') ? levels : null;
        queueMicrotask(() => callback(json ? null : new Error('Unknown resource ' + name), { json }));
      },
    },
  };
  const { FlowerCatalog } = loadModule('FlowerCatalog.ts', name => {
    if (name === './FlowerAssets') return {loadFlowerAsset: cc.resources.load};
    assert.equal(name, 'cc');
    return cc;
  }, { warn: (...args) => warnings.push(args.join(' ')) });
  const catalog = await FlowerCatalog.load();
  assert.equal(loads.length, 2);
  return catalog;
}
const flowerCount = config => config.flowers.reduce((sum, group) => sum + group.count, 0);
const orderCount = order => order.needs.reduce((sum, need) => sum + need.count, 0);
function advanceBoard(game) {
  const events = game.collectMatchingOrder();
  if (events.length) return events;
  // Compose rejects a partial group. Ordinary clicks can empty its remaining
  // pool supply, which lets the original one-second difficulty check fire.
  const needs = game.orders.filter(Boolean).map(order => order.needs.find(need => need.filled < need.required).kind);
  const flower = game.flowers.find(piece => piece.status === 'pool' && !piece.specialId && needs.includes(piece.kind));
  return flower ? game.select(flower.id) : game.tick(1);
}

test('real catalog keeps the observed tutorial at nine flowers, three bouquets and 180 seconds', async () => {
  const catalog = await loadCatalog();
  const level = catalog.level(1);
  assert.equal(level.source, 'observed');
  assert.equal(level.timeLimit, 180);
  assert.equal(flowerCount(level), 9);
  assert.equal(level.orders.length, 3);
  assert.equal(level.initialUnlockedOrderSlots, 2);
  assert.equal(JSON.stringify(level.orders.map(order => order.vaseId)), JSON.stringify([1301, 1601, 1201]));
  assert.equal(new FlowerRules(level).flowers.length, 9);
});

test('the extracted second level joins to 99 flowers and 31 bouquets including two six-flower bouquets', async () => {
  const catalog = await loadCatalog();
  const level = catalog.level(2);
  assert.equal(level.source, 'extracted');
  assert.equal(level.timeLimit, 400);
  assert.equal(level.initialUnlockedOrderSlots, 4);
  assert.equal(level.orders.length, 31);
  assert.equal(flowerCount(level), 99);
  const mixed = level.orders.filter(order => orderCount(order) === 6);
  assert.equal(mixed.length, 2);
  assert.equal(mixed.every(order => order.vaseId === 5201 && order.needs.length === 2), true);
  assert.equal(level.orders.filter(order => orderCount(order) === 3).length, 29);
  const game = new FlowerRules(level);
  assert.equal(game.normalFlowerCount, 99);
  assert.equal(game.flowers.length, 107);
  assert.equal(game.orders.length, 4);
  let moves = 0;
  while (game.status === 'playing') {
    const events = advanceBoard(game);
    moves += events.filter(event => event.type === 'move').length;
  }
  assert.equal(game.status, 'won');
  assert.equal(game.completedOrders, 31);
  assert.equal(game.stars, 31);
  assert.equal(moves, 99);
});

test('second-level original special rows create four butterflies of each id at the original sequential insertion positions', async () => {
  const catalog = await loadCatalog();
  const config = catalog.level(2);
  assert.equal(config.specials.length, 8);
  assert.equal(config.specials.filter(item => item.specialId === 2000 && item.kind === 'hd_01').length, 4);
  assert.equal(config.specials.filter(item => item.specialId === 2001 && item.kind === 'hd_02').length, 4);
  const game = new FlowerRules(config);
  const initialPool = game.flowers.filter(piece => piece.status === 'pool');
  const indexes = [7, 11, 19, 24, 39, 47, 60, 72];
  indexes.forEach((at, index) => assert.equal(initialPool[at].id, 'special-' + index));
  assert.equal(game.normalFlowerCount, 99);
  assert.equal(game.flowers.length, 107);
  assert.equal(initialPool.length, 102);
  assert.equal(game.flowers.filter(piece => piece.status === 'hidden').length, 5);
  assert.equal(game.progress, 0);
});

test('the catalog passes original sequence gaps and four-layer limits through to the board', async () => {
  const catalog = await loadCatalog();
  const config = catalog.level(2);
  assert.equal(JSON.stringify(config.flowerIntervalRange), '[3,5]');
  assert.equal(JSON.stringify(config.layerNumber), '[[19,21],[1,2],[35,40],[0,0]]');
  const game = new FlowerRules(config);
  assert.equal(JSON.stringify(game.layerMaxCounts), '[21,2,40,0]');
  assert.equal(JSON.stringify(config.diffRange), '[[35,15],[40,5],[46,5],[51,1],[57,1]]');
  assert.equal(JSON.stringify(game.layerCounts), '[22,1,39,40]');
  assert.equal(game.flowers.filter(piece => piece.specialId !== undefined && piece.initialLayer === 0).length, 3);
});

test('an odd or singleton special id is reported and its rows are skipped like the original insertion routine', async () => {
  const emitted = [];
  const catalog = await loadCatalog((tables, levels) => {
    levels.tables.LevelInfoConfigB.find(level => level.level === 2).specialObjectNum = [[2000, 8], [2001, 20], [2001, 25]];
  }, emitted);
  const config = catalog.level(2);
  assert.equal(config.specials.length, 2);
  assert.equal(config.specials.every(item => item.specialId === 2001), true);
  assert.equal(emitted.some(warning => /2000.*跳过/.test(warning)), true);
  assert.equal(new FlowerRules(config).normalFlowerCount, 99);
});

test('every selected flower type comes from the vase requirement choices and the last element remains the count', async () => {
  const catalog = await loadCatalog();
  const level = catalog.level(2);
  for (const order of level.orders) {
    const vase = catalog.vases.get(order.vaseId);
    assert.equal(order.needs.length, vase.orderInfo.length);
    order.needs.forEach((need, index) => {
      const raw = vase.orderInfo[index];
      const flower = catalog.flowersByKind.get(need.kind);
      assert.equal(need.count, raw[raw.length - 1]);
      assert.equal(raw.slice(0, -1).includes(flower.type), true);
      assert.ok(flower.unlockLevel <= 2);
    });
  }
});

test('the same local seed yields identical level data across calls and independent resource loads', async () => {
  const first = await loadCatalog(), second = await loadCatalog();
  assert.equal(JSON.stringify(first.level(2)), JSON.stringify(first.level(2)));
  assert.equal(JSON.stringify(first.level(2)), JSON.stringify(second.level(2)));
});

test('new-vase markers apply only to the first occurrence in its unlock level, excluding the tutorial', async () => {
  const catalog = await loadCatalog();
  let newVases = 0, repeatedEligible = 0;
  for (const number of catalog.levels.keys()) {
    const config = catalog.level(number), seen = new Set();
    for (const order of config.orders) {
      const eligible = number !== 1 && catalog.vases.get(order.vaseId).unlockLevel === number;
      const expected = eligible && !seen.has(order.vaseId);
      assert.equal(order.isNew, expected, `level ${number}, vase ${order.vaseId}`);
      if (expected) newVases++;
      if (eligible && seen.has(order.vaseId)) repeatedEligible++;
      seen.add(order.vaseId);
    }
  }
  assert(newVases > 0); assert(repeatedEligible > 0, 'real tables exercise repeated newly unlocked vases');
  assert(catalog.level(1).orders.every(order => order.isNew === false));
  const first = catalog.level(2).orders.map(order => [order.vaseId, order.isNew]);
  catalog.level(3);
  assert.equal(JSON.stringify(catalog.level(2).orders.map(order => [order.vaseId, order.isNew])), JSON.stringify(first), 'generation/restart never reuses another attempt’s seen set');
});

test('unresolved B-branch groups log and skip exactly their original entries while leaving solvable levels', async () => {
  const emitted = [];
  const catalog = await loadCatalog(undefined, emitted);
  const definedGroups = new Set(originalTables.tables.OrderLevelConfigB.map(group => group.index));
  for (let number = 53; number <= 61; number++) {
    const source = levelTables.tables.LevelInfoConfigB.find(row => row.level === number);
    const expectedOrderCount = source.levelOrderIndex.reduce((sum, id, index) =>
      sum + (definedGroups.has(id) ? source.levelOrderNum[index] : 0), 0);
    const level = catalog.level(number);
    assert.equal(level.orders.length, expectedOrderCount);
    const warnings = catalog.levelWarnings.get(number);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], new RegExp(`第${number}关.*${number}01.*跳过`));
    assert.equal(emitted.includes(warnings[0]), true);
    assert.equal(flowerCount(level), level.orders.reduce((sum, order) => sum + orderCount(order), 0));
    const game = new FlowerRules(level);
    let moves = 0;
    while (game.status === 'playing') {
      const events = advanceBoard(game);
      moves += events.filter(event => event.type === 'move').length;
    }
    assert.equal(game.status, 'won');
    assert.equal(game.completedOrders, expectedOrderCount);
    assert.equal(moves, flowerCount(level));
    assert.equal(game.displayProgressPercent, 100);
  }
  assert.equal(emitted.length, 9);
});

test('a level with no remaining valid order groups fails explicitly after recording its warning', async () => {
  const emitted = [];
  const catalog = await loadCatalog((tables, levels) => {
    const source = levels.tables.LevelInfoConfigB.find(level => level.level === 2);
    source.levelOrderIndex = [999999];
    source.levelOrderNum = [1];
  }, emitted);
  assert.throws(() => catalog.level(2), /第2关.*无有效订单/);
  assert.equal(catalog.levelWarnings.get(2).length, 1);
  assert.match(emitted[0], /999999.*跳过/);
});

test('only the second level begins with four unlocked slots, while the third returns to two', async () => {
  const catalog = await loadCatalog();
  assert.equal(catalog.level(2).initialUnlockedOrderSlots, 4);
  assert.equal(catalog.level(3).initialUnlockedOrderSlots, 2);
  const game = new FlowerRules(catalog.level(3));
  assert.equal(game.unlockedOrderSlots, 2);
  assert.equal(game.orders.filter(Boolean).length, 2);
});

test('a group with no unlocked bouquets is warned and skipped instead of selecting a locked bouquet', async () => {
  const emitted = [];
  const catalog = await loadCatalog(tables => {
    const group = tables.tables.OrderLevelConfigB.find(row => row.index === 101);
    for (const id of group.orderList) tables.tables.VaseInfoConfig.find(vase => vase.index === id).unlockLevel = 999;
  }, emitted);
  const level = catalog.level(2);
  assert.equal(level.orders.length, 28);
  assert.equal(flowerCount(level), 90);
  assert.equal(catalog.levelWarnings.get(2).length, 1);
  assert.match(emitted[0], /101.*没有已解锁.*跳过/);
  assert.equal(level.orders.some(order => order.vaseId === 1301), false);
});

test('a missing vase reference fails explicitly even when its group has other valid choices', async () => {
  const catalog = await loadCatalog(tables => {
    tables.tables.OrderLevelConfigB.find(group => group.index === 101).orderList.push(999999);
  });
  assert.throws(() => catalog.level(2), /999999/);
});
