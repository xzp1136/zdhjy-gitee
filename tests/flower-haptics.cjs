const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const creatorProduction = require('./creator-production.cjs');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript');
const output = creatorProduction(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../assets/scripts/FlowerHaptics.ts'), 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS},
}).outputText);

function harness(options = {}) {
  let now = 0, saved = options.saved, storageError = false;
  const calls = [], reads = [], logs = [];
  const sys = {
    platform: options.platform || 'wechat', Platform: {WECHAT_GAME: 'wechat'}, isBrowser: options.platform === 'web',
    localStorage: {getItem(key) { reads.push(key); if (storageError) throw new Error('Storage unavailable'); return saved; }},
  };
  const exports = {};
  const scope = {exports, Date: {now: () => now}, require(name) { assert.equal(name, 'cc'); return {sys}; },
    console: Object.fromEntries(['log', 'warn', 'error', 'info'].map(name => [name, (...args) => logs.push(args)])),
  };
  if (!options.noWx) scope.wx = {
    vibrateShort(args) {
      assert.equal(this, scope.wx, 'preserves the host API receiver');
      calls.push({platform: 'wechat', args});
      if (options.throwApi) throw new Error('Unavailable vibration');
      if (options.failApi) args.fail({errMsg: 'vibrateShort:fail'});
    },
  };
  if (options.navigator) scope.navigator = options.navigator;
  vm.runInNewContext(output, scope);
  return {tap: exports.vibrateFlowerTap, calls, reads, logs, scope, sys,
    at(value) { now = value; }, save(value) { saved = value; }, failStorage(value) { storageError = value; }};
}

test('missing WeChat storage and on default to one light tap, reading only the existing vibration preference', () => {
  for (const saved of [undefined, null, '', 'on']) {
    const h = harness({saved}); h.tap();
    assert.equal(h.calls.length, 1); assert.equal(h.calls[0].args.type, 'light');
    assert.equal(typeof h.calls[0].args.fail, 'function');
    assert.deepEqual(h.reads, ['zdhjy.vibrate']); assert.deepEqual(h.logs, []);
  }
});

test('off disables immediately and settings changes are read on the next tap', () => {
  const h = harness({saved: 'off'}); h.tap(); assert.equal(h.calls.length, 0);
  h.save('on'); h.tap(); assert.equal(h.calls.length, 1);
  h.at(100); h.save('off'); h.tap(); assert.equal(h.calls.length, 1);
  h.save(''); h.tap(); assert.equal(h.calls.length, 2);
});

test('accepted calls are limited to one per 90ms, including a first tap at time zero', () => {
  const h = harness(); h.tap();
  for (const time of [0, 1, 40, 89]) { h.at(time); h.tap(); }
  assert.equal(h.calls.length, 1);
  h.at(90); h.tap(); assert.equal(h.calls.length, 2);
  h.at(179); h.tap(); assert.equal(h.calls.length, 2);
  h.at(180); h.tap(); assert.equal(h.calls.length, 3);
  h.at(20); h.tap(); assert.equal(h.calls.length, 4, 'clock rollback does not silence all later taps');
  h.at(21); h.tap(); assert.equal(h.calls.length, 4);
});

test('callback failures and thrown API errors stay silent and still throttle repeated attempts', () => {
  for (const option of [{failApi: true}, {throwApi: true}]) {
    const h = harness(option);
    assert.doesNotThrow(h.tap); assert.doesNotThrow(h.tap); assert.equal(h.calls.length, 1);
    h.at(90); assert.doesNotThrow(h.tap); assert.equal(h.calls.length, 2);
    assert.deepEqual(h.logs, []);
  }
});

test('storage errors safely suppress feedback and can recover without changing the saved preference', () => {
  const h = harness(); h.failStorage(true);
  assert.doesNotThrow(h.tap); assert.equal(h.calls.length, 0); assert.deepEqual(h.logs, []);
  h.failStorage(false); h.tap(); assert.equal(h.calls.length, 1);
});

test('unsupported WeChat hosts are no-ops and do not invoke a browser fallback', () => {
  let browserCalls = 0;
  const h = harness({noWx: true, navigator: {vibrate() { browserCalls++; }}});
  assert.doesNotThrow(h.tap);
  h.scope.wx = {}; assert.doesNotThrow(h.tap);
  h.scope.wx.vibrateShort = null; assert.doesNotThrow(h.tap);
  assert.equal(browserCalls, 0); assert.deepEqual(h.logs, []);
});

test('browser uses one short 12ms pulse with the same preference and throttle', () => {
  const calls = [], browser = {vibrate(duration) { assert.equal(this, browser); calls.push(duration); return false; }};
  const h = harness({platform: 'web', navigator: browser});
  h.tap(); h.tap(); assert.deepEqual(calls, [12]); assert.equal(h.calls.length, 0);
  h.at(90); h.tap(); assert.deepEqual(calls, [12, 12]);
  h.at(180); h.save('off'); h.tap(); assert.deepEqual(calls, [12, 12]);
});

test('unsupported browsers, browser exceptions and native platforms without an adapter remain silent', () => {
  for (const navigator of [undefined, {}, {vibrate: null}, {vibrate() { throw new Error('Denied'); }}]) {
    const h = harness({platform: 'web', navigator});
    assert.doesNotThrow(h.tap); assert.deepEqual(h.logs, []);
  }
  let browserCalls = 0;
  const native = harness({platform: 'native', navigator: {vibrate() { browserCalls++; }}});
  assert.doesNotThrow(native.tap); assert.equal(native.calls.length, 0); assert.equal(browserCalls, 0);
});
