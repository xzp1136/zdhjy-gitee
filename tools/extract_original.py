"""Export original Unity runtime art without modifying the source archive."""
from pathlib import Path
from collections import Counter
import json, re, UnityPy
from PIL import Image, ImageDraw

SOURCE=Path('/Users/zhangxiaoqiang/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_2godfknbh8v622_57d5/msg/file/2026-11/真的好解压_wx38b4f3dff4fbedf0_资源汇总_20261106(1)/真的好解压_wx38b4f3dff4fbedf0/runtime-cache/d83724c5931a26b5.webgl.data.unityweb.bin')
PROJECT=Path(__file__).resolve().parents[1]
DEST=PROJECT/'assets/resources/original'; DEST.mkdir(parents=True,exist_ok=True)
DOC=PROJECT/'docs/reference'; DOC.mkdir(parents=True,exist_ok=True)
env=UnityPy.load(str(SOURCE))
objects={(o.assets_file.name,o.path_id):o for o in env.objects}
rm=json.loads((SOURCE.parent.parent/'completeness-audit/resource-manager.json').read_text())['m_Container']
manifest=[];errors=[];skipped=[];chosen={}
allowed={'background','butterfly','flower','font','order','ui','uiflower','vase','water'}
for path,ptr in rm:
 if path.split('/')[0] not in allowed:continue
 obj=objects.get(('resources.assets',ptr['m_PathID']))
 if not obj or obj.type.name not in ['Sprite','Texture2D','Font']:continue
 if path in chosen and chosen[path].type.name=='Sprite':continue
 chosen[path]=obj
for path,obj in chosen.items():
 if path.startswith('font/'):
  skipped.append({'path':path,'reason':'Runtime font is an empty atlas, not a reusable font file.'});continue
 try:
  d=obj.read();filename=re.sub(r'[^\w./ -]','_',path)
  ext='.ttf' if obj.type.name=='Font' else '.png'
  target=DEST/(filename+ext);target.parent.mkdir(parents=True,exist_ok=True)
  item={'source':path,'resource':'original/'+filename,'file':str(target.relative_to(PROJECT)),'unityFile':obj.assets_file.name,'pathId':obj.path_id,'type':obj.type.name}
  if ext=='.png':
   im=d.image; im.save(target);item.update(width=im.width,height=im.height)
   if obj.type.name=='Sprite':
    item['pixelsPerUnit']=d.m_PixelsToUnits;item['pivot']={'x':d.m_Pivot.x,'y':d.m_Pivot.y};item['border']={k:getattr(d.m_Border,k) for k in ['x','y','z','w']}
  else:
   data=bytes(d.m_FontData)
   if not data:
    skipped.append({'path':path,'reason':'Font data is not embedded in this runtime export.'});continue
   target.write_bytes(data)
  manifest.append(item)
 except Exception as exc:
  if obj.type.name=='Font':skipped.append({'path':path,'reason':'Font data is not available from the runtime export.'})
  else:errors.append({'path':path,'error':str(exc)})
# Export named non-resource textures used by the main scene's UI.
known={(m['unityFile'],m['pathId']) for m in manifest}
known.update(('resources.assets', ptr['m_PathID']) for path,ptr in rm)
for obj in env.objects:
 if obj.type.name!='Texture2D' or obj.assets_file.name=='unity_default_resources':continue
 d=obj.read()
 if (obj.assets_file.name,obj.path_id) in known or d.m_Name.startswith(('Font Texture','Alibaba','Liberation','Rank')):continue
 # Sprite export references can already cover the texture; only include unmapped named art.
 if any(v.type.name=='Texture2D' and v.path_id==obj.path_id and v.assets_file.name==obj.assets_file.name for v in chosen.values()):continue
 name=re.sub(r'[^\w.-]','_',d.m_Name)
 if not name:continue
 filename=f'extras/{name}_{obj.path_id}'
 target=DEST/(filename+'.png');target.parent.mkdir(parents=True,exist_ok=True)
 try:
  im=d.image;im.save(target)
  manifest.append({'source':d.m_Name,'resource':'original/'+filename,'file':str(target.relative_to(PROJECT)),'unityFile':obj.assets_file.name,'pathId':obj.path_id,'type':'Texture2D','width':im.width,'height':im.height})
 except Exception as exc:errors.append({'path':filename,'error':str(exc)})
for bundle in SOURCE.parent.glob('WebGL/*.bundle'):
 if not any(x in bundle.name for x in ['bgm_','sound_short']):continue
 be=UnityPy.load(str(bundle))
 for obj in be.objects:
  if obj.type.name!='AudioClip':continue
  d=obj.read()
  try:
   for name,data in d.samples.items():
    target=DEST/'audio'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    manifest.append({'source':d.m_Name,'resource':'original/audio/'+target.stem,'file':str(target.relative_to(PROJECT)),'type':'AudioClip','bytes':len(data)})
  except Exception as exc:errors.append({'path':d.m_Name,'error':str(exc)})
(DEST/'manifest.json').write_text(json.dumps({'source':str(SOURCE),'unityVersions':list(set(o.assets_file.unity_version for o in env.objects)),'assets':manifest,'errors':errors,'skipped':skipped},ensure_ascii=False,indent=2))
for category,prefixes in [('ui',['background/','order/','ui/']),('flowers',['flower/']),('vases',['vase/']),('extras',['extras/'])]:
 items=[m for m in manifest if m['file'].endswith('.png') and any(m['resource'].replace('original/','',1).startswith(p) for p in prefixes)]
 for start in range(0,len(items),120):
  batch=items[start:start+120];cellw,cellh=160,152;cols=8;rows=(len(batch)+cols-1)//cols
  out=Image.new('RGB',(cellw*cols,cellh*rows),(230,230,230));draw=ImageDraw.Draw(out)
  for i,m in enumerate(batch):
   x=(i%cols)*cellw;y=(i//cols)*cellh
   im=Image.open(PROJECT/m['file']).convert('RGBA');im.thumbnail((152,118));out.paste(im,(x+(cellw-im.width)//2,y+(120-im.height)//2),im)
   name=m['resource'].replace('original/','',1)
   draw.text((x+3,y+122),name[:25],fill='black')
   if len(name)>25:draw.text((x+3,y+134),name[25:50],fill='black')
  out.save(DOC/f'{category}-{start//120+1}.jpg',quality=90)
print(json.dumps({'exported':len(manifest),'categories':dict(Counter(m['type'] for m in manifest)),'errors':errors,'manifest':str(DEST/'manifest.json')},ensure_ascii=False))
