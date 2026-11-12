# 原包物理、水下材质与奖励核对

本轮继续读取用户提供的 Unity 解包文件，并修改当前 Cocos 工程。没有操作微信，没有重新打开 Cocos 项目。本轮已经完成离线回归和普通编辑器预览复测；胶囊精度及结算第三栏奖励仍保留明确边界。

## 来源

- 原容器：`/Users/a7/Desktop/真的好解压_wx38b4f3dff4fbedf0/runtime-cache/d83724c5931a26b5.webgl.data.unityweb.bin`
- 容器 SHA-256：`3f74128bbe4c7b8490e2b012f52c5b928dce1a940fff80eb5ade91571fb644b6`
- WASM SHA-256：`9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92`
- `tools/export_flower_runtime.py --source <解包目录或上述容器文件>` 提取 442 个花朵、480 个非触发碰撞体、四面墙、水流设置、水面材质参数和两张原贴图。点击触发轮廓继续独立使用，不把整张 PNG 当碰撞体。
- 原 GLSL 位于 `reference/unity-shader-evidence-2026-11-12/`；本轮对应 WASM 函数归档在 `reference/unity-function-evidence-2026-11-12/`。

## 物理代码

`FlowerPhysics.ts` 使用 Cocos 自带 Box2D，不再使用手写椭圆避让、PNG 墙内留边或正弦漂移。运行数据位于 `core-effects/original/data/flower-runtime-physics.json`。

| 项目 | 原包读数/行为 | 对应来源 |
| --- | --- | --- |
| 固定时间步 | 约 .02 秒，最大累计帧时间约 .333333 秒 | TimeManager |
| 求解迭代 | 速度 8，位置 3 | Physics2DSettings |
| 花朵刚体 | Dynamic、质量 1、非自动质量、无重力、可旋转、可休眠 | Rigidbody2D；40969 |
| 物理材质 | 花朵继承刚体 FlowerPhysicsMat，摩擦约 .1、弹性 0；墙默认摩擦约 .4 | PhysicsMaterial2D / 刚体材料引用 |
| 阻尼 | 线性 .35、角 .25 | FlowerWaterFlowController |
| 分层 | 每层只和本层及池壁碰撞；Down 不模拟 | 原碰撞矩阵；40969 |
| 水流 | 每 .15 秒检查，按原分步筛选，.9–2 秒换方向；速度/冲量随深度设置 | 40963/40964/40966/40967 |
| 注册漂移 | 速度平方 < .0025 时，随机赋 .05–.12 的初速度 | 40968 |
| 生成 | 中心 (0,-2.51)，X ±2.6、Y ±3.3、圆内 .25 抖动、.2–.5 初始冲量、完整角度范围 | 41043/44354 |
| 移除通知 | 该包 NotifyFlowerRemoved 为 nop；没有额外加入吸引/补洞力 | 1591 |

渲染坐标保持原相机的 `750/10.8`；模拟节点使用 Cocos 32 单位/米，并放在独立场景根下，避免响应式 UI 缩放改变物理尺寸。Cocos 2D 的碰撞体必须和刚体处于同一节点，因此将 Unity 子节点矩阵烘入碰撞体轮廓。重建或缩放碰撞体后，按原显式质量归一化密度。

保留已有的入场、上浮、打乱动画和首关观测布局。动画期间暂停对应刚体，完成后重新接回模拟；打乱不会在聚拢中心同时激活所有刚体。暂停不推进模拟，点击移除会立即禁用该物理体。未出生的花不提前参与接触。

### 精度边界

Cocos 没有 CapsuleCollider2D。本实现按 Direction 和缩放构建圆形/凸多边形胶囊轮廓，圆弧多边形误差限制在原接触偏移 .01 米以内，再交给 Cocos 原生凸分解和最多 8 顶点拆分。**异常宽高与 Direction 的 Unity 实际构造结果尚未用原版运行时逐个比对**，不能宣称这部分已经逐接触完全一致。Unity 与 Cocos 的 Box2D 版本/求解实现也有差异。

固定形状模拟在 15/30/60 fps 下的固定步结果一致。入场缩放/打乱动画按渲染帧更新碰撞形状，密集接触的最终坐标可能随帧率产生小差异；不把这种随机接触结果当作原版截图的同一帧。首关固定观测布局继续保留。

## 水下代码

`FlowerWater.ts` 和两套 `.effect` 替换整朵置灰、水面透明度常量及整张水面摇摆：

- Up 显示完整彩色花朵，位于水面上方。
- Middle 用独立的上下两份彩色 Sprite，分别在水面前后，应用原 `SpriteHalfMaskSimple` 的互补 alpha 方程；曲线、柔边、倾斜和波动参数取自 HalfSubmergedSimple。
- Bottom 使用完整彩色 Sprite，位于水面下方，由实际水面材质遮罩。
- 水面使用原 `SpriteWaterPlanE` GLSL 算术、原 `DisplacementDetail2` / `Perlin` 贴图及采样设置，包含 UV 流动、扰动、边缘和高光。原 `_Color.a=182/255`、`_WaterAlpha≈.86`，不再叠加旧的 172 UIOpacity。
- 材质所用 SpriteFrame 是私有不可动态合图副本，按实际 UV 基底转换；不修改共享帧。收花时恢复共享帧，使飞行节点不受花池销毁影响。材质、下层副本和私有帧随花池回收。

这里移植的是原 shader 已存在的逻辑，没有添加凭空的反射贴图或新色调。两套原 GLSL 水面 variant 的具体计算已归档。

