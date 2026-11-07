# 原版合成、打乱、清除道具的静态执行链

本记录依据用户提供运行包的 IL2CPP metadata 和 `game.wasm`，仅做静态取证，不代表所有边界都已经在原版现场复测。WASM SHA-256 为 `9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92`，提取方法见 `original-config-extraction.md`。下文 token 为 Assembly-CSharp 方法 token 的低 24 位，function 为该包的 WASM 函数编号；不能直接套用到其它版本。

结论是：**合成补一个当前订单组，打乱会优先把首个可用订单缺花提升到表层，清除把普通暂存花移到待回填区**。清除并不减少关卡所需总花数，也不凭空消灭花。普通暂存、待回填区、水池分层是三个不同的数据集合。

## 合成：补足第一个能够补齐的当前订单组

入口链：

```text
PropButtonControl.ComposeProp       token 1832 → function 42401
  OrderAreaManager.UseComposeProp          997 → 43428
    FlowerManager.SelectFlowersByComposeProp 582 → 44445
      FlowerManager.FindComposeFlowers      583 → 44446
      SelectSingeFlower coroutine.MoveNext   707 → 40953
        FlowerCtr.SelectToOrderByComposeProp 495 → 44379
```

`UseComposeProp` 按 `orderItemCtrs` 的槽位顺序遍历，跳过不存在、未解锁、已满、正在切换/处理中的订单；计算当前花束组的剩余需求，扣除已插入和已经预留的数量。对每个仍有需求的组调用 `SelectFlowersByComposeProp`，第一次返回 true 就结束。若首个候选所需花无法凑齐，可以继续尝试后面的候选；不是无条件只认左边第一个槽。

`FindComposeFlowers` 从 `FlowerManager.allFlowerDict` 的四个深度列表查找所需 `flowerId`，跳过 `isRemoving` 和 `IsSelected`，收集到所需数量即停止。这里允许取深层花；没有要求只能从当前露出的表层选择。若不足，`SelectFlowersByComposeProp` 尝试 `GameMgr.ReleaseDiffFlowerForCompose`（835，41050）释放对应订单的难度隐藏花后再查一次；仍不足则返回 false，没有把部分找到的花当成一次成功补单。

找到足量花后，协程每 0.15 秒调用一次 `SelectToOrderByComposeProp`，全部指向同一目标订单组。对于多组花束，本次只补当前组，不直接填完之后的所有组。普通暂存或待回填花随后因订单更新自动进入新组，可能在画面上造成“一个道具连着完成多个订单”的观感，应与道具直接补单区分。

当前组字段另有交叉证据：`OrderItemCtr.RefreshCurrentOrderUI`（1017，43404）从 `orderInfo[offset84][orderInfoIndex(offset92)]` 读取组的第一个值到 `NeedOrderType`（68）、第二个值到 `NeedOrderNum`（72）。`UseComposeProp` 只使用这两个字段。因此“3朵 A + 3朵 B”的混合花束，一次只补当前 A 组或当前 B 组的剩余，不能把两个 needs 合并成一次6朵目标。

普通点击也遵循该组顺序：`TryFindOrder`（991，43416）→`TryReserveFlowerNode`（1031，43417）必须满足传入 flowerId 等于 `NeedOrderType`，并检查当前组已收数加 `pendingPutCount`（100）小于 `NeedOrderNum`。自动暂存回填也只传当前 `NeedOrderType`。后续组的花应先进入暂存，不能在前组未完成时直接填进同一花束的后组。

按钮调用 `UseComposeProp` 成功后才扣减合成次数；没有可补目标的 false 路径会显示提示。余量为零时走原补充道具界面，不是自动免费执行。

### 蝴蝶配对使用同一目标规则

蝴蝶配对调用 `UseComposeProp(true, butterflyId)`。参数 `playButterflyEffect` 和 `butterflyId` 在 43428 中不参与目标选择，在 44445 中也不改变查找数量，只存入协程字段，继续传到 44379。

