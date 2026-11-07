# 原水波、入场、收花和按钮动画取证

依据用户提供的同一 Unity 运行包，静态读取 prefab、AnimationClip、IL2CPP metadata 与 WASM。本文记录可复现的数据和触发链，不把 Cocos 接入结果当作已完成的原版逐帧验收。

## 可加载数据与复现

| 文件 | 内容 |
| --- | --- |
| `assets/resources/original/data/water-ripple-animations.json` | 442 个花 prefab 的水波挂点、6 个 effect/clip、55 个 Sprite 的裁切几何、原动画曲线 |
| `assets/resources/original/effects/ripple/*.png` | 上述 55 个 Sprite 的原始导出图 |
| `assets/resources/original/data/original-motion-settings.json` | FlowerManager 场景覆盖值、140 个按钮、47 个面板、收花与入场参数、源对象和偏移 |
| `assets/resources/original/data/original-main-audio.json` | 主包 25 个 AudioClip 的名称、路径、时长、hash 和源对象 |

在项目根目录运行：

```sh
python3 tools/export_water_ripple_animations.py
python3 tools/export_original_motion_settings.py
python3 tools/export_original_main_audio.py
```

脚本依赖 UnityPy，读取 `manifest.json` 中记录的原包路径；不执行原游戏代码，不改原包，不写 `.meta`。原 `manifest.json` 的 1044 项保持为早期导出清单；本轮新增图、声音与字体有独立来源报告，不能用 1044 当作现在全部文件数量。

## 水波不是统一的圆圈

每个花 prefab 都有 `WaterRippleAnimationCtr`。其序列化内容是 `bowenPoint`、`upPoints`、`middlePoint`，每个挂点存 prefabName、localPosition、localEulerAngles、localScale。不同花的挂点数量、方位和大小不同；两个蝴蝶等空挂点在导出中保持 `null`/空数组。

442 个组件的播放参数完全一致：bowen/up/middle 速度为 1；bowen 兜底长度 .6 秒；初始随机延迟 .1～.4 秒。实际 bowen 长度从 AnimatorController 第一条 clip 取得，不能一律用 .6 秒。

| Effect | Clip | 长度 | 循环 | 内容 |
| --- | --- | --- | --- | --- |
| Ani_lianyi1 | effect_lianyi_1 | .533333361 s | 是 | 6 张 Sprite，0/.1/.2/.3/.4/.5 秒换帧 |
| Ani_lianyi2 | effect_lianyi_2 | .5 s | 是 | 6 张 Sprite，原离散换帧时间见 JSON |
| Ani_lianyi3 | effect_lianyi_3 | .466666669 s | 是 | 6 张 Sprite，原离散换帧时间见 JSON |
| Ani_lianyi5 | effect_lianyi_5 | .533333361 s | 是 | 6 张 Sprite，原离散换帧时间见 JSON |
| Ani_bowen | bowen | 1.033333302 s | 否 | 两个 Sprite 子层，独立换图、RGBA 曲线；第二层默认旋转 −90° |
| Ani_bowen2 | effect_shuibowen_2 | .666666687 s | 否 | Sprite 换帧、RGBA 与 XYZ scale 曲线 |

`CreateRippleObject`（41006）从池取得 prefab 后，设为 flower 的 waterRipple 子节点，再**覆盖**根的局部位置、Euler 和 scale。因此不能再乘源 prefab 根中 1.8 或 3.0 的默认 scale。原子层 `SpriteRenderer.sortingOrder` 为 2；ApplySortingOrder（1138）在此包是空方法。

### 原触发链

