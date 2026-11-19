"""Export original OverUIControl's two SkeletonGraphic effects without redrawing.

Source WASM CreateTitleEffect=42831 and CreateVaseEffect=42832 load the named
prefabs. Adds routed assets in the existing effects bundle; Creator owns .meta.
"""
from pathlib import Path
import argparse,json,struct,hashlib
import UnityPy
from asset_paths import PROJECT,resource_file
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--source',type=Path,required=True);a=p.parse_args()
e=UnityPy.load(str(a.source));objects=list(e.objects);idx={(o.assets_file.name,o.path_id):o for o in objects}
def find(typ,name):
 found=[o for o in objects if o.type.name==typ and getattr(o.read(check_read=False),'m_Name','')==name]
 assert len(found)==1,(typ,name,len(found))
 return found[0]
def duration(x):
 if isinstance(x,dict):return max([float(x.get('time',0))]+[duration(v) for v in x.values()])
 if isinstance(x,list):return max([0]+[duration(v) for v in x])
 return 0
routepath=PROJECT/'assets/resources/bundle-routes.json';routes=json.loads(routepath.read_text())
owner=routes['routes']['original/effects/spine/huatexiao_1/huatexiao_1'];assert not routes['bundles'][owner]['remote']
manifest_path=resource_file('original/data/order-spine-effects.json',write=True);manifest=json.loads(manifest_path.read_text())
for role,prefab,name in [('resultTitle','OverLightSpineEffect','texiao_6'),('resultCard','OverVaseSpineEffect','texiao_5')]:
 obj=find('GameObject',prefab);go=obj.read();t=next(cp.component.read() for cp in go.m_Component if cp.component.type.name=='RectTransform')
 comp=next(cp.component.deref() for cp in go.m_Component if cp.component.type.name=='MonoBehaviour' and cp.component.deref().read(check_read=False).m_Script.read().m_ClassName=='SkeletonGraphic')
 fi,pi=struct.unpack_from('<iq',comp.get_raw_data(),88);assert fi==0
 skel=idx[obj.assets_file.name,pi];r=skel.get_raw_data();n=struct.unpack_from('<i',r,28)[0];pos=(32+n+3)//4*4;count=struct.unpack_from('<i',r,pos)[0];scale=struct.unpack_from('<f',r,pos+4+12*count)[0]
 text=find('TextAsset',name).read().m_Script;atlas=find('TextAsset',name+'.atlas').read().m_Script;data=json.loads(text);assert data['skeleton']['spine']=='3.8.99'
 mat=find('Material',name+'_Material').read_typetree();assert dict(mat['m_SavedProperties']['m_Floats'])['_StraightAlphaInput']==1
 resource='original/effects/spine/'+name+'/'+name
 routes['routes'][resource]=owner
 # JSON+PNG share the same extensionless route; .atlas needs its own routed key.
 routepath.write_text(json.dumps(routes,ensure_ascii=False,separators=(',',':')))
 resource_file(resource+'.json',write=True).write_text(text)
 # The route resolver strips the file suffix, so the extensionless resource also owns atlas.
 resource_file(resource+'.atlas',write=True).write_text(atlas)
 tex=find('Texture2D',name);tex.read().image.save(resource_file(resource+'.png',write=True))
 choice={'prefab':'prefabs/model/'+prefab.lower(),'resource':resource,'animation':'animation','track':0,
 'duration':duration(data['animations']['animation']),'prefabScale':[t.m_LocalScale.x,t.m_LocalScale.y,t.m_LocalScale.z],
 'sourceSkeletonDataScale':scale,'sourceJsonSha256':hashlib.sha256(text.encode()).hexdigest(),'sourcePrefabPathId':obj.path_id,
 'sourceComponentPathId':comp.path_id,'sourceRenderer':'SkeletonGraphic','source':str(a.source),'sourceSha256':hashlib.sha256(a.source.read_bytes()).hexdigest(),'alphaMode':'straight','importNormalization':None}
 roledata={'choices':[choice]}
 if role=='resultCard':roledata['followup']={'animation':'animation2','loop':True,'duration':duration(data['animations']['animation2'])}
 else:roledata['localOffset']=[159,20];roledata['loop']=True
 manifest['roles'][role]=roledata
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# Every file in one effect folder has the same route key; remove unused aliases.
for k in list(routes['routes']):
 if k.endswith('.atlas') and '/texiao_' in k:del routes['routes'][k]
for name in ['core-data',owner]:
 files=[f for f in (PROJECT/'assets/bundles'/name).rglob('*') if f.is_file() and f.suffix!='.meta']
 routes['bundles'][name]['sourceBytes']=sum(f.stat().st_size for f in files)
 routes['bundles'][name]['fileCount']=len(files)
routepath.write_text(json.dumps(routes,ensure_ascii=False,separators=(',',':')))
print(json.dumps({k:manifest['roles'][k] for k in ['resultTitle','resultCard']},ensure_ascii=False))
