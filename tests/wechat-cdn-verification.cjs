const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {EventEmitter} = require('node:events');
const {Readable} = require('node:stream');
const {selectFiles, verifyPlan} = require('../tools/verify-wechat-cdn.cjs');

function fixture(count = 10) {
    const prefix = 'zdhjy/test-version';
    const plan = {version: 1, prefix, server: `https://game2cdn.chujinggamefun.com/${prefix}/`, files: []};
    const bodies = new Map();
    for (let i = 1; i <= count; i++) {
        const bundle = `flowers-${String(i).padStart(2, '0')}`;
        for (const tail of ['config.abc.json', 'import/02/020f184a-6bbc-4180-a66e-1e54453e7967.a2533.json', 'native/ab/a.png', 'native/cd/b.png']) {
            const path = `remote/${bundle}/${tail}`, body = Buffer.from(path);
            plan.files.push({path, objectKey: `${prefix}/${path}`, bytes: body.length,
                sha256: crypto.createHash('sha256').update(body).digest('hex')});
            bodies.set(`https://game2cdn.chujinggamefun.com/${prefix}/${path}`, body);
        }
    }
    return {plan, bodies};
}

function getMock(bodies, {mutate, status = () => 200, hanging = false} = {}) {
    const calls = []; let active = 0, maxActive = 0;
    const requestImpl = (url, options, callback) => {
        calls.push({url, options});
        const request = new EventEmitter();
        request.destroy = () => { request.destroyed = true; };
        request.end = () => {
            active++; maxActive = Math.max(maxActive, active);
            if (hanging) return;
            setImmediate(() => {
                const original = bodies.get(url); assert(original, 'mock never requests an unplanned URL');
                const response = Readable.from([mutate ? mutate(url, original) : original]);
                response.statusCode = status(url);
                let completed = false;
                const complete = () => { if (!completed) { completed = true; active--; } };
                response.once('end', complete); response.once('close', complete);
                callback(response);
            });
        };
        return request;
    };
    return {requestImpl, calls, get maxActive() { return maxActive; }};
}

test('selects exactly config, one import JSON and one native PNG per bundle without requiring a remote index', () => {
    const {plan} = fixture(), files = selectFiles(plan);
    assert.equal(files.length, 30);
    assert.equal(files.filter(file => file.type === 'config').length, 10);
    assert.equal(files.filter(file => file.type === 'import-json').length, 10);
    assert.equal(files.filter(file => file.type === 'index').length, 0);
    assert.equal(files.filter(file => file.type === 'native-png').length, 10);
    assert(files.filter(file => file.type === 'native-png').every(file => file.path.endsWith('/a.png')));
});

const emittedPlan = path.join(__dirname, '../temp/wechat-cdn-plan.json');
test('the actual emitted WeChat upload plan yields 30 existing config/import/native samples', {skip: !fs.existsSync(emittedPlan)}, () => {
    const plan = JSON.parse(fs.readFileSync(emittedPlan, 'utf8')), selected = selectFiles(plan);
    assert.equal(selected.length, 30); assert.equal(selected.filter(file => file.type === 'index').length, 0);
    for (const file of selected) {
        const body = fs.readFileSync(path.join(plan.buildRoot, file.path));
        assert.equal(body.length, file.expectedBytes);
        assert.equal(crypto.createHash('sha256').update(body).digest('hex'), file.expectedSha256);
    }
});

test('an actually listed remote index is an extra sample, rather than an assumed required file', () => {
    const {plan} = fixture(1), name = 'remote/flowers-01/index.def.js';
    plan.files.push({path: name, objectKey: `${plan.prefix}/${name}`, bytes: 0, sha256: crypto.createHash('sha256').update('').digest('hex')});
    const selected = selectFiles(plan);
    assert.equal(selected.length, 4); assert.equal(selected.filter(file => file.type === 'index').length, 1);
});

test('public GET verifies 30 planned files with at most four concurrent requests and no authorization headers', async () => {
    const {plan, bodies} = fixture(), mock = getMock(bodies);
    const report = await verifyPlan(plan, {requestImpl: mock.requestImpl});
    assert.equal(report.checked, 30); assert.equal(report.passed, 30); assert.equal(report.failed, 0);
    assert.equal(mock.calls.length, 30); assert(mock.maxActive <= 4); assert(mock.maxActive > 1);
    assert.deepEqual(report.representativeTypes, {config: 10, 'import-json': 10, 'native-png': 10});
    for (const call of mock.calls) {
        assert.equal(call.options.method, 'GET'); assert.equal(new URL(call.url).search, '');
        assert.deepEqual(call.options.headers, {'Accept-Encoding': 'identity'});
    }
});

test('same-length wrong content is reported as a SHA-256 mismatch while the other samples finish', async () => {
    const {plan, bodies} = fixture(1), mock = getMock(bodies, {mutate: (url, body) => {
        if (!url.endsWith('.png')) return body;
        const changed = Buffer.from(body); changed[0] ^= 1; return changed;
    }});
    const report = await verifyPlan(plan, {requestImpl: mock.requestImpl});
    assert.equal(report.checked, 3); assert.equal(report.failed, 1); assert.equal(report.passed, 2);
    const failure = report.results.find(row => !row.passed);
    assert.equal(failure.status, 200); assert.equal(failure.error.kind, 'sha256');
    assert.notEqual(failure.expectedSha256, failure.actualSha256);
});

test('404 and redirects fail explicitly without fetching a replacement URL or logging bodies', async () => {
    for (const httpStatus of [404, 302]) {
        const {plan, bodies} = fixture(1), mock = getMock(bodies, {status: url => url.includes('/import/') ? httpStatus : 200});
        const report = await verifyPlan(plan, {requestImpl: mock.requestImpl});
        assert.equal(report.failed, 1); assert.equal(mock.calls.length, 3);
        const failure = report.results.find(row => !row.passed);
        assert.equal(failure.error.kind, 'http'); assert.equal(failure.status, httpStatus);
        assert.equal(failure.actualSha256, null); assert.equal('body' in failure, false); assert.equal('headers' in failure, false);
    }
});

test('stalled GET requests reach their total deadline and produce a complete failure report', async () => {
    const {plan, bodies} = fixture(1), mock = getMock(bodies, {hanging: true});
    const report = await verifyPlan(plan, {requestImpl: mock.requestImpl, timeoutMs: 5});
    assert.equal(report.checked, 3); assert.equal(report.failed, 3);
    assert(report.results.every(row => row.error.kind === 'timeout'));
});

test('untrusted origins, credentials, traversal, object-key drift and duplicate inventory are rejected before GET', async () => {
    const mutations = [
        p => { p.server = 'https://elsewhere.example/zdhjy/test-version/'; },
        p => { p.server = 'https://user:secret@game2cdn.chujinggamefun.com/zdhjy/test-version/'; },
        p => { p.files[0].path = 'remote/flowers-01/../config.json'; },
        p => { p.files[0].objectKey = 'another-project/remote/flowers-01/config.json'; },
        p => { p.files.push({...p.files[0]}); },
    ];
    for (const mutate of mutations) {
        const {plan, bodies} = fixture(1), mock = getMock(bodies); mutate(plan);
        await assert.rejects(verifyPlan(plan, {requestImpl: mock.requestImpl})); assert.equal(mock.calls.length, 0);
    }
});
