# 原包对照：顶层空隙、下层辨色与适配

> 阶段性记录：后续已接入边界包围范围、延迟落花修复与解锁 Spine，最新状态见 [本轮修复](validation-source-restoration-2026-11-12.md)。
本次检查基于本地 `587d0a1`，对应测试反馈三项：**最上层空隙又太大、第二层花全灰难辨、界面适配没做好**。本次没有改游戏运行代码；新增的是取证工具、数据和截图。`587d0a1` 仍未成功推送。

## 结论与修复方向

| 反馈 | 核查结论 | 建议修复 |
| --- | --- | --- |
| 最上层空隙过大 | 原物理与水流未移植；当前最远点排布、大椭圆避让会把花主动分散。此前把活动边界扩展到长屏水面，也使同数量花朵密度下降。 | 统一水面、活动区与花朵尺寸的换算；复用原物理碰撞体及分层水流，减少人为大范围推开。不要只增加表层数量或继续放大点击框。 |
| 下层花全灰、同形异色难辨 | **确认还原偏差**。原版半浸水 shader 保留纹理 RGB、按水线改 alpha；当前代码把所有非顶层 Sprite 整体 grayscale。水面前后的渲染顺序也被单一花层替代。 | 恢复“水下完整图 → 水面 → 水上裁切图/顶层花”的组合，保留花色；迁移原水线材质，水波与明暗按层处理。 |
| 界面适配 | 四种实际竖屏画布未复现主要按钮裁切，暂停弹窗完整；**确认不同尺寸的玩法区密度不一致**。原世界坐标到 UI 的锚点适配仍未移植。 | 背景延展与玩法区分离，依据相机/世界锚点放置订单、暂存区；长屏和平板保持花池相对尺寸/密度。原生安全区与微信胶囊另做设备检查。 |

## 原包身份与范围

只读目录：`/Users/a7/Desktop/真的好解压_wx38b4f3dff4fbedf0`。

- 确认为 Unity 运行资源，序列化文件版本包括 `2022.3.54f1`、`2022.3.62f3c1`；不是可编辑 Unity 工程。
- `expanded/game.wasm` SHA-256：`9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92`，与仓库此前取证的二进制一致。
- 主数据包 SHA-256：`3f74128bbe4c7b8490e2b012f52c5b928dce1a940fff80eb5ade91571fb644b6`。
- 原包读取 27,290 个对象；本次重新校验目录中的全部 **442 个花 prefab 点击轮廓**，与当前 JSON 最大坐标差 `4.9984e-9`，小于原数据保留 8 位小数的精度。**没有发现点击轮廓整体导错**。
- 运行原版需要微信平台插件，本次没有执行 Unity/WASM 原游戏；原版行为结论来自序列化对象、GLSL 和函数体。Cocos 画面来自现有编辑器实际编译结果。

完整取证：`reference/original-fidelity-audit-2026-11-12.json`。

## 1. 表层空隙：排布和密度机制有偏差

原 442 个花 prefab 的非触发物理碰撞体共有 **480 个**：392 个 CapsuleCollider2D、15 个 PolygonCollider2D、73 个 CircleCollider2D。它们与 LayerClick 的 442 个触发点击轮廓是两套数据。部分花有多个物理碰撞体；有些物理体形状也与完整花图相差很大。例如蓝绣球 `cdy_lxq_01/Collider/c1` 原 capsule 的序列化尺寸是 `(2.12, 0.08)`，另有局部缩放和旋转；不能把整个花图的大椭圆当成它的碰撞体。

原 `FlowerWaterFlowController`（level2/pathId698）及 FixedUpdate/UpdateLayerFlow 有实际函数体，按分层设置向刚体施加运动、限制速度和施加小扭矩。场景参数包括 updateInterval `.15`、directionInterval `[.9,2]`、linearDrag `.35`、angularDrag `.25`、torqueImpulse `.005`。当前 Cocos 则以固定锚点附近的正弦漂浮、最远点采样和椭圆推开近似这些运动。

