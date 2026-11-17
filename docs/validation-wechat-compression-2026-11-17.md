# 微信构建包压缩记录（2026-11-17）

基于合并同事素材后的 `baefdbd` 构建。源素材、场景、尺寸、布局、碰撞与玩法不变；仅优化构建产物的图片编码。

| 未压缩的文件字节数 | 优化前 | 优化后 |
| --- | ---: | ---: |
| 主包 | 4,184,666 | 3,272,805 |
| 主包 + 本地分包 | 29,099,787 | 23,592,311 |
| 独立远程资源（不计入上传包） | 35,328,475 | 27,403,839 |

主包 3.12 MiB，本地总包 22.50 MiB。主包下降 21.8%，本地总包下降 18.9%。这不是 ZIP 大小；审计保守地按排除 `remote/` 后的全部文件原始字节计算，并校验 `project.config.json` 的忽略规则和 `urlCheck=true`。

## 处理方法

- PNG 优先无损重编码，或对颜色量化；每张 PNG 的透明通道逐字节保持，尺寸不变，可见颜色 PSNR 至少 42 dB。
- 两张 JPG 背景使用 mozjpeg 重编码，尺寸不变，PSNR 至少 36 dB。
- 无法达到质量门槛、或节省不足 2% 的图片保留原文件。共检查 1,167 张，优化 927 张（925 PNG、2 JPG）。
- 音频、字体、引擎和游戏逻辑不压缩改写；只更新资源版本及相应加载引用。
- 更新纹理 MD5、bundle native versions、bundle config/script 版本、settings、application、import-map、game.js；微信远程 bundle 的本地 `src/bundle-scripts/` 脚本同步更名。
- 新远程版本隔离在 `https://game2cdn.chujinggamefun.com/zdhjy/wechat/v20261117-baefdbd-opt3/`，已上传并通过 30 个线上样本校验。旧远程包不能与此包混用。

## 复现

先正常构建微信包，再对构建输出制作单独副本。脚本拒绝覆盖输入、已有输出或含符号链接的目录。

```sh
npm install --prefix /tmp/zdhjy-image-opt --ignore-scripts --no-audit --no-fund sharp@0.35.5
ZDHJY_SHARP_MODULE=/tmp/zdhjy-image-opt/node_modules/sharp \
  node tools/optimize-wechat-package.cjs build/wechatgame build/wechatgame-optimized-new \
  https://game2cdn.chujinggamefun.com/zdhjy/wechat/NEW-UNUSED-VERSION/
node tools/check-wechat-runtime.cjs build/wechatgame-optimized-new
ZDHJY_SHARP_MODULE=/tmp/zdhjy-image-opt/node_modules/sharp node --test tests/*.cjs
```

`sharp` 是构建工具依赖，未加入小游戏运行依赖。本次安装只在临时目录，项目依赖未变。以后重新用 Creator 构建会重新生成原编码，需再运行优化脚本。

## 验证与交付

- 216 项回归测试通过，无跳过；含真实 PNG 压缩、透明通道、远程脚本更名、字体子目录和缓存引用的回归测试。
- 优化包的 16 项实际生成代码检查通过，含真实 Box2D 求解器；其他 cc 接口使用测试替身，不代表微信真机或开发者工具验证。
- 独立重读 927 张输出图，全部尺寸相同；925 张 PNG 透明通道完全一致，质量门槛全部通过。
- 21 个 bundle、1,225 个 native 版本引用均存在。原尺寸裁片对照启动背景与水池，未见明显异常。
- 导入目录：`build/wechatgame-optimized-v3`。本地 ZIP：`build/ZDHJY-wechatgame-optimized-20261117.zip`，排除 remote；远程 ZIP：`build/ZDHJY-remote-assets-optimized-20261117.zip`。
- ZIP 解压后逐文件 SHA-256 对照构建目录；清单见 `build/wechat-optimized-artifacts-20261117.json`。
- 配套 remote 已部署到上述新版本 CDN；仍需在微信后台配置相应合法域名，并完成第二关流程、微信上传和真机验收。

本地报告：`build/wechatgame-optimized-v3.optimization.json`、`temp/wechat-image-qa-20261117.json`、`temp/wechat-runtime-check-optimized-20261117.json`、`temp/wechat-tests-optimized-20261117.log`。

## CDN 补齐与输入排查

用户提供外部凭据文件后，已在 2026-11-17 上传优化版全部 2,651 个远程文件（27,403,839 字节）；未复制或提交凭据。报告为 `temp/wechat-cdn-upload-optimized-20261117.json`。公开 GET 抽样覆盖 10 个 bundle 的 30 个配置/导入数据/PNG，全部 HTTP 200 且长度与 SHA-256 匹配，见 `temp/wechat-cdn-verification-optimized-20261117.json`。

随后排查开发者工具中全部控件无响应：主页 ready=true、busy=false，开始按钮 active/interactable/enabled，未发现活动 BlockInputEvents 遮罩；临时探针未收到用户点击的触摸回调。仅在本地 project.private.config.json 中将 useApiHook 从 true 设为 false 作对照，未修改游戏源码。工具重启前未验证改善，不能认定该选项是根因。用户关闭并重新打开开发者工具后确认点击恢复；临时探针随旧运行时退出消失。第二关完整流程、真机与正式上传验收尚未完成，不应据此认定已具备正式发布条件。