44379 先按同一种方法预留订单挂点；`playButterflyEffect=true` 时走 `PlacementAreaManager.CreateComposeButterfly`（1156，43553）携花动画，普通道具则直接 `MoveFlowerToOrder`。因此绿蝶 2000 与粉蝶 2001 没有“各自只补某种颜色花”或补不同数量的分支；ID用于蝴蝶表现。普通合成查找订单所需普通花，也不会把水池蝴蝶当普通花消耗。蝴蝶配对本身不经过 `ComposeProp` 按钮的次数扣减。

配对清格时序、满格检查见 `original-special-objects-behavior.md`。

## 打乱：先帮助当前订单，再聚拢与散开

入口链：

```text
PropButtonControl.ShuffleProp              1830 → 42399
  FlowerManager.ShuffleFlower               570 → 44432
    WaitShuffleFlower coroutine.MoveNext    719 → 40957
      ShuffleFlowerAction coroutine.MoveNext 713 → 40955
        PrepareShuffleOrderFlowers         574 → 44437
          GetShuffleOrderFlowerNeed        998 → 43429
          MoveShuffleFlowersToUp           575 → 44438
            MoveShuffleFlowerToUp          576 → 44439
        PlayFlowerShuffleGather            577 → 44440
        PlayFlowerShuffleScatter           578 → 44441
```

`ShuffleFlower` 用 `isShuffling` 防重入，启动等待/取消正在提升的动画后进入聚散流程。准备步骤调用 **`GetShuffleOrderFlowerNeed(1)`**，即按槽顺序取得第一个满足已解锁、未满、非处理状态的订单组，统计该组当前缺少的 `flowerId` 和数量。

随后比较表层已有的可用同种花；不足的部分从 **Middle → Bottom → Down** 按顺序提升至 Up。44438 按原深度列表倒序寻找同种、非移除、非提升中的对象；44439 移出原层，必要时激活原 Down 对象，应用 Up 的深度/大小/排序并重新注册。44437 中这三次调用经过 WASM 动态调用包装，参数深度依次为 1、2、3；已从 WASM element 段确认 table 索引 5123 指向 function 44438。

之后开始水池聚散动画：

- 只遍历 `shuffleDepths` 指定的层。构造函数 589 / 44451 把该数组设为 `[0,1,2]`，即 Up、Middle、Bottom；原 Down 层不会全部加入，先被提升的目标花例外。
- 跳过不活跃、正在移除、正在提升的对象，暂时禁用点击和刚体运动，再向池中位置聚拢。
- 以随机每批 4～6 个、批间隔 0.05 秒散开；最后再等待 0.35 秒，清理状态并解除 `isShuffling`。聚拢时长和散开范围来自管理器字段，不是固定 UI 坐标。
- 该链不清空 `placementItemCtrs` 或 `waitClearFlowers`，不直接完成订单，也不增加收花进度。

因此，把打乱实现为“所有物种全局洗牌”或只改现有表层位置，都只覆盖原行为的一部分。尤其全局洗牌可能将当前目标花埋到后层，与原版先提升首订单缺花的目的相反。

40955 的对象过滤条件没有排除 `isSpecial`，并且生成链已确认蝴蝶同样注册：`SpawnLevelObject` 协程 41079 → `SpawnFlower` 协程 41077 遍历共用层数据 → `SpawnOneFlower` 41042 → `RegisterFlower` 44368。两种生成路径都按 `flowerDepth` 放入 `allFlowerDict`，没有 type200 排除。因此 Up/Middle/Bottom 中符合相同活动状态条件的蝴蝶也参与聚散；暂存中的蝴蝶不在这条水池遍历中。打乱本身不配对或清除蝴蝶。

## 清除：把全部普通暂存花转移到待回填区

当前按钮实际调用的链是：

```text
PropButtonControl.RemoveProp                         1829 → 42395
  PlacementAreaManager.GetPlacementNum               1147 → 43539
  PlacementAreaManager.RemovePlacementFlower         1148 → 43540
    PlacementItemCtr.RemoveFlowerByPropToWaitArea     1207 → 43541
      <RemoveFlowerByPropToWaitArea>b__0              1224 → 43590
        <RemovePlacementFlower>b__0                  1175 → 43569
          PlayFlowerToWaitArea                      1150 → 43544
          OrderAreaManager.TryFillWaitClearFlowers    992 → 43418
```

