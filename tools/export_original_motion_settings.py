#!/usr/bin/env python3
"""Export serialized scene motion settings and audited original WASM constants."""
from pathlib import Path
import json, struct, collections, hashlib
import UnityPy
P=Path(__file__).resolve().parents[1]
manifest=json.loads((P/'assets/resources/original/manifest.json').read_text())
source=Path(manifest['source']);env=UnityPy.load(str(source))
wasm=source.parent.parent/'expanded/game.wasm'
wasm_sha=hashlib.sha256(wasm.read_bytes()).hexdigest()
assert wasm_sha=='9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92','Re-audit function constants for this source binary.'
web=source.read_bytes();pos=20;meta=None
while pos<struct.unpack_from('<I',web,16)[0]:
    off,n,l=struct.unpack_from('<III',web,pos);pos+=12;name=web[pos:pos+l].decode();pos+=l
    if name.endswith('global-metadata.dat'):meta=web[off:off+n]
assert meta is not None
def string(n):
    pos=406072+n;return meta[pos:meta.find(b'\0',pos)].decode()
types={}
for i in range(3900,4500):
    a=struct.unpack_from('<16i8H2I',meta,6332248+i*88)
    types[a[2]]={'name':string(a[0]),'parent':a[4]}
def is_view(name):
    t=next((t for t in types.values() if t['name']==name),None)
    while t:
        if t['name']=='BaseViewUI':return True
        t=types.get(t['parent'])
    return False
def hierarchy(go):
    names=[go.m_Name]
    while True:
        tr=next((c.component.read() for c in go.m_Component if c.component.type.name in ['Transform','RectTransform']),None)
        if not tr or not tr.m_Father.path_id:break
        go=tr.m_Father.read().m_GameObject.read();names.append(go.m_Name)
    return '/'.join(reversed(names))
def f(b,o):return struct.unpack_from('<f',b,o)[0]
def i(b,o):return struct.unpack_from('<i',b,o)[0]

manager_fields=['vacancyStartDelay','vacancyNearRadius','vacancyTargetRandomRadius',
 'bottomToUpDelay','bottomToUpDuration','bottomToUpMoveRate','bottomToUpRandomRadius','bottomToUpRotateAngle','bottomToUpOvershoot','bottomToUpDepthSwitchProgress','bottomToUpEndImpulse','bottomPromoteCooldown',
 'downToBottomDelay','downToBottomDuration','downToUpDelay','downToUpDuration','downToUpMoveRate','downToUpRandomRadius','downToUpRotateAngle','downToUpOvershoot','downToUpEndImpulse',
 'autoPromoteIntervalMin','autoPromoteIntervalMax','autoPromoteChance','middleAutoUpExtraLimit',
 'middleToUpDuration','middleToUpRotateAngle','middleToUpOvershoot','middleToUpEndImpulse','middlePromoteCooldown','bottomDirectUpChance','downDirectUpChance']
