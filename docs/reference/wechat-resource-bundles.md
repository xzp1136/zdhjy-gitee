# 微信资源拆分与可复现审计

2026-11-07，在 Cocos Creator 3.8.7 的 asset-db 中完成资源移动和 Bundle 设置。没有文本重写 `.meta`，1,153 个移动文件的 SHA-256、字节数和主资源 UUID 均与迁移前快照一致。7 张 loading 图片保持原路径及场景引用；未参与运行时的原版资源清单归档至 `assets/reference/original/manifest.json`。

## 实际目录与加载路径

- `assets/resources/original/extras/`：仅保留 loading 的 `bgLoad_8`、`btz_11`、`pb_0_6`、`pb_1_7`、`fl_l_9`、`fl_r_4`、`fl_b_10` 共7张 PNG。
- `assets/resources/bundle-routes.json`：1,138 个逻辑资源路径映射，约50.4 KiB。Spine 同名 JSON、atlas、PNG 共用逻辑 stem，所以路由条数小于物理文件数。
- `assets/bundles/<bundle>/original/...`：16 个独立 Bundle，内部保留原 `original/...` 路径。所有游戏脚本仍在 `assets/scripts`；Bundle 中没有脚本。
- `assets/reference/original/manifest.json`：475,176 字节，仅用于提取工具与取证；没有运行时路由或场景引用，不作为资源包配置。
- `assets/scripts/FlowerAssets.ts`：按路由选择 `assetManager.loadBundle(name)`，之后在包内加载原逻辑路径；没有路由的 loading 图片仍用 `resources`。编辑器预览从本地读取 Bundle；微信构建由发布配置决定本地分包或远程目录。