## 结算 +1：继续追踪奖励类型与生成路径

证据在 `reference/original-win-reward-audit-2026-11-12.json`，含三套 OverUIControl 的完整节点树和字段列表：

- level2 / 842、resources.assets / 20578、resources.assets / 22170 的通关奖励都只有 `reward3/txtGoldNum` 与 `reward3 (1)/txtStarNum` 两栏，没有截图中的第三个合成道具栏。
- `OverUIControl.InitRewardValue`（42816）更新金币 10 与 `curAddStarValue` 星星，未找到通关发合成道具的调用。
- `OverUIControl.ShowView`（42813）、SaveData（42817）、GameMgr.OverGameWin（41054）及其直接业务调用已继续核对，没有据此得出固定通关 +1。
- `PropInfo.number=1` 和 `PropViewControl.AddProp`（42438）属于道具补领流程。现有补领 +1 保留，不能拿它证明通关 +1。

用户已确认第二关截图与解包对应同一版本。因此，不能根据静态 OverUI 的两栏就断言版本差异。截图第三栏是紫色拼块图标，和已导出合成魔杖不相同，之前称它为“合成 +1”不准确。进一步扫描全部应用托管方法中对三种道具存档的显式写入，发现补领、商店、通用奖励、引导和消耗方法，未从该扫描中找到主通关直接发放合成库存的证明；远程五个 Bundle 也已核对，主要为声音、字体及表情资源。奖励的类型、图标来源及生成路径仍待核实。**本轮没有猜测每关 +1、只限第二关 +1、首次通关 +1 等规则，也没有发放虚假的奖励。**

## 验证状态

- TypeScript no-emit 通过。
- 最终 Node 全量回归为 204 项：203 通过、0 失败、1 跳过（缺少平台构建产物）。包含材质飞行生命周期与引擎真实凸分解回归。`git diff --check` 通过。
- 物理测试使用 Creator 3.8.7 自带 `@cocos/box2d` 实际接触求解器和引擎的 PolygonPartition，验证全部 442 个物体/480 个碰撞体、质量、分层、池壁、固定步、暂停及禁用。
- 两套 `.effect` 使用 Creator 应用内的 effect-compiler、实际引擎 offline-mappings/chunk 编译通过；这不等于 GPU 实测通过。
- 新增脚本、材质及贴图已经由当前编辑器生成 `.meta`。首次实际启动发现 `/texture` 子资源未匹配父图片的分包路由，已修复 FlowerAssets 并补回归。
- 用户随后反馈第二关 `Cannot read properties of undefined (reading 'instance')`。原因是仅更新了引擎选项缓存，遗漏实际 `includeModules` 的 `physics-2d-framework` / `physics-2d-box2d`，且当前编辑器仍缓存旧的 `cc` 导出模块。现在源配置包含两项实际模块，回归同时检查勾选值和导出列表。
- 当前会话针对配置重建了生成的 preview `cc` 导出缓存及其 import-map。`tools/refresh-physics-preview.cjs` 保存可复核的操作：仅在配置明确启用且生成模块缺少物理导出时补齐，并将原缓存备份到临时目录；不修改引擎安装、场景、prefab 或 `.meta`。已齐全时只报告，无写入。当前编辑器内存的配置显示值可能尚未刷新，源配置已经保存；如该会话再次生成旧导出，可用此工具复核。
- 排查期间临时响应式页面曾显式接入相同 Creator 的物理 feature unit 用于隔离问题；该覆盖已经移除，最终验证直接使用 **普通 Creator 7456 预览**，不是替代物理或模拟画面。
- 普通预览 `http://127.0.0.1:7456/?previewLevel=2` 已能启动第二关。实际点花后，蓝花与紫花订单计数从 x3 变 x2、进度到 5%，并出现下层上浮与水下分层；复测期间没有新的 error。证据 `validation-images/native-physics-water-2026-11-12/normal-preview-level2-after-taps.png`。
- 响应式检查包含 390×844 第二关、375×667 首关。真实刚体移动时不能用隔几十秒的截图坐标重复点击；首关截图是中间点击状态，不作为通关证明。最终普通预览已恢复运行状态，浏览器视口覆盖已撤销。
- **没有验证平台构建、真机或 GPU 跨设备差异，也没有取得原版运行时每个胶囊的实际接触形状。** 第三栏 +1 的物品名称/用途用户也不清楚，继续保持未确认状态，未擅自增加合成库存。

## 后续稳定性优化

按用户反馈增加了通用碰撞稳定策略，见 [花池持续抖动修复](validation-contact-stability-2026-11-12.md)。受挤时停止额外随机转动，近乎静止的稳定接触组可休眠，邻花移走或明显受力后重新唤醒；这部分是 Cocos 体验优化，不是宣称来自原包的算法。原花朵尺寸、数量、池壁和分层碰撞数据保持不变。

## 生成映射回归的后续修复

此前手补 preview 编号导出与 import-map 的方式，在 Creator 独立重建映射后产生 `__unresolved_16` 启动错误。已替换为引擎完整模块标识，修复工具不再写 import-map；验证见 [预览模块映射启动错误](validation-preview-module-resolution-2026-11-12.md)。本节取代上文旧的缓存修复方式说明。

## 后续修正

本记录之后核实了质心施力、大角度欧拉分解及胶囊多边形内部接缝的问题；当前实现与复现结果以 [原包碰撞与休眠复核](validation-original-contact-rest-2026-11-12.md) 为准。