需要区分：组件中虽保存 gapPullRadius `2.2` / gapPullImpulse `.015`，但本包的 `NotifyFlowerRemoved`（token735/function1591）函数体只有 `nop/end`。不能因为有这些字段，就断言原版已执行了“移除后牵引空位”的算法。此前检查过程中的这条初步判断已据函数体更正。

当前代码的具体问题：

- `FlowerPool.choosePosition()` 从 48 个候选中最大化与邻花的最小距离，目标是分散，不是填密。
- `repackSurface()` 使用图像尺寸约 `.46` 倍作为半径，最小间距 72，执行 16 轮推开；没有对应的聚拢步骤，也未使用原非触发碰撞体。
- `SURFACE_FILL_RATIO=.68` 只是补位准入上限，不是“低于 68% 就自动补满”的目标。
- `setBounds()` 按整个水面线性扩展锚点，花朵图片大小不跟着扩展；原关卡初始花数也不随屏幕增加。

按当前公式、无安全区额外 inset、同一组花及相同尺寸估算：

| 画布 | 活动面积（设计单位平方） | 相对 375×667 的同花面积密度 |
| --- | ---: | ---: |
| 375×667 | 459,428 | 100% |
| 390×844 | 650,797 | 70.6% |
| 360×800 | 679,653 | 67.6% |
| 768×1024 | 633,275 | 72.5% |

这是代码几何推算，不是图像像素覆盖率测量；实际层间提升、不同花种和随机旋转会改变视觉覆盖。它解释了同一关在短屏挤、长屏疏的趋势。前一轮水面边界调整确实带来了这项密度偏差，不能以“画面铺满屏幕”作为还原完成的判据。

## 2. 下层全灰：已确认的材质与排序遗漏

原花包含 `FlowerMajor`、`FlowerUp`、`FlowerDown` 和 `HalfSubmergedSimple`。读取全部 442 个组件，其水线参数只有一套：waterCut `.5`、cutSoftness `.004`、curveStrength `-.05`、curveWidth `.95`、curvePower `1.5`，以及细微水线波动参数。

`ModofyActive`（function44357，仓库已有 WAT）在 Middle 层关闭 Major，启用 Up/Down。原 `ModifyOrder`（token483/function44285）将 Major/Up 设为对应层排序，将 Down 设为 **-1**；场景 Water 排序为 **0**。这形成同一花朵在水面前后的组合。Bottom 的 Major 位于水面下，Down 层保持 inactive；不是“所有下层都换灰色图”。

本次从原 Shader 压缩程序直接恢复了 GLES3 代码：

- `Custom/SpriteHalfMaskSimple`：`reference/unity-shader-evidence-2026-11-12/1086-1.glsl`。
- `Custom/SpriteWaterPlanE`：`1090-1.glsl` 及带 `USE_REFLECTION_DISTORT` 的 `1090-2.glsl`。

半浸水 fragment 保留 `texture(_MainTex, uv) * vertexColor` 的 RGB，仅将 alpha 乘水线遮罩。`HalfSubmergedSimple.ApplyProperties`（40984/40985）对 Up/Down 分别设置 ShowUnderWater=false/true。**不是整图去色**。这些是 Unity 打包后的 GLES3 程序，迁移到 Cocos 仍需改写材质接口，不是直接可导入的 `.effect`。

注意：Material 的 savedProperties 里还有 `_UnderWaterTint`、`_UnderWaterAlpha` 等历史值，但当前半浸水 GLSL 并未读取它们，不能把这些遗留字段当作精确还原颜色的依据。

当前 `FlowerPool.ts` 则显式执行 `image.grayscale = visualBand !== 0`，Middle/Bottom alpha 分别趋近 150/95，叠加 `UNDERWATER=(208,225,225)`。WaterCaustics 先创建，全部花朵后来统一放到 FloatingFlowers，因此缺少真正水面前后分层。即使原 PNG 色彩完全正确，当前渲染链也会丢失同形花的颜色线索。

## 3. 适配：相机策略接近，但世界/UI 映射不同

原 `CameraWidthAdapter`（level2/pathId704）参考 1080×1920、orthoSize=9.6。静态还原 `ApplyCameraSize`（token86/function56043）为：

