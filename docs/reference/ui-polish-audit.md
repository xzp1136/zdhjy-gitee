# 原版 UI 质感取证（2026-11-07）

本轮只分析原 Unity 序列化资源并导出字体、布局与动画数据，不修改 Cocos 脚本或场景。下列“复刻现状”取自本轮开始时的代码；主代理正在并行修正，不能据此认定最终版本仍有这些差异。原 Canvas 参考分辨率为 1080×1920，当前 Cocos 宽度为 750，下文换算系数 `U = 750 / 1080`。

## 1. 使用原字体，并区分正文和装饰标题

原字体实际包含在运行包中。已导出到 `assets/resources/original/fonts`，不是重新绘制或字体替代：

| 角色 | 资源路径（省略扩展名） | 字符覆盖 | 原 UI 用途 |
| --- | --- | --- | --- |
| body | `original/fonts/AlibabaPuHuiTi-2-65-Medium` | 2737 个 cmap 码点 | 首页、按钮、HUD、道具说明、奖励、花束名 |
| display | `original/fonts/ZhanKuXiaoLOGOTi-2` | 177 个 cmap 码点 | 暂停、设置、时间到了等大标题 |

`original-font-usage.json` 保留 559 个 Text 的原层级、字体引用、字号、颜色和缺字结果。498 个引用 Alibaba，36 个引用站酷，25 个为未绑定/内置字体。所有已绑定的原 Text 内容均在对应字体 cmap 中。

具体对应：PauseView/Panel/txtTitle 和 SetView/Panel/txtTitle 用 display，字号 110（Cocos 76.39）；TimeUpOver/Panel/view2/txtTitle2 用 display，字号 85（59.03）；胜利页“通关奖励”用 body，字号 52（36.11）。正文不应统一切换为标题字体。

这两份是原包子集字体。Alibaba 不含 `×`、`频`；站酷仅覆盖少量标题字符。`font-coverage.json` 的 `{body,display}` 字符串可用于整段 Label 检查，忽略空白，缺字时整段使用系统字体。不能把题词字体设为全部 UI 默认字体。

复现：安装 UnityPy 与 fontTools 后，在工程根目录运行 `python3 tools/export_original_fonts.py`。脚本直接读取 `manifest.json` 记录的原包，导出 TTF、coverage 和引用报告。TTF 的源 pathId 与 SHA256 在报告 `fonts` 中。

## 2. 九宫格必须同时保留边距、基准缩放和原使用类型

`ui-slice-metrics.json` 保存原 Sprite border。表中顺序是 **左、上、右、下**（Unity 原结构为 x左、y下、z右、w上）。

| 资源 | 原逻辑尺寸 | L/T/R/B |
| --- | --- | --- |
| green_button_931 | 455×192 | 103 / 0 / 109 / 0 |
| pink_484 | 455×192 | 115 / 0 / 123 / 0 |
| pink_deep_167 | 272×192 | 112 / 0 / 110 / 0 |
| bg1_816 | 944×738 | 0 / 335 / 0 / 331 |
| tittlebg_305 | 401×113 | 64 / 0 / 57 / 0 |
| hl0_435 | 139×167 | 39 / 55 / 37 / 0 |

纸张 bg1 是上下切片，不能整张拉伸；原上下边总高 666 像素（462.5 Cocos 单位），过矮会挤压纸张边缘。首页导航 hl0 的边框也应按 U 缩放。可将视觉子节点以原像素单位设尺寸，再整体乘 U；直接把原边距塞进 750 宽的节点会让边距相对大 1.44 倍。

但“Sprite 有 border”不意味着每一个 Image 都使用 Sliced。`ui-image-type-evidence.json` 保留原组件的 `imageType`（0 Simple，1 Sliced）：

- 首页 StartGame/imgbtn、暂停 btnBack、TimeUpOver/view2/btnVideo2 是 Simple。
- 胜利 ContinueWin、失败 ContinueLose、CommonReward/btnDraw 是 Sliced。
- TimeUpOver/view2/Image 的 bg1 与首页导航背景 hl0 是 Sliced。

主代理已开始接入独立 SpriteFrame clone 和原基准缩放，后续只需按上述上下文核对，不宜全局把所有绿按钮改为 Sliced。

## 3. 首页顶栏应使用原顶栏图标

本轮审阅时 `FlowerHome.ts` 使用 `ui/itemicon/spirit`、`ui/itemicon/gold`、`ui/itemicon/star`（奖励图标）。原首页对应不同素材，三者 RectTransform 均为 95×95，即 65.97×65.97：