- `InitDepth`（40996）取消旧协程、回收已有波纹。初始 Up(0)/Middle(1) 才开始随机延迟；Bottom(2)/Down(3) 不建水波。
- `DelayPlayInitialRipple.MoveNext`（41019）等待 .1～.4 秒后，Up 直接播放常驻 Up，Middle 播放常驻 Middle。**开局不先播 bowen**。
- `PlayUpAnimation`（41007）遍历所有 upPoints，每个 Animator 使用独立随机 normalizedTime `[0,1]`。`PlayMiddleAnimation`（41002）也随机初始相位。
- `ChangeDepth`（41000）进入 Up 时调用 `PlayBowenOnce`（41001），从 normalizedTime=0 播一次短波，按 clip 长度等待，回收后进入常驻 Up。进入 Middle 直接换 Middle；进入更深层停止全部水波。
- 点击成功开始收花时，`BeginRemoveFromWater`（44287）直接调用 waterRippleCtr 的 `StopAllAnimation`（40998），结束协程并回收所有波纹。全包仅 ChangeDepth 调用 PlayBowenOnce。**没有点击时留在原位置的独立水波尾迹，也不应让水波随花飞入花瓶**。

### JSON 坐标与曲线

`prefabs[flowerResource].up/middle/promotion.transform` 是 `[a,b,c,d,tx,ty]`，把 effect 根局部 Unity 单位映射到裁切后 FlowerImage 的中心 UV（y 向上）；最终乘实际显示宽/高。`effects[name].nodes[].transform` 是其父节点局部矩阵，按 `parent` 建树；不要按扁平节点再次累计父变换。

Sprite 的逻辑大小和裁图尺寸以像素为单位，pivot 是 0～1 比例。原图局部中心为 `(trimOffset + croppedSize/2 − pivot*logicalSize) / ppu`，大小为 `croppedSize/ppu`。每帧图片留白不同，必须逐帧应用该几何。

轨道 `sprite` 和 `m_IsActive` 是阶梯值；颜色和 scale 的系数 `[a,b,c,d]` 以 `dt=t-key.time` 求 `((a*dt+b)*dt+c)*dt+d`，是绝对值，不再加 key.value。显示色限制在 0～1。原 streamed clip 的初始哨兵值并入 time=0，真正的零时刻 key 优先；null Sprite 保持不可见。

少数挂点带很小的 X/Y 倾斜。导出矩阵使用 Unity Z→X→Y Euler 的 XY 投影，同时保留原 XYZ 数据；二维播放器对这种轻微透视/剪切的表现仍需实际画面对照。

## 花池入场与补层

`SpawnFlower.MoveNext`（41077）每批随机 3 或 4 个对象、间隔 .05 秒生成，最后等待 .35 秒；尾部 CaptureInitialLayerCount 只记录初始层数量。`SpawnOneFlower`（41042）对可见层（非 Down）将根 scale 从零以 .35 秒 OutCubic 恢复配置值。Down 保持隐藏。这个生成节奏独立于各花水波的初始延迟。

不能再给整个 GameBoard 添加 .5 秒弹出：原 GameUIControl（level2 pathId 780）的 BaseViewUI.Panel PPtr 是空引用，UIManager.StartGame（43184）传给 GameUI.ShowView 的 animate 参数也是 false。GameUI.ShowView（42695）立即调用 CloseCutSceneAni（42696）→ GameMgr.StartGame（41031）→ GamePlay.MoveNext（41073），后者 yield 一帧后启用 IsPlayGame/gameState。花朵入场期间原游戏逻辑可以推进。

原 FlowerManager 场景组件（level2 pathId 701）的参数覆盖了 ctor 默认值；使用 `original-motion-settings.json.flowerManager.values`，其中保存每个参数的 serializedOffset。主要覆盖：

| 过渡 | 延迟 | 时长 | 最大角度 | overshoot |
| --- | --- | --- | --- | --- |
| Bottom→Up | .14 | .70 | 8° | 1.035 |
| Middle→Up | 由对应调度路径决定 | .90 | 5° | 1.018 |
| Down→Bottom | .10 | .12 | 由原过渡决定 | 由原过渡决定 |
| Down→Up | .14 | .66 | 10° | 1.045 |

nearRadius=1.3、vacancyTargetRandomRadius=.08；自动提升间隔 `[5.2,7.8]`、chance=.5。以上是原参数，不意味着本轮已复现完整原物理与自动提升调度。

