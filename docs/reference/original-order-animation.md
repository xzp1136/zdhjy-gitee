# 原订单完成、离场和补位动画

2026-11-07，只读取证；本轮不修改 Game/Rules/Bouquet/Pool。依据原 WASM 函数与 metadata 方法映射，相关函数保存在 `docs/reference/wasm/order-motion-*.wat`。资源节点尺寸和 Spine 素材由 `original-order-effects.md` 独立记录。

## 最重要的动作顺序

1. 每朵花落入当前需求组后，更新剩余数量与关卡进度；下一帧播放 flowerhit 和落花 Spine。
2. 当前需求组填满后，**该组每朵已插花**依次弹动，总长 `0.22 + 0.05 × (n - 1) + 0.05` 秒；三朵组为 **0.37 秒**。
3. 若花束还有下一需求组，切换当前需求、刷新气泡并尝试吸入待清区/暂存花；篮子留在原位。
4. 若整个花束已完成，隐藏需求气泡，开始整束 **0.60 秒**的放大回落、上移淡出。
5. 离场结束归还花朵对象并销毁花篮；下一帧请求新单。若仍有订单，新篮子等 **0.005 秒**后做 **0.35 秒**的左侧入场。

完整三花订单从最后一朵落地到离场结束约 **0.97 秒**；之后另加一帧及新单 0.355 秒入场。该时间线不包含之前的收花飞行。

## 当前需求组完成：逐朵弹动

`OrderItemCtr.CheckIsCompleteOrder` token 1036 / **43461** 检查当前组已收数量；满足时调用 `CompleteCurrentOrder` 1037 / **43463**，置 busy 标记、播放花名声音，再进入 `PlayOrderLevelCompleteAction` 1039 / **43465**。

43465 遍历 `flowerItemList[orderInfoIndex]`，对每一朵实际存在的花的 Transform：

| 相对时间 | 动作 |
| --- | --- |
| `i × 0.05` | 从当前 localScale 到其 **1.18 倍**，**0.12 秒 OutBack**（Ease 27） |
| `i × 0.05 + 0.12` | 回到保存的原 localScale，**0.10 秒 OutQuad**（Ease 6） |
| 所有花完成后 | AppendInterval **0.05 秒** |

这是逐花缩放，不是整篮统一 bounce。43465 先终止旧的组完成 sequence；回调 **43499** 清除 sequence 引用，再调用 **43487**。

43487 清 pendingPutCount、取消组完成标志、`orderInfoIndex++` 并更新 combo。若尚有需求组，依次调用 RefreshCurrentOrderUI **43404**、TryFillOrderFromPlacement **43473**、PlayVaseSwitchSpineEffect **43455**，并播放音频配置 67。若已无需求组，调用 CompleteAllOrder **43468**。

## 整束离场

`CompleteAllOrder` **43468** 先隐藏独立需求气泡 imgOrderTip 及 New 标记，再累计完整订单数、检查全关完成，然后调用 `PlayVaseRemoveAction` token 1020 / **43447**。

**动作目标是 vaseObj 的 RectTransform 与它的 CanvasGroup**；不是整个 OrderItemCtr。花篮与已插花一起移动，独立的需求图标、数量和视频锁区不跟着移动。

43447 先取消旧 tween，CanvasGroup.alpha 设为 1，播放音频配置 **74 = vasesuccss**，并调用 PlayVaseCompleteSpineEffect **43449**。接着构造以下 sequence：

| 相对时间 | 目标 | 参数 |
| --- | --- | --- |
| 0.00–0.16 | vaseObj.localScale | **1 → 1.16，0.16 秒 OutQuad** |
| 0.16–0.26 | vaseObj.localScale | **1.16 → 1，0.10 秒 InOutQuad**（Ease 7） |
| 0.26–0.60 | vaseObj.anchoredPosition | 到 **(0, 60)**，**0.34 秒 InCubic**（Ease 8） |
| 0.32–0.60 | CanvasGroup.alpha | **1 → 0，0.28 秒**，在最后一段开始后延迟 **0.06 秒**；未单独 SetEase，继承 DOTween 默认值 |

位置是 Unity 原坐标。当前 750/1080 缩放下，60 对应 **41.6667**；不得把此值直接理解为当前 Cocos 像素。Sequence 完成回调 **43485** 调用 `VaseDestory` **43448**。

43448 归还已插入的花朵、销毁 vaseObj，并通过 `StaticUtils.DelayNextFrameToDo` **43914** 延后一帧。闭包 **43486** 再调用 `OrderAreaManager.UpdateOrderVase` **43411**，因此新篮子不能在旧篮子淡出尚未结束时直接重建覆盖。

## 新篮子入场

`PlayVaseAppearAction` token 1019 / **43441**：

- 保存基准 anchoredPosition 为 `Vector2.zero`，准备 CanvasGroup。
- 起点是 **`Vector2.left × (RectTransform.rect.width + 80)`**，即 `(-(width+80), 0)`，不是上方进入。
- 初始 localScale 为 **0.72 × Vector3.one**，alpha 为 **0**。

