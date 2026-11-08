const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {EventEmitter} = require('node:events');
const ts = require('/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript');
const production = require('./creator-production.cjs');
const source = production(ts.transpileModule(fs.readFileSync(__dirname + '/../assets/scripts/FlowerViewport.ts', 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS},
}).outputText);
function harness(w = 750, h = 1334, dpr = 1) {
  const view = new EventEmitter(), screen = new EventEmitter(), calls = [];
  const state = {w, h, scale: 1, safe: {x: 0, y: 0, width: w, height: h}};
  screen.windowSize = {width: w*dpr, height: h*dpr};
  Object.assign(view, {getVisibleSize: () => ({width: state.w, height: state.h}), getScaleY: () => state.scale,
    getViewportRect: () => ({x: 0, y: 0}), setDesignResolutionSize(width, height, policy) {
      const p = screen.windowSize; state.scale = policy === 1 ? p.width/width : p.height/height;
      state.w = p.width/state.scale; state.h = p.height/state.scale; calls.push(policy);
      state.safe = {x: 0, y: 0, width: state.w, height: state.h}; view.emit('design-resolution-changed');
    }});
  class Node extends EventEmitter {static EventType = {NODE_DESTROYED: 'destroyed'}; isValid = true;}
  class UITransform {}
  const sys = {platform: 'web', Platform: {WECHAT_GAME: 'wechat'}, getSafeAreaRect(symmetric) {
    assert.equal(symmetric, false); return state.safe;
  }};
  const scope = {exports: {}, require(name) {assert.equal(name,'cc'); return {view, screen, sys, Node, UITransform, ResolutionPolicy: {FIXED_WIDTH: 1, FIXED_HEIGHT: 2}};}};
  vm.runInNewContext(source, scope);
  return {...scope.exports, scope, view, screen, sys, state, calls, Node, UITransform};
}
test('viewport fills tall phones and portrait tablets without SHOW_ALL borders', () => {
  for (const [w,h,expected] of [[750,1334,1],[390,844,1],[360,800,1],[768,1024,2]]) {
    const api=harness(w,h,3); api.configureFlowerViewport(new api.Node());
    assert.equal(api.calls[0],expected); assert(api.state.w>=750-1e-6); assert(api.state.h>=1334-1e-6);
    assert(Math.abs(api.state.w/api.state.h-w/h)<1e-6);
    const art={size:null,position:null,getComponent(){return {setContentSize:(x,y)=>this.size={width:x,height:y}};},setPosition(...args){this.position=args;}};
    const v=api.getFlowerViewport(); api.coverFlowerArt(art,v);
    assert(art.size.width>=v.width-1e-6 && art.size.height>=v.height-1e-6);
    assert(Math.abs(art.size.width/art.size.height-750/1334)<1e-6);
  }
});
test('notch and capsule use design units once, with distinct bottom gesture inset', () => {
  const api=harness(390,844,3); api.configureFlowerViewport(new api.Node());
  const factor=750/390;
  api.sys.platform='wechat'; api.state.safe={x:0,y:34*factor,width:750,height:(844-44-34)*factor};
  api.scope.wx={getWindowInfo:()=>({windowWidth:390}),getMenuButtonBoundingClientRect:()=>({bottom:76,width:87,height:32})};
  const v=api.getFlowerViewport();
  assert(Math.abs(v.safeBottom-(-v.height/2+34*factor))<1e-6);
  assert(Math.abs(v.safeTop-(v.height/2-76*factor-8))<1e-6);
  assert(611+v.topShift<=v.safeTop); // pause hit area: center 585 + half-height 26
  assert(Math.abs(-667+v.bottomShift-v.safeBottom)<1e-6); // navigation lower edge
  api.scope.wx = {}; // Keep controls safe even if the capsule API is unavailable.
  const withoutCapsule=api.getFlowerViewport();
  assert(611+withoutCapsule.topShift<=withoutCapsule.safeTop);
});
test('baseline art positions remain unchanged without device insets', () => {
  const v=harness().getFlowerViewport(); assert.equal(v.topShift,0); assert.equal(v.bottomShift,0); assert.equal(v.centerY,0);
});
test('resize bindings are idempotent, switch aspect policies, and detach on destruction', () => {
  const api=harness(), owner=new api.Node(), values=[];
  api.configureFlowerViewport(owner); api.bindFlowerViewport(owner,v=>values.push(v.height));
  api.screen.windowSize={width:375,height:812}; api.screen.emit('window-resize');
  api.view.setDesignResolutionSize(750,1334,1); api.view.emit('canvas-resize');
  assert.equal(values.at(-1),1624); assert.equal(api.calls.filter(p=>p===2).length,0);
  api.screen.windowSize={width:768,height:1024}; api.screen.emit('window-resize');
  assert.equal(api.calls.at(-1),2); assert.equal(values.at(-1),1334);
  owner.isValid=false; owner.emit('destroyed');
  assert.equal(api.screen.listenerCount('window-resize'),0);
  assert.equal(api.view.listenerCount('canvas-resize'),0); assert.equal(api.view.listenerCount('design-resolution-changed'),0);
});
