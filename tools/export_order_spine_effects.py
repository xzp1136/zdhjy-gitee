#!/usr/bin/env python3
"""Export original order Spine 3.8 assets and all 119 vase RectTransforms."""
from pathlib import Path
from asset_paths import resource_file, manifest_file
import json, struct, hashlib
import UnityPy
P=Path(__file__).resolve().parents[1]
m=json.loads(manifest_file().read_text())
source=Path(m['source']);env=UnityPy.load(str(source))
objects={(o.assets_file.name,o.path_id):o for o in env.objects}
rm=dict(json.loads((source.parent.parent/'completeness-audit/resource-manager.json').read_text())['m_Container'])
defs=[('flowerPut','flowerspineeft1','huatexiao_1'),('flowerPut','flowerspineeft2','huatexiao_3'),
 ('flowerPut','flowerspineeft3','huatexiao_4'),('vaseComplete','vasecmpspineeft','hualanxiaoshi'),
 ('vaseSwitch','vaseswitchspineeft','hualanxiaoshi2'),('orderTip','ordertipspine','orderTipSpine'),
 ('orderNewVase','ordernewvasespine','xinghuashu')]
def find_type(type_name,name):
    matches=[o for o in env.objects if o.type.name==type_name and o.read(check_read=False).m_Name==name]
    assert len(matches)==1,(type_name,name,len(matches))
    return matches[0]
def duration(x):
    if isinstance(x,dict):return max([float(x.get('time',0))]+[duration(v) for v in x.values()])
    if isinstance(x,list):return max([0]+[duration(v) for v in x])
    return 0
roles={}
for role,prefab,name in defs:
    pp='prefabs/model/'+prefab;goobj=objects['resources.assets',rm[pp]['m_PathID']];go=goobj.read()
    tr=next(c.component.read() for c in go.m_Component if c.component.type.name=='Transform')
    comp=next(c.component.deref() for c in go.m_Component if c.component.type.name=='MonoBehaviour' and c.component.deref().read(check_read=False).m_Script.read().m_ClassName=='SkeletonAnimation')
    fi,pi=struct.unpack_from('<iq',comp.get_raw_data(),32);assert fi==0
    skel=objects['resources.assets',pi];raw=skel.get_raw_data();n=struct.unpack_from('<i',raw,28)[0];pos=(32+n+3)//4*4
    atlas_count=struct.unpack_from('<i',raw,pos)[0];assert atlas_count==1
    scale=struct.unpack_from('<f',raw,pos+4+12*atlas_count)[0]
    txt=find_type('TextAsset',name);atlas=find_type('TextAsset',name+'.atlas');tex=find_type('Texture2D',name)
    material=find_type('Material',name+'_Material');mat=material.read_typetree()
    straight=dict(mat['m_SavedProperties']['m_Floats'])['_StraightAlphaInput']
    assert straight==1 and '_STRAIGHT_ALPHA_INPUT' in mat['m_ValidKeywords']
    source_text=txt.read().m_Script;data=json.loads(source_text);fix=None
    if 'skeleton' not in data:
        assert name=='hualanxiaoshi2' and name in data
        # Only normalize the source's metadata-header key so the Cocos importer
        # recognizes the file. Bone/skin/animation content remains untouched.
        data={'skeleton':data[name],**{k:v for k,v in data.items() if k!=name}}
        fix='Rename metadata header hualanxiaoshi2 to skeleton for Cocos importer detection; no animation changes.'
        evidence=P/'docs/reference/spine-source';evidence.mkdir(exist_ok=True)
        (evidence/(name+'.source.json')).write_text(source_text)
    assert data['skeleton']['spine']=='3.8.99'
    resource='original/effects/spine/'+name+'/'+name
    resource_file(resource+'.json', write=True).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')) if fix else source_text)
    atlas_text=atlas.read().m_Script;assert atlas_text.lstrip().splitlines()[0]==name+'.png'
    resource_file(resource+'.atlas', write=True).write_text(atlas_text)
    texture=tex.read();texture.image.save(resource_file(resource+'.png', write=True))
    entry={'prefab':pp,'resource':'original/effects/spine/'+name+'/'+name,
        'animation':'animation','track':0,'loop':False,'duration':duration(data['animations']['animation']),
        'prefabScale':[tr.m_LocalScale.x,tr.m_LocalScale.y,tr.m_LocalScale.z],
        'sourceSkeletonDataScale':scale,'sourcePrefabPositionIgnored':[tr.m_LocalPosition.x,tr.m_LocalPosition.y,tr.m_LocalPosition.z],
        'sourcePrefabPathId':goobj.path_id,'sourceSkeletonAnimationPathId':comp.path_id,'sourceSkeletonDataPathId':pi,
        'sourceJsonPathId':txt.path_id,'sourceAtlasPathId':atlas.path_id,'sourceTexturePathId':tex.path_id,
        'sourceJsonSha256':hashlib.sha256(source_text.encode()).hexdigest(),'importNormalization':fix,
        'textureSize':[texture.m_Width,texture.m_Height],'alphaMode':'straight',
        'sourceMaterialPathId':material.path_id,'sourceStraightAlphaInput':straight}
    roles.setdefault(role,{'selection':'uniform' if role=='flowerPut' else 'single','choices':[],
        'offsetPolicy':'caller-anchor-world-position; ignore prefab authoring position'})['choices'].append(entry)
