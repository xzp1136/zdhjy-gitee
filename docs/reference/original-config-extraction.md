# 原版关卡、订单、花种与花束配置提取

## 提取范围

本次检查用户提供的 Unity 运行包后，在 IL2CPP 静态初始化函数中找到了可直接恢复的表。原游戏代码没有被执行，原始运行包没有修改。此前“没有现成 JSON，因此只能本地生成后续关卡”的判断已不充分；现在应区分**已提取的原表**与**仍未还原的运行时选表、随机与教程逻辑**。

原始 `expanded/game.wasm` 的 SHA-256 为 `9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92`。完整源路径和元数据哈希保存在输出 JSON 中。Unity 运行包包含 `global-metadata.dat` version 31。

## 已输出的原始表

- `assets/resources/original/data/original-order-flower-vase-tables.json`：OrderLevelConfig 与 A 各162条，B 与 C 各153条；ItemDataConfig 151条；VaseInfoConfig 119条。
- `assets/resources/original/data/original-level-info-tables.json`：LevelInfoConfig 与 A/B/C，四个分支各85关，由 game_rules 代理同法提取。
- `assets/resources/original/data/win-preview-level1.json`：首关胜利预告的6束原名称、容器映射与布局。花种颜色选择仍包含视觉推定，尤其浅棕笺的向日葵后层，不能当成已解码的预览选种逻辑。

OrderLevelConfig 的 `index` **不是关卡号**；关卡的 `levelOrderIndex` 引用它，再由其 `orderList` 引用 VaseInfoConfig 的 `index`。花束 `orderInfo` 每组最后一个整数表示花数，前面整数是花种类型候选；ItemDataConfig 的 `type` 对应该候选类型。`flowerResIndex` 保存花朵 Sprite 变体索引。

首关三种花的确定映射：

| index | type | 名称 | 原 Sprite 组 |
| --- | --- | --- | --- |
| 401 | 40 | 蓝绣球 | `cdy_lxq_01..03` |
| 701 | 70 | 紫木槿 | `dy_zmj_01..03` |
| 302 | 30 | 金鱼草 | `cdcs_jyc_01..03` |

首关胜利预告的确定容器映射：

| VaseInfo index | 名称 | uiPrefabPath | unlockLevel |
| --- | --- | --- | --- |
| 1401 | 暮云笺 | bkt1_3cdsy_01 | 2 |
| 1501 | 浅梦来信 | bkt1_3dys_01 | 2 |
| 1901 | 小竹兰 | bkt1_3zy_01 | 2 |
| 2001 | 浅绯 | bkt1_3zyj_01 | 2 |
| 2201 | 翠扶摇 | bkt1_3xy_01 | 2 |
| 5201 | 浅棕笺 | bkt2_3zyj3cdtx_01 | 2 |

第二关表中 gameTime=400、totalNumber=99。订单数合计31，其中两单引用206→浅棕笺，包含两组各3花，因此普通三花订单93朵再加6朵，正好99朵。这解释了为什么不能把原表统一转成三花订单。首关表中totalNumber54不是当前运行时分母：InitGameConfig按实际订单逐组累计花数，三单各三花得到9；详见 `runtime-config-behavior.md`。

## 解析方法与复现

WASM 中 Assembly-CSharp.dll 字符串在静态内存地址198872，对应 CodeGenModule 在2283224；其 methodPointers 数组地址3483296、数量3205。元数据方法 token 与 WASM element table 联接后得到如下函数索引：

| 表 | WASM function |
| --- | --- |
| OrderLevelConfig / A / B / C | 56133 / 56139 / 56140 / 56141 |
| ItemDataConfig | 56134 |
| LevelInfoConfig / A / B / C | 56135 / 56136 / 56137 / 56138 |
| VaseInfoConfig | 56142 |

这些初始化函数在首个元数据初始化保护块之后是直线构造代码。解析器模拟本地栈、字段存储、List 添加与 Dictionary 添加；不实例化原游戏运行时。i64.store 拆成两个32位字段，字符串从 metadata literal 池读取，花朵尺寸按IEEE754 float还原。元数据usage不是字符串池裸下标：高位类型为5的编码，其低29位右移1才是literal index。

