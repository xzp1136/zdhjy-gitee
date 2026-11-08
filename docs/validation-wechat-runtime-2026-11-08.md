# 微信端运行观察与字体修复

验证对象：Cocos Creator 3.8.7、AppID `wx3ef66f850d873a67`、微信开发者工具 Stable `2.02.2608060`、基础库 `3.17.6`。以下时间均为北京时间，构建与校验 JSON 中的时间戳为 UTC。

**状态：已登录并完成部分原生运行观察；新字体修复已构建，通过自动检查，但尚未完成微信端复测。19:03 用户反馈已定位一批资源下载失败：后台截图与开发者工具当前生效的下载域名列表不一致。** 此记录补充[11 月 7 日启动与分包记录](validation-startup-wechat-2026-11-07.md)，当前构建摘要见 [wechat-v0001.json](releases/wechat-v0001.json)。

## 已观察到的微信端行为

- 已使用登录后的开发者工具导入 `build/wechatgame/`，导入页核实正式 AppID，选择不使用云服务。生成配置保留 `urlCheck:true`；未关闭域名校验、未开启安全服务端口。
- 初次运行曾因基础库下载发生 `ECONNRESET` 而停留黑屏。工具日志显示 00:08:55 下载成功、00:08:56 校验及准备完成；这次基础库下载中断随后恢复，不能据此认定游戏资源加载失败。
- 旧构建 `zdhjy-wechat-1794066785129-067554`（源码提交 `32cdecb`）在模拟器实际经过原版 loading、首页并进入第一关；可见 9 朵花、水波与引导。
- 第一关自然超时后出现继续弹窗。点击右侧带视频标识的绿色继续按钮后，弹窗关闭、游戏继续倒计时，未进入广告画面。本次未准确记录点击前后金币和完整计时变化，因此不将这次观察记为“精确增加 120 秒且不扣币”通过。
- 该旧构建存在原生字体过小问题。控制台还曾显示 30 条错误、38 条警告，尚未逐条展开定位；不得将本次部分可玩观察写成“无运行错误”。

这些观察来自开发者工具模拟器，不是真机结果。原生首次点击进入关卡的耗时没有准确测量；此前 Chrome 的 31 ms 仅代表那次浏览器测量。

本地观察截图保留于 `temp/wechat-home-font-before.jpg`、`temp/wechat-timeout-before.jpg`。`temp/` 为本机验证材料目录，不随 Git 发布。

## 字体过小的原因与修复

原包的两个 TTF 文件本身未被缩放或替换。微信开发者工具的 `wx.loadFont` 返回字体内部 family 名称；其中正文名称包含标点及 `2.0 65 Medium`，标题名称包含反斜杠和控制字符。Cocos 将这些名称直接拼入 Canvas 的 `font` 简写，未加引号的字符串不能正确解析。

原生控制台读取某关卡标签时，标签字号为 28、实际栅格字号为 43.68，但 Canvas 实际保留 `10px sans-serif`。独立原生 Canvas 对照也确认：先设 `30px sans-serif`，再设置未加引号的 `46px <family>`，Canvas 仍保留 30px；给 family 加引号后，Canvas 接受 46px。这确认了字号异常的原因和修复方向，尚不代表完整新游戏画面已复测通过。

`assets/scripts/FlowerUI.ts` 现在仅在微信平台预加载字体时，将原生 family 包在双引号中，并按 CSS 规则转义双引号、反斜杠及控制字符；用 WeakSet 避免共享字体和重试时重复处理。字体资源、原字号和场景缩放保持不变。

新增 4 项回归覆盖原始 TTF family、特殊字符、空值、普通 family、非微信平台及共享资源/失败重试的幂等性。开发者工具已监测到新产物并触发编译，但尚未完成新界面视觉复测：此前电脑锁屏，随后本轮原生 UI 自动化工具不可用。这不再是账号未登录问题。

