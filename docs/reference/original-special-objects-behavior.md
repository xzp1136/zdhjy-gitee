# 原版蝴蝶、气泡与插入位置

本说明依据用户运行包的静态WASM与原始表，以及root本轮现场观察。没有运行原游戏二进制，没有修改Cocos脚本。WASM SHA-256见`original-config-extraction.md`；下列函数片段保存于`docs/reference/wasm/`。

## 已确认的玩法模型

- `ItemDataConfig.index=2000`，type200，资源`hd_01`为绿色/蓝色蝶翼；index2001同属type200，资源`hd_02`为粉色/黄色蝶翼。两条原名均为“蝴蝶”，unlockLevel=1。
- 单只蝴蝶是可收取特殊对象。点击后播放破泡效果并飞入**普通暂存格使用的同一组槽位**，单只不会立即代收一朵普通花。
- 相同具体itemId的第二只优先进入已有同色蝴蝶的格子，累计两只后触发自动补单；不同itemId分占不同格子。
- 配对触发后，会尝试填满第一个符合条件的当前订单组，表现使用蝴蝶携花动画；不是随机点击一朵花。
- 特殊对象自身不加入普通订单总花数。进度、星星要由其后真正放入订单的普通花和订单完成来推进。

root实际点了一只粉蝶和一只绿蝶，最终两者自身进入暂存第3和第4格，进度仍53%、星10，符合单只占格模型。最早“粉蝶直接帮收粉芍药”的观察已由root纠正，不能作为行为依据。

## `specialObjectNum` 第二值是位置百分比

`GameMgr.AddSpecialObjects`，token817，function **41036**：

1. 读取每行至少两个数的`specialObjectNum`。
2. 先按首个数itemId统计其在整表出现的行数。
3. 每种itemId至少出现2次且次数为偶数，否则记录原文“蝴蝶数量配置错误，必须至少2个并且为偶数，itemId：{0}，配置数量：{1}”并跳过该ID的行。
4. 每个有效行只创建**一个**对象。第二个数先截到0～100，传给插入函数。

`GameMgr.AddSpecialObjectToLayer`，token818，function **41038**：每插入一行前重新计算当前层列表总对象数N，计算：

```text
globalIndex = clamp(floor(N * percent / 100), 0, N - 1)
```

然后按层序累计长度，找到包含globalIndex的层，在该层的局部位置插入对象。N包括前面已插入的特殊对象。它不是“点击多少朵后生成”的阈值，也不是“生成多少只”的数量。

第二关B表：

```text
[2000,8], [2000,12], [2001,20], [2001,25],
[2000,40], [2000,48], [2001,60], [2001,72]
```

意味着**4绿+4粉，共8只**。若忽略难度隐藏、以99个普通花逐行计算，索引会是7、12、20、25、41、49、63、76；但进一步追踪41029/41030后确认，第2关5朵普通花被存为难度隐藏花，初始层列表实际94朵，因此插入位置必须按实际列表重算。41030尾部仅输出容量日志，没有重新整理层列表。具体生成链见`original-layer-generation.md`。

`CreateSpecialObjectSpawnData`，token823，function **41039**，取原ItemData的type、随机Sprite/Prefab变体、尺寸，并产生[-180°,180°]随机旋转。特殊对象沿用层深数据；原版漂浮位置/物理轨迹并未因此完整还原。

## 点击与同色配对

`FlowerCtr.OnClickFlower`，token488，function **44282**：

- 先检查游戏正在运行、对象未选中等常规条件。
- `flowerTypeId==200`时进入专用分支，不先尝试匹配普通订单。
- 调用`PlacementAreaManager.TryFindSpecialPlacementPos`（1153，**43548**）。它先找**已解锁、同itemId且剩余配对容量**的特殊格，再找已解锁的空格；没有位置则记录“蝴蝶没有可放置位置 flowerId：{0}”并返回。
- 成功预留后播放`PlayBubbleSpineEffect`（504，**44284**），隐藏bubbleRender，移除水面占位，0.42秒移动到暂存位置。
- 泡泡动画资源是`Prefabs/Model/BubbleSpine`、动画名`animation2`。气泡在这条路径中是蝴蝶外观与点击效果，没有发现独立可兑换的“泡泡奖励对象”。

`PlacementItemCtr.TryReserveSpecialFlowerNode`（1214，**43550**）限制同ID并累计`specialReservedCount`，避免并发点击超过容量。

`PutSpecialFlowerItem`（1212，**43584**）把抵达的对象加入`specialFlowerObjects`列表（字段offset76），数据加入offset80；以列表数量更新`specialPutCount`（68），将`IsPutFill`（85）设true，普通`putType`（40）记录具体itemId。它不写普通`flowerObject`（44）。

`PlacementItemCtr`构造函数（1220，**43588**）明确将`SpecialMaxCount`（60）设为 **2**；不是3。对同格计算`specialPutCount + specialReservedCount < 2`才能继续预留。

## 两只凑齐后的状态顺序

`PlaySpecialObjectEffect`的协程MoveNext（1182，**43572**）：