## 收花与声音触发

FlowerCtr ctor（44385）运行时字段 `moveDuration@172=.58`、`pickedScaleRatio@176=1.25`、`targetScaleRatio@180=.46`。442 个序列化组件只有 164 或 176 字节，这三个运行时字段不在序列化数据中。目标倍率会在 MoveFlowerToTargetPos（44288）被传入目标值覆盖；不能把 `.46` 当成所有目标的固定最终尺寸。

| 原事件 | 原函数和条件 | 原声音 / 当前可加载路径 |
| --- | --- | --- |
| 一次关卡开始生成花池 | SpawnFlower.MoveNext 41077，批次循环前一次 | ID73，`original/audio/flowerstart` |
| 花朵点击被接受 | OnClickFlower 44282 → PlayClickSound 44283；使用 FlowerCtr.clickSound，空时 fallback ID70 | `original/audio/click` |
| 花朵抵达订单后的特效 | DelayPlayFlowerSpineEffect.MoveNext 43500，yield 一帧后播放 ID72，再触发花朵特效 | `original/audio/flowerhit` |
| 完成花束开始移走 | OrderItemCtr.PlayVaseRemoveAction 43447，播放 ID74 | `original/audio/vasesuccss` |
| 补层切换到 Up | PlayDepthTransition 的切层回调 40916：先 ApplyPromotedDepth，再仅在新层=Up、upSound非空时播放 | ItemDataConfig.playUpSound；24 条为 `original/audio/flowerfuqi`，127 条为空 |

151 条 ItemDataConfig.sound **全部为 `click`**；nameSound 是另一个花名语音字段，不能将它当成普通点击音。补层音效在切层时触发，没有在该路径随机选择 flowerfuqi_1/_2 的证据，也不应等整个补位动画结束才播放。初始加载调用 InitDepth，不走该补层切深回调。

上述 ID→资源名来自 Config ctor 56047 的 SoundInfo 字典：72 备注“花朵飞到花篮位置”、73“关卡开始创建花朵”、74“花篮订单完成”。主包 25 个声音此前未包含在早期仅导出远程 bundle 的 22 项音频清单中，本轮已补导；现有 `collect` 与主包同名音频的字节哈希不同，后者保存为 `collect_main`，未覆盖已有文件。

## 按钮与面板参数

原 ButtonHandler 140 个序列化实例中，136 个 scaleSize=.9；4 个首页 btnStartGame 为 .94（level1 pathId595 及对应3个资源副本）。PointerDown 43784 和 PointerUp 43785 都用 .1 秒 InOutQuad（Ease7）缩到目标/回到原scale。取消与销毁时的还原需由输入实现处理，不能让长按后切场景遗留缩放。

暂停、设置、超时 BaseViewUI 的开/关为 .4/.4 秒，0→1 scale，OutBack/InBack（27/26）；GameUI/Over 的字段值为 .5/.3，但是否使用动画还需结合 Panel 引用和 ShowView 参数（上述 GameUI 明确不使用）。140 个按钮和47个面板的原字段已逐条导出。

UIAnimation Start（43173）采样一次整数 Random.Range(2,5)，即 2、3 或4秒固定间隔；Update（43175）等当前 clip normalizedTime≥1 后才调延迟，协程（43179）等待该间隔后从 normalizedTime=0 重播。StartIconAni 是1秒非循环，不应持续快速循环。首页 boxAni 的可领取状态控制由同伴继续取证，详见本轮按钮动画记录。

## 检查范围

导出检查覆盖：442个水波 prefab、55个PNG资源引用和尺寸、6个 clip 的所有绑定/初始key、空Sprite及RGBA/scale曲线；140按钮、47面板、442收花组件序列化长度；25个主包音频的文件哈希和来源。脚本语法与JSON可解析性已检查。未操作 CUA；本轮可视播放与浏览器验收由主代理和表现模块负责。
