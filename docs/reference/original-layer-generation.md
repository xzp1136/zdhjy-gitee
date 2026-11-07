# 原版花朵序列、分层与补层

依据同一用户运行包的静态 WASM / metadata。下列索引对应本包，证据原文在 `wasm/<function>.wat`。此文给出可以实现的数据规则，原随机位置与物理缓动不在验证范围。

## 花序列先按订单组展开，再交错

`GameMgr.InitGameConfig`（814 / **41027**）按 `levelOrderIndex` 顺序、每项 `levelOrderNum` 次数生成花束。每个花束按 `orderInfo` 的需求组顺序生成 `OrderData`，加入 `GameMgr.orderDataList`（offset72）。每条记录含 flowerTypeId、flowerId、orderNumber、flowerResIndex、vaseOrderIndex。相同 flowerId 的后续订单仍保持独立记录；不合并为物种总量列表。

`BuildOrderFlowerSequence`（815 / **41033**）使用 `LevelInfo.flowerIntervalRange`（offset36）构建实际花朵顺序。该字段不是随机 min/max 范围，而是循环使用的**间隔列表**。原算法等价于：

```text
if interval is null or empty:
    return each OrderData in order, each flowerIndex from 0 to count-1
slots = []
firstFree = 0
for group in orderDataList:
    pos = -1
    for j in 0 .. group.orderNumber-1:
        if j == 0:
            pos = firstFree
            while pos < slots.length and slots[pos] != null:
                pos += 1
            firstFree = pos
        else:
            pos += max(0, interval[(j-1) % interval.length])
            do pos += 1 while pos < slots.length and slots[pos] != null
        extend slots with null until slots.length > pos
        slots[pos] = { orderData: group, flowerIndex: j }
        if pos == firstFree:
            while firstFree < slots.length and slots[firstFree] != null:
                firstFree += 1
return slots with null entries removed, preserving positions
```

例如间隔 `[3,5]` 的首个3花组放在稀疏位置0、4、10；下一个组从最早空位1起步。其目的与“相同物种全部堆在前面”完全不同。第2关B间隔 `[3,5]`，第3关 `[3,8]`；首关 `[3,9]`。41033没有随机范围调用，41030没有层内洗牌。

`CreateFlowerSpawnData`（822 / **41035**）根据本组的 `flowerResIndex[flowerIndex]` 选择原表 `uiPath` / `flowerPrefabPath`，索引越界时日志并回退0。这与简单拼 `${kind}_0${variant}` 不等价；部分原花的三个槽是 `[01,02,01]` 或 `[01,01,01]`。

## layerNumber 的两个值

四层顺序固定 `[0,1,2,3]`，依次 Up、Middle、Bottom、Down。除枚举名外，初始化所用 metadata 字段18674（`<PrivateImplementationDetails>`）默认字节确认为 `00 00 00 00 01 00 00 00 02 00 00 00 03 00 00 00`。

`BuildLayerFlowerLists`（819 / **41030**）和 `FindAvailableLayerIndex`（821 / **41034**）遍历前述花序列：

- 每层第一个值 `layerNumber[i][0]` 是初始目标数量；负数按0。
- 当前层实际列表未达到目标则追加；达到后向下一层推进。
- **Down 是最后的剩余区，接收全部剩余对象**，不受它的初始0限制。
- 序列中的 `flowerIndex` 与 OrderData 保留到 SpawnData；不应重新按物种汇总。

`FlowerManager.InitLayerLimit`（538 / **44405**）分别保存 `layerInitialCount`（200）与 `layerMaxCount`（204）：

```text
initial[i] = max(0, row[0])
max[i] = row.length >= 2 ? max(initial[i], row[1]) : initial[i]
```

第二个值是运行时可接收的最大数量，不是随机上界。`CanLayerReceive`（540 / **44407**）对非Down要求 `max > 0 && currentCount < max`；Down直接允许。

第2关B：initial `[19,1,35,0]`，max `[21,2,40,0]`。普通序列先填19 Up、1 Middle、35 Bottom，其余Down（还需扣除下述隐藏难度花）。固定21彩色+16灰色不是原关卡分层。

