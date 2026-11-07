// Reproduce the iterable-sensitive transforms observed in Creator 3.8.7's
// published WeChat bundle. This is not a replacement for the full editor build.
const root = '/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/';
const babel = require(root + '@babel/core');
const spread = require(root + '@babel/plugin-transform-spread');
const forOf = require(root + '@babel/plugin-transform-for-of');
const classes = require(root + '@babel/plugin-transform-classes');
module.exports = function creatorProduction(code) {
  return babel.transformSync(code, {configFile: false, babelrc: false,
    plugins: [classes, [spread, {loose: true}], [forOf, {loose: true}]], filename: 'FlowerGame.js'}).code;
};
