"""Export the supplied Unity package's runtime physics and water material inputs.

Reads scene values, actual collider definitions and source textures. Does not
edit source archives or Cocos scenes/prefabs/import metadata.
"""
import argparse,hashlib,json,math,struct
from pathlib import Path
import UnityPy
from asset_paths import PROJECT,resource_file,manifest_file
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--source',type=Path,required=True);a=p.parse_args()
source=a.source/'runtime-cache/d83724c5931a26b5.webgl.data.unityweb.bin' if a.source.is_dir() else a.source
env=UnityPy.load(str(source));objects=list(env.objects);index={(o.assets_file.name,o.path_id):o for o in objects}
routes_path=PROJECT/'assets/resources/bundle-routes.json';routes=json.loads(routes_path.read_text());owner='core-effects'
for key in ['original/data/flower-runtime-physics','original/data/flower-water-materials','original/materials/flower-half-water','original/materials/flower-water-surface','original/materials/water-flow','original/materials/water-detail']:routes['routes'][key]=owner
routes_path.write_text(json.dumps(routes,separators=(',',':')))
manifest=json.loads(manifest_file().read_text());resources={x['resource'] for x in manifest['assets'] if x['type']=='Sprite' and x['resource'].startswith('original/flower/')}
def tf(go):return next(cp.component.read() for cp in go.m_Component if cp.component.type.name in ('Transform','RectTransform'))
def matrix(t):
 q,s,p=t.m_LocalRotation,t.m_LocalScale,t.m_LocalPosition
 assert abs(q.x)<1e-6 and abs(q.y)<1e-6
 v=2*math.atan2(q.z,q.w);c,sn=math.cos(v),math.sin(v)
 return [c*s.x,sn*s.x,-sn*s.y,c*s.y,p.x,p.y]
def mul(m,n):
 a,b,c,d,x,y=m;e,f,g,h,u,v=n
 return [a*e+c*f,b*e+d*f,a*g+c*h,b*g+d*h,a*u+c*v+x,b*u+d*v+y]
def descend(go,m):
 yield go,m
 for ch in tf(go).m_Children:
  t=ch.read();yield from descend(t.m_GameObject.read(),mul(m,matrix(t)))
def rounded(x):
 if isinstance(x,float):return round(x,9)
 if isinstance(x,list):return [rounded(v) for v in x]
 if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
 return x
def fixture(obj,m,body_material=None):
 d=obj.read_typetree();material=d['m_Material'];material=material if material['m_PathID'] else body_material or material;mat=obj.assets_file.objects[material['m_PathID']].read_typetree() if material['m_PathID'] else {'friction':.4,'bounciness':0}
 return {'kind':obj.type.name,'sourcePathId':obj.path_id,'matrix':m,'density':d['m_Density'],'friction':mat['friction'],'restitution':mat['bounciness'],
  'offset':d['m_Offset'],**{k:d[k] for k in ('m_Size','m_Radius','m_Direction','m_Points') if k in d}}