蝴蝶在普通花已分层之后由41036/41038按百分比插入对应层。每插入一行时按当时合并列表长度重新计算索引，再定位所在层；不会重新分配已有花到下一层。因此加入特殊对象后层内数量可能大于initial。41030末段只是记录各层容量/数量日志，**没有再次整理、截断或把超额对象向下一层搬移**。

## 隐藏难度花影响池中实际数量

`ApplyVaseDifficulty`（816 / **41029**）读取 `diffRange`。每行 `[percent,delayTime]` 以 `clamp(floor(vaseCount*percent/100)-1,0,vaseCount-1)` 定位一个花束序号，重复序号跳过。把对应花束标记为难度花束，取它最后需求组的 flowerId，建立 `LevelDiffInfo`，hideFlowerCount=1。

41030构建每个 SpawnData 时，查询是否有同flowerId且尚未持有hideFlowerData的难度记录（820 / **41040**）；若有则把该花存到记录的hideFlowerData，不加入任何层。它仍计入 GameMgr.totalFlowerNum/currentFlowerNum，故“订单总需求数量”与“初始池中列表总数”不同。第2关有5条不同难度记录，初始普通池中94朵，另5朵等待难度释放；蝴蝶8只是在94朵分层后插入。不要把99直接当初始层列表长度。

难度花触发/延时主链见下文；合成路径41050还可按订单主动释放被隐藏的花。若本地暂时把所有普通需求花直接放入池中，应明确这是对难度隐藏的简化，不能宣称其初始深度完全一致。

## 取走一朵后的主要补层规则

`HandleFlowerVacancy`协程（605 / **40919**）：

| 空位 | 选择顺序 |
| --- | --- |
| Up | 范围内最近Middle → 范围内最近Bottom → 首个可用Middle → 首个可用Bottom → 首个可用Down |
| Middle | 范围内最近Bottom → 首个可用Bottom → 首个可用Down |

目标层先通过44407最大容量检查。Middle/Bottom被移出后调用 `RefillLowerLayer`（701 / **40951**）：

- 补Middle：先选Bottom移到Middle，并先尝试Down→Bottom补它留下的空位；没有可用Bottom则Down→Middle。
- 补Bottom：Down→Bottom。

`FindPromoteFlowerByRange`（550 / **44414**）的“近”是当前位置到空位的平方距离小于等于 `vacancyNearRadius²`，从范围内取最近对象；另一个输出是该列表第一个可用对象。过滤无效、非活动（Down例外）、正在移除、正在提升、未过提升冷却的花。

`FindRandomPromoteFlower`（568 / **44431**）虽然名字含Random，本包实现从0开始顺序扫描首个可用项，没有随机索引调用。`DirectPromoteFirstFlower`（548 / **44413**）同样保留列表先后。若实现不带原物理坐标，可以先保留层优先级与列表顺序，但需把“最近范围”的缺失标为视觉/物理简化。

## 不点击也会自动提升

`AutoPromoteLoop`（599 / **40917**）按管理器设定的随机时间间隔运行。仅在游戏进行中、未打乱、未处理空位补层、没有其它提升正在处理时，通过autoPromoteChance概率门槛，按 `[Middle,Bottom,Down]` 尝试一个对象。

`TryGetAutoPromoteTarget`（566 / **44429**）：

- Middle：Up有容量便提升到Up。
- Bottom：Up有容量时以bottomDirectUpChance概率直接Up，否则尝试Middle；Middle无容量再尝试Up。
- Down：先尝试Bottom，再尝试Middle。

这条自动流动路径与取走花后的补空位链并存。若只在点击后更新，后续可见性可能与原版不同。

## sorting 与尺寸不改排列

`FlowerManager`构造函数（589 / **44451**）的 `sortingBase` 为 Up80、Middle8、Bottom-14、Down-28；`depthLocalSize` 为1、0.9、0.8、0.7。它们传给生成/提升时的渲染层与尺寸，未参与41033序列排序。Down的对象在初始化时 inactive（466 / **44352**），提升时才激活。