| 原节点（level1） | 原资源 | GameObject pathId |
| --- | --- | --- |
| Canvas/Start/PanelButton/imgSpirit/Image | `original/extras/heart_336` | 114 |
| Canvas/Start/PanelButton/imgGold/gold | `original/extras/coin_165` | 121 |
| Canvas/Start/PanelButton/imgStar/star | `original/order/star128` | 39 |

证据在 `level1-layout.json`。尤其奖励体力图并非正方形，当前以 66×66 强行绘制会改变轮廓。直接使用原顶栏图比对奖励图继续微调宽高更可靠。这里只核对素材和尺寸，没有据静态 prefab 推断运行时顶部安全区位置。

heart/coin extras PNG 是未裁 128×128，可直接画在上述方框。star128 是裁切导出的 118×110 PNG；原 Sprite 逻辑 Rect 为 128×128，textureRect 为 117.9465×109.8971、textureRectOffset 为 (5.02675,11.07612)。若还原透明留白，其图片应在 65.97 方框内显示约 60.79×56.64，中心上移约 1.04，而非把裁切图拉成正方形。heart/coin 已直接查看，都是 RGBA 透明图，无黑色圆底。

## 4. 游戏 HUD 的字号与进度色有精确值

`original-font-usage.json` 中原 level2 的四个 Text 均为 body 字体：

| Text / pathId | 原字号 | ×U | 原色 | 本轮审阅时复刻值 |
| --- | --- | --- | --- | --- |
| txtLevel / 771 | 45 | 31.25 | #ffffff | 28 |
| txtOverTime / 835 | 42 | 29.17 | #ffffff | 28 |
| txtOrderNum / 845 | 42 | 29.17 | #ffd714 | 27，#ffdf38 |
| txtStar / 848 | 42 | 29.17 | #ffffff | 29 |

四者完整原路径均在 `Canvas/Game/imgTop/TopParent` 下。接入原字体后，可同时按这些字号恢复文字占位比例。运行时分辨率适配、描边和屏幕截取会影响最终外观，不能仅凭字体大小宣称像素完全一致。

## 5. 引导手指与首页装饰动画已有原曲线

`ui-animator-bindings.json` 确认原 level2 `Canvas/Game/hand` 绑定 `handAni`。原 clip 是 0.666667 秒循环缩放：0 秒 1.0、0.333333 秒 1.1、0.666667 秒 1.0，XYZ 同值，没有位移动画。本轮 `FlowerGame.showGuide` 使用每段 0.6 秒、上下 14 单位位移，可改为原缩放曲线。

首页两个箱子 `imgLevelBox/levelBox` 与 `imgStarBox/starBox` 绑定 `boxAni`，0.666667 秒循环旋转：z 在 0 / 0.166667 / 0.333333 / 0.5 / 0.666667 秒分别为 0 / +4.79 / 0 / −4.5 / 0 度。是否运行时按可领取状态启停 Animator 未在本轮确认，不能把 clip.loop 推断为所有状态始终摇动。

首页三个活动入口 Image 绑定 `StartIconAni`：1 秒非循环 squash/stretch。0 / .166667 / .416667 / .666667 / .833333 / 1 秒的 XY 分别为 (1,1)、(1.08,.98)、(.95,1.1)、(1.05,1)、(.98,1.04)、(1,1)。原触发间隔尚未知，不应自行设为快速无限循环。

原始完整 typetree 在 `ui-original-animation-curves.json`；解码结果在 `ui-animation-keyframes.json`，保留时间、每通道数值与 cubicCoefficients。曲线不是只有线性关键帧；需要精确采样时，可按该段四系数对局部时间求值。

附：442 个花 prefab 的 WaterRippleAnimationCtr 参数一致：bowenPlaySpeed=1、bowenDefaultDuration=.6、upSpeed=1、middleSpeed=1、初始随机 delay=.1～.4。未发现连续旋转字段。`effect_lianyi_1` 是 .533333 秒循环 Sprite 序列，`bowen` 为 1.033333 秒非循环 Sprite/Color 曲线。现有 Pool 摇动仅属表现近似，本轮没有提出额外重做物理或涟漪系统。

## 导出范围与验证

新增字体为原包字节直接导出，未修改原图片。验证了两个 TTF 的 cmap/字形表、全部原 Text 字符覆盖、JSON 可解析以及字体导出脚本的 Python 语法。本轮未操作编辑器/UI、未改 TS/场景，也未把静态 prefab 的数据当作所有运行状态的最终布局。