方向证据：UnityEngine.Vector2 的 static 字段顺序是 zero、one、up、down、left、right；WASM 使用 static offset 32，即 left。Rect 返回值 offset 8 是 width；两者结合排除了“从上方高度+80进入”的误读。

| 相对时间（扣除外部 delay） | 动作 |
| --- | --- |
| 0.00–0.10 | alpha → 1；DOFade 未显式 SetEase |
| 0.00–0.30 | anchoredPosition → **(20, 0)**，**0.30 秒 OutCubic**（Ease 9） |
| 0.00–0.30 | scale → **1.05**，**0.30 秒 OutBack**（Ease 27） |
| 0.30–0.35 | position → **(0, 0)**，**0.05 秒 OutQuad** |
| 0.30–0.35 | scale → **1**，**0.05 秒 OutQuad** |

首个 fade 使用 Append，位移和放大使用 Join，因此前三项同时开始，整体是 **0.35 秒**而非 0.45 秒。

外部 delay：

- `InitOrderVase` **43399**：初始第 i 个槽传 **i × 0.06 秒**。
- `UpdateOrderVase` **43411**：补单传 **0.005 秒**。
- `UnlockNewOrderVase` **43414**：解锁新槽也传 **0.005 秒**。

出现完成 / OnKill 共用一次性闭包 **43491**（经 **43492/43493**），先核实仍是同一个 vaseObj、组件仍启用，再确保 position=0、scale=1、alpha=1，并执行订单进入回调；防止旧 tween 的回调污染新对象。随后若为新花篮，显示 New 标记、音频配置 66，并延迟启动新花篮 Spine。

### “新花篮”并非每次补单

`InitGameConfig` **41027** 每次构造关卡时新建一个本次使用的 vaseId 集合（约261–267行）。生成订单时只有以下三个条件同时满足才置 OrderData.isNew：

- 花瓶配置 `unlockLevel == 当前关卡`；
- 当前关卡不为 1；
- 该 vaseId 尚未在本次生成中标记为新。

条件在约765–797行计算；生成出有效订单后，约1204–1220行将该 vaseId 加入集合。标记写入 OrderData 的 offset17，**43400** 再复制到 OrderItemCtr.isNewVase（offset78）。该集合不读取长期收藏状态，因此重开同一解锁关卡仍会有每种新花瓶的一次提示；下一关复用旧花瓶则不提示。

声音配置 **66 = `level_new`**，原备注“新花篮订单第一次出现”；**67 = `level_checkceng`**，原备注“花篮订单多层切换”。因此新篮子入场完成仅在 isNew 时播放66；复式花束切组播放67，不能对每次普通补单都播放新篮子声音。

`DelayPlayOrderNewVaseSpineEffect` **43451** 的协程 MoveNext **43502** 只有 `yield null` 一帧，再调用 **43452**，没有额外的秒级等待。它由 **43491** 的 isNew 分支启动，位于入场完成之后。FlowerCatalog / FlowerRules 通过 `order.isNew` 保留该证据行为；事件快照与重开均保留此标记。

## 落花、气泡与暂存归单

`PutFlowerItem` **43459**：将 UI 花放入对应挂点、归一化挂点内 transform，加入当前组列表，更新剩余 `xN`，调用 `GameMgr.ReduceFlowerNum` **41051** 更新进度，然后 SetPutFlowerSprite **43460**、CheckIsCompleteOrder **43461**、满格检查，最后启动 DelayPlayFlowerSpineEffect **43456**。

该协程的 MoveNext **43500** 先 yield 一帧，再播放音频配置 **72 = flowerhit**，调用 **43457** 创建花朵落点 Spine。此链未显示每一朵落地都给整个花篮添加额外缩放；不能把组完成逐花弹动误用成每朵落地整篮 bounce。

`RefreshCurrentOrderUI` **43404** 选择当前组的花种/数量并刷新气泡图像、文字；`SetOrderTip` **43442** 在已解锁时显示气泡，按剩余需求组数选择 signRes，groupIndex>0 时启动提示 Spine 协程。已检查的这两函数不直接 tween 气泡缩放/位移。具体 Spine 骨骼动画归资源证据文档，不用近似缩放替代并称为原行为。

组间切换和新篮子出现回调通过 EnterCurrentOrder **43472** / TryFillOrderFromPlacement **43473** 才继续从待清区/暂存补花。复刻表现应依动作顺序推进，不应在离场前将下一单的花种、数量或已插花提前显示到旧篮子。

## 未在此处断言的内容

- DOFade 没有单独 SetEase。本文保留“继承默认”，不靠视觉猜测其曲线。
- 具体花篮宽度需读对应 prefab RectTransform，不能用槽宽直接代替。
- Spine 的挂点、缩放、播放名和持续时间见资源取证，不以近似粒子代替原骨骼动画。
- 以上为静态代码证据；取消生命周期和实际视觉仍需预览验收。
