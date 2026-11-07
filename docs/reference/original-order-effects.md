# 原订单特效、挂点与花瓶入场尺寸

与 `original-order-animation.md` 配套：该文记录 WAT 的时序，本文件记录原 prefab、Spine 资源、透明度和位置。未修改原游戏资源包；未修改 Cocos TS 或场景。

## 119 个入场尺寸

`assets/resources/original/data/order-motion-layouts.json` 是 `vaseId → {width,height,pivot,scale,path,name}` 的映射，119 条直接读取原花瓶 prefab 的根 RectTransform，单位为 1080×1920 UI 基准。它与裁切 PNG 的可见边界不同。

原 PlayVaseAppearAction（43441）使用该 RectTransform 的 width：初始 X 为 `−(width+80)`，在 Cocos 750 宽基准应乘 `750/1080`。不宜用固定宽度或整束花朵组合的包围盒替代容器的原 width。

## 可加载的原 Spine 数据

`assets/resources/original/data/order-spine-effects.json` 保存以下对应。每个 resource 路径不含扩展名，同目录包含 JSON、atlas 和 atlas 指向的 PNG；运行端加载 `sp.SkeletonData`。所有原 JSON 标注 Spine 3.8.99，使用 animation 名称 `animation`、track 0。

| 角色 | 原 prefab | resource 末段 / 文件夹 | 单次长度 | prefab scale |
| --- | --- | --- | --- | --- |
| flowerPut 三选一 | FlowerSpineEft1 | huatexiao_1/huatexiao_1 | 1.2333 s | 1 |
| flowerPut 三选一 | FlowerSpineEft2 | huatexiao_3/huatexiao_3 | 1.2333 s | 1 |
| flowerPut 三选一 | FlowerSpineEft3 | huatexiao_4/huatexiao_4 | 1.2333 s | 1 |
| vaseComplete | VaseCmpSpineEft | hualanxiaoshi/hualanxiaoshi | 1.4333 s | 1 |
| vaseSwitch | VaseSwitchSpineEft | hualanxiaoshi2/hualanxiaoshi2 | 1.4333 s | 1 |
| orderTip | OrderTipSpine | orderTipSpine/orderTipSpine | 1.5 s | 1 |
| orderNewVase | OrderNewVaseSpine | xinghuashu/xinghuashu | 2.7333 s | .2 |

路径统一前缀为 `original/effects/spine/`。例如 `original/effects/spine/huatexiao_1/huatexiao_1`。

落花选择是 PlayFlowerPutSpineEffect（43457）对三个 prefab 的列表执行 `Random.Range(0,list.Count)`；没有花种或大小映射。所有单次效果在 Spine Complete 回调中归还对象池。

orderTip 有例外：PlayOrderTipSpineEffect（43453）收到 `isNew=true` 时循环播放，另启动 5 秒后回收的协程；`false` 时播放一次 1.5 秒。清单的 `roles.orderTip.newVaseMode` 保留该分支。气泡本身未因此改变位置或 scale；发光效果的原骨骼轨道提供动态：两个发光层 alpha 从 0→0xA7（.7333 秒）→0（1.5 秒），同时逐渐扩大，第二层使用 additive blend。

`hualanxiaoshi2` 原 JSON 的元数据头误写成 `"hualanxiaoshi2"` 而非 `"skeleton"`。为让 Cocos importer 识别，导出只将这个头字段更名，骨骼、皮肤、动画曲线未改；原文本完整保留在 `docs/reference/spine-source/hualanxiaoshi2.source.json`，清单记录原 SHA256 与 importNormalization。其它 JSON 和 atlas 为原内容直接导出。

## Alpha 与缩放

7 个主材质（resources.assets pathId 4、6、8、10、12、14、16）全部带 `_STRAIGHT_ALPHA_INPUT` keyword，且 `_StraightAlphaInput=1.0`。因此导出图是 **straight alpha 输入**，Cocos Skeleton 应设 `premultipliedAlpha=false`；不能仅因 `.atlas` 没有 `pma` 字段而沿用 true。清单每项保存 alphaMode 与源 Material pathId。纹理没有重画或预乘处理。

原 SkeletonDataAsset.scale 均为 .01；原 level2 Camera（pathId273）是正交相机、orthographicSize=9.60000038，对应 1920 UI 高度即 100 UI 像素/Unity 世界单位。故在 Cocos SkeletonData.scale=1 时，效果节点 scale 为 `(750/1080)×prefabScale`。不要再次乘 .01。新花束效果单独乘 prefab 的 .2。

## 原挂点

四个 OrderItem 的尺寸均 240×290，pivot(.5,.5)，vaseParent 与 OrderItem 中心重合。原位置如下，仍为 1080 UI 单位：

| 效果 | 原调用位置 | 相对 OrderItem 中心 |
| --- | --- | --- |
| vaseComplete | OrderItem.transform | (0,0) |
| vaseSwitch | OrderItem.transform | (0,0) |
| orderNewVase | newVaseSpinePos | (0,−145) |
| orderTip | imgOrderTip.transform 的 pivot | (−13,−166.79999) |
| flowerPut | 抵达花朵的 attachment Transform | 每朵花的原挂点 |

需求气泡原尺寸 176×116、pivot(.5,.45)。如果 Cocos 节点以图片几何中心代替原 pivot，需要先还原 pivot 位置再挂特效。

当前花束几何以容器底部为共同原点，所以完成/切组特效应放在该原点上方 `145×U`，新花束特效位于原点。落花特效应使用原 attachment pivot；PNG 裁切后的图片中心可能与它不同，不能直接使用裁图中心当作挂点。

43449、43452、43453、43455、43457 在取出特效对象后都用调用方 Transform 的 worldPosition 覆盖特效位置。因此 FlowerSpineEft prefab 中的编辑位置（约−14.11,.76）不应该再叠加。特效作为独立对象在世界位置播放，不能随已完成花束一起移动、淡出或提前销毁。

## 复现与检查

```sh
python3 tools/export_order_spine_effects.py
```

工具从原容器映射读取 prefab，解析 SkeletonAnimation→SkeletonDataAsset→JSON/atlas/PNG，导出对应清单和全部花瓶尺寸。检查包含7套纹理与atlas尺寸、7个动画名/时长、Spine版本、直通透明材质、119个vaseId关联；未手写meta。编辑器导入与实际播放由表现模块继续验证，本记录不将资源齐全视为所有设备已验收。