flowers={};walls=[];flow=None;physics=None;time=None;water=None;half=None
for obj in objects:
 if obj.type.name=='TimeManager':time=obj.read_typetree()
 elif obj.type.name=='Physics2DSettings':physics=obj.read_typetree()
 elif obj.type.name=='GameObject':
  go=obj.read();resource='original/flower/'+go.m_Name
  if resource in resources:
   rb=next(cp.component.deref() for cp in go.m_Component if cp.component.type.name=='Rigidbody2D');body=rb.read_typetree();fixtures=[]
   for child,m in descend(go,[1,0,0,1,0,0]):
    for cp in child.m_Component:
     if cp.component.type.name.endswith('Collider2D'):
      c=cp.component.deref();d=c.read_typetree()
      if d['m_Enabled'] and not d['m_IsTrigger']:fixtures.append(fixture(c,m,body['m_Material']))
   flowers[resource]={'sourceRootPathId':obj.path_id,'mass':body['m_Mass'],'autoMass':body['m_UseAutoMass'],'gravityScale':body['m_GravityScale'],'constraints':body['m_Constraints'],'fixtures':fixtures}
  elif obj.assets_file.name=='level2' and go.m_Name=='WaterBoundary':
   for child,m in descend(go,matrix(tf(go))):
    for cp in child.m_Component:
     if cp.component.type.name=='BoxCollider2D':walls.append(fixture(cp.component.deref(),m))
  elif obj.assets_file.name=='level2' and go.m_Name=='Water':
   sr=next(cp.component.read() for cp in go.m_Component if cp.component.type.name=='SpriteRenderer');mat=sr.m_Materials[0].read_typetree();sp=sr.m_Sprite.read();tex=sp.m_RD.texture.read()
   water={'sourceRendererPathId':299,'sourceMaterialPathId':sr.m_Materials[0].path_id,'material':mat['m_Name'],'floats':dict(mat['m_SavedProperties']['m_Floats']),'colors':dict(mat['m_SavedProperties']['m_Colors']),'keywords':mat.get('m_ValidKeywords'),
          'mainTextureSize':[tex.m_Width,tex.m_Height],'spriteRect':{'x':sp.m_RD.textureRect.x,'y':sp.m_RD.textureRect.y,'width':sp.m_RD.textureRect.width,'height':sp.m_RD.textureRect.height},'textures':{}}
   for name,record in mat['m_SavedProperties']['m_TexEnvs']:
    if name not in ('_FlowTex','_DetailTex'):continue
    source=index['resources.assets',record['m_Texture']['m_PathID']];texture=source.read();resource='original/materials/water-'+('flow' if name=='_FlowTex' else 'detail');texture.image.save(resource_file(resource+'.png',write=True))
    water['textures'][name]={'resource':resource,'sourcePathId':source.path_id,'name':texture.m_Name,'wrapU':texture.m_TextureSettings.m_WrapU,'wrapV':texture.m_TextureSettings.m_WrapV,'filter':texture.m_TextureSettings.m_FilterMode}
 elif obj.type.name=='MonoBehaviour':
  d=obj.read(check_read=False)
  if not d.m_Script.path_id:continue
  name=d.m_Script.read().m_ClassName;r=obj.get_raw_data()
  if name=='FlowerWaterFlowController':
   flow={'sourcePathId':obj.path_id,'updateInterval':struct.unpack_from('<f',r,32)[0],'updateStep':struct.unpack_from('<i',r,36)[0],
    'directionInterval':list(struct.unpack_from('<2f',r,40)),'linearDrag':struct.unpack_from('<f',r,48)[0],'angularDrag':struct.unpack_from('<f',r,52)[0],'torqueImpulse':struct.unpack_from('<f',r,56)[0],'layers':[]}
   for i in range(4):
    layer,strength,speed=struct.unpack_from('<iff',r,60+i*12);assert layer==i;flow['layers'].append({'layer':layer,'strength':strength,'maxSpeed':speed})
  elif name=='HalfSubmergedSimple' and half is None:
   half=dict(zip('waterCut cutSoftness cutTilt curveStrength curveCenter curveWidth curvePower waveStrength waveSpeed waveDensity'.split(),struct.unpack_from('<10f',r,56)))
assert len(flowers)==442 and sum(len(f['fixtures']) for f in flowers.values())==480
assert len(walls)==4 and flow and half and physics and time and water
provenance={'source':str(source),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest()}
bodydata={**provenance,'fixedTimeStep':time['Fixed Timestep'],'maximumFrameTime':time['Maximum Allowed Timestep'],'velocityIterations':physics['m_VelocityIterations'],'positionIterations':physics['m_PositionIterations'],'contactOffset':physics['m_DefaultContactOffset'],'maxAngularSpeed':physics['m_MaxRotationSpeed'],'collisionMatrix':physics['m_LayerCollisionMatrix'],'flow':flow,'walls':walls,'flowers':flowers,
 'spawn':{'center':[0,-2.51],'xRange':[-2.6,2.6],'yRange':[-3.3,3.3],'jitterRadius':.25,'angleRange':[-180,180],'sizeRange':[.92,1.08],'initialImpulseRange':[.2,.5],'functions':[41043,44354]},'functionEvidence':{'flowUpdate':40963,'flowLayer':40964,'rigidbodySettings':40969,'clampSpeed':40966,'direction':40967,'register':40968,'depthChange':40972,'notifyRemoved':1591}}
resource_file('original/data/flower-runtime-physics.json',write=True).write_text(json.dumps(rounded(bodydata),separators=(',',':')))
resource_file('original/data/flower-water-materials.json',write=True).write_text(json.dumps(rounded({**provenance,'half':half,'water':water}),ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'flowers':len(flowers),'fixtures':480,'walls':len(walls),'flow':flow,'water':water},default=str,ensure_ascii=False))
