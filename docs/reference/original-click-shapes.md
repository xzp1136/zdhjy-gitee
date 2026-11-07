# 原版花朵点击轮廓

用户运行包共有442个`LayerClick`对象，全部启用且位于`FlowerClick`（layer12），其中438个`PolygonCollider2D`、4个`CircleCollider2D`。不存在使用BoxCollider2D的花朵点击轮廓。多边形共6108个顶点。

已生成 `assets/resources/original/data/flower-click-shapes.json`，覆盖原ItemDataConfig全部实际flowerPrefabPath。圆形是hd_01、hd_02、zytx_xlq_01、zytx_xlq_02；其余为多边形。重建命令：

```sh
python3 tools/export_flower_click_shapes.py
```

依赖UnityPy。脚本从现有manifest.source定位用户运行包，只读取原素材；不改PNG或TS。原始偏移、变换、pivot、trim、PPU、路径和对象ID保存在每条数据，便于复核。

## 坐标与运行时判定

shape以实际资源路径为key，例如`original/flower/dy_zmj_02`，不是按固定3种后缀猜资源名。

坐标空间为**裁切后导出PNG中心、y向上、x除PNG宽度、y除PNG高度**。轮廓已做以下换算：

1. 对原collider点加m_Offset，再用LayerClick相对花根节点的Transform变换。
2. 逆变换到原FlowerMajor SpriteRenderer的局部空间。
3. 乘Sprite的PixelsToUnits，补pivot × logicalSize，减textureRectOffset及导出PNG尺寸的一半。
4. 分别除导出PNG宽、高。

所以UI侧只需把触点逆变换到**实际显示花图节点**的局部坐标，再除该图节点实际宽高。节点旋转、父缩放和Sprite适配由这次逆变换处理，不要再次加源trim或原Transform。

```text
polygon: { type: 'polygon', paths: [ [[x,y], ...], ... ] }
ellipse: { type: 'ellipse', center:[x,y], axisX:[x,y], axisY:[x,y] }
```

多边形的多个paths按并集判定。椭圆从 `p-center = u*axisX + v*axisY` 解二元线性方程，判断 `u²+v² <= 1`。不能直接把原圆当PNG归一化空间的正圆，因为宽高不同。

蝴蝶的原圆半径0.92单位，覆盖气泡区域，宽度明显超出蝶翼图本身。hd_01归一化center≈[-0.0015781,0]、axisX≈[0.81415931,0]、axisY≈[0,0.56790124]；hd_02中心≈[-0.00336486,0]、轴长≈0.82882884和0.5935484。使用蝶翼显示节点做上述逆变换后直接检测该椭圆，不需要再套一个猜测的气泡圆。

## 点击优先级

轮廓外的透明区域不挡住后方露出的花。多个有效轮廓同时命中时，原CameraCtr只选择GetClickLayerOrder最大的对象；Unity渲染排序在本地可对应池中实际显示层级。

0/1/2层均可点击，3层Down整体inactive。依据与现场灰花点击验证见`original-layer-generation.md`。应采用池中统一命中测试，避免每朵Button的矩形先截走事件。

## 校验

导出脚本断言全部目录花资源都有shape、每个LayerClick只有一个已知碰撞器、没有翻转的FlowerMajor或非2D变换。导出后检查442条记录全为enabled/layer12，polygon路径至少3顶点且全部有限，ellipse基底可逆。尚未声称Cocos命中边缘和原物理查询每个像素完全一致。
