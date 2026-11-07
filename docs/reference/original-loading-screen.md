# 原启动加载界面取证

依据用户提供的 Unity 运行包 `level0`、`sharedassets0.assets`、IL2CPP metadata/WASM，以及本轮用户提供的 100% 加载截图。这里只记录原数据与适配建议；未修改 Cocos TS、场景或 meta，未操作原版窗口。

## 基准与素材

启动场景的 CanvasScaler（level0 pathId 84）独立使用 **750×1334**，ScaleWithScreenSize，MatchWidthOrHeight=0（按宽适配）。它不使用首页/游戏场景的 1080×1920 基准，以下尺寸不应再乘 `750/1080`。

本轮需要的七张图片均已存在，来自 `sharedassets0.assets`，无需补导美术。路径相对于 `assets/resources/`；这些早期文件按 Texture2D 导出，原 Sprite 的九切边界没有随 Texture2D 条目进入 manifest，边界另列如下。

| 用途 | 资源路径 | 原整图尺寸 | 原 Sprite pathId | Image 类型 |
| --- | --- | --- | --- | --- |
| 花店背景 | `original/extras/bgLoad_8` | 750×1334 | 17 | Simple |
| 游戏标题 | `original/extras/btz_11` | 1024×311 | 20 | Simple |
| 进度条外框 | `original/extras/pb_0_6` | 202×72 | 15 | Sliced |
| 绿色进度 | `original/extras/pb_1_7` | 202×72 | 16 | Sliced |
| 进度条左侧花 | `original/extras/fl_l_9` | 105×109 | 18 | Simple |
| 进度条右侧花 | `original/extras/fl_r_4` | 88×87 | 14 | Simple |
| 提示两侧小花 | `original/extras/fl_b_10` | 39×38 | 19 | Simple |

背景与标题是两张独立图片。背景 Image（74）四边 stretch、offset 为零，PreserveAspect=false；标题不能重复烘焙到背景，也不需从截图裁图。

## RectTransform 布局

除标题的顶部锚点外，以下位置相对 Canvas 几何中心，X 向右、Y 向上。各图片及文字 pivot=(.5,.5)，默认 scale=1。Canvas 根序列化 size/scale 为零是 Overlay Canvas 的运行时驱动结果，不应把零值搬入 Cocos。

| 节点 / GameObject pathId | 位置或锚点 | 原矩形 | 备注 |
| --- | --- | --- | --- |
| `bg` / 12 | 四边 stretch | 画布全宽高 | 不保比例拉伸 |
| `Icon` / 19 | 顶部中心，anchoredPosition=(0,−330) | 1112×345 | localScale=(.67,.67,.67)，显示尺寸 **745.04×231.15**；在参考画布中中心 Y=337 |
| `Slider` / 15 | (0,−399.5) | 500×57.6 | 原无 handle；水平从左向右 |
| `Background` / 14 | Slider 内 (0,0) | **500×57.8** | anchors=(0,.25)→(1,.75)，sizeDelta=(0,29)；高度=57.6×.5+29 |
| `Fill Area` / 18 | 与 Background 相同 | **500×57.8** | 绿色 Fill 随 Slider 值改变水平 anchor |
| `Image` / 9，左侧花 | (−254,−399.5) | 105×109 | 覆盖条左端 |
| `Image (1)` / 11，右侧花 | (244,−399.5) | 88×87 | 覆盖条右端 |
| `txtPro` / 17 | (0,−395) | 240×50 | 比条中心高 4.5；初始 `0%` |
| `txtProTip` / 3 | (0,−461) | 245×70 | 初始 `加载中...请稍后` |
| `Image (2)` / 16，小花右 | (146,−461) | 39×38 | 和提示文字同中心 Y |
| `Image (3)` / 7，小花左 | (−146,−461) | 39×38 | 和提示文字同中心 Y |

Canvas 子节点绘制顺序为：bg → Icon → Slider → 左侧花 → 右侧花 → 右小花 → 左小花 → 百分比 → 提示文字。Slider 内先 Background 再 Fill Area。

若使用 Cocos 底部原点的 750×1334 坐标：条中心 Y=267.5，百分比 Y=272，提示 Y=206；标题中心距顶部 330。长屏适配应保留“标题顶部锚定、条/文字画布中心锚定”的区别，不把所有元素按整张参考截图同比缩放。

## 九切、透明留白与文字

