#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const https = require('node:https');
const { listFiles, readConfig, outputDirectory } = require('./build-wechat.cjs');

const PROJECT = path.resolve(__dirname, '..');
const DEFAULT_ENV = path.resolve(PROJECT, '../NLBGW/.env');
const PLAN_FILE = path.join(PROJECT, 'temp/wechat-cdn-plan.json');
const CDN_ORIGIN = 'https://game2cdn.chujinggamefun.com';
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function publicTarget(server) {
    const url = new URL(server);
    if (url.origin !== CDN_ORIGIN || url.username || url.password || url.search || url.hash) throw Error('Unexpected CDN server');
    const prefix = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '');
    if (!/^zdhjy\/[a-zA-Z0-9_/-]+$/.test(prefix) || prefix.split('/').some(part => !part || part === '.' || part === '..')) throw Error('CDN uploads must remain in a new zdhjy/ namespace');
    return { server: `${CDN_ORIGIN}/${prefix}/`, prefix };
}

function createPlan(buildRoot, server) {
    buildRoot = path.resolve(buildRoot);
    const target = publicTarget(server);
    if (!fs.existsSync(path.join(buildRoot, 'game.json'))) throw Error('The WeChat build is absent');
    const settingsFiles = listFiles(buildRoot).filter(file => /^src\/settings[^/]*\.json$/.test(file.path));
    if (settingsFiles.length !== 1) throw Error('Expected exactly one generated src/settings*.json');
    const settings = JSON.parse(fs.readFileSync(path.join(buildRoot, settingsFiles[0].path), 'utf8'));
    if (publicTarget(settings.assets?.server || '').server !== target.server) throw Error('Built settings CDN differs from the build configuration');
    const remoteRoot = path.join(buildRoot, 'remote');
    const remoteFiles = listFiles(remoteRoot);
    if (!remoteFiles.length) throw Error('Generated remote/ is empty');
    for (const name of settings.assets?.remoteBundles || []) {
        if (!remoteFiles.some(file => file.path.startsWith(name + '/'))) throw Error(`Remote bundle is absent: ${name}`);
    }
    const files = remoteFiles.map(file => ({ path: `remote/${file.path}`, bytes: file.bytes,
        sha256: sha256(path.join(remoteRoot, file.path)), objectKey: `${target.prefix}/remote/${file.path}` }));
    return { version: 1, createdAt: new Date().toISOString(), buildRoot, ...target,
        settingsPath: settingsFiles[0].path, settingsSha256: sha256(path.join(buildRoot, settingsFiles[0].path)),
        totalBytes: files.reduce((sum, file) => sum + file.bytes, 0), files };
}

function validatePlan(plan) {
    if (plan.version !== 1 || !Array.isArray(plan.files) || !plan.files.length) throw Error('Invalid upload plan');
    const target = publicTarget(plan.server);
    if (target.prefix !== plan.prefix) throw Error('Upload prefix differs from server');
    const current = createPlan(plan.buildRoot, plan.server);
    if (current.settingsSha256 !== plan.settingsSha256 || JSON.stringify(current.files) !== JSON.stringify(plan.files)) {
        throw Error('Build output changed after the upload plan was created; prepare a new plan');
    }
    return plan;
}