```text
aspect = screenWidth / screenHeight
referenceAspect = 1080 / 1920
orthoSize = aspect < referenceAspect ? 9.6 * referenceAspect / aspect : 9.6
```

这与目前 Cocos 长屏 FIXED_WIDTH、短宽屏 FIXED_HEIGHT 的大方向基本一致，不能把问题笼统归因于“没做分辨率适配”。

差异在后续布局：原 `UIAreaPositionAdapter`（level2/pathId712）将订单和暂存区连接到 `BackGround/OrderAreaAnchor`（world y=6.43）、`PlacementAreaAnchor`（world y=3.62），用相机和 RectTransform 换算。当前使用固定局部坐标，再统一加 topShift/bottomShift，同时伸展水面、盆和活动边界。画面背景延展与玩法密度因而耦合。原 UI 锚点适配函数体保存于 `reference/unity-function-evidence-2026-11-12/43597.wat.txt` / `43598.wat.txt`。

## 实际预览测试

没有重新打开项目；复用现有 Creator `localhost:7456` 的脚本、引擎、场景及资源。为排除编辑器工具条/设备模拟器尺寸干扰，在本机临时代理测试页启动同一场景，画布使用真实窗口大小，没有调用收花/改存档等业务方法，没有替换任何游戏脚本。

| 场景 | 观察 |
| --- | --- |
| 390×844、360×800 | HUD、四订单、暂存和道具可见；下层全灰清楚复现；长屏花池分布较疏。 |
| 375×667 | 主按钮未裁切，但同关花朵明显更挤；暂停和继续游戏可操作，弹窗完整。 |
| 768×1024 | 全尺寸画布确认 768×1024，主要内容完整；水面延展后花与水面比例变化。 |
| 844×390 | 浏览器额外边界检查：HUD/订单很小，花朵横向分散。微信构建已配置 portrait，不将强行横屏算作已复现的微信缺陷。 |
| 连续 resize | 关卡/倒计时继续，无重新开局；暂停后 resize 到短屏，弹窗仍完整。 |

原 Creator “Webpage Full Screen”在先以大窗口启动、后缩小浏览器时保留旧模拟容器，曾显示 1280×720 画布超出 390×844 页面。此为预览工具干扰，已排除，未把这张裁切画面当成游戏适配结果。结束时已恢复 iPhone 14 Pro 设备预设，清除临时浏览器尺寸覆盖。

截图位于 `validation-images/original-audit-2026-11-12/`，都是 **当前 Cocos 画面**，不是原 Unity 运行截图。测试页控制台没有 error。此次没有仿真或验证手机刘海/安全区、微信胶囊、真机 GPU 材质、物理性能；因此不能宣称“所有机型适配通过”，也不能据此确认反馈中的未知机型裁切问题。

## 后续实现顺序

1. 先恢复半浸水材质与水面前后排序，使下层同形异色的花可辨。
2. 将背景扩展、UI 锚点和花池活动坐标分开，固定同关的玩法尺寸关系，修正长屏密度下降。
3. 引入原 480 个物理碰撞体、碰撞层关系和已确认的水流参数，再校准拥挤程度和移动手感。点击仍使用当前已核对正确的 442 个 LayerClick 轮廓。
4. 对首关、第二关和后续混花关重新录制相同操作、多尺寸对比；微信真机单独验收。

不要只把灰色关掉就宣布水下表现还原，也不要用继续增加推开半径或一味加花数量来修补密度。

## 重现原包核查

```sh
python tools/audit_original_flower_fidelity.py \
  --source '/Users/a7/Desktop/真的好解压_wx38b4f3dff4fbedf0/runtime-cache/d83724c5931a26b5.webgl.data.unityweb.bin' \
  --out docs/reference/original-fidelity-audit-2026-11-12.json
```

依赖 UnityPy，工具从指定源读取，输出证据 JSON 和 GLSL，不重写 manifest、运行素材或 `.meta`。已实际运行：442/442 点击轮廓一致、全部半浸水参数一致、480 个物理体完成枚举、三个 GLES3 程序输出。选取的 WASM 函数记录为只读静态反汇编文本；它们不是可直接执行的 WAT 模块。
