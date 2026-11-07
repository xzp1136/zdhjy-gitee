#!/usr/bin/env node
'use strict';
// Uses the running Creator 3.8.7 editor. This does not launch another instance.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { call } = require('./cocos_mcp.cjs');

const PROJECT = path.resolve(__dirname, '..');
const MIB = 1024 * 1024;
const MAIN_LIMIT = 4 * MIB;
const TOTAL_LIMIT = 30 * MIB;

function readConfig(file = path.join(PROJECT, 'build-configs/wechatgame.json')) {
    const config = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (config.platform !== 'wechatgame') throw Error('Expected platform=wechatgame');
    if (config.packages?.wechatgame?.appid !== 'wx3ef66f850d873a67') throw Error('Unexpected WeChat appid');
    if (!config.startScene || !config.scenes?.some(scene => scene.uuid === config.startScene)) throw Error('Starting scene is not in the build scene list');
    return config;
}

function outputDirectory(config, project = PROJECT) {
    const base = config.buildPath?.startsWith('project://')
        ? path.resolve(project, config.buildPath.slice('project://'.length))
        : path.resolve(project, config.buildPath || 'build');
    return path.resolve(base, config.outputName || 'wechatgame');
}

function listFiles(root, current = root) {
    const files = [];
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const absolute = path.join(current, entry.name);
        if (entry.isSymbolicLink()) throw Error(`Build contains a symlink: ${path.relative(root, absolute)}`);
        if (entry.isDirectory()) files.push(...listFiles(root, absolute));
        else if (entry.isFile()) files.push({ path: path.relative(root, absolute).split(path.sep).join('/'), bytes: fs.statSync(absolute).size });
    }
    return files;
}

function normalizeRoot(value) {
    const root = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
    if (!root || root.startsWith('/') || root.split('/').some(part => !part || part === '.' || part === '..')) throw Error('Invalid subpackage root');
    return root;
}

