#!/usr/bin/env node
'use strict';
// Public GET requests only. No uploader, credential reader, or server mutation.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const https = require('node:https');

const PROJECT = path.resolve(__dirname, '..');
const PLAN_FILE = path.join(PROJECT, 'temp/wechat-cdn-plan.json');
const REPORT_FILE = path.join(PROJECT, 'temp/wechat-cdn-verification.json');
const CDN_ORIGIN = 'https://game2cdn.chujinggamefun.com';
const CONCURRENCY = 4;
const TIMEOUT_MS = 30000;

function selectFiles(plan) {
    if (plan?.version !== 1 || !Array.isArray(plan.files) || !plan.files.length) throw Error('Invalid CDN plan');
    const server = new URL(plan.server);
    if (server.origin !== CDN_ORIGIN || server.username || server.password || server.search || server.hash) throw Error('Unexpected public CDN server');
    const prefix = decodeURIComponent(server.pathname).replace(/^\/+|\/+$/g, '');
    if (!/^zdhjy\/[A-Za-z0-9_/-]+$/.test(prefix) || prefix.split('/').some(part => !part || part === '.' || part === '..')
        || prefix !== plan.prefix) throw Error('Invalid CDN namespace');
    const groups = new Map(), seen = new Set();
    for (const file of plan.files) {
        if (typeof file.path !== 'string' || /[\\\u0000-\u001f\u007f?#]/.test(file.path)) throw Error('Invalid CDN object path');
        const parts = file.path.split('/');
        if (parts.length < 3 || parts[0] !== 'remote' || parts.some(part => !part || part === '.' || part === '..')
            || !/^[A-Za-z0-9_-]+$/.test(parts[1]) || file.objectKey !== `${prefix}/${file.path}`) throw Error('CDN object is outside its planned namespace');
        if (seen.has(file.path) || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || !/^[a-f0-9]{64}$/i.test(file.sha256)) throw Error('Invalid or duplicate CDN file inventory');
        seen.add(file.path);
        const bundle = parts[1];
        if (!groups.has(bundle)) groups.set(bundle, []);
        groups.get(bundle).push(file);
    }
    const selected = [];
    for (const [bundle, files] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
        const config = files.filter(file => /^remote\/[^/]+\/config[^/]*\.json$/.test(file.path));
        const index = files.filter(file => /^remote\/[^/]+\/index[^/]*\.js$/.test(file.path));
        const imported = files.filter(file => /^remote\/[^/]+\/import\/.+\.json$/i.test(file.path)).sort((a, b) => a.path.localeCompare(b.path));
        const png = files.filter(file => /^remote\/[^/]+\/native\/.+\.png$/i.test(file.path)).sort((a, b) => a.path.localeCompare(b.path));
        if (config.length !== 1 || !imported.length || !png.length) throw Error(`Expected one config, import JSONs, and native PNGs in ${bundle}`);
        // Creator's actual WeChat output keeps bundle scripts in the local app;
        // remote/ contains config/import/native. Check remote index only if emitted.
        for (const [type, file] of [['config', config[0]], ['import-json', imported[0]], ['native-png', png[0]], ...index.map(file => ['index', file])]) {
            const url = `${CDN_ORIGIN}/${file.objectKey.split('/').map(encodeURIComponent).join('/')}`;
            selected.push({bundle, type, path: file.path, url, expectedBytes: file.bytes, expectedSha256: file.sha256.toLowerCase()});
        }
    }
    return selected;
}

/** Stream and hash the response; do not store or log response bodies/headers. */
function verifyFile(file, {requestImpl = https.request, timeoutMs = TIMEOUT_MS} = {}) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 120000) return Promise.reject(Error('Invalid verification timeout'));
    return new Promise(resolve => {
        const started = Date.now(), hash = crypto.createHash('sha256');
        let settled = false, request, timer, bytes = 0, status = null;
        const finish = (error, actualSha256 = null) => {
            if (settled) return;
            settled = true; clearTimeout(timer);
            resolve({...file, status, actualBytes: bytes, actualSha256, passed: !error,
                elapsedMs: Date.now() - started, ...(error ? {error} : {})});
        };
        const failTransport = error => {
            const code = typeof error?.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? error.code : 'network';
            finish({kind: 'network', message: `GET transport failed (${code})`});
        };
        // A total deadline also covers DNS/connect stalls, not just socket inactivity.
        timer = setTimeout(() => {
            finish({kind: 'timeout', message: `GET exceeded ${timeoutMs} ms`}); request?.destroy();
        }, timeoutMs);
        try {
            request = requestImpl(file.url, {method: 'GET', headers: {'Accept-Encoding': 'identity'}}, response => {
                status = response.statusCode || null;
                response.on('error', failTransport);
                response.on('aborted', () => finish({kind: 'network', message: 'GET response was interrupted'}));
                if (status !== 200) {
                    finish({kind: 'http', message: `Expected HTTP 200, received ${status}`});
                    response.destroy(); return; // No redirect following, including cross-origin redirects.
                }
                response.on('data', chunk => {
                    if (settled) return;
                    bytes += chunk.length;
                    if (bytes > file.expectedBytes) {
                        finish({kind: 'size', message: 'Response exceeded the planned byte length'});
                        response.destroy(); return;
                    }
                    hash.update(chunk);
                });
                response.on('end', () => {
                    if (settled) return;
                    const actual = hash.digest('hex');
                    if (bytes !== file.expectedBytes) finish({kind: 'size', message: 'Response byte length differs from plan'}, actual);
                    else if (actual !== file.expectedSha256) finish({kind: 'sha256', message: 'Response SHA-256 differs from plan'}, actual);
                    else finish(null, actual);
                });
            });
            request.on('error', failTransport);
            request.end();
        } catch (error) { failTransport(error); request?.destroy(); }
    });
}

