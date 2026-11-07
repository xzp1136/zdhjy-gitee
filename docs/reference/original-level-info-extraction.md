# LevelInfo 原始表提取说明

数据文件：`assets/resources/original/data/original-level-info-tables.json`。本文件说明静态提取证据，不把尚未确认的字段解释为游戏规则。

## 来源与方法

- 原文件：用户资源包中的 `expanded/game.wasm`。
- SHA-256：`9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92`。
- 通过 wabt 转成 WAT，静态解析构造方法中的常量、栈变量、对象字段存储及 `List.Add`，未执行 WASM 游戏程序。
- 构造函数索引：`LevelInfoConfig=56135`、`A=56136`、`B=56137`、`C=56138`。
- 元数据类型 `LevelInfo` 的九个字段名与顺序已核对，字段在对象中的偏移为 8、12、16、20、24、28、32、36、40。`i64.store` 同时写入相邻两个 32 位字段时拆分保存。
- JSON 保留全部四分支，包含 WASM/metadata/WAT 哈希、逐行构造来源 `_source` 和逐条校验 `_validation`。引用字段中零指针表示为 `null`；整数值不改写。

## 结果和校验

四个分支均 85 条，关号为 1–85，无重复关号；每条订单索引数组和次数数组等长，时间为正，次数为正整数，范围字段形状均为整数二元组数组。

| 分支 | 与基础表的差异 | 订单引用校验 |
| --- | --- | --- |
| 基础 | 原始基准 | 所有引用可在同名 OrderLevel 表解析 |
| A | 全部字段与基础表相同 | 所有引用可解析 |
| B | 52 关的 `specialObjectNum` 不同，最早为第 2 关 | 第 53–61 关分别有 5301–6101 缺失于对应 B 订单表 |
| C | 61 关不同，最早第 20 关，涉及订单数组、时间、层参数、难度范围等 | 同样有第 53–61 关的 5301–6101 引用未在对应 C 表解析 |

上述未解析引用按原值保留，并写入每条 `_validation.unresolvedOrderIndices`；未擅自套用其他分支。运行时是否存在基础表回退机制仍需检查。

## 前两关原值

所有分支的第 1 关：

- `totalNumber=54`
- `levelOrderIndex=[101,102,103]`
- `levelOrderNum=[1,1,1]`
- `gameTime=180`
- `layerNumber=[[8,10],[3,10],[0,0],[0,0]]`
- `diffRange=null`
- `flowerIntervalRange=[3,9]`
- `specialObjectNum=null`

所有分支第 2 关共同字段：

- `totalNumber=99`
- `levelOrderIndex=[101,102,103,203,201,202,203,206,201,205,202]`
- `levelOrderNum=[3,3,3,3,3,3,3,2,3,2,3]`
- `gameTime=400`
- `layerNumber=[[19,21],[1,2],[35,40],[0,0]]`
- `diffRange=[[35,15],[40,5],[46,5],[51,1],[57,1]]`
- `flowerIntervalRange=[3,5]`

第 2 关仅 B 分支的 `specialObjectNum` 非空：`[[2000,8],[2000,12],[2001,20],[2001,25],[2000,40],[2000,48],[2001,60],[2001,72]]`。其语义与运行时分支选择尚未由本次提取证明。

首关实测为 9 朵，与原表 `totalNumber=54` 不符，应保留新手流程覆盖的可能性。不能直接用此原始字段替换已经确认的首关花数。