manager={};buttons=[];views=[];flower_lengths=collections.Counter();flower_count=0
for o in env.objects:
    if o.type.name!='MonoBehaviour':continue
    try:d=o.read(check_read=False);name=d.m_Script.read().m_ClassName
    except (ValueError,AttributeError,KeyError):continue
    b=o.get_raw_data()
    if name=='FlowerManager':
        assert o.assets_file.name=='level2' and o.path_id==701 and len(b)==212
        manager={'sourceFile':o.assets_file.name,'sourcePathId':o.path_id,'sourcePath':hierarchy(d.m_GameObject.read()),'values':{},'serializedOffsets':{}}
        for k,n in enumerate(manager_fields):
            off=60+4*k;manager['values'][n]=i(b,off) if n=='middleAutoUpExtraLimit' else f(b,off);manager['serializedOffsets'][n]=off
    elif name=='ButtonHandler':
        assert len(b)==56
        buttons.append({'sourceFile':o.assets_file.name,'sourcePathId':o.path_id,'path':hierarchy(d.m_GameObject.read()),
            'IsScaleAction':bool(i(b,32)),'DelayScaleAnim':f(b,36),'IsPlaySound':bool(i(b,40)),
            'scaleSize':f(b,44),'LongPressBtn':bool(i(b,48)),'LongPressInterval':f(b,52)})
    elif name=='FlowerCtr':flower_count+=1;flower_lengths[len(b)]+=1
    elif is_view(name):
        assert len(b)>=100,(name,len(b))
        fi,pi=struct.unpack_from('<iq',b,72)
        views.append({'sourceFile':o.assets_file.name,'sourcePathId':o.path_id,'class':name,'path':hierarchy(d.m_GameObject.read()),
            'animationDurationOpen':f(b,32),'startScale':list(struct.unpack_from('<3f',b,36)),
            'endScale':list(struct.unpack_from('<3f',b,48)),'animationDurationClose':f(b,60),
            'StartAnimEase':i(b,64),'EndAnimEase':i(b,68),'Panel':{'fileId':fi,'pathId':pi} if pi else None,
            'IsOpenSound':bool(i(b,84)),'IsCloseSound':bool(i(b,88)),'delayOpenTime':f(b,92),'isDelayOpen':bool(i(b,96))})
move,picked=struct.unpack('<2f',struct.pack('<q',4584664421721471713))
result={'version':1,'source':str(source),'sourceWasmSha256':wasm_sha,'flowerManager':manager,
 'flowerCollection':{'sourceFunction':44385,'runtimeFieldOffsets':{'moveDuration':172,'pickedScaleRatio':176,'targetScaleRatio':180},
    'moveDuration':move,'pickedScaleRatio':picked,'targetScaleRatioDefault':struct.unpack('<f',struct.pack('<I',1055622431))[0],
    'prefabCountChecked':flower_count,'serializedRecordLengths':dict(flower_lengths),'serializedOverride':False,
    'note':'These three private runtime fields are absent from the serialized FlowerCtr data. The target scale field is overwritten by the target argument in function 44288.'},
 'spawn':{'function':41077,'batchSizeMinInclusive':3,'batchSizeMaxExclusive':5,'batchInterval':.05,'finalWait':.35,
    'visibleScaleIn':{'function':41042,'duration':.35,'from':[0,0,0],'to':'configured flower root scale','ease':9,'easeName':'OutCubic'},
    'soundId':73,'soundName':'flowerstart','soundRemark':'关卡开始创建花朵'},
 'buttonHandlers':buttons,'buttonPressDefaults':{'downFunction':43784,'upFunction':43785,'duration':.1,'ease':7,'easeName':'InOutQuad','scaleSize':.9,'homeStartScaleSize':.94},
 'baseViews':views,
 'uiAnimationRestart':{'StartFunction':43173,'UpdateFunction':43175,'CoroutineFunction':43179,'interval':'integer Random.Range(2,5), sampled once at Start; 2, 3 or 4 seconds','trigger':'wait normalizedTime>=1; mark IsPlaying=false/completed=true; wait the sampled interval; restart from normalizedTime 0. Normal completion does not disable the Animator.'},
 'gameUIEntry':{'UIManagerFunction':43184,'GameUIShowFunction':42695,'CloseCutSceneFunction':42696,'GameMgrStartFunction':41031,'GamePlayMoveNextFunction':41073,'animateArgument':False,'scenePanelReference':None,'note':'No whole-board popup scale. GameUI ShowView calls CloseCutSceneAni immediately; GamePlay yields one frame then enables IsPlayGame/gameState.'},
 'soundMapping':{'sourceFunction':56047,'72':{'remark':'花朵飞到花篮位置','resourceName':'flowerhit'},'73':{'remark':'关卡开始创建花朵','resourceName':'flowerstart'},'74':{'remark':'花篮订单完成','resourceName':'vasesuccss'}}}
(P/'assets/resources/original/data/original-motion-settings.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'manager':manager['values'],'buttons':len(buttons),'views':len(views),'flowerCtr':flower_count},ensure_ascii=False))
