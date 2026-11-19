# 预览模块映射启动错误

用户反馈黑屏，浏览器报 `Unable to resolve bare specifier '__unresolved_16'`，来源为预览生成的 `cc` 导出模块。

## 原因

此前为了补入 Box2D，手动更新了生成模块及项目 import-map。Creator 后续重建 import-map，恢复为原来的 16 项编号映射，而导出模块仍引用额外的编号。这是先前缓存修复方式造成的启动回归；防抖策略本身没有执行到。

## 本次修复

`tools/refresh-physics-preview.cjs` 已替换：

- 从当前项目的 `includeModules` 和当前 Creator 引擎的 `cc.config.json` 展开真实 feature unit。
- 对生成的 preview `cc` 模块使用引擎 import-map 已提供的完整 `cce:/internal/x/cc-fu/...` 标识，不再新增 `__unresolved_N` 编号。
- 不改项目 import-map。它由 Creator 生成/覆盖时，不会再次丢掉手补编号。
- 检查所有 unit 是否存在；配置缺少物理模块或不认识 feature 时，在写文件前停止。原生成模块写入前备份；内容已正确时不重复写。

项目源配置已确认 `physics-2d` 启用、后端为 `physics-2d-box2d`，`includeModules` 包含 Box2D 与 framework。原生窗口自动化定位到了另一个空启动实例，已停止该窗口操作，没有点击“打开项目”。不宣称已在用户截图中的项目设置面板完成操作；实际核对的是工程配置文件和普通预览。

## 验证

- 新增回归：不完整编号映射仍可修复；Creator 编号 scope 再次生成后，连续三次新启动解析仍成立；禁用/未知配置不破坏生成文件；重复运行幂等。
- 全量 Node 210 项：209 通过、0 失败、1 跳过。TypeScript no-emit、`git diff --check` 通过。
- 当前真实项目的 import-map 中仍没有 `__unresolved_16`；修复后的模块直接使用引擎完整标识，普通 `7456/?previewLevel=2` 已能加载第二关。没有使用临时代理页代替普通预览。
- 继续在同一浏览器页面刷新启动验证。记录的是当前工程、当前 Creator 会话的结果，不代表微信构建/真机验收。
