const fs = require('node:fs');
const path = require('node:path');
const project = path.join(__dirname, '..');

/** Resolve test fixtures through the same published bundle map, retaining extensions. */
module.exports = function resourceFile(resource) {
  const local = path.join(project, 'assets/resources', resource);
  if (fs.existsSync(local) || ['.json', '.png', '.atlas', '.m4a', '.ttf'].some(extension => fs.existsSync(local + extension))) return local;
  const manifest = JSON.parse(fs.readFileSync(path.join(project, 'assets/resources/bundle-routes.json'), 'utf8'));
  const key = resource.replace(/\.(png|json|atlas|m4a|ttf|mp3|wav)(\.meta)?$/, '');
  const bundle = manifest.routes[key];
  if (!bundle) throw new Error('No fixture resource route: ' + resource);
  return path.join(project, 'assets/bundles', bundle, resource);
};