开发者工具日志 `WeappLog/logs/2026-11-08-00-00-38-801.log` 第 24088 行记录 02:31:01 检测到 `assets/start-scene/index.2d348.js`，第 35938 行记录 02:31:06 检测到 `src/chunks/bundle.a192c.js`；02:31:19–02:31:30 有分包 CompileCache 记录。这些仅证明文件检测与编译活动，不能当作画面或交互验收。

## 当前构建及自动检查

当前任务：`zdhjy-wechat-1794076222812-35129a`，测量时间 **2026-11-08 02:31:10**。产物目录：`build/wechatgame/`。它替代 `067554` 本地构建。

| 项目 | 字节 | 结果或范围 |
| --- | ---: | --- |
| 主包 | 3,995,995 | 低于审计阈值 4 MiB |
| 全部本地包（含主包） | 21,398,727 | 低于审计阈值 30 MiB |
| 远程资源 | 40,312,368 | 2,651 个文件，已排除在本地打包范围外 |

以上为未压缩输出文件字节，含本地配置文件；6 个内容分包之外另有 2 个 Creator Wasm 支持分包。包体审计通过不等于微信运行验收完成。

| 检查 | 结果 | 本地报告 |
| --- | --- | --- |
| 源码回归 `node --test tests/flower-*.cjs tests/wechat-*.cjs` | 151/151 通过 | `temp/wechat-font-fix-tests.txt` |
| 实际压缩产物 `node tools/check-wechat-runtime.cjs build/wechatgame` | 12/12 通过 | `temp/wechat-font-fix-emitted.json` |
| 构建字体与压缩模块专项 | 2 个实际构建 TTF 的 family 转义、重复预加载、46 号字体引用检查通过 | `temp/wechat-font-fix-built-fonts.json` |
| TypeScript diagnostics | 0 错误 | `temp/wechat-font-fix-scene-validation.json` |
| Funplay `validate_scene` | `ok:false`，保留累计历史错误与日志关键词匹配 | 同上 |
| 包体审计 | 通过 | `temp/wechat-package-audit.json` |

最终产物回归执行 `assets/start-scene/index.2d348.js`，SHA-256 为 `4ccf96ede8506300bbf3db02c8fbcddfb0aca7f969ce7ad7e2f11e28e2dfeb83`；共享 chunk `src/chunks/bundle.a192c.js` 的 SHA-256 为 `1670620bed659bc79cc6606cf3b6d1a0a3639549434a0ec461eb2441ffc95d56`。这些回归使用 `cc` 测试替身，不执行原生渲染、字体加载或微信网络请求。字体构建阶段保存的 Creator 场景报告记录 `paused:false`、`timeScale:1`，这不是当前微信运行态；本轮恢复检查时，Creator 已切到未命名的 `scene-2d`。未清空历史日志。

构建字体专项读取实际构建出的两个 TTF 的 name records，再执行当前压缩 `FlowerUI` 模块；确认 family 已加引号并正确转义、重复预加载不再加引号或重载字体，以及覆盖范围内的 46 号标签使用修补后的 Font 资源。报告 `passed:true`，执行脚本哈希与上述产物回归一致。该检查仍使用 `cc` 测试替身，没有调用 `wx.loadFont` 或渲染像素，因此不能替代原生视觉复测。

## CDN 沿用 v0001

CDN 地址仍为 `https://game2cdn.chujinggamefun.com/zdhjy/wechat/v0001/`。本次字体修复不改变远程资源：全部 **2,651** 个文件的路径、字节长度、SHA-256 与已上传清单完全一致，见 `temp/wechat-font-fix-cdn-comparison.json`，因此未重传、未覆盖、未更换前缀。

活动上传计划仅重新生成，settings SHA-256 更新为 `0042eb251c8cbb800ee1871c63b7218055cebb5ee02339e65540d78be57cc622`。最初上传快照的 settings SHA-256 为 `52f0ecbb2aa1b73aaa23a22d6a6f9b20422623619c2b2d6cbbcd15ad8e1dc6ef`；settings 改变并不意味着远程文件发生改变。

