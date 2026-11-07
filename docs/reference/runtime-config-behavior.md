# 原版配置查表、实际花数与初始订单槽

本说明继续使用用户提供的原 `game.wasm`（SHA-256 `9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92`）。证据为静态反汇编，不是执行原游戏后读取内存。本次只读分析并新增说明与WAT片段，没有修改Cocos脚本。

## B/C 第53～61关缺失订单组：错误日志并跳过

`GameMgr.InitGameConfig`，Assembly-CSharp方法token814，对应WASM function **41027**。相关代码见 `wasm/41027.wat` 第275～352行：

1. 从选定关卡的 `levelOrderIndex` 按次序取订单组ID。
2. 对**当前 `OrderLevelConfig.orderLevelData`**调用 `TryGetValue`（共享泛型方法function34286）。
3. 查找失败时格式化原始字符串 **“配置OrderLevelConfig表不存在{0}”**，调用日志函数，然后跳出本组处理块，继续下一组。
4. 查找成功后才取 `orderList`、过滤解锁花束、构建实际订单。

等价伪代码：

```text
for each groupId in levelInfo.levelOrderIndex:
    if !currentOrderTable.TryGetValue(groupId, out group):
        Log("配置OrderLevelConfig表不存在{0}", groupId)
        continue
    ... build this group's vase orders ...
```

该失败分支**没有读回基础表，没有按花束ID直接查询，也没有将5301改写成其它编号**。因此适配可遵循原版“显式警告并跳过该组”，不应自行合并基础表并称其为原版回退。

静态数据中B/C第53～61关引用的5301、5401、5501、5601、5701、5801、5901、6001、6101，不在各自B/C订单组字典中。基础表/A保留这些组。这个差异仍是原始表事实；跳过不是修复表数据。

## 选B/C时确实同时替换关卡表与订单组表

`StartUIControl.ChangeConfigB`（token2373，function **43070**）的指令明确赋值：

```text
LevelInfoConfig.levelInfo = LevelInfoConfigB.levelInfo
OrderLevelConfig.orderLevelData = OrderLevelConfigB.orderLevelData
Constant.ConfigA = false
```

`ChangeConfigC`（token2374，function **43071**）同理切换C；`ChangeConfigA`（token2372，function **43069**）切换A。完整函数均保存于本目录 `wasm/`。

这不仅是调试按钮代码：`ReportManager.ConvertReportControllerData`（token2819，function **43890**）也有同时替换B或C两张表的普通数据处理分支，见第515～631行（B）与758～878行（C）。该分支尚未还原服务端数据、分组与版本的全部判定，不能凭静态代码断言当前用户一定选哪一套。

核对的元数据usage地址：

| 静态地址 | 对应类型 |
| --- | --- |
| 3359688 / 3359692 / 3359696 / 3359700 | LevelInfoConfig / A / B / C |
| 3360992 / 3360996 / 3361000 / 3361004 | OrderLevelConfig / A / B / C |
| 3482744 | 字符串“配置OrderLevelConfig表不存在{0}” |

## `totalNumber=54` 为什么首关实际9朵

`LevelInfo.totalNumber` 的表字段值与实际花数需要分开。function41027从 `levelOrderIndex` 与 `levelOrderNum` 构造实际花束订单，再按每个花束 `orderInfo` 的组花数生成 `OrderData`。

在第1139行附近，`OrderData.orderNumber` 写入对象offset16；第1174～1180行把它加入局部变量13。末尾第1314～1319行将这个累计量同时写到：

- `GameMgr.totalFlowerNum`：实例offset24；
- `GameMgr.currentFlowerNum`：实例offset28。

这个路径不读取`LevelInfo.totalNumber`（实例offset12）作为实际分母。首关表是订单组 `[101,102,103]`、次数 `[1,1,1]`；它们各映射一个三花花束，因此真实累计为 **3×3=9**。无需虚构“代码把54硬改成9”的教程赋值。

第二关按相同规则得到99：普通31单基础为93朵，其中两次浅棕笺是六花复合订单而非三花，多6朵，总计99。B/C缺失组被跳过时，实际总数同样只累计成功创建的订单；进度应以该实际总数为分母。

此结论不表示首关完全没有教程分支；首关引导、锁槽显示与交互另有特殊处理，只是本次所查花数不需要额外教程覆盖。

## 初始订单槽：只有第二关特设4槽

`OrderAreaManager.Awake`（token975，function **43391**）读取 `LocalData.Level`，并在第145～169行执行：

```text
unlockNum = min(orderItemCtrs.Count, LocalData.Level == 2 ? 4 : 2)
maxNum = orderItemCtrs.Count
```

原指令是**等于2**，不是大于等于2。因此证据支持第1关初始2槽、第2关初始4槽、其它关初始化默认2槽；后续通过道具或原逻辑再次解锁需要独立处理。`LocalData`类型元数据的静态字段顺序为Gold、Spirit、Level、PlayLevel，代码访问static_fields+8明确为Level。

`OrderAreaManager.InitOrderVase`（token983，function **43399**）进一步按 `unlockNum` 设置各槽启用/锁定状态。其第186行附近还有 `level == 1 && Constant.ConfigA` 的条件，满足时将锁住的槽GameObject隐藏。B/C选表会将ConfigA设false，因此不能无条件套用这个隐藏分支。

`OrderAreaManager`构造函数的默认值是unlockNum=2、maxNum=4，Awake随后按上述第二关条件调整。

## 适配建议与边界

- 原始JSON不改。B/C缺组时记录组ID与关卡并跳过，与当前二进制行为一致。
- 若所有组都失败，本地适配器可以报明确配置错误，避免假造可玩关卡；这是本地错误处理选择，不是已确认的原版成功流程。
- 以实际有效订单需求之和计算总花数、胜利和百分比。
- 初始四槽只应用于第二关，除非新的运行证据显示另有后续覆盖。
- 未证明远端是否会在未来版本修订B/C表；当前分析只覆盖给定运行包。未完成普通选表服务端字段的完整还原，也未验证所有后期关卡的实际画面。


## 追查：花束组筛空时也不回退，解锁条件确为关卡

`DataManager.ProcessingData`（token419，function **44142**）维护解锁字典；`ProcessingItemInfo`（token420）在此构建中已优化为空函数，不能因方法名就选错入口。

- 第90～101行清空`Constant.itemDataDict`（offset216）与`vaseDataDict`（offset220）。
- 第102～124行读取`LocalData.Level`到局部8。
- 第603～607行：如果`level < ItemData.unlockLevel`（字段offset40）则跳过该花种，否则把它放入按type分组的`itemDataDict`。
- 第1124～1129行：如果`VaseInfo.unlockLevel > level`（字段offset40）则跳过花束，否则加入`vaseDataDict`。

因此普通游玩路径使用`unlockLevel <= 当前关卡`是有原代码支持的，不是仅用于收集册的显示条件。

`InitGameConfig`（41027）第425行附近先将订单组`orderList`过滤为已解锁花束ID。如果过滤后为空，第514～543行记录 **“订单组{0}没有已解锁的花篮订单”**，然后跳过该组。没有“筛空后回退到全组”的分支。例如本地适配若第3关筛空后强选解锁49的vase1701，继而找不到type94的可用花种，这是本地回退造成的额外行为，应移除回退并保留警告。

另有`Constant`实例布尔offset624控制的特殊路径：启用时取全`VaseInfoConfig`与`allItemDataDict`，普通路径取上述两个解锁字典。这里只确认两个路径与字段偏移，没有把该特殊模式无条件应用于正常关卡。
