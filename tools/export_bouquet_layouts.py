"""Export original vase attachment geometry. Does not execute original game code."""
from pathlib import Path
import json,math,struct
P=Path(__file__).resolve().parents[1]
helper=P/'tools/inspect_unity_layout.py';ns={'__file__':str(helper)}
exec(helper.read_text().split("for scene in ['level1','level2']:")[0],ns)
manifest={x['resource']:x for x in ns['m']['assets']}
rm=dict(json.loads((Path(ns['m']['source']).parent.parent/'completeness-audit/resource-manager.json').read_text())['m_Container'])
vases=json.loads((P/'assets/resources/original/data/original-order-flower-vase-tables.json').read_text())['tables']['VaseInfoConfig']
metrics={}
for resource,m in manifest.items():
 if not (resource.startswith('original/flower/') or resource.startswith('original/vase/')):continue
 if m['type']!='Sprite':continue
 sprite=ns['objects'][(m['unityFile'],m['pathId'])].read();r=sprite.m_Rect;t=sprite.m_RD.textureRectOffset
 metrics[resource]={'width':m['width'],'height':m['height'],'logicalWidth':r.width,'logicalHeight':r.height,'centerOffsetX':t.x+m['width']/2-r.width/2,'centerOffsetY':t.y+m['height']/2-r.height/2}
def rotate(x,y,angle):
 a=math.radians(angle);return x*math.cos(a)-y*math.sin(a),x*math.sin(a)+y*math.cos(a)
def world_child(node,parent):
 t=node['transform'];pt=parent['t'];sz=pt['m_SizeDelta'];pivot=pt['m_Pivot'];anchor=t.get('m_AnchorMin',{'x':.5,'y':.5});pos=t.get('m_AnchoredPosition',{'x':0,'y':0});dx=((anchor['x']-pivot['x'])*sz['x']+pos['x'])*parent['sx'];dy=((anchor['y']-pivot['y'])*sz['y']+pos['y'])*parent['sy'];dx,dy=rotate(dx,dy,parent['angle']);sc=t['m_LocalScale'];r=t['m_LocalRotation']
 return {'x':parent['x']+dx,'y':parent['y']+dy,'sx':parent['sx']*sc['x'],'sy':parent['sy']*sc['y'],'angle':parent['angle']+math.degrees(2*math.atan2(r['z'],r['w'])),'t':t}
def image_layer(resource,w):
 m=metrics[resource];t=w['t'];sz=t['m_SizeDelta'];pv=t['m_Pivot'];sx=w['sx']*sz['x']/m['logicalWidth'];sy=w['sy']*sz['y']/m['logicalHeight'];dx=(.5-pv['x'])*sz['x']*w['sx']+m['centerOffsetX']*sx;dy=(.5-pv['y'])*sz['y']*w['sy']+m['centerOffsetY']*sy;dx,dy=rotate(dx,dy,w['angle'])
 return {k:round(v,5) if isinstance(v,float) else v for k,v in {'resource':resource,'x':w['x']+dx,'y':w['y']+dy,'width':m['width']*sx,'height':m['height']*sy,'angle':w['angle']}.items()}
output={};errors=[]
for vase in vases:
 name=vase['uiPrefabPath'];path='prefabs/vase/'+name
 try:
  tree=ns['parse_node'](ns['objects'][('resources.assets',rm[path]['m_PathID'])]);t=tree['transform'];size=t['m_SizeDelta'];pivot=t['m_Pivot'];w={'x':(pivot['x']-.5)*size['x'],'y':pivot['y']*size['y'],'sx':1,'sy':1,'angle':0,'t':t}
  item={'name':vase['name'],'containerPrefab':path,'origin':'container-bottom-center','baseLayers':[image_layer('original/vase/'+vase['uiResPath'],w)],'flowerSlots':[],'foregroundLayers':[]}
  component=next(c for c in tree['components'] if c['type']=='VaseItemCtr')
  raw=ns['objects'][('resources.assets',component['pathId'])].get_raw_data();pos=32;count=struct.unpack_from('<I',raw,pos)[0];pos+=4;orders=[]
  for _ in range(count):
   orderIndex,orderNumber,nodeCount=struct.unpack_from('<iii',raw,pos);pos+=12;refs=[]
   for _ in range(nodeCount):
    fileId,pathId=struct.unpack_from('<iq',raw,pos);pos+=12;refs.append(pathId)
   stringCount=struct.unpack_from('<I',raw,pos)[0];pos+=4;strings=[]
   for _ in range(stringCount):
    length=struct.unpack_from('<I',raw,pos)[0];pos+=4;strings.append(raw[pos:pos+length].decode('utf8'));pos=(pos+length+3)&~3
   orders.append({'group':orderIndex-1,'count':orderNumber,'refs':refs,'sprites':strings})
  assert len(raw)-pos==24,(name,'unexpected component tail',len(raw)-pos)
  worlds={}
  def index_nodes(node,nodeWorld):
   nodeWorld['drawOrder']=len(worlds)
   obj=ns['objects'][('resources.assets',node['pathId'])].read()
   for cp in obj.m_Component:
    if cp.component.type.name=='RectTransform':worlds[cp.component.path_id]=nodeWorld
   for child in node.get('children',[]):index_nodes(child,world_child(child,nodeWorld))
  index_nodes(tree,w)
  for order in orders:
   group=order['group']
   for index,ref in enumerate(order['refs']):
    fw=worlds[ref];fsz=fw['t']['m_SizeDelta'];slot={'group':group,'index':index,'drawOrder':fw['drawOrder'],'variantIndex':vase['flowerResIndex'][group][index],'x':fw['x'],'y':fw['y'],'width':fsz['x']*fw['sx'],'height':fsz['y']*fw['sy'],'scaleX':fw['sx'],'scaleY':fw['sy'],'angle':fw['angle'],'defaultSprite':order['sprites'][index] if index<len(order['sprites']) else None};item['flowerSlots'].append({k:round(v,5) if isinstance(v,float) else v for k,v in slot.items()})
  for child in tree.get('children',[]):
   if child['name']=='Image' and vase['uiResPathTwo']!=vase['uiResPath']:
    item['foregroundLayers'].append(image_layer('original/vase/'+vase['uiResPathTwo'],world_child(child,w)))
  item['flowerSlots'].sort(key=lambda slot:slot['drawOrder'])
  expected=sum(len(x) for x in vase['flowerResIndex']);assert len(item['flowerSlots'])==expected,(name,len(item['flowerSlots']),expected)
  output[str(vase['index'])]=item
 except Exception as exc:errors.append({'vaseId':vase['index'],'prefab':path,'error':str(exc)})
assert not errors,errors
D=P/'assets/resources/original/data';(D/'bouquet-layouts.json').write_text(json.dumps(output,ensure_ascii=False,indent=2));(D/'flower-sprite-metrics.json').write_text(json.dumps({k:v for k,v in metrics.items() if k.startswith('original/flower/')},ensure_ascii=False,indent=2))
print(json.dumps({'vases':len(output),'flowerSlots':sum(len(x['flowerSlots']) for x in output.values()),'flowerSpriteMetrics':sum(k.startswith('original/flower/') for k in metrics)},ensure_ascii=False))
