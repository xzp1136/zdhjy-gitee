"""Read original physical fixtures for pool boundary envelopes (not LayerClick).

Capsules use their serialized size rectangle as a conservative envelope, not a
replacement rigid-body shape. Circles retain analytic ellipse axes. This export
fixes image-based wall insets; it does not reproduce Unity's dynamic solver.
"""
import argparse, hashlib, json, math
from pathlib import Path
import UnityPy
from asset_paths import resource_file, manifest_file

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',type=Path,required=True)
a=parser.parse_args()
env=UnityPy.load(str(a.source));manifest=json.loads(manifest_file().read_text())
objects={(o.assets_file.name,o.path_id):o for o in env.objects}
assets={x['resource']:x for x in manifest['assets'] if x['type']=='Sprite'}
target=resource_file('original/data/flower-click-shapes.json',write=True)
data=json.loads(target.read_text());physics={}
def transform(go):return next(c.component.read() for c in go.m_Component if c.component.type.name=='Transform')
def matrix(t):
 q,s,p=t.m_LocalRotation,t.m_LocalScale,t.m_LocalPosition
 assert abs(q.x)<1e-6 and abs(q.y)<1e-6
 angle=2*math.atan2(q.z,q.w);c,sn=math.cos(angle),math.sin(angle)
 return [c*s.x,sn*s.x,-sn*s.y,c*s.y,p.x,p.y]
def mul(m,n):
 a,b,c,d,x,y=m;e,f,g,h,u,v=n
 return [a*e+c*f,b*e+d*f,a*g+c*h,b*g+d*h,a*u+c*v+x,b*u+d*v+y]
def point(m,x,y):return [m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]
def inv(m):
 a,b,c,d,x,y=m;det=a*d-b*c
 return [d/det,-b/det,-c/det,a/det,(c*y-d*x)/det,(b*x-a*y)/det]
def nodes(go,m):
 yield go,m
 for c in transform(go).m_Children:
  t=c.read();yield from nodes(t.m_GameObject.read(),mul(m,matrix(t)))
for obj in env.objects:
 if obj.type.name!='GameObject':continue
 root=obj.read();resource='original/flower/'+root.m_Name
 if resource not in data['shapes']:continue
 descendants=list(nodes(root,[1,0,0,1,0,0]))
 major_matrix=next(m for go,m in descendants if go.m_Name=='FlowerMajor')
 to_major=inv(major_matrix);asset=assets[resource]
 sprite=objects[asset['unityFile'],asset['pathId']].read();w,h=asset['width'],asset['height'];ppu=sprite.m_PixelsToUnits
 shift=[sprite.m_Pivot.x*sprite.m_Rect.width-sprite.m_RD.textureRectOffset.x-w/2,
        sprite.m_Pivot.y*sprite.m_Rect.height-sprite.m_RD.textureRectOffset.y-h/2]
 fixtures=[]
 for go,m in descendants:
  for cp in go.m_Component:
   collider=cp.component
   if not collider.type.name.endswith('Collider2D'):continue
   d=collider.read_typetree()
   if d['m_IsTrigger'] or not d['m_Enabled']:continue
   combined=mul(to_major,m)
   def normalized(x,y):
    xy=point(combined,x,y);return [(xy[0]*ppu+shift[0])/w,(xy[1]*ppu+shift[1])/h]
   ox,oy=d['m_Offset']['x'],d['m_Offset']['y']
   if collider.type.name=='CircleCollider2D':
    center=normalized(ox,oy);x=normalized(ox+d['m_Radius'],oy);y=normalized(ox,oy+d['m_Radius'])
    shape={'type':'ellipse','center':center,'axisX':[x[i]-center[i] for i in range(2)],'axisY':[y[i]-center[i] for i in range(2)]}
   elif collider.type.name=='PolygonCollider2D':
    shape={'type':'polygon','paths':[[normalized(p['x']+ox,p['y']+oy) for p in path] for path in d['m_Points']['m_Paths']]}
   else:
    assert collider.type.name in ('CapsuleCollider2D','BoxCollider2D'),collider.type.name
    sx,sy=d['m_Size']['x']/2,d['m_Size']['y']/2
    shape={'type':'polygon','paths':[[normalized(ox+x,oy+y) for x,y in [(-sx,-sy),(sx,-sy),(sx,sy),(-sx,sy)]]]}
   fixtures.append({'sourceType':collider.type.name,'shape':shape})
 assert fixtures,resource
 physics[resource]=fixtures
assert set(physics)==set(data['shapes'])
physics_data={'source':str(a.source),'sourceSha256':hashlib.sha256(a.source.read_bytes()).hexdigest(),
 'note':'Conservative wall envelopes only. Capsule size rectangles bound their serialized area; no claim of Unity solver parity. Independent from exact LayerClick contours.',
 'fixtures':dict(sorted(physics.items()))}
# Keep the original click contours readable and untouched; compact only the
# machine-generated physical envelopes so the local data bundle stays small.
def rounded(value):
 if isinstance(value,float):return round(value,8)
 if isinstance(value,list):return [rounded(x) for x in value]
 if isinstance(value,dict):return {k:rounded(x) for k,x in value.items()}
 return value
data.pop('physicsBounds',None)
base=json.dumps(data,ensure_ascii=False,indent=2).rsplit('\n}',1)[0]
target.write_text(base+',\n  "physicsBounds": '+json.dumps(rounded(physics_data),ensure_ascii=False,separators=(',',':'))+'\n}\n')
print(json.dumps({'flowers':len(physics),'fixtures':sum(map(len,physics.values())),'output':str(target)},ensure_ascii=False))
