// Baseline layout for tests focused on loading/motion; responsive geometry is
// exercised by flower-viewport.cjs and the real Creator browser preview.
const viewport = {width: 750, height: 1334, safeLeft: -375, safeRight: 375,
  safeTop: 667, safeBottom: -667, topShift: 0, bottomShift: 0, centerY: 0};
module.exports = {getFlowerViewport: () => viewport, configureFlowerViewport() {},
  bindFlowerViewport(_owner, callback) { callback(viewport); return () => {}; }, coverFlowerArt() {}};