此前公开 CDN GET 抽查仍对应相同远程字节：**30/30 通过**，覆盖 10 个 Bundle 各 1 个 config、1 个 import JSON、1 张 PNG，共 700,892 字节，均为 HTTP 200 且长度与 SHA-256 一致。没有对全部 2,651 个远程文件逐一做公开 GET；公开访问成功也不证明该 AppID 的微信下载域名白名单已生效。

11 月 8 日 **18:59:47** 再次执行公开 CDN GET 抽查，仍为 **30/30 通过**，类型与此前相同，见 `temp/wechat-cdn-feedback-verification.json`。这不替代微信 `downloadFile` 域名校验。

## 较早的本机联网阻塞

11 月 8 日 **18:25–18:26** 重新打开项目时，开发者工具持久日志记录连接 `127.0.0.1:7892` 被拒绝（`ECONNREFUSED`）。只读检查 `scutil --proxy` 显示系统 HTTP、HTTPS、SOCKS 代理均启用该地址，而 `lsof` 未发现该端口监听进程。这是当时开发者工具联网的阻塞证据，不代表当前代理状态；本轮没有修改全局代理配置，也没有把它解释为需要重新登录账号。

日志证据位于当前开发者工具用户配置目录内的 `WeappLog/logs/2026-11-08-03-47-05-778.log`，第 19、138、352、639 行分别记录 18:25:23、18:25:26、18:25:38、18:26:50 的代理连接拒绝。

这批错误与午夜模拟器中的 30 条控制台错误时间不同，目前没有证据证明二者同因。11 月 8 日 WeappLog 与 Editor 持久日志中未找到可据以定位那 30 条错误的游戏/远程加载记录，不能将未落盘当作没有错误。

## 用户反馈：后台与工具生效域名列表不一致

用户提供 **19:03:21** 的报错：`downloadFile:fail createDownloadTask:fail url not in domain list`。失败请求是 `flowers-02`、`flowers-03`、`flowers-04`、`flowers-05` 的 config，均位于 `https://game2cdn.chujinggamefun.com`；开发者工具当时展示的 `downloadFile` 列表却只有 `https://tcb-api.tencentcloudapi.com`。

用户随后提供的后台截图中，`request`、`uploadFile`、`downloadFile` 三行均已有 `https://game2cdn.chujinggamefun.com`，但截图没有显示 AppID。因此准确结论是**该后台截图与开发者工具当前生效列表不一致**，不能继续判断为“后台没有配置 CDN 域名”。本地已复核 `build-configs/wechatgame.json` 与 `build/wechatgame/project.config.json` 的 AppID 均为 `wx3ef66f850d873a67`；private config 没有覆盖 AppID，`urlCheck:true` 保持开启。

下一步先确认截图对应后台的 AppID 也是 `wx3ef66f850d873a67`，再在开发者工具的“详情 → 域名信息”刷新项目配置并重新编译，重测第二关远程资源。没有执行后台修改，也没有通过关闭域名校验绕过问题。用户日志中的“目录已存在”警告尚未认定为阻断项；没有清理缓存或存档。

这批下载红字已由具体错误定位至域名列表校验，但不能据此将此前所有 30 条错误归为同因。字体显示、第二关完整加载和其余免广告奖励仍待原生复测；后台截图与公开 GET 成功均不代表微信验收通过。

## 尚需完成的原生验收

1. 在开发者工具重新编译当前 `35129a` 构建，复核 loading、首页、关卡与弹窗的原字体大小及位置。
2. 完成上述后台 AppID 与工具域名列表同步核对，并继续定位此前其余控制台错误；已识别的 19:03 下载错误不能代替全部错误排查。
3. 完成第一关并进入第二关，核实远程 Bundle 下载、合法域名校验与缓存复用；目前没有第二关原生运行通过的结论。
4. 记录已预加载状态下首次点击关卡的实际耗时；冷启动、冷网络及手机端速度另行测量，不能承诺下载阶段“秒开”。
5. 验证花束位视频解锁、超时免费增加 120 秒且金币不变、道具耗尽领取 1 次且不自动使用。现有源码/浏览器测试提供支持，原生完整交互仍待复测。

本记录没有将开发者工具预览二维码的生成记为正式版本上传或发布。
