// Reproduce the iterable-sensitive transforms observed in Creator 3.8.7's
// published WeChat bundle. This is not a replacement for the full editor build.
const fs = require('node:fs');
const path = require('node:path');
const roots = [
  process.env.COCOS_CREATOR_ENGINE_NODE_MODULES,
  'C:/ProgramData/cocos/editors/Creator/3.8.7/resources/resources/3d/engine/node_modules',
  '/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules',
].filter(Boolean);
const root = roots.find(candidate => fs.existsSync(path.join(candidate, '@babel/core')));
if (!root) throw new Error('Creator 3.8.7 engine node_modules not found; set COCOS_CREATOR_ENGINE_NODE_MODULES.');
const babel = require(path.join(root, '@babel/core'));
const spread = require(path.join(root, '@babel/plugin-transform-spread'));
const forOf = require(path.join(root, '@babel/plugin-transform-for-of'));
const classes = require(path.join(root, '@babel/plugin-transform-classes'));
module.exports = function creatorProduction(code) {
  return babel.transformSync(code, {configFile: false, babelrc: false,
    plugins: [classes, [spread, {loose: true}], [forOf, {loose: true}]], filename: 'FlowerGame.js'}).code;
};
