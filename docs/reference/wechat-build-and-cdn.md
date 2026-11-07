# 微信构建与 CDN 工具

工具复用已经打开 ZDHJY 的 Creator 3.8.7，不启动第二个编辑器。2026-11-07 已完成最终微信构建、远程资源上传及 HTTP 抽样核验；结果见文末。微信开发者工具上传校验和设备启动测速仍未执行。

```sh
node tools/build-wechat.cjs --check
node tools/build-wechat.cjs --build
node tools/build-wechat.cjs --status <taskId>
node tools/build-wechat.cjs --audit build/wechatgame
```

`--check` 读取 `build-configs/wechatgame.json`，通过运行中编辑器的 `builder.check-and-complete-options` 验证并补齐参数。`--build` 在队列空闲时调用 `Editor.Message.request('builder', 'add-task', options, false)`，传独立 `taskId`，随后用 `query-task` 跟踪结果。此接口已从本机官方安装包 `builtin/builder/dist/browser/index` 与 `tasks` 核实：返回1表示入队，不表示构建成功；终态以任务的 `success/failure/cancel` 为准。

成功后按实际生成文件审计主包≤4 MiB、本地主包与分包总量≤30 MiB，并写 `temp/wechat-package-audit.json`。审计先确认生成的 `project.config.json` 明确包含 `packOptions.ignore: [{"type":"folder","value":"remote"}]`、`include` 为空且 `setting.urlCheck=true`；缺少这些配置会失败，不能仅在计算中假设远程目录被排除。分类读取生成的 `game.json` 分包根目录，排除 `remote/`，保守计入其余本地文件；这不是微信开发者工具最终上传压缩大小的测量，上传校验仍以微信工具为准。

该配置写在 `build-templates/wechatgame/project.config.json`，从编辑器或脚本构建均通过官方模板融合机制应用，不依赖手工修改上一次输出。[Cocos 3.8 官方模板文档](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/custom-project-build-template.html)明确支持微信 `project.config.json` 的JSON融合；微信官方示例也使用 `packOptions.ignore` 的 `type: "folder"` / `value` 结构：[wechat-miniprogram/ai-mode-demo](https://github.com/wechat-miniprogram/ai-mode-demo/blob/master/project.config.json)。微信文档站本次无法直接访问，因此以官方示例与本机Creator的模板处理链交叉核对。模板不覆盖构建生成的AppID、包名或分包配置。

本机官方微信插件支持 `packages.wechatgame.wasmSubpackage`；当该项为 true、`separateEngine` 为 false 时设置 `WASM_SUBPACKAGE`。`server` 是可选字段，插件只给非空地址补末尾斜杠。当前使用已存在的真实 CDN 域名，不使用示例地址。

已通过 `Editor.Profile.setProject('engine', 'modules', …)` 移除当前脚本与场景均未引用的 dragon-bones、tiled-map、particle-2d、physics-2d-box2d、video、webview、profiler。保留 Spine 3.8、2D、UI、图形/遮罩、音频、tween、animation、渲染后端等15项。读取 `engine.query-engine-modules-profile` 已确认生效；最终代码体积与功能仍需实际构建验收。

CDN沿用 NLBGW 的公开目的地：`https://game2cdn.chujinggamefun.com/`，OSS bucket `yaocheng-2`，endpoint `oss-cn-shenzhen.aliyuncs.com`。此游戏使用独立 `zdhjy/wechat/v0001/` 前缀，构建的 server 设为 `https://game2cdn.chujinggamefun.com/zdhjy/wechat/v0001/`。生成目录 `remote/<bundle>/…` 对应 OSS `zdhjy/wechat/v0001/remote/<bundle>/…`。

```sh
# 最终构建完成后先生成只读快照；不联网、不读凭据。
node tools/upload-wechat-cdn.cjs --plan
# 仅在确认上传该最终产物时执行。
node tools/upload-wechat-cdn.cjs --upload
```

上传计划保存在忽略提交的 `temp/wechat-cdn-plan.json`。上传前核对生成 settings 的 server、完整远程文件列表及 SHA-256；生成计划后改过构建文件会拒绝上传，必须重建计划。开始PUT前，先对新前缀执行只读OSS列表检查（最多返回1个对象）；已有任何对象或不能核实为空均拒绝上传。脚本不删除任何远程对象，也不会访问旧 `ndll/` 命名空间。后续发新版应先换新的版本前缀，避免不可变缓存复用同一路径；部分上传失败也不能直接覆盖同前缀。

密钥只在 `--upload` 时从相邻 `../NLBGW/.env` 读取；也可用 `ZDHJY_CDN_ENV_FILE` 指定凭据源。不会把密钥复制进本工程、写入计划或输出日志。NLBGW文件保持原样。上传目标按本项目域名、bucket及 `zdhjy/` 路径校验；上传失败日志仅含状态码与资源相对路径。

## 本次最终结果

最终任务 `zdhjy-wechat-1794063852095-dec7ea` 构建成功。此任务在7套 Spine 导入依赖修复之后执行，构建的 `project.config.json` 已确认排除 `remote` 文件夹，AppID 为 `wx3ef66f850d873a67`，`urlCheck=true`。`temp/wechat-package-audit.json` 的实际输出统计为：

| 范围 | 实际输出字节 | MiB |
| --- | ---: | ---: |
| 主包 | 3,995,705 | 3.811 |
| 主包与本地分包合计 | 21,398,437 | 20.407 |
| 远程目录 | 40,312,368 | 38.445 |

按本工具4 MiB / 30 MiB门槛通过，主包余量198,599字节。该报告统计未压缩生成文件并保守计入本地配置，不是微信开发者工具实际上传压缩大小。源资源统计和输出统计不可混用：例如本地 `core-data` 的源JSON为4,086,643字节，构建输出为1,754,024字节；构建会压缩序列化JSON并新增依赖/引擎等文件。完整源资源明细见 [资源拆分说明](wechat-resource-bundles.md)。

远程目录 **2,651个文件、40,312,368字节** 已上传到 `https://game2cdn.chujinggamefun.com/zdhjy/wechat/v0001/remote/`。随后对全部10个远程 Bundle 各抽取 config、import JSON、native PNG，共30个URL执行真实 GET；**30/30 HTTP 200、字节数及SHA-256匹配**，未出现失败。报告为 `temp/wechat-cdn-verification.json`，上传快照为 `temp/wechat-cdn-plan.json`。这覆盖每包代表资源，不能表述成全部2,651个对象都已逐一HTTP下载校验，也不代替微信后台下载域名配置或设备网络验证。

项目/构建输入保留500毫秒的正常插屏设置，但微信最终产物由 `first-screen.js` 承接引擎加载阶段、生成 settings 的内部插屏时间为0；没有确认首屏实际显示500毫秒。详见 [启动插屏核验](cocos-startup-splash.md)。