- `pb_0` 原 Sprite border 为 **left=35, bottom=0, right=35, top=0**。
- `pb_1` 原 Sprite border 为 **left=41, bottom=0, right=38, top=0**。
- 两张图的 pixelsPerUnit 均为 100；原 Image 都是 Sliced，非 Filled。Slider 改 Fill 的水平矩形宽度，不能把绿色图当普通全宽图一直显示。
- 必须保留整张 202×72 图的透明留白。`pb_0_6.png` alpha 非空包围盒为 `(0,1)～(202,70)`；`pb_1_7.png` 为 `(10,11)～(191,51)`。不要将绿色可见部分裁成 181×40 再撑满 500×57.8，否则绿条高度、上下内边距都会改变。
- 进度百分比 Text（79）使用原 `AlibabaPuHuiTi-2-65-Medium`，固定字号 **32**，Normal，MiddleCenter，白色；Outline（80）黑色 alpha=0.8509804，距离=(1,1)。
- 底部 Text（65）使用同一字体，字号上限32，**BestFit 开启，最小20/最大32**，矩形245×70，MiddleCenter，白色；Outline（66）纯黑，距离=(1,1)。横向为 Overflow，纵向为 Truncate，因此应保持完整提示为一行，并以原 BestFit 范围适配；不能把长完成文案按32号硬塞成多行。
- 两个 Text 的 serialized lineSpacing 都为1。当前已导出的正文字体完整覆盖两条提示、数字与 `%`，不缺加载界面所需字符。

## 绑定与原加载流程

Canvas 的 LoadCtr（level0 pathId 85）三个序列化引用依次为：raw32→Slider 77，raw44→txtPro 79，raw56→txtProTip 65。序列化偏移与 WASM 运行时对象偏移不同；运行时三字段位于32、36、40。

| 方法 | 原函数索引 | 已确认行为 |
| --- | --- | --- |
| `LoadCtr.Start` | 41107 | 启动异步状态机 |
| `<Start>d__9.MoveNext` | 43387 | 订阅加载回调、将 Slider 设0；等待 Addressables 初始化，随后启动 LoginRequest 并调用 OptimizeForDevice |
| `LoadCtr..ctor` | 41122 | `addValue` 默认 float32 `.01`；场景名为 MainScene / StartScene |
| `LoadCtr.Update` | 41116 | 当 `isStop=false`，每帧直接 `proValue += addValue`；未使用 deltaTime，也未读取异步加载百分比 |
| `LoadCtr.onLoadScene` | 41120 | 主动将 proValue 设为1，再依据配置选择目标场景并调用 LoadSceneAsync，绑定完成回调 |
| `<onLoadScene>b__28_0` | 41126 | 设置 allowSceneActivation=true，并发送 `LOAD_FINISH` |

Update 中 `proValue<1` 时，Slider=value，百分比为 `floor(value×100)+"%"`，提示 **`加载中...请稍后`**；达到/超过1后，Slider=1、文字 **`100%`**、提示 **`加载完成，即将进入游戏`**，最后设置 `isStop=true`。两条提示均直接来自该函数的 metadata 字符串，后一条与用户截图一致。

因此原进度条本身是逐帧增加的显示进度，约100帧即可到顶（受 float32 累加边界影响），不是下载进度或固定秒数。到100%的 Update 分支本身不切换场景；真正切换来自初始化/登录等流程触发的 onLoadScene。上述已核链中没有独立的“100%固定停留若干秒”或淡出动画参数，不应把截图停留时间推断成原常量。登录网络与平台分支没有在本次复刻中恢复。

## Cocos 适配建议与边界

1. 先呈现原背景、独立标题、九切进度条与四个装饰花，再执行项目已有预加载；保持 750 设计宽，不套用首页的1080单位换算。
2. 进度由本地实际资源准备阶段驱动，准备完成才显示100%并进入首页。若保留短暂的完成态供用户看清，应明确这是本地交互策略，不能标为原代码的固定延迟。
3. 白字黑描边、绿色图原留白、左右花的不同尺寸、标题距顶部330，比替换为普通色条更接近截图。背景 stretch 与标题顶部锚点需在长屏预览核对。
4. 本次只读取原布局/动画流程与现有图片；Cocos 的实际接入和浏览器验收由启动集成执行。原版微信登录、网络初始化时长及逐帧过渡未现场重新测量。

机器可读副本见 `original-loading-layout.json`；关键静态函数见 `wasm/loading-41107.wat`、`loading-41116.wat`、`loading-41120.wat`、`loading-41122.wat`、`loading-41126.wat`、`loading-43387.wat`。原资源包未修改。