先用 WABT 生成 WAT，再提取订单、花种、花束表：

```sh
npx --yes --package=wabt wasm2wat '<资源包绝对路径>/expanded/game.wasm' -o /tmp/zdhjy-original.wat
python3 tools/extract_original_tables.py --wat /tmp/zdhjy-original.wat
python3 -m py_compile tools/extract_original_tables.py
```

解析器从项目原 manifest 找到资源包，不需要手工提供 metadata 或静态内存副本。它校验原 wasm 哈希；换一个版本必须重新核实函数索引。该工具只输出原表 JSON，不修改游戏脚本、场景或原素材。

## 验证与边界

四套订单表的每个花束ID都能在119条花束表找到。原表静态构造中返回字典的key与行index逐条一致。LevelInfo的base与A完全相同；B/C第53～61关引用了各自OrderLevelConfigB/C中不存在的5301～6101订单组（具体见LevelInfo输出校验）。后续已恢复原查表分支：缺失时记录错误并跳过该组，不回退base或把ID作为vase。运行时分母按实际成功生成的花数累计，见 `runtime-config-behavior.md`。

尚未恢复：运行时A/B/C选表条件、不同花种随机选择与种子、教程覆写、花池层与出生位置算法、蝴蝶/泡泡完整逻辑、原版每关奖励公式。静态原表的存在不等于上述行为已实现或已与原版一致。

主包24个TextAsset检查结果是Spine atlas/JSON及换行字表；远程资源bundle以音频和字体为主。这个有范围的否定结果不再用来断言“完整配置不存在”。`NumberStringEncoder`邻近的是`LocalStorage`；名字相邻不足以证明关卡表经过压缩。


## 119个花束的几何

`assets/resources/original/data/bouquet-layouts.json` 以字符串花束ID为key，包含原容器底中心原点的`baseLayers`、`flowerSlots`、`foregroundLayers`，共119束、709个挂点。`flower-sprite-metrics.json` 提供445张花头的裁切尺寸、逻辑尺寸与中心偏移。

`flowerSlots`中的`group/index`来自原`VaseItemCtr.orders`的`OrderNodeData`数组与`flowerNodes`指针；`variantIndex`联接原`flowerResIndex`；数组已按原层级绘制顺序排列，另保留`drawOrder`。不能仅用order1/2节点名确定组：9101和9102两束的节点命名与序列化组顺序相反。`width/height`是挂点20×20占位框经scale后的尺寸，动态花朵必须使用PNG尺寸×`scaleX/scaleY`，并把裁切中心偏移乘scale后按angle旋转加到slot中心。

`defaultSprite`只记录原预制体中的占位字符串，部分是不存在的`knx_03`，不能作为实际订单选花依据。初始三束的占位花型也可能与实测教程不同。

复现命令：

```sh
python3 tools/export_bouquet_layouts.py
python3 tools/build_win_preview.py
python3 -m py_compile tools/export_bouquet_layouts.py tools/build_win_preview.py
```

## 进度百分比：已恢复原公式并对上实测

`GameMgr.ReduceFlowerNum`的方法token为836，对应WASM function41051。它先将remaining减去传入花数并截到0，然后计算：

```text
p = (total - remaining) / total
percent = floor(100 * (p + (0.95 - p) * (1.7 * p) * (1 - p)))
```

原代码使用f32运算与f32.floor。显示不是线性进度。`GameUIControl.RefreshFlowerNum`的方法token为1605，对应function42714，接收已计算百分比，用于文字并将进度条设置为percent/100。

| 实测条件 | 原公式结果 | 原版观察 |
| --- | --- | --- |
| 首关total=9，完成1/3/6朵 | 25 / 56 / 77% | 25 / 56 / 77% |
| 第二关total=99，完成3/6/9/12/15/18朵 | 7 / 14 / 21 / 27 / 32 / 37% | 7 / 14 / 21 / 27 / 32 / 37% |

两组数据全吻合。可审计函数片段已保存于`docs/reference/wasm/41051.wat`与`42714.wat`。另存`43424.wat`作为订单完成数更新入口，它调用41052而不是百分比计算。
