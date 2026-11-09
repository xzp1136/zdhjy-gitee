const path = require('node:path');
const roots = [process.env.COCOS_TYPESCRIPT,
  'C:/ProgramData/cocos/editors/Creator/3.8.7/resources/app.asar.unpacked/node_modules/typescript',
  '/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript'];
for (const root of roots.filter(Boolean)) {
  if (require('node:fs').existsSync(path.join(root, 'package.json'))) {
    module.exports = require(root);
    return;
  }
}
throw new Error('Set COCOS_TYPESCRIPT to the TypeScript package supplied with Creator.');