1. 原日志“蝴蝶对象凑齐2个，ID：{0}”。
2. 先等待一帧，再等待0.12秒。
3. `PlaySpecialCombineEffect`（1216，**43573**）播放暂存合成效果；效果对象0.8秒后销毁。
4. 调用`OrderAreaManager.UseComposeProp(true, butterflyId)`（997，**43428**）。
5. 立即`ClearSpecialObjects`（1218，**43574**），不等待各朵花飞入订单。其尾部清空special列表、special计数、specialTypeId、IsPutFill、putType、isReserved。

协程**忽略UseComposeProp的返回值**。即使当前没有可填的订单，清理特殊格仍会继续；本地实现不应擅自把这一分支改成“配对失败就永久占格”，除非另有运行证据。

## 自动补单目标有确定条件

`UseComposeProp`（43428）按订单槽数组顺序遍历，跳过未解锁、已满、正在处理流程的订单。计算当前组尚欠花数（扣除已经插入与预留中的数量），找到可以补齐的第一项，调用`FlowerManager.SelectFlowersByComposeProp`（582，**44445**）。

后者调用`FindComposeFlowers`（583，**44446**）按需求flowerId从分层花列表查找未选中、未移除的同种花。数量不足时，尝试释放该订单的难度隐藏花后再查；仍不足则记录日志并返回false，继续尝试后续订单。

`OrderItemCtr.RefreshCurrentOrderUI`（1017，**43404**）给出了“当前组”的直接证据：它读取`orderInfo`（84）中的`orderInfoIndex`（92）项，将该项[0]写入`NeedOrderType`（68），[1]写入`NeedOrderNum`（72）。43428计算已放数量时，同样只读取`flowerItemList`（56）中该索引的列表长度。因此一个3+3的六花混合花束，一次合成只补当前3花组的剩余花数，而不是一次完成六花。

找到足量目标后，`SelectSingeFlower`协程（707，**40953**）每0.15秒调用`FlowerCtr.SelectToOrderByComposeProp`（495，**44379**）。配对传入`playButterflyEffect=true`，通过`Prefabs/Model/butterfly`创建携花动画。它针对当前订单组，并不直接完成多组花束的所有后续层。

## 水池里的蝴蝶参与打乱

`SpawnLevelObject`协程（886，**41079**）启动`SpawnFlower`；后者的MoveNext（880，**41077**）遍历包含特殊对象的共用层列表，对每个数据调用`SpawnOneFlower`（827，**41042**）。该函数的两种位置/动画分支最终均调用`FlowerManager.RegisterFlower`（537，**44368**）。RegisterFlower按`flowerDepth`（72）把对象加入`allFlowerDict`（48），没有type200排除条件。

因此特殊对象和普通花都在水池分层对象列表中。打乱协程40955按shuffleDepths遍历该字典，过滤正在移除/提升和inactive对象，没有特殊类型排除；shuffleDepths由构造函数44451设为[0,1,2]，即Up/Middle/Bottom。因此这些层的可用水池蝴蝶会参与聚拢与散开；Down层不会直接参加。打乱前另有为首订单补花到Up的步骤，详见`original-props-behavior.md`。

## 暂存容量与满格失败

蝴蝶与普通花共用`placementItemCtrs`数组。一格中的单只蝴蝶就设置IsPutFill，因此正常占1格；同色两只共用该格，不额外占第二格。

`CheckPlacementFull`（1139，**43412**）计数全部 **IsUnlock && IsPutFill && !isReserved** 的槽，没有排除特殊格。计数达到unlockNum后，若订单结算当前不忙，便置gameState=2并打开满格失败界面。因此“还有一只同色蝶可配对”不是满格免死条件。

原抵达时序值得保留：43584先检查满格，再在specialPutCount达到2时启动配对协程；配对中的预留计数与动画会影响即时检查。若本地状态机把所有动画折叠为同步动作，应明确验证满格与清格的先后，不能自行认为特殊格不参与失败统计。

清除道具使用普通`flowerObject`非空条件；蝴蝶只保存在special列表，因而不会由普通清除路径取走。详细道具链由`original-props-behavior.md`单独记录。

## 尚未确认

- 原版所有粒子、Spine动画、浮动轨迹、补层重排的完整视觉一致性。
- 特殊对象在具体视口的初始XY位置与用户版本选择后的确切随机状态。
- 全满且第二只正在飞入、订单正在结算等多事件竞争的全部现场结果。这里保留代码时序，未声称完成所有运行场景验证。
- 特殊对象是否会被其它尚未分析的复活或活动分支批量处理。

## 附：时间耗尽后的100金币续120秒

此项由root实测后补充静态确认：`TimeUpOverControl.ClickGold`（2487，**43160**）要求金币>=100并扣100；成功调用ShareSuccess（2488，**43161**）→AddGameTime（2493，**43164**），先把GameMgr.gameState设为1。随后GameMgr.AddGameTime（845，**41059**）延迟0.6秒调用callback（859，**41070**），最终增加Constant.PropAddTime（offset48）。Constant构造函数（108，**56068**）该字段为120.0秒。所查成功链未重置已收花、订单或暂存；这里不推断广告服务已接通。