function auditPackage(buildRoot) {
    buildRoot = path.resolve(buildRoot);
    const projectConfig = JSON.parse(fs.readFileSync(path.join(buildRoot, 'project.config.json'), 'utf8'));
    if (path.resolve(buildRoot, projectConfig.miniprogramRoot || './') !== buildRoot) throw Error('Package audit requires miniprogramRoot to be the generated build root');
    const ignoresRemote = Array.isArray(projectConfig.packOptions?.ignore) && projectConfig.packOptions.ignore.some(rule =>
        rule?.type === 'folder' && typeof rule.value === 'string' && rule.value.replace(/^\.\//, '').replace(/\/+$/, '') === 'remote');
    if (!ignoresRemote) throw Error('project.config.json must exclude remote with packOptions.ignore: [{type:"folder",value:"remote"}] before package sizes are valid');
    if (projectConfig.packOptions.include?.length) throw Error('packOptions.include must be empty so it cannot reinclude CDN files');
    if (projectConfig.setting?.urlCheck !== true) throw Error('WeChat release configuration must retain setting.urlCheck=true');
    const game = JSON.parse(fs.readFileSync(path.join(buildRoot, 'game.json'), 'utf8'));
    const roots = (game.subpackages || game.subPackages || []).map(item => ({ name: item.name || item.root, root: normalizeRoot(item.root), bytes: 0, files: 0 }));
    roots.sort((a, b) => b.root.length - a.root.length);
    const files = listFiles(buildRoot);
    let mainBytes = 0, remoteBytes = 0, localFiles = 0;
    for (const file of files) {
        if (file.path === 'remote' || file.path.startsWith('remote/')) { remoteBytes += file.bytes; continue; }
        localFiles++;
        const group = roots.find(item => file.path.startsWith(item.root + '/'));
        if (group) { group.bytes += file.bytes; group.files++; }
        else mainBytes += file.bytes;
    }
    for (const group of roots) if (!group.files) throw Error(`Declared subpackage is empty or absent: ${group.root}`);
    const totalBytes = mainBytes + roots.reduce((sum, item) => sum + item.bytes, 0);
    return {
        buildRoot, measuredAt: new Date().toISOString(), remoteExcludedByProjectConfig: true,
        measurement: 'Uncompressed emitted file bytes; remote/ excluded by verified project.config.json folder-ignore. Conservative: local project configuration and any generated maps are included.',
        mainBytes, totalBytes, remoteBytes, localFiles, subpackages: roots,
        limits: { mainBytes: MAIN_LIMIT, totalBytes: TOTAL_LIMIT },
        passed: mainBytes <= MAIN_LIMIT && totalBytes <= TOTAL_LIMIT,
        largestLocalFiles: files.filter(file => !file.path.startsWith('remote/')).sort((a, b) => b.bytes - a.bytes).slice(0, 12),
    };
}

function unwrapEditorResult(value) {
    if (value?.ok === false) throw Error(value.message || 'Editor execution failed');
    return value?.ok === true && Object.prototype.hasOwnProperty.call(value, 'result') ? value.result : value;
}

async function editor(script, args = {}) {
    const result = await call('execute_javascript', { context: 'editor',
        code: `async function run({Editor,args}) { if(Editor.Project.path!==args.project)throw Error('The running Creator has another project open'); ${script} }`,
        args: { ...args, project: PROJECT } });
    return unwrapEditorResult(result);
}

async function inspectBuild(config) {
    return editor(`const tasks=await Editor.Message.request('builder','query-tasks-info');
        const options=await Editor.Message.request('builder','check-and-complete-options',args.config);
        if(!options)throw Error('Creator rejected the build configuration');
        const engine=await Editor.Message.request('engine','query-engine-modules-profile',options.engineModulesConfigKey);
        return {free:tasks.free,options,engineModules:engine?.includeModules};`, { config });
}

async function enqueueBuild(config) {
    const taskId = `zdhjy-wechat-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const result = await editor(`const tasks=await Editor.Message.request('builder','query-tasks-info');
        if(!tasks.free)throw Error('Creator is already building; no second task was queued');
        return await Editor.Message.request('builder','add-task',args.config,false);`, { config: { ...config, taskId } });
    if (result !== 1) throw Error(`Creator did not enqueue the build (TaskAddResult=${result})`);
    return taskId;
}

async function queryTask(taskId) {
    return editor(`const task=await Editor.Message.request('builder','query-task',args.taskId);
        if(!task)throw Error('Build task was not found');
        return {id:task.id,state:task.state,stage:task.stage,progress:task.progress,message:task.message,detailMessage:task.detailMessage};`, { taskId });
}

async function main(argv = process.argv.slice(2)) {
    const mode = argv[0] || '--check';
    if (mode === '--help') {
        console.log('node tools/build-wechat.cjs --check [config.json]\nnode tools/build-wechat.cjs --build [config.json]\nnode tools/build-wechat.cjs --status <taskId>\nnode tools/build-wechat.cjs --audit [build/wechatgame]\n--build queues and monitors the running Creator; all other modes are read-only.');
        return;
    }
    if (mode === '--status') { if (!argv[1]) throw Error('Task id is required'); console.log(JSON.stringify(await queryTask(argv[1]), null, 2)); return; }
    if (mode === '--audit') {
        const report = auditPackage(argv[1] || path.join(PROJECT, 'build/wechatgame'));
        console.log(JSON.stringify(report, null, 2));
        if (!report.passed) process.exitCode = 2;
        return;
    }
    if (!['--check', '--build'].includes(mode)) throw Error('Unknown mode; use --help');
    const config = readConfig(argv[1]);
    const check = await inspectBuild(config);
    console.log(JSON.stringify({ editorFree: check.free, output: outputDirectory(check.options), appid: check.options.packages.wechatgame.appid,
        server: check.options.server || '', wasmSubpackage: check.options.packages.wechatgame.wasmSubpackage, engineModules: check.engineModules }, null, 2));
    if (mode === '--check') return;
    const taskId = await enqueueBuild(check.options);
    console.log(`[build] queued ${taskId}`);
    let previous = '';
    const deadline = Date.now() + 45 * 60 * 1000;
    while (Date.now() < deadline) {
        const task = await queryTask(taskId), line = JSON.stringify(task);
        if (line !== previous) { console.log(line); previous = line; }
        if (task.state === 'success') {
            const report = auditPackage(outputDirectory(check.options));
            const reportPath = path.join(PROJECT, 'temp', 'wechat-package-audit.json');
            fs.mkdirSync(path.dirname(reportPath), { recursive: true });
            fs.writeFileSync(reportPath, JSON.stringify({ taskId, ...report }, null, 2) + '\n');
            console.log(JSON.stringify(report, null, 2));
            if (!report.passed) process.exitCode = 2;
            return;
        }
        if (['failure', 'cancel'].includes(task.state)) throw Error(`Creator build ${task.state}: ${task.detailMessage || task.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    throw Error(`Build monitoring timed out; task ${taskId} may still be running. Query --status before another build.`);
}

module.exports = { readConfig, outputDirectory, listFiles, auditPackage, inspectBuild, enqueueBuild, queryTask, unwrapEditorResult };
if (require.main === module) main().catch(error => { console.error(`[build] ${error.message}`); process.exitCode = 1; });