颜色/遮水表现不应只由这里的整数直接推断：`FlowerCtr.ModofyActive`（485 / **44357**）对Middle关闭`majorSpriteRender`、启用`upSpriteRender`和`downSpriteRender`；其它层反过来。Bottom仍使用主节点，并以负sortingBase处于更低渲染层。上述对象的名字不直接证明它们都是灰色贴图。Cocos把Middle和Bottom都统一置灰属于近似视觉表现，不能当作已确认的原参数。

## 点击层：露出的灰色花可以点

**Up / Middle / Bottom均可被命中，Down因整体inactive暂时不可点。** root现场确认第二关右下灰花点击后直接进入暂存，前层花未消失；这一结果与下面代码链相符。不能用“只有Up可点”的规则替代原版。

`CameraCtr.Awake`（370 / **44276**）把唯一点击layerMask设为独立的`FlowerClick`。`TrySelectAt`（372 / **44279**）把屏幕点转成世界点，查询该mask内重叠碰撞器，向父节点查找FlowerCtr：仅排除不存在与`isRemoving`（96）的对象，没有flowerDepth筛选。随后为每个候选调用`GetClickLayerOrder`（479 / **44281**），选sortingOrder最大的对象调用`OnClickFlower`（488 / **44282**）。

`FlowerCtr.Awake`（464 / **44350**）把`LayerClick`子节点的Collider保存为`clickCollider`（44），与物理colliders（40）分开。`ApplyPromotedDepth`（469 / **44358**）修改深度时，改对象与普通物理碰撞器的FlowerUp / FlowerMiddle / FlowerBottom / FlowerDown层，遍历碰撞器时显式跳过clickCollider。因此改变深度没有把点击碰撞器移出FlowerClick。

`SetClickEnabled`（477 / **44363**）仅设置clickCollider.enabled；`SetPhysicsCollidersEnabled`（481 / **44360**）遍历普通colliders并跳过clickCollider。初始化44352仅以`depth != 3`决定整个花对象active，所以原Down被阻断，Middle/Bottom仍有可命中的点击对象。

可实现的输入规则是：在已激活的0/1/2层可点击形状里命中；一处同时命中多朵时优先最高排序，不应从覆盖它的高层花穿透到低层。灰/浅色本身不是禁点标志。选中、移除或打乱时的临时禁点仍需保留。

## 隐藏花的释放时机

`RefreshCurrentOrderUI`（1017 / **43404**）会检查`CheckOrderDiffTrigger`（1058 / **43443**）。触发要求该花束isDiffOrder、尚未触发，且当前已进入最后需求组：`orderLayerCount <= orderInfoIndex + 1`。首次触发启动`TriggerDiffOrder`协程（1120 / **43510**），等一帧后按vaseOrderIndex寻找对应LevelDiffInfo：

- 计算当前组尚欠数`NeedOrderNum - currentGroupPutCount`（最少0）。
- 用`GetFlowerDiffNumber`（585 / **44448**）统计各深度中同flowerId、未移除、未提升的花。
- 若尚欠数大于池内可用数，直接调用`DelaySpawnHideFlower`（832 / **41047**）。
- 否则设置该记录isOpenUpdateCheck，开启GameMgr的每秒检查。`GameMgr.Update`（834 / **41049**）在游戏进行时每累计1秒检查一次；同ID可用花数降到0、hideFlowerData存在、尚未启动延迟时，才开始延迟生成。

两条分支最终进入`DelaySpawnDiffFlower.MoveNext`（862 / **41071**）：等待记录delayTime秒（diffRange第二值，非百分比），检查记录仍存在，再调用`SpawnDiffFlower`（831 / **41046**）。它复制隐藏SpawnData、指定depth=Bottom(2)、重新随机旋转后生成，删除该难度记录。原总需求数量不改变。

若合成先通过41050释放并删除了该记录，已启动的延迟协程醒来时发现记录不再存在便返回，避免重复生成。暂停的精确Unity协程时间缩放仍需结合主控制器验证；本文不据此推断所有延迟在暂停期间的表现。
