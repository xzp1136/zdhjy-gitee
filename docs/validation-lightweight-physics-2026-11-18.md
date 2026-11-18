# 轻量花朵碰撞（2026-11-18）

历史记录：下文对应第一版，不代表当前验收状态。53 个可见对象的基准使用了回退层配置，不能代表真实第二关（水上 22 / 中层 1 / 水下 39）。最新修正及验证见 [当前记录](validation-local-collision-scheduling-2026-11-18.md)。用户已暂停微信构建，所有下文包目录均为旧产物，不包含当前源码修正。

## 实现

按这次“引擎的物理碰撞太卡，改成简单高性能实现”的要求，`FlowerPhysics` 已改为数值求解器，不创建 `RigidBody2D`、碰撞组件、引擎物理世界或逐花物理节点。现有分帧创建、入场、收集、补位继续通过原接口调用，所有关卡共用。

- 三个可见深度各自使用空间哈希，只检查附近花朵；深层隐藏对象和未入场对象不参与求解。
- 按 30 Hz 固定步长更新，渲染姿态插值；单次更新最多追赶 3 步，每步最多检查 2,048 对候选对象，避免卡顿后无限追赶。
- 同层形状重叠用质量加权的位置修正和法向速度消除处理，不施加碰撞扭矩。边界从原包四面矩形墙的内侧读取。
- 接触时衰减速度，稳定 0.7 秒后休眠；移走邻居、改变深度或缩放时唤醒相关对象。休眠对象不持续受水流推动。
- 缓存每种花的局部形状和每个对象的世界坐标数组。入场缩放只更新数值，不重建引擎碰撞体。
- 项目功能裁剪关闭全部 `physics-2d` 模块。新微信包的引擎代码未包含 `PhysicsSystem2D`、`RigidBody2D` 等物理实现。保留的 WASM 分包用于 Spine。

## 简化边界

沿用原包的形状尺寸、偏移、质量、出生范围及水流参数，但这是新的轻量求解器，不再等同 Unity/Box2D。原包 442 套花朵轮廓共 480 个形状：392 个胶囊、73 个圆直接转换；15 个多边形近似为主轴胶囊。详细点击轮廓、美术素材、花朵数量和界面布局不变。

自由旋转限制为每秒 8 度，接触不产生旋转冲量。极端拥挤时允许跨数帧完成分离，不能保证同一帧解开所有重叠。这些是本次为手机性能所做的明确简化。

## 验证

- Creator 3.8.7 自带 TypeScript：`tsc --noEmit -p tsconfig.json` 通过。
- 完整 Node 回归 232 项全部通过，无跳过。包括全部源轮廓转换、同层/跨层接触、墙边休眠、收集唤醒、缩放数组复用、交叉及重合胶囊、玫瑰/睡莲角落重叠、15/30/60 fps 一致性、长帧预算和生产代码转换。
- Creator 官方后台 CLI 微信正式构建成功。18 项生成代码检查通过，包含新求解器与玫瑰/睡莲回归。此项使用 cc 测试替身，不代表微信设备测试。
- 当前浏览器 393×852 第二关预览：进入关卡，连续收集三朵紫花，订单完成、星星增加为 1、进度为 7%，花池补位正常。自本次刷新起 error 为 0；仍有此前的第 3 关订单组 301 跳过警告。截图：`temp/light-physics-level2-preview-20261118.jpg`。
- 手机实际帧率、低端机长时间运行及微信真机冷启动尚未测量，需要用本次新包验收。

## CPU 对比

`tools/benchmark-flower-physics.cjs` 对相同种子和布局运行 300 帧，前 21 帧缩放，后 240 帧统计稳定阶段。旧代码为 `389805b` 中的 `FlowerPhysics.ts`，使用 Creator 实际 Box2D JS 求解器及测试组件适配器。测量包含 sync/update/pose，不包含渲染、网络或真实 Creator 组件生命周期，不是手机 FPS。

| 场景 | 旧方案稳定 P95 | 新方案稳定 P95 |
| --- | ---: | ---: |
| 总计 102，53 个可见 | 0.923 ms | 0.386 ms |
| 总计 300，53 个可见 | 0.970 ms | 0.384 ms |
| 180 个可见压力场景 | 4.724 ms | 1.379 ms |

单次桌面结果有波动；基准用于比较计算开销，不作手机性能保证。复现：将上述提交中的旧脚本导出为项目外的 `.txt` 文件，再运行 `node tools/benchmark-flower-physics.cjs --baseline /绝对路径/旧脚本.txt`。

## 微信包与 CDN

导入目录：`build/wechatgame-light-physics`。压缩包：`build/ZDHJY-wechatgame-light-physics-20261118.zip`。旧的 `wechatgame-frame-budget`、`wechatgame-optimized-v3` 仍是旧包。

主包 2,864,357 字节（2.73 MiB），本地总包 23,183,863 字节（22.11 MiB），较上一个分帧包减少 413,152 字节。图像压缩保留尺寸和 PNG 透明通道。ZIP 排除 CDN 目录，解压后 1,056 个文件逐个 SHA-256 与导入目录一致。

2,651 个远程文件的路径、字节数和 SHA-256 与已部署的 `v20261117-baefdbd-opt3` 完全一致，复用现有 CDN，没有覆盖上传。额外抽查三个公开 URL 均返回 200 且 SHA-256 匹配。缓存引用检查覆盖 21 个 bundle、1,225 个 native 条目。

本地记录：`temp/light-physics-final-tests-20261118.log`、`temp/light-physics-typecheck.log`、`temp/light-physics-benchmark.json`、`temp/wechat-light-physics-runtime.log`、`temp/wechat-light-physics-audit.json`、`temp/wechat-cdn-plan-light-physics-20261118.json`、`temp/light-physics-cdn-public-check-20261118.json`、`temp/light-physics-zip-check-20261118.json`。
