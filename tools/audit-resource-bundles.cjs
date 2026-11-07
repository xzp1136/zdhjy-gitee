#!/usr/bin/env node
'use strict';
// Read-only: checks the asset-db migration against its pre-move byte/UUID snapshot.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const project = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(project, 'docs/reference/bundle-migration-plan.json'), 'utf8'));
const routes = JSON.parse(fs.readFileSync(path.join(project, 'assets/resources/bundle-routes.json'), 'utf8'));
const issues = [];
const buckets = {};
const assetPath = url => path.join(project, url.replace(/^db:\/\//, ''));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceKey = url => url.replace(/^db:\/\/assets\/resources\//, '').replace(/\.[^.]+$/, '');

for (const move of plan.moves) {
    const target = assetPath(move.target);
    if (fs.existsSync(assetPath(move.source))) issues.push(`Source still exists: ${move.source}`);
    if (!fs.existsSync(target)) { issues.push(`Target missing: ${move.target}`); continue; }
    if (fs.statSync(target).size !== move.bytes || digest(target) !== move.sha256) issues.push(`Bytes changed: ${move.target}`);
    if (!fs.existsSync(target + '.meta')) issues.push(`Metadata missing: ${move.target}`);
    else if (JSON.parse(fs.readFileSync(target + '.meta', 'utf8')).uuid !== move.uuid) issues.push(`UUID changed: ${move.target}`);
    if (move.bundle) {
        if (routes.routes[sourceKey(move.source)] !== move.bundle) issues.push(`Route mismatch: ${move.source}`);
        const bucket = buckets[move.bundle] ||= { bytes: 0, files: 0, remote: routes.bundles[move.bundle]?.remote };
        bucket.bytes += fs.statSync(target).size;
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
for (const [resource, bundle] of Object.entries(routes.routes)) {
    if (!plannedRoutes.has(resource)) issues.push(`Unexpected route: ${resource}`);
    if (!plan.bundles[bundle]) issues.push(`Unknown bundle: ${bundle}`);
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
    measurement: 'Source file bytes, excluding .meta. Not generated WeChat package bytes or network transfer size.',
    movedFiles: plan.moves.length, routes: Object.keys(routes.routes).length, bundles: buckets,
    localBundleBytes: localBytes, remoteBundleBytes: remoteBytes,
    startupImageBytes: loadingBytes, routeManifestBytes: runtimeConfigBytes,
    runtimeLocalSourceBytes: localBytes + loadingBytes + runtimeConfigBytes,
    issues,
}, null, 2));
if (issues.length) process.exitCode = 1;
