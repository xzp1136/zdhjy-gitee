#!/usr/bin/env node
'use strict';
// Read-only: checks migrated asset content, paths, and UUIDs against the tracked manifest.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const project = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(project, 'docs/reference/bundle-migration-plan.json'), 'utf8'));
const routes = JSON.parse(fs.readFileSync(path.join(project, 'assets/resources/bundle-routes.json'), 'utf8'));
const issues = [];
const buckets = {};
const assetPath = url => path.join(project, url.replace(/^db:\/\//, ''));
function assetContents(file) {
    const bytes = fs.readFileSync(file);
    if (!/\.(json|atlas|effect)$/.test(file)) return bytes;
    return Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
}
const sourceKey = url => url.replace(/^db:\/\/assets\/resources\//, '').replace(/\.[^.]+$/, '');
const additionalBundle = 'greenhouse-board';

for (const move of plan.moves) {
    const target = assetPath(move.target);
    if (fs.existsSync(assetPath(move.source))) issues.push(`Source still exists: ${move.source}`);
    if (!fs.existsSync(target)) { issues.push(`Target missing: ${move.target}`); continue; }
    const contents = assetContents(target);
    if (contents.length !== move.bytes || crypto.createHash('sha256').update(contents).digest('hex') !== move.sha256) {
        issues.push(`Bytes changed: ${move.target}`);
    }
    if (!fs.existsSync(target + '.meta')) issues.push(`Metadata missing: ${move.target}`);
    else if (JSON.parse(fs.readFileSync(target + '.meta', 'utf8')).uuid !== move.uuid) issues.push(`UUID changed: ${move.target}`);
    if (move.bundle) {
        if (routes.routes[sourceKey(move.source)] !== move.bundle) issues.push(`Route mismatch: ${move.source}`);
        const bucket = buckets[move.bundle] ||= { bytes: 0, files: 0, remote: routes.bundles[move.bundle]?.remote };
        bucket.bytes += contents.length;
        bucket.files++;
    }
}

for (const [name, expected] of Object.entries(plan.bundles)) {
    const actual = buckets[name];
    if (!actual || actual.bytes !== expected.sourceBytes || actual.files !== expected.fileCount) issues.push(`Bundle totals mismatch: ${name}`);
    const metaFile = path.join(project, 'assets/bundles', name + '.meta');
    if (!fs.existsSync(metaFile)) { issues.push(`Bundle metadata missing: ${name}`); continue; }
    const data = JSON.parse(fs.readFileSync(metaFile, 'utf8')).userData;
    const preset = expected.remote ? 'zdhjy-remote' : 'zdhjy-local';
    if (!data?.isBundle || data.bundleName !== name || data.bundleConfigID !== preset) issues.push(`Bundle settings mismatch: ${name}`);
}

const plannedRoutes = new Set(plan.moves.filter(move => move.bundle).map(move => sourceKey(move.source)));
const audioBundle = 'core-audio';
for (const name of ['compose-charge', 'compose-flick', 'compose-catch', 'compose-land']) {
    const resource = `original/audio/${name}`;
    const file = path.join(project, 'assets/bundles', audioBundle, `${resource}.m4a`);
    plannedRoutes.add(resource);
    if (routes.routes[resource] !== audioBundle || !fs.existsSync(file) || !fs.existsSync(file + '.meta')) {
        issues.push(`Missing or unrouted compose audio: ${resource}`);
        continue;
    }
    buckets[audioBundle].bytes += fs.statSync(file).size;
    buckets[audioBundle].files++;
}
if (routes.bundles[audioBundle].sourceBytes !== buckets[audioBundle].bytes ||
    routes.bundles[audioBundle].fileCount !== buckets[audioBundle].files) {
    issues.push(`Bundle totals mismatch: ${audioBundle} including compose audio`);
}
const petalEffect = 'original/effects/bouquet-petals', effectsBundle = 'core-effects';
const effectFile = path.join(project, 'assets/bundles', effectsBundle, petalEffect + '.effect');
if (routes.routes[petalEffect] !== effectsBundle || !fs.existsSync(effectFile) || !fs.existsSync(effectFile + '.meta')) {
    issues.push(`Missing or unrouted bouquet effect: ${petalEffect}`);
} else {
    const bucket = buckets[effectsBundle];
    bucket.bytes += assetContents(effectFile).length;
    bucket.files++;
    if (routes.bundles[effectsBundle].sourceBytes !== bucket.bytes || routes.bundles[effectsBundle].fileCount !== bucket.files) {
        issues.push(`Bundle totals mismatch: ${effectsBundle} including bouquet effect`);
    }
    plannedRoutes.add(petalEffect);
}
for (const [resource, bundle] of Object.entries(routes.routes)) {
    if (bundle === additionalBundle && resource.startsWith('greenhouse/')) {
        const dir = path.join(project, 'assets/bundles', bundle);
        const files = ['.png', '.jpg', '.ttf'].map(extension => path.join(dir, resource + extension)).filter(fs.existsSync);
        if (files.length !== 1 || !fs.existsSync(files[0] + '.meta')) {
            issues.push(`Missing or ambiguous greenhouse asset: ${resource}`);
            continue;
        }
        const bucket = buckets[bundle] ||= {bytes: 0, files: 0, remote: false};
        bucket.bytes += fs.statSync(files[0]).size;
        bucket.files++;
        continue;
    }
    if (!plannedRoutes.has(resource)) issues.push(`Unexpected route: ${resource}`);
    if (!plan.bundles[bundle]) issues.push(`Unknown bundle: ${bundle}`);
}
const greenhouse = buckets[additionalBundle], greenhouseRoute = routes.bundles[additionalBundle];
const greenhouseMeta = JSON.parse(fs.readFileSync(path.join(project, 'assets/bundles', additionalBundle + '.meta'), 'utf8')).userData;
if (!greenhouse || !greenhouseRoute || greenhouseRoute.remote || greenhouseRoute.sourceBytes !== greenhouse.bytes ||
    greenhouseRoute.fileCount !== greenhouse.files || !greenhouseMeta.isBundle ||
    greenhouseMeta.bundleName !== additionalBundle || greenhouseMeta.bundleConfigID !== 'zdhjy-local') {
    issues.push(`Bundle totals or settings mismatch: ${additionalBundle}`);
}
let loadingBytes = 0;
for (const file of plan.keptResources) {
    const target = path.join(project, file);
    if (!fs.existsSync(target)) issues.push(`Startup asset missing: ${file}`);
    else loadingBytes += fs.statSync(target).size;
}
const runtimeConfigBytes = fs.statSync(path.join(project, 'assets/resources/bundle-routes.json')).size;
const localBytes = Object.values(buckets).filter(bucket => !bucket.remote).reduce((sum, bucket) => sum + bucket.bytes, 0);
const remoteBytes = Object.values(buckets).filter(bucket => bucket.remote).reduce((sum, bucket) => sum + bucket.bytes, 0);
console.log(JSON.stringify({
    passed: issues.length === 0, measuredAt: new Date().toISOString(),
    measurement: 'Source file bytes excluding .meta, with LF line endings for JSON, shaders and Spine atlases.',
    movedFiles: plan.moves.length, routes: Object.keys(routes.routes).length, bundles: buckets,
    localBundleBytes: localBytes, remoteBundleBytes: remoteBytes,
    startupImageBytes: loadingBytes, routeManifestBytes: runtimeConfigBytes,
    runtimeLocalSourceBytes: localBytes + loadingBytes + runtimeConfigBytes,
    issues,
}, null, 2));
if (issues.length) process.exitCode = 1;