不要因为另有方法 `RemoveFlowerByProp`（1206，43583）就把它当作当前清除按钮的执行路径。42395 → 43540 确切调用的是 **`RemoveFlowerByPropToWaitArea`**。

43540 遍历全部 `placementItemCtrs`，没有最多 1/3/N 朵的限制。43541 对每格要求：

```text
IsUnlock(offset84) && IsPutFill(offset85)
&& !isReserved(offset52) && flowerObject(offset44) != null
```

满足后保存原 flowerObject、putType、flowerSpawnData 到回调闭包，立即清空该格的普通 flowerObject、putType、flowerSpawnData、IsPutFill 和 isReserved；花节点播放缩放/转移效果。回调 43569 把原对象、原类型、原 spawnData 封装成 `WaitClearFlowerData` 加入 `PlacementAreaManager.waitClearFlowers`（offset48），设置其 `isReserved=false`，再播放移向待回填区的效果。等待本批回调到齐后尝试回填当前订单。

这里保留的是原花及原数据，不是直接给订单加数，不是销毁总量后让剩余花更少。腾出普通暂存格本身不应增加进度、星或完成订单数；只有后面真正进入订单的花参与正常结算。

### 待回填花优先于普通暂存花

`TryFillWaitClearFlowers`（43418）按订单槽顺序寻找可接收的组，再调用 `TryFindPlacementFlower`（1140，43419）。后者的顺序可直接从两段循环确认：

1. 先遍历 **waitClearFlowers / offset48**，取类型匹配、对象有效、非reserved的项；成功预留订单挂点后调用 `MoveWaitClearFlowerToOrder`（1142，43422）。
2. 需求仍未满足时，才遍历 **placementItemCtrs / offset32**，按普通暂存格条件继续补入。

因此本地实现应保持 **waiting → buffer** 的补单优先级，不能先消耗后来放进暂存格的花。waiting中的不匹配花继续保留，等后续出现对应订单组时使用。

### 清除会跳过蝴蝶

`PutSpecialFlowerItem`（1212，43584）把蝴蝶放在 `specialFlowerObjects`（offset76）和 `specialFlowerDatas`（offset80），更新特殊计数、putType和IsPutFill，**不写普通 flowerObject（offset44）**。清除的普通对象非空条件因此失败，特殊对象、特殊计数和占用槽位都保留。没有“清除后自动触发蝴蝶合成”的调用。

一个尚需现场验证的原码边界：按钮先调用的 `GetPlacementNum`（43539）只检查已解锁、已占用、非reserved，并未要求普通 flowerObject 非空，所以会把单只蝴蝶占用的格子计入数量。42395 在调用 void `RemovePlacementFlower` 后直接减一次道具余量。由此可推导：**只有蝴蝶、没有普通暂存花时，原按钮可能消耗一次清除却没有普通花可转移**。这是静态可达路径推论，不是已完成原版点击验证；产品实现若过滤这种空操作，应明确记录为本地保护，不能称作已证实的原版一致行为。

## 证据范围与实现边界

- 此文确认的是本运行包的普通三道具链，不覆盖广告回调、活动赠送、复活专用清理等其它分支。
- 道具次数扣减与动画/订单业务是分开的入口，蝴蝶配对复用合成业务不等于消耗一次合成道具。
- 尚未现场验证纯蝴蝶清除、深层补花不足、同时存在waiting与普通暂存的全部竞争时序；静态代码顺序已单独标明。
- 原版水池物理轨迹、各动画缓动和完整随机状态还未达到逐帧复现；已有 Cocos 浮动/打乱实现是否覆盖上述准备步骤，需由实际源码与运行验证另行确认。本记录不声明完整 1:1 已完成。

相关函数的原始 WAT 片段存放于 `docs/reference/wasm/<function>.wat`。本次追踪中间文件是 `/tmp/zdhjy-wasm-function-<function>.wat`；不能把带 `.named` 的辅助注释文件当成原始 WAT，因为泛型/跨程序集的短 token 可能重名，关键调用关系均以 Assembly-CSharp 方法表和实际函数签名交叉确认。
