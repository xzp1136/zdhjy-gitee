# 原按钮、首页和弹窗动画

取证日期：2026-11-07。证据来自用户提供的原 Unity WASM、metadata、序列化 MonoBehaviour 与 AnimationClip，不是运行画面估算。WASM SHA-256：`9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92`。

原值汇总见 `assets/resources/original/data/original-motion-settings.json`；曲线见 `docs/reference/ui-animation-keyframes.json` 和 `ui-original-animation-curves.json`。本文将已经证实的原行为和当前本地适配边界分开记录。

## 按钮

| 证据 | 结果 |
| --- | --- |
| ButtonHandler.OnPointerDown，token 1416 / WASM 43784 | 目标为保存的基础 scale × scaleSize，DOScale 0.1 秒，Ease 7（InOutQuad）。同时暂停可选的 idle scaleTween。 |
| OnPointerUp，token 1417 / 43785 | 0.1 秒 InOutQuad 回到基础 scale。 |
| Start / PlayScaleAction，1419–1420 / 43787–43788 | IsScaleAction 为真时，1.6 秒 InOutQuad，Yoyo 无限循环，目标仍为基础 scale × scaleSize；支持序列化 DelayScaleAnim。 |
| Up 完成回调，1425 / 43790 | 重新启动 idle scaleTween。 |
| 140 个已解码 ButtonHandler | 136 个 scaleSize≈0.9。4 个 btnStartGame 例外为≈0.94，IsScaleAction=true，DelayScaleAnim=0。其它绝大多数不启用 idle。 |

复刻使用稳定的外层 hit node 和独立视觉子节点；触控区域不随缩放改变。按下、抬起、移出和取消共用一个时间状态，不创建叠加 tween。组件禁用、按钮不可交互、祖先禁用及销毁会恢复视觉。开始游戏按钮使用已证实的 .94 例外。外层 `Button` 由 `tap()` 返回，原视觉节点引用仍保留原孩子结构；调用者不能再假定 Button 挂在视觉节点上。

原 ButtonHandler.IsPlaySound 存在于数据中，但已检查的 Awake、Start、Down、Up、OnPointerClick 及其闭包没有音频调用；OnPointerClick 43782 仅设 IsClick=true。因而本轮没有给通用 tap 发射 click 声音事件。原包存在 click 音频并不能单独证明此路径触发它。

## 首页图标

`StartIconAni` 为不循环的 1 秒 clip，原绑定仅在 btnTimeReward/Image、btnShareReward/Image、btnSuperGift/Image。原曲线是非等比压缩/拉伸，非简单 sin 波。FlowerMotion.ts 直接使用提取的每段 cubicCoefficients，按原帧时刻采样；仅图案动，底牌、缎带、文字和点击区域不动。

UIAnimation.Start（token 2501 / 43173）为每个组件调用一次整数 `Random.Range(2,5)`，得到固定 2、3 或 4 秒间隔。Update（2503 / 43175）等待 clip 的 normalizedTime≥1，再由 DelayPlay 43176 / 回调 43179 等待该间隔，重播到 normalizedTime=0。不是每帧随机，也不是永不停顿的 1 秒循环。ChangeAniState(false) 43174 和 OnDisable 43177 停掉待播动作并复位。

HomeControl 原触发：

- InitSuperGiftTimer 42750：倒计时结束后启用 superGiftUIAni；未结束时停用。
- InitOnlineTimer 42751：在线可领取列表非空时启用 onlineUIAni；计时未完成时停用。
- InitShareReward 42752：以原 LocalData 对应分享状态控制 shareUIAni；本轮没有把该状态直接等同于本地分享服务已接通。

**本地适配边界**：当前 Home 的每日奖励与一次性欢迎奖励仍沿用已有本地逻辑，不是恢复了原在线计时系统。这两个入口用本地可领取状态驱动原曲线，领取后复位。分享服务未接入，分享图案不制造“可领奖”动画。Welfare 与 GameCommunity 没有对应 StartIconAni 绑定，不套用此动画。

## 宝箱

`boxAni` 是 2/3 秒循环的 Z 轴摆动，按原 cubicCoefficients 采样，关键角度为 0→4.79°→0→-4.5°→0。绑定是宝箱图案本身，非整个入口。

HomeControl.PlayLevelBoxAni / PlayStarBoxAni（1661 / 42756、1663 / 42758）启用 Animator 并从 0 播放。RefreshStarBox 42749 只在星数达到目标时调用播放；未达到时停止。RefreshLevelBox 42748 同样按当前奖励档的就绪判断启停。

本地星箱显示阈值为 1500，达到后才摆动。关卡宝箱尚无真实领取/奖励档状态，仍保留其现有不可领取行为，不把 `level % 5` 猜作原领取条件，也不持续播放就绪动画。后续接入奖励表时可直接传真实 readiness 给 FlowerHomeMotion。

## 弹窗

BaseViewUI.ShowView / HideView（token 1403–1404 / 43774–43775）先取消 Panel 上旧 tween，再从 startScale 到 endScale 或反向。已由序列化对象确认：

| 对象 | 开启 | 关闭 | 比例 / 曲线 | 音效条件 |
| --- | --- | --- | --- | --- |
| PauseView / SetView / TimeUpOver | .4 s | .4 s | 0→1 OutBack / 1→0 InBack | open=true / close=true |
| OverUI | .5 s | .3 s | 同上 | open=true / close=false |
| GameUI | 字段为 .5 s | 字段为 .3 s | Panel=null，UIManager调用动画参数为false | 不应给游戏花池套全局弹出 |
| CommonReward | .4 s | .4 s | 同上 | open=false / close=false |

`presentPopup` 的默认时长为 .4/.4，Results/Failure 使用 OverUI 的 .5/.3；遮罩保持静止，已组装好的内容统一缩放。`dismissPopup` 取消进入动作且只完成一次。声音只在显式已证实的选项下通过 `cc.game.emit('flower-ui-sound', 'open'|'close')` 发出，由主流程依据用户音效设置播放；重复 present/dismiss 不重复发声。原映射为 BaseView 的音频配置 id 2/open、3/close。

## 验证范围

`tests/flower-ui-motion.cjs` 使用真实 TypeScript 实现与提取曲线，覆盖固定 hit 几何、按压四分之一时刻的 InOutQuad 值、取消/禁用/销毁、快速重复输入、开始按钮 yoyo、全部曲线段中点、一次采样的循环等待、奖励状态复位、Home 绑定目标、弹窗中断以及音效只发一次。它是无渲染回归；Cocos 原生事件派发、实际画面和声音由预览验收，不以 stub 测试冒充实机观察。