将全部图片继续放在 `resources` 内会强制打入该内置 Bundle，不能只靠修改加载字符串缩小启动包。Creator 对 Bundle 的资源归属和远程输出规则见 [Cocos 3.8 Asset Bundle 文档](https://docs.cocos.com/creator/3.8/manual/zh/asset/bundle.html)。

## 源资源字节数

下表是磁盘源文件、不含 `.meta`，不是构建后的微信上传大小，也不是设备下载耗时。

| Bundle | 模式 | 文件数 | 源字节数 | 内容 |
| --- | --- | ---: | ---: | --- |
| core-data | 本地分包 | 11 | 4,086,643 | 关卡、花束、碰撞轮廓、水波等数据 |
| core-audio | 本地分包 | 47 | 3,489,974 | 原版音频 |
| core-effects | 本地分包 | 79 | 1,567,987 | 7套 Spine、55帧水波、2个字体与字符覆盖表 |
| core-level1 | 本地分包 | 44 | 3,139,966 | 首关花种全部变体、3个花篮、首关6张结果预告所用图层 |
| core-ui-01 | 本地分包 | 60 | 3,294,819 | 首页、HUD、弹窗、需求图片等 |
| core-ui-02 | 本地分包 | 34 | 3,702,997 | 同上 |
| flowers-01 | 远程 | 83 | 4,138,715 | 其余花种，同种变体同包 |
| flowers-02 | 远程 | 81 | 4,109,041 | 同上 |
| flowers-03 | 远程 | 83 | 4,106,104 | 同上 |
| flowers-04 | 远程 | 84 | 4,107,271 | 同上 |
| flowers-05 | 远程 | 84 | 4,138,282 | 同上 |
| vases-01 | 远程 | 55 | 3,636,529 | 其余容器，容器与前景 mask 同包 |
| vases-02 | 远程 | 52 | 3,638,257 | 同上 |
| vases-03 | 远程 | 57 | 3,638,230 | 同上 |
| reference-01 | 远程 | 149 | 3,964,283 | 暂未被当前界面引用的原版素材 |
| reference-02 | 远程 | 149 | 3,964,290 | 同上 |

本地 Bundle 合计 **18.389 MiB**，远程 Bundle 合计 **37.614 MiB**。7张启动图 **1.789 MiB**；加路由清单后，运行时本地源资源合计 **20.227 MiB**。这个数字尚不含引擎、脚本、序列化元数据和构建转换产生的差异。首关不需要 CDN，但本地分包首次也需要微信下载，不能把“使用本地分包”当成已经实现秒进。

## 配置与发布边界

可复现配置是 `build-configs/wechatgame.json`：

- `packages.wechatgame.appid = wx3ef66f850d873a67`，竖屏。
- `startSceneAssetBundle = true`，起始场景 `FlowerGame.scene`。
- `nativeCodeBundleMode = wasm`、`wasmSubpackage = true`、`separateEngine = false`。
- `server = https://game2cdn.chujinggamefun.com/zdhjy/wechat/v0001/`。

配置结构依据本机 Creator 3.8.7 安装包的 `modules/platform-extensions/extensions/wechatgame/@types/index.d.ts`、`builtin/builder/@types/public/options.d.ts` 和 `protected/bundle-config.d.ts`，并已通过运行中编辑器 `builder.check-and-complete-options` 校验。后续构建和发布入口见 [微信构建与 CDN 工具](wechat-build-and-cdn.md)。

当前编辑器新建微信任务的默认 AppID 也已通过 `Editor.Profile.setConfig('wechatgame', 'builder.options.wechatgame.appid', 'wx3ef66f850d873a67', 'local')` 保存；`getConfig` 的有效值和 local 值均读回为该 AppID，未改全局偏好。这里必须使用 local preferences：该平台生成任务读取 `getConfig`，单独写 `setProject` 不会覆盖官方默认值。跨机器复现以纳入版本管理的 `build-configs/wechatgame.json` 为准。

`settings/v2/packages/builder.json` 使用两个自定义 preset：`zdhjy-local` 在 `miniGame` 中选择 `{isRemote:false, compressionType:'subpackage'}`，`zdhjy-remote` 选择 `{isRemote:true, compressionType:'merge_dep'}`。两者的 `native/web` 都按本地 `merge_dep` 设置，便于浏览器预览和本地 Web 构建。16个 Bundle 根目录的 `isBundle`、`bundleName`、`priority:6`、`bundleConfigID` 都经 asset-db 写入并读回。

远程输出保持 `remote/<bundle>/...` 子树上传到隔离前缀 `zdhjy/wechat/v0001/`。server 不再追加 `remote`：本机引擎 `cocos/asset/asset-manager/downloader.ts:105` 明确由加载器拼接 `remote/${bundleName}`。项目不含 CDN 密钥；沿用已存在的域名，发布前仍需在对应小游戏后台确认下载域名允许该 HTTPS 域名。

2026-11-07 查阅的 [Cocos 官方微信分包说明](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/subpackage.html) 标明主包上限4M、分包总量上限30M，单分包没有单独大小限制；这不是微信小程序的2M限制。其所链接的 [微信小游戏分包原文](https://developers.weixin.qq.com/minigame/dev/guide/base-ability/subPackage/useSubPackage.html) 本次浏览工具无法直接打开，因此不声称已独立读取微信原页。最终以当前微信开发者工具对实际输出的校验为准。`tools/build-wechat.cjs --audit` 按4 MiB/30 MiB检查未压缩输出，排除 `remote/`；源资源表本身不证明包体合格。

## 验证与复查

```sh
node tools/audit-resource-bundles.cjs
node tools/audit-spine-imports.cjs
node tools/build-wechat.cjs --check
node --test tests/*.test.cjs
```

`docs/reference/bundle-migration-plan.json` 保存每个移动文件的原路径、目标路径、UUID、源字节数和 SHA-256。审计脚本只读文件，检查目标完整性、旧路径已移走、路由归属、Bundle preset 和启动图是否存在；它不会移动或重新导出资源。

本次完成的验证：

- 1,153 个移动文件字节/哈希/UUID一致；1,138 条路由和16个 Bundle 配置通过。
- MCP 回读16个 Bundle 均 `imported:true`、`invalid:false`。
- 迁移后全套 **120/120** 测试及 TypeScript 检查通过。
- 首屏到首关实际预加载依赖验证均为本地，包含字体、音频、水波、Spine、暂停/失败/续时、3个初始花篮和6个通关预告花束；首关点击流程没有新增冷加载依赖。
- 微信构建参数校验通过。实际构建包体、CDN上传结果及微信设备冷启动时间须分别记录，不能由这些静态检查推断。

后续最终构建已完成：主包3,995,705字节，本地主包与分包合计21,398,437字节，远程输出40,312,368字节，按本工具4 MiB / 30 MiB阈值通过。远程输出2,651文件已上传，每个远程包的 config/import/native 代表资源共30项HTTP与SHA-256抽样全部通过。以上为生成产物统计，与前述源文件字节数不同；[构建与CDN记录](wechat-build-and-cdn.md)保留详细测量口径。微信设备冷启动耗时仍未测量。

### Spine 导入依赖修复

首轮构建后检查到迁移顺序问题：7个 Spine JSON 比对应 PNG 先到新目录，导入器当时留下纹理缺失日志，且生成的 `SkeletonData.textures/textureNames` 实际为空。普通资源哈希与 `invalid:false` 不能证明这种导入依赖完整；首轮构建不能作为最终发布产物。

在全部 PNG/atlas 到位后，经官方 asset-db `reimport-asset` 重导7个 JSON。`tools/audit-spine-imports.cjs` 随后逐个核验生成的 library：SkeletonData 的 atlasText 与源 atlas 相同、textureNames 与 textures 均存在，asset-db 依赖包含正确 Texture2D UUID，Texture2D mipmap 指向同目录原 PNG，且其导入后的 library PNG 存在。7/7通过，原 UUID 不变，源文件字节审计再次通过。旧日志保留；最终构建须在此修复及500毫秒插屏配置之后执行。
