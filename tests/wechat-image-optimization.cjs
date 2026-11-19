'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { optimizePackage, verifyCacheReferences } = require('../tools/optimize-wechat-package.cjs');
const hash = bytes => crypto.createHash('md5').update(bytes).digest('hex').slice(0, 5);
let sharp;
try { sharp = require(process.env.ZDHJY_SHARP_MODULE || 'sharp'); } catch {}

function fixture(t, image = Buffer.from('small-image')) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdhjy-optimize-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const source = path.join(root, 'source'), output = path.join(root, 'optimized');
    const write = (name, body) => {
        const file = path.join(source, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, typeof body === 'object' && !Buffer.isBuffer(body) ? JSON.stringify(body) : body);
        return file;
    };
    write('project.config.json', { setting: { urlCheck: true }, packOptions: { ignore: [{ type: 'folder', value: 'remote' }] } });
    write('game.json', { subpackages: [{ name: 'core', root: 'subpackages/core' }] });
    const uuid = '12345678-1234-1234-1234-123456789abc', version = hash(image);
    const bundleVers = {};
    for (const [name, dir] of [['start-scene', 'assets/start-scene'], ['flowers', 'remote/flowers']]) {
        const config = { name, uuids: [uuid], versions: { native: [0, version] }, hasPreloadScript: true };
        const bundleVersion = hash(JSON.stringify(config));
        bundleVers[name] = bundleVersion;
        write(`${dir}/config.${bundleVersion}.json`, config);
        write(`${dir}/native/12/${uuid}.${version}.png`, image);
        write(name === 'flowers' ? `src/bundle-scripts/flowers/index.${bundleVersion}.js` : `${dir}/index.${bundleVersion}.js`, 'preload();');
    }
    const fontConfig = { name: 'core', uuids: [uuid], versions: { native: [0, '123ab'] }, hasPreloadScript: true };
    bundleVers.core = hash(JSON.stringify(fontConfig));
    write(`subpackages/core/config.${bundleVers.core}.json`, fontConfig);
    write(`subpackages/core/native/12/${uuid}.123ab/font.ttf`, 'font-bytes');
    write('subpackages/core/game.js', 'fontPreload();');
    const settings = JSON.stringify({ assets: { bundleVers, server: 'https://game2cdn.chujinggamefun.com/zdhjy/wechat/test/' } });
    const settingsName = `settings.${hash(settings)}.json`;
    write(`src/${settingsName}`, settings);
    const application = `load('src/${settingsName}');`, applicationName = `application.${hash(application)}.js`;
    write(applicationName, application);
    const map = `map('${applicationName}');`, mapName = `import-map.${hash(map)}.js`;
    write(`src/${mapName}`, map);
    write('game.js', `require('src/${mapName}');`);
    return { source, output, uuid, version, bundleVers };
}

test('optimization keeps a separate source and follows the settings/application/import-map cache chain', async t => {
    const { source, output } = fixture(t);
    const gameBefore = fs.readFileSync(path.join(source, 'game.js'));
    const report = await optimizePackage(source, output, {
        sharp: { concurrency() {} }, server: 'https://game2cdn.chujinggamefun.com/zdhjy/wechat/test-optimized/',
    });
    assert.equal(report.imagesChanged, 0);
    assert.equal(report.after.passed, true);
    assert.deepEqual(verifyCacheReferences(output), { bundles: 3, nativeEntries: 3 });
    assert.deepEqual(fs.readFileSync(path.join(source, 'game.js')), gameBefore);
    assert.notDeepEqual(fs.readFileSync(path.join(output, 'game.js')), gameBefore);
    await assert.rejects(optimizePackage(source, source), /separate sibling/);
    await assert.rejects(optimizePackage(source, path.join(source, 'nested')), /separate sibling/);
    await assert.rejects(optimizePackage(source, output), /already exists/);
    fs.unlinkSync(path.join(output, 'subpackages/core/game.js'));
    assert.throws(() => verifyCacheReferences(output), /preload script is missing/);
});

test('compressed PNGs retain geometry/alpha and remain loadable from local and remote versioned bundles', { skip: !sharp && 'Install sharp or set ZDHJY_SHARP_MODULE to run image QA' }, async t => {
    const width = 128, height = 128, rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < rgba.length; i += 4) {
        rgba[i] = (i / 4) % 128; rgba[i + 1] = 96; rgba[i + 2] = 200; rgba[i + 3] = (i / 4) % 256;
    }
    const image = await sharp(rgba, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 0 }).toBuffer();
    const { source, output, uuid, version, bundleVers } = fixture(t, image);
    const report = await optimizePackage(source, output, { sharp });
    assert.equal(report.imagesChanged, 2);
    assert.deepEqual(verifyCacheReferences(output), { bundles: 3, nativeEntries: 3 });
    for (const change of report.changes) {
        assert.ok(change.after < change.before);
        assert.equal(change.alphaExact, true);
        assert.equal(change.width, width); assert.equal(change.height, height);
        const file = path.join(output, change.output), decoded = await sharp(file).ensureAlpha().raw().toBuffer();
        for (let i = 3; i < rgba.length; i += 4) assert.equal(decoded[i], rgba[i]);
        assert.equal(hash(fs.readFileSync(file)), change.newVersion);
        assert.deepEqual(fs.readFileSync(path.join(source, change.path)), image);
        assert.equal(fs.existsSync(path.join(output, change.path)), false);
    }
    const settingsFile = fs.readdirSync(path.join(output, 'src')).find(f => /^settings\./.test(f));
    const settings = JSON.parse(fs.readFileSync(path.join(output, 'src', settingsFile)));
    for (const [name, dir] of [['start-scene', 'assets/start-scene'], ['flowers', 'remote/flowers']]) {
        const next = settings.assets.bundleVers[name];
        assert.notEqual(next, bundleVers[name]);
        const config = JSON.parse(fs.readFileSync(path.join(output, dir, `config.${next}.json`)));
        assert.notEqual(config.versions.native[1], version);
        const scriptDir = name === 'flowers' ? 'src/bundle-scripts/flowers' : dir;
        assert.ok(fs.existsSync(path.join(output, scriptDir, `index.${next}.js`)));
        assert.equal(fs.existsSync(path.join(output, scriptDir, `index.${bundleVers[name]}.js`)), false);
        assert.ok(config.uuids.includes(uuid));
    }
});