roles['orderTip']['newVaseMode']={'loop':True,'lifetime':5,'sourceFunction':43453,'note':'isNew=true loops and is returned after 5 seconds; ordinary group-change hint is a single 1.5 second play.'}
data={'version':1,'source':str(source),'spineVersion':'3.8.99','roles':roles,
 'scalePolicy':{'unityCameraOrthographicSize':9.600000381,'unityReferenceHeight':1920,'unityPixelsPerWorldUnit':100,
    'cocosNodeScale':'750/1080 * prefabScale; Cocos SkeletonData.scale=1. Source SkeletonData.scale .01 is canceled by 100 UI pixels per Unity world unit.'},
 'anchors':{'coordinateSpace':'1080x1920 Unity UI units relative to OrderItem/vaseParent center',
    'vaseParent':{'position':[0,0],'size':[240,290],'pivot':[.5,.5]},
    'orderNewVase':{'position':[0,-145],'sourceNode':'newVaseSpinePos'},
    'vaseComplete':{'position':[0,0],'sourceNode':'OrderItem.transform'},
    'vaseSwitch':{'position':[0,0],'sourceNode':'OrderItem.transform'},
    'orderTip':{'position':[-13,-166.799987793],'sourceNode':'imgOrderTip.transform','size':[176,116],'pivot':[.5,.449999988]},
    'flowerPut':{'position':'each received flower attachment pivot','sourceNode':'flower node Transform'}}}
resource_file('original/data/order-spine-effects.json', write=True).write_text(json.dumps(data,ensure_ascii=False,indent=2))
table=json.loads(resource_file('original/data/original-order-flower-vase-tables.json').read_text())['tables']['VaseInfoConfig']
rects={}
for v in table:
    path='prefabs/vase/'+v['uiPrefabPath'];go=objects['resources.assets',rm[path]['m_PathID']].read()
    t=next(c.component.read() for c in go.m_Component if c.component.type.name=='RectTransform')
    rects[str(v['index'])]={'path':path,'name':v['name'],'width':t.m_SizeDelta.x,'height':t.m_SizeDelta.y,
        'pivot':[t.m_Pivot.x,t.m_Pivot.y],'scale':[t.m_LocalScale.x,t.m_LocalScale.y,t.m_LocalScale.z]}
assert len(rects)==119
resource_file('original/data/order-motion-layouts.json', write=True).write_text(json.dumps(rects,ensure_ascii=False,indent=2))
print(json.dumps({'effects':[(k,len(v['choices'])) for k,v in roles.items()],'vases':len(rects)},ensure_ascii=False))