async function verifyPlan(plan, options = {}) {
    const files = selectFiles(plan), startedAt = new Date().toISOString(), results = new Array(files.length);
    let cursor = 0;
    await Promise.all(Array.from({length: Math.min(CONCURRENCY, files.length)}, async () => {
        while (cursor < files.length) {
            const index = cursor++;
            results[index] = await verifyFile(files[index], options);
        }
    }));
    const types = {};
    for (const file of files) types[file.type] = (types[file.type] || 0) + 1;
    return {version: 1, startedAt, completedAt: new Date().toISOString(), server: plan.server,
        readOnly: true, method: 'GET', concurrency: CONCURRENCY,
        sampling: 'Each bundle: config, first import JSON, first native PNG; remote index scripts only when present. WeChat scripts normally remain local.',
        timeoutMs: options.timeoutMs ?? TIMEOUT_MS, bundles: new Set(files.map(file => file.bundle)).size,
        checked: results.length, representativeTypes: types, passed: results.filter(result => result.passed).length,
        failed: results.filter(result => !result.passed).length, results};
}

async function main(argv = process.argv.slice(2)) {
    const mode = argv[0];
    if (!mode || mode === '--help') {
        console.log('node tools/verify-wechat-cdn.cjs --list [plan.json]\nnode tools/verify-wechat-cdn.cjs --verify [plan.json]\nChecks config, one import JSON and one native PNG per bundle, plus remote index scripts only if present.\n--list selects files without requests. --verify performs public GET only after upload, then writes temp/wechat-cdn-verification.json.');
        return;
    }
    if (mode !== '--list' && mode !== '--verify') throw Error('Unknown mode; use --help');
    const plan = JSON.parse(fs.readFileSync(argv[1] || PLAN_FILE, 'utf8'));
    if (mode === '--list') {
        const files = selectFiles(plan);
        console.log(JSON.stringify({requested: false, selected: files.length, files}, null, 2)); return;
    }
    const report = await verifyPlan(plan);
    fs.mkdirSync(path.dirname(REPORT_FILE), {recursive: true});
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({reportFile: REPORT_FILE, checked: report.checked, bundles: report.bundles,
        representativeTypes: report.representativeTypes, passed: report.passed, failed: report.failed, readOnly: true}, null, 2));
    if (report.failed) process.exitCode = 1;
}

module.exports = {selectFiles, verifyFile, verifyPlan};
if (require.main === module) main().catch(() => { console.error('[cdn-verify] Verification could not start; check the plan path, namespace, and file inventory.'); process.exitCode = 1; });
