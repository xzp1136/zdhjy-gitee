from pathlib import Path
from asset_paths import resource_file, manifest_file
import json, struct, UnityPy
P=Path(__file__).resolve().parents[1]
m=json.loads(manifest_file().read_text())
env=UnityPy.load(m['source']);objects={(o.assets_file.name,o.path_id):o for o in env.objects};sprites={a['pathId']:a['resource'] for a in m['assets'] if a['type']=='Sprite' and a['unityFile']=='resources.assets'}

textures={(a['unityFile'],a['pathId']):a['resource'] for a in m['assets'] if a['type']=='Texture2D'}
for o in env.objects:
 if o.type.name=='Sprite' and o.assets_file.name=='resources.assets' and o.path_id not in sprites:
  d=o.read();key=(o.assets_file.name,d.m_RD.texture.path_id)
  if key in textures:sprites[o.path_id]=textures[key]

def read(ptr):
 try:return ptr.deref().read(check_read=False)
 except:return None

def asvec(v):return {k:getattr(v,k) for k in ['x','y','z','w'] if hasattr(v,k)}

def parse_node(o,depth=0):
 d=o.read();n={'name':d.m_Name,'pathId':o.path_id,'active':d.m_IsActive,'components':[]}
 tr=None
 for cp in d.m_Component:
  ptr=cp.component;v=read(ptr)
  if v is None:continue
  if ptr.type.name in ['RectTransform','Transform']:
   tr=v;n['transform']={k:asvec(getattr(v,k)) for k in ['m_LocalPosition','m_LocalScale','m_LocalRotation','m_AnchorMin','m_AnchorMax','m_AnchoredPosition','m_SizeDelta','m_Pivot'] if hasattr(v,k)}
  elif ptr.type.name=='MonoBehaviour':
   ms=read(v.m_Script);cl=getattr(ms,'m_ClassName','?');c={'type':cl,'pathId':ptr.path_id}
   obj=ptr.deref();raw=obj.get_raw_data()
   if cl in ['Image','Text'] and len(raw)>=60:
    c['color']={k:round(x*255) for k,x in zip(['r','g','b','a'],struct.unpack_from('<ffff',raw,44))}
   if cl=='CanvasScaler' and len(raw)>=60:
    c['referenceResolution']={'width':struct.unpack_from('<f',raw,44)[0],'height':struct.unpack_from('<f',raw,48)[0]};c['matchWidthOrHeight']=struct.unpack_from('<f',raw,56)[0]
   if cl=='Text' and len(raw)>=148:
    c['fontSize']=struct.unpack_from('<i',raw,100)[0];c['alignment']=struct.unpack_from('<i',raw,120)[0];c['bestFit']=bool(struct.unpack_from('<i',raw,108)[0]);le=struct.unpack_from('<i',raw,144)[0]
    if 0<=le<=len(raw)-148:c['text']=raw[148:148+le].decode('utf8')
   if cl=='Image':
    for i in range(32,len(raw)-12,4):
     fi,pi=struct.unpack_from('<iq',raw,i)
     if pi in sprites and fi in [0,1,2,3,4,5]:c.setdefault('spriteCandidates',[]).append({'offset':i,'sprite':sprites[pi],'fileId':fi})
   if cl in ['Text','TextMeshProUGUI']:
    # Printable serialized strings with length prefix.
    values=[]
    for i in range(32,len(raw)-4,4):
     le=struct.unpack_from('<i',raw,i)[0]
     if 0<le<200 and i+4+le<=len(raw):
      try:
       s=raw[i+4:i+4+le].decode('utf8')
       if all(ord(ch)>=32 or ch in '\n\t' for ch in s):values.append(s)
      except:pass
    c['textCandidates']=values
   n['components'].append(c)
  elif ptr.type.name=='SpriteRenderer':
   sprite=read(v.m_Sprite);n['components'].append({'type':'SpriteRenderer','sprite':getattr(sprite,'m_Name',None),'resource':sprites.get(v.m_Sprite.path_id)})
  else:n['components'].append({'type':ptr.type.name})
 if tr and depth<20:
  n['children']=[parse_node(c.read().m_GameObject.deref(),depth+1) for c in tr.m_Children]
 return n
for scene in ['level1','level2']:
 roots=[]
 for o in env.objects:
  if o.assets_file.name==scene and o.type.name in ['RectTransform','Transform']:
   d=o.read()
   if d.m_Father.path_id==0:roots.append(parse_node(d.m_GameObject.deref()))
 target=P/f'docs/reference/{scene}-layout.json';target.write_text(json.dumps(roots,indent=2,ensure_ascii=False));print(target)
 def walk(n,path=''):
  path+='/'+n['name'];t=n.get('transform',{});s=[c for c in n['components'] if c.get('spriteCandidates') or c.get('textCandidates')]
  if s:print(path,'TR',t.get('m_AnchoredPosition',t.get('m_LocalPosition')), 'SZ',t.get('m_SizeDelta'), 'COMP',s)
  for c in n.get('children',[]):walk(c,path)
 for n in roots:walk(n)