function loadCredentials(envFile = DEFAULT_ENV, overrides = process.env) {
    const env = {};
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
        const clean = line.trim();
        if (!clean || clean.startsWith('#')) continue;
        const match = clean.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (match) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
    for (const key of ['OSS_BUCKET', 'OSS_ENDPOINT', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET']) {
        if (overrides[key]) env[key] = overrides[key];
        if (!env[key]) throw Error(`Missing ${key} in credential source`);
    }
    if (env.OSS_BUCKET !== 'yaocheng-2' || env.OSS_ENDPOINT !== 'oss-cn-shenzhen.aliyuncs.com') throw Error('Unexpected OSS destination');
    // Do not return unrelated NLBGW configuration or persist this object.
    return Object.fromEntries(['OSS_BUCKET', 'OSS_ENDPOINT', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET'].map(key => [key, env[key]]));
}

function contentType(file) {
    return ({'.json':'application/json','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg',
        '.jpeg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.m4a':'audio/mp4','.wav':'audio/wav',
        '.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.wasm':'application/wasm'})[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function assertPrefixUnused(plan, credentials, requestImpl = https.request) {
    const target = publicTarget(plan.server), date = new Date().toUTCString();
    // OSS V1 ListObjects: ordinary prefix/max-keys query fields are not signed
    // subresources. The canonical resource for this bucket listing is /bucket/.
    const signature = crypto.createHmac('sha1', credentials.OSS_ACCESS_KEY_SECRET)
        .update(`GET\n\n\n${date}\n/${credentials.OSS_BUCKET}/`).digest('base64');
    return new Promise((resolve, reject) => {
        const request = requestImpl({ method:'GET', hostname:`${credentials.OSS_BUCKET}.${credentials.OSS_ENDPOINT}`,
            path:`/?prefix=${encodeURIComponent(target.prefix + '/')}&max-keys=1`, timeout:30000,
            headers:{ Authorization:`OSS ${credentials.OSS_ACCESS_KEY_ID}:${signature}`, Date:date } }, response => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                if (response.statusCode !== 200) { reject(Error(`Cannot check unused CDN prefix: OSS HTTP ${response.statusCode}`)); return; }
                const xml = Buffer.concat(chunks).toString('utf8');
                if (!/<ListBucketResult[\s>]/.test(xml)) { reject(Error('Unexpected OSS prefix-list response')); return; }
                if (/<Contents[\s>]/.test(xml)) { reject(Error('CDN version prefix already contains objects; select a fresh version before uploading')); return; }
                resolve();
            });
            response.on('error', () => reject(Error('OSS prefix response ended unexpectedly')));
        });
        request.on('error', error => reject(Error(`OSS prefix-check transport failure (${error.code || 'network'})`)));
        request.on('timeout', () => request.destroy(Error('Prefix check timeout')));
        request.end();
    });
}

function putFile(file, plan, credentials) {
    const body = fs.readFileSync(path.join(plan.buildRoot, file.path));
    if (crypto.createHash('sha256').update(body).digest('hex') !== file.sha256) throw Error('Build changed during upload');
    const type = contentType(file.path), md5 = crypto.createHash('md5').update(body).digest('base64');
    const date = new Date().toUTCString();
    const signature = crypto.createHmac('sha1', credentials.OSS_ACCESS_KEY_SECRET)
        .update(`PUT\n${md5}\n${type}\n${date}\n/${credentials.OSS_BUCKET}/${file.objectKey}`).digest('base64');
    return new Promise((resolve, reject) => {
        const request = https.request({ method:'PUT', hostname:`${credentials.OSS_BUCKET}.${credentials.OSS_ENDPOINT}`,
            path:'/' + file.objectKey.split('/').map(encodeURIComponent).join('/'), timeout:60000,
            headers:{ Authorization:`OSS ${credentials.OSS_ACCESS_KEY_ID}:${signature}`, Date:date,
                'Content-Type':type, 'Content-MD5':md5, 'Content-Length':body.length, 'Cache-Control':'public,max-age=31536000,immutable' } }, response => {
            response.resume();
            response.on('end', () => response.statusCode >= 200 && response.statusCode < 300
                ? resolve() : reject(Error(`OSS PUT failed with HTTP ${response.statusCode} for ${file.path}`)));
            response.on('error', () => reject(Error('OSS response ended unexpectedly')));
        });
        // Never print request objects, authorization headers, or response bodies.
        request.on('error', error => reject(Error(`OSS transport failure (${error.code || 'network'})`)));
        request.on('timeout', () => request.destroy(Error('Upload timeout')));
        request.end(body);
    });
}

async function uploadPlan(plan, credentials, { put = putFile, ensureUnused = assertPrefixUnused, onProgress = () => {} } = {}) {
    validatePlan(plan);
    await ensureUnused(plan, credentials);
    let cursor = 0, completed = 0, stopped = false;
    const worker = async () => {
        while (!stopped) {
            const index = cursor++;
            if (index >= plan.files.length) return;
            try { await put(plan.files[index], plan, credentials); }
            catch (error) { stopped = true; throw error; }
            onProgress(++completed, plan.files.length);
        }
    };
    await Promise.all(Array.from({ length: Math.min(6, plan.files.length) }, worker));
    return { files: completed, bytes: plan.totalBytes, server: plan.server };
}

async function main(argv = process.argv.slice(2)) {
    const mode = argv[0] || '--plan';
    if (mode === '--help') {
        console.log('node tools/upload-wechat-cdn.cjs --plan [config.json]\nnode tools/upload-wechat-cdn.cjs --upload [plan.json]\n--plan only hashes final remote/ output. --upload sends exactly that unchanged plan.\nCredentials are read at upload time from ../NLBGW/.env or ZDHJY_CDN_ENV_FILE; never copied into this project.');
        return;
    }
    if (mode === '--plan') {
        const config = readConfig(argv[1]), plan = createPlan(outputDirectory(config), config.server);
        fs.mkdirSync(path.dirname(PLAN_FILE), { recursive: true });
        fs.writeFileSync(PLAN_FILE, JSON.stringify(plan, null, 2) + '\n');
        console.log(JSON.stringify({ planFile: PLAN_FILE, files:plan.files.length, bytes:plan.totalBytes, server:plan.server, uploaded:false }, null, 2));
        return;
    }
    if (mode !== '--upload') throw Error('Unknown mode; use --help');
    const plan = JSON.parse(fs.readFileSync(argv[1] || PLAN_FILE, 'utf8'));
    validatePlan(plan);
    const credentials = loadCredentials(process.env.ZDHJY_CDN_ENV_FILE || DEFAULT_ENV);
    const result = await uploadPlan(plan, credentials, { onProgress:(done,total) => {
        if (done === 1 || done % 50 === 0 || done === total) console.log(`[cdn] ${done}/${total}`);
    } });
    console.log(JSON.stringify(result, null, 2));
}

module.exports = { publicTarget, createPlan, validatePlan, loadCredentials, contentType, uploadPlan, assertPrefixUnused };
if (require.main === module) main().catch(error => { console.error(`[cdn] ${error.message}`); process.exitCode = 1; });
