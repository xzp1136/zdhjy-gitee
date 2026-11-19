# Preview runtime jitter follow-up — 2026-11-12

## Confirmed causes and changes

Actual Creator 3.8.7 preview exposed two integration mistakes that the earlier adapter did not represent:

- `RigidBody2D.isAwake()` is a method. Testing the function reference as a boolean always succeeds and lets periodic water impulses wake native sleeping bodies. Both linear and angular impulse paths now call the method.
- Box2D writes `node.setWorldRotationFromEuler()`. Creator's `Node.angle` getter directly returns the cached `_euler.z`, whereas `node.eulerAngles` refreshes it. Rest detection, the previous fixed-step pose and render interpolation now read `eulerAngles.z` so visual rotation follows collision rotation.

Verified against the installed engine's `rigid-body-2d.ts`, `node.ts` and `box2d/physics-world.ts`. No species sizes, original collider data, pool bounds, density, mass or spawn count were changed in this follow-up. No editor or project was launched, and WeChat was not accessed.

## Regression coverage

The native Box2D adapter now matches Creator's method signature and stale Euler cache after world rotation writes. Two regressions fail against `/tmp/zdhjy-physics-before-runtime-jitter.ts` and pass against the corrected source:

1. A native sleeping body must remain asleep across periodic water updates.
2. A fractional fixed-step render must interpolate the refreshed collision-body angle rather than its stale Euler cache.

The existing crowded sunflower, release-after-removal, layer masks, fixture/mass and frame-rate tests continue to pass. Full run: 212 tests, 211 passed, one existing production-artifact skip, zero failures. TypeScript no-emit passed.

## Browser verification

Used the already-running normal Creator preview at `http://127.0.0.1:7456/?previewLevel=2`, using its iPhone 14 Pro 393×852 profile. Reloaded the current preview; did not reopen Creator. Existing generated module was temporarily compiled from the same source using the installed TypeScript compiler because the editor's external-file scan requires focus. The temporary diagnostic logging was restricted to that generated module, then removed.

- Actual clicks completed the initial three blue orders, reaching 21%, and then continued with purple flowers into the second half of the level (67%), where sunflowers, lotus and other large shapes were present. Input, promotion and contact movement remained functional.
- At 7%, after contacts settled, eight source-side diagnostic samples over 21.022 seconds showed all 24 active surface bodies retained exactly the same physics positions and angles. All were marked resting. See `validation-images/runtime-jitter-2026-11-12/settled-trace.json`. This is a measurement of that observed layout, not a claim that all random layouts or devices are jitter-free.
- At 67%, continued checking the crowded large-flower layout; the final three 3-second samples showed all 24 active surface bodies resting. This shorter observation supplements the 21-second measurement above.
- No console errors were observed during these runs.

![Second-level collection and large flowers](validation-images/runtime-jitter-2026-11-12/level2-after-collection.png)

Physical motion immediately after a removal is expected; the test concerns indefinite vibration after contacts settle. Existing water/ripple and butterfly-wing animations remain active. No real-device performance claim is made.

## 后续修正

本记录之后核实了质心施力、大角度欧拉分解及胶囊多边形内部接缝的问题；当前实现与复现结果以 [原包碰撞与休眠复核](validation-original-contact-rest-2026-11-12.md) 为准。
