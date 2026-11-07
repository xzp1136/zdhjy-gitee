#!/usr/bin/env python3
"""Export original LayerClick colliders into cropped-PNG normalized coordinates.
Only reads the Unity runtime export; does not modify source sprites or Cocos scripts.
"""
from pathlib import Path
import json, math
import UnityPy
P=Path(__file__).resolve().parents[1]
manifest=json.loads((P/'assets/resources/original/manifest.json').read_text())
env=UnityPy.load(manifest['source'])
objects={(o.assets_file.name,o.path_id):o for o in env.objects}
assets={a['resource']:a for a in manifest['assets'] if a['type']=='Sprite'}

def tf(t):
    q=t.m_LocalRotation
    assert abs(q.x)<1e-6 and abs(q.y)<1e-6, "Non-planar collider transform"
    a=2*math.atan2(q.z,q.w);c=math.cos(a);s=math.sin(a)
    sc=t.m_LocalScale;p=t.m_LocalPosition
    return [c*sc.x,s*sc.x,-s*sc.y,c*sc.y,p.x,p.y]
def point(m,p):return [m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]]
def inverse(m):
    a,b,c,d,x,y=m;det=a*d-b*c
    assert abs(det)>1e-10
    return [d/det,-b/det,-c/det,a/det,(c*y-d*x)/det,(b*x-a*y)/det]
def rnd(v):
    if isinstance(v,float):return round(v,8)
    if isinstance(v,list):return [rnd(x) for x in v]
    if isinstance(v,dict):return {k:rnd(x) for k,x in v.items()}
    return v

def transform(go):return next(c.component.read() for c in go.m_Component if c.component.type.name=='Transform')
def find_major(root_t):
    for child in root_t.m_Children:
        tr=child.read();go=tr.m_GameObject.read()
        if go.m_Name=='FlowerMajor':
            sr=next(c.component.read() for c in go.m_Component if c.component.type.name=='SpriteRenderer')
            assert not sr.m_FlipX and not sr.m_FlipY, 'Flipped major renderer needs separate mapping'
            return tr
    raise ValueError('No FlowerMajor')

shapes={};ignored=[];types={};circle_names=[]
for o in env.objects:
    if o.type.name!='GameObject':continue
    go=o.read()
    if go.m_Name!='LayerClick':continue
    tr=transform(go);root_t=tr.m_Father.read();root=root_t.m_GameObject.read()
    resource='original/flower/'+root.m_Name
    if resource not in assets:
        ignored.append({'prefab':root.m_Name,'reason':'no exported flower Sprite'});continue
    major=find_major(root_t);to_major=inverse(tf(major));click_tf=tf(tr)
    a=assets[resource];sp=objects[(a['unityFile'],a['pathId'])].read()
    width,height=a['width'],a['height'];ppu=sp.m_PixelsToUnits;offset=sp.m_RD.textureRectOffset
    shift=[sp.m_Pivot.x*sp.m_Rect.width-offset.x-width/2,sp.m_Pivot.y*sp.m_Rect.height-offset.y-height/2]
    def norm(xy):
        xy=point(to_major,point(click_tf,xy))
        return [(xy[0]*ppu+shift[0])/width,(xy[1]*ppu+shift[1])/height]
    cs=[c.component.deref() for c in go.m_Component if c.component.type.name.endswith('Collider2D')]
    assert len(cs)==1,(root.m_Name,len(cs))
    c=cs[0];d=c.read_typetree();ox,oy=d['m_Offset']['x'],d['m_Offset']['y']
    result={'sourcePrefab':root.m_Name,'sourceFile':o.assets_file.name,'sourceGameObjectPathId':o.path_id,
            'colliderPathId':c.path_id,'sourceColliderType':c.type.name,'enabled':bool(d['m_Enabled']),
            'layer':go.m_Layer,'width':width,'height':height,'ppu':ppu,
            'spritePivot':[sp.m_Pivot.x,sp.m_Pivot.y],
            'logicalSize':[sp.m_Rect.width,sp.m_Rect.height],'trimOffset':[offset.x,offset.y],
            'clickTransform':tf(tr),'majorTransform':tf(major),'colliderOffset':[ox,oy]}
    if c.type.name=='PolygonCollider2D':
        paths=d['m_Points']['m_Paths'];result.update(type='polygon',paths=[
            [norm([p['x']+ox,p['y']+oy]) for p in path] for path in paths])
        result['sourcePaths']=[[[p['x'],p['y']] for p in path] for path in paths]
    elif c.type.name=='CircleCollider2D':
        radius=d['m_Radius'];center=norm([ox,oy]);px=norm([ox+radius,oy]);py=norm([ox,oy+radius])
        result.update(type='ellipse',center=center,axisX=[px[0]-center[0],px[1]-center[1]],axisY=[py[0]-center[0],py[1]-center[1]],sourceRadius=radius)
        circle_names.append(resource)
    else:raise ValueError(c.type.name)
    assert resource not in shapes,resource
    shapes[resource]=rnd(result);types[c.type.name]=types.get(c.type.name,0)+1
catalog=json.loads((P/'assets/resources/original/data/original-order-flower-vase-tables.json').read_text())['tables']['ItemDataConfig']
required={'original/flower/'+path for f in catalog for path in f['flowerPrefabPath']}
missing=sorted(required-shapes.keys())
output={'version':1,'coordinateSpace':'cropped-png-centered-normalized-y-up',
        'source':manifest['source'],'note':'Inverse-transform a pointer into the displayed FlowerImage local space, then divide x/y by displayed image width/height. Polygon paths are a union. Ellipse axes are two basis vectors from center: solve pointer=center+u*axisX+v*axisY and accept u*u+v*v<=1. Root rotation, scale and sprite fitting are supplied by the display transform, not baked twice.',
        'shapes':dict(sorted(shapes.items())),'ignored':ignored,'missingCatalogResources':missing}
assert not missing,missing
out=P/'assets/resources/original/data/flower-click-shapes.json';out.write_text(json.dumps(output,ensure_ascii=False,indent=2))
print(json.dumps({'shapes':len(shapes),'types':types,'circleNames':circle_names,'ignored':ignored,'missingCatalogResources':missing},ensure_ascii=False))
for k in ['original/flower/hd_01','original/flower/hd_02']:
 print(k,json.dumps(shapes[k],ensure_ascii=False))
