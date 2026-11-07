# Creator 启动插屏配置核验

2026-11-07 核对本机 Creator 3.8.7 与当前官方3.8文档。保留默认 Cocos 插屏和标识，将正常项目设置的最小显示时长从 **2000 ms 改为500 ms**；没有禁用插屏、修改许可/问卷状态、编辑引擎或手改生成产物。**微信产物使用独立 first-screen 首屏，其实际时长不能按此500毫秒配置断言。**

已通过 `Editor.Profile.setProject('builder', 'splash-setting.totalTime', 500)` 保存，读回500。可复现的 `build-configs/wechatgame.json` 同时保存完整 `splashScreen` 设置，默认 logo/background 不变。再经 `builder.check-and-complete-options` 校验后的结果为：

```json
{"totalTime":500,"logoType":"default","useSplashScreen":true}
```

依据是 [官方项目设置说明](https://docs.cocos.com/creator/3.8/manual/zh/editor/project/) 和 [官方构建选项说明](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/build-options.html)：正常时长控件最小值为500毫秒。本机安装包 `builtin/builder/static/contributions/splash-setting.html:29` 也明确 `min="500"`；项目默认值2000来自 `builtin/builder/package.json` 的 `splash-setting`。

当前工程的 `information` 状态中，`customSplash` 和 `removeSplash` 均为 `complete:false`，关联官方功能问卷。官方插件类型把这是问卷状态，不能据此声称需要购买许可，也不能把未完成状态改成已完成。若以后要自定义或移除，应通过编辑器提供的正常入口完成官方要求并验证对应平台的支持情况。本轮没有提交问卷，也没有做这些变更。

浏览器编辑器预览与正式构建不同：官方文档明确构建插屏设置不作用于预览。本机预览模板 `builtin/preview/static/views/index.ejs` 含独立 `#splash` DOM，故浏览器里看到的 Created with Cocos 加载页不能据此推断微信构建会强制显示同样时长。本轮按任务要求没有修改预览模板。

设置发生时首轮微信构建任务 `zdhjy-wechat-1794063377208-4f9ad9` 已开始。随后最终任务 `zdhjy-wechat-1794063852095-dec7ea` 使用新配置重新构建成功，其构建日志明确记录输入 `splashScreen.totalTime:500` 和 `useSplashScreen:true`，但生成 `src/settings.7bc4d.json` 中的引擎插屏 `totalTime` 是0。

这不等于没有默认首屏。最终 `game.js` 与本机官方 `resources/3d/engine/templates/wechatgame/game.ejs:47–68` 对应：先 `firstScreen.start()`，再载入 Application、引擎模块并执行 `application.init(cc)`，然后 `firstScreen.end().then(() => application.start())`。独立 `first-screen.js` 绘制默认 `logo.png`、`slogan.png` 和进度条，初始化阶段依次更新0.2、0.4、0.6，结束时更新到1并清理。最终代码及官方 `first-screen.ejs` 均没有 `totalTime`、500毫秒等待或固定计时器。

因此最终产物的行为是：微信独立首屏承接引擎加载阶段，生成的引擎内部插屏时间置0，避免随后再播放内部插屏。这个判断由实际产物和官方模板控制流交叉支持；不能宣称默认 Cocos 标识只显示500毫秒，也不能由 `totalTime:0` 宣称已经移除首屏。本轮没有微信设备启动计时，不报告“秒开”或首屏精确时长。
