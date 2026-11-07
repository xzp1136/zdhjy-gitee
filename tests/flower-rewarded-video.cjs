const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript');
const value = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../assets/scripts/FlowerRewardedVideo.ts'), 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS},
}).outputText, {exports: value, Promise, Set});
const {FlowerRewardedVideo, rewardedVideo} = value;
const deferred = () => {let resolve; const promise = new Promise(yes => {resolve = yes;}); return {promise, resolve};};

test('ads-disabled mode grants directly, never invokes a supplied provider, and deduplicates repeated taps', async () => {
  let providerCalls = 0, grants = 0;
  const service = new FlowerRewardedVideo({adsEnabled: false, provider: async () => {providerCalls++; return true;}});
  const first = service.claim('slot-2', () => {grants++;});
  const duplicate = service.claim('slot-2', () => {grants++;});
  assert.equal(await first, true); assert.equal(await duplicate, false);
  assert.equal(grants, 1); assert.equal(providerCalls, 0);
  assert.equal(await rewardedVideo.claim('default-off', () => {grants++;}), true);
  assert.equal(grants, 2);
});

test('future enabled mode grants only after provider completion and does not invent a missing SDK reward', async () => {
  let grants = 0;
  assert.equal(await new FlowerRewardedVideo({adsEnabled: true}).claim('time', () => {grants++;}), false);
  assert.equal(await new FlowerRewardedVideo({adsEnabled: true, provider: async () => false}).claim('time', () => {grants++;}), false);
  const video = deferred(), service = new FlowerRewardedVideo({adsEnabled: true, provider: () => video.promise});
  const work = service.claim('time', () => {grants++;});
  assert.equal(grants, 0); video.resolve(true); assert.equal(await work, true); assert.equal(grants, 1);
});

test('abandoned scenes cannot receive late rewards and failed grants release their retry lock', async () => {
  const service = new FlowerRewardedVideo(); let current = true, grants = 0;
  const work = service.claim('tool', () => {grants++;}, () => current);
  current = false; assert.equal(await work, false); assert.equal(grants, 0);
  const error = new Error('grant failed');
  await assert.rejects(service.claim('tool', () => {throw error;}), value => value === error);
  assert.equal(await service.claim('tool', () => {grants++;}), true); assert.equal(grants, 1);
});

test('the grant stays locked until asynchronous application finishes and explicit no-op is not a success', async () => {
  const service = new FlowerRewardedVideo(), applied = deferred(), started = deferred(); let grants = 0;
  const work = service.claim('slot', () => {grants++; started.resolve(); return applied.promise;});
  await started.promise;
  assert.equal(await service.claim('slot', () => {grants++;}), false);
  applied.resolve(true); assert.equal(await work, true); assert.equal(grants, 1);
  assert.equal(await service.claim('slot', () => false), false);
});
