const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript');
const source = fs.readFileSync(path.join(__dirname, '../assets/scripts/FlowerStartup.ts'), 'utf8');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS},
}).outputText, {exports: exportsObject, Promise});
const {runStartupTasks} = exportsObject;
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
};
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('starts all asset jobs concurrently and advances only for actual completion', async () => {
  const jobs = [deferred(), deferred(), deferred()], started = [], progress = [];
  const work = runStartupTasks(jobs.map((job, index) => () => {started.push(index); return job.promise;}), (...value) => progress.push(value));
  assert.deepEqual(started, [0, 1, 2]); assert.deepEqual(progress, [[0, 3]]);
  await flush(); assert.deepEqual(progress, [[0, 3]], 'elapsed microtasks cannot invent progress');
  jobs[2].resolve(); await flush(); assert.deepEqual(progress.at(-1), [1, 3]);
  jobs[0].resolve(); await flush(); assert.deepEqual(progress.at(-1), [2, 3]);
  jobs[1].resolve(); assert.equal(await work, true);
  assert.deepEqual(progress, [[0, 3], [1, 3], [2, 3], [3, 3]]);
});

test('rejects promptly on failure and suppresses late progress without poisoning a retry', async () => {
  const failed = deferred(), late = deferred(), firstProgress = [], error = new Error('asset failed');
  const work = runStartupTasks([() => failed.promise, () => late.promise], (...value) => firstProgress.push(value));
  const rejected = assert.rejects(work, value => value === error);
  failed.reject(error); await rejected;
  const retryProgress = [];
  const retry = runStartupTasks([() => Promise.resolve(), () => Promise.resolve()], (...value) => retryProgress.push(value));
  late.resolve(); assert.equal(await retry, true); await flush();
  assert.deepEqual(firstProgress, [[0, 2]], 'old run cannot report completion into retry UI');
  assert.deepEqual(retryProgress, [[0, 2], [1, 2], [2, 2]]);
});

test('synchronous task throws reject the run and never invoke finalize', async () => {
  const error = new Error('sync failure'), progress = []; let finalized = 0;
  await assert.rejects(runStartupTasks([() => {throw error;}], (...value) => progress.push(value), () => true,
    async () => {finalized++;}), value => value === error);
  assert.deepEqual(progress, [[0, 2]]); assert.equal(finalized, 0);
});

test('cancellation is sticky, suppresses late callbacks, and skips finalize', async () => {
  const jobs = [deferred(), deferred()], progress = []; let current = true, finalized = 0;
  const work = runStartupTasks(jobs.map(job => () => job.promise), (...value) => progress.push(value), () => current,
    async () => {finalized++;});
  current = false; jobs[0].resolve(); await flush();
  current = true; jobs[1].resolve();
  assert.equal(await work, false); assert.deepEqual(progress, [[0, 3]]); assert.equal(finalized, 0);
});

test('100 percent waits for finalize after all asset jobs, including cancellation during final UI construction', async () => {
  const asset = deferred(), ui = deferred(), finalStarted = deferred(), progress = []; let finalized = 0;
  const work = runStartupTasks([() => asset.promise], (...value) => progress.push(value), () => true,
    () => {finalized++; finalStarted.resolve(); return ui.promise;});
  assert.equal(finalized, 0); asset.resolve(); await finalStarted.promise;
  assert.equal(finalized, 1); assert.deepEqual(progress, [[0, 2], [1, 2]]);
  ui.resolve(); assert.equal(await work, true); assert.deepEqual(progress.at(-1), [2, 2]);
  const lateUI = deferred(), lateStarted = deferred(), cancelledProgress = []; let current = true;
  const cancelled = runStartupTasks([], (...value) => cancelledProgress.push(value), () => current, () => {lateStarted.resolve(); return lateUI.promise;});
  await lateStarted.promise; current = false; lateUI.resolve();
  assert.equal(await cancelled, false); assert.deepEqual(cancelledProgress, [[0, 1]]);
});

test('finalize failure rejects without reporting 100 percent', async () => {
  const progress = [], error = new Error('UI build failed');
  await assert.rejects(runStartupTasks([async () => {}], (...value) => progress.push(value), () => true,
    async () => {throw error;}), value => value === error);
  assert.deepEqual(progress, [[0, 2], [1, 2]]);
});

test('empty runs finish normally while an already abandoned run performs no work or callback', async () => {
  const progress = [];
  assert.equal(await runStartupTasks([], (...value) => progress.push(value)), true);
  assert.deepEqual(progress, [[0, 0]]);
  let calls = 0;
  assert.equal(await runStartupTasks([async () => {calls++;}], () => {calls++;}, () => false, async () => {calls++;}), false);
  assert.equal(calls, 0);
});
