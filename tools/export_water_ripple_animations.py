#!/usr/bin/env python3
"""Export original ripple prefab geometry, Sprite frames and animation curves.

Reads the provided Unity runtime pack; writes ordinary PNG/JSON files only.
Transforms on per-flower instances map effect-root Unity units to the cropped
FlowerImage centered UV space (Y up). Never apply the source prefab root's
serialized scale again: CreateRippleObject overrides it with RippleTransformData.
"""
from pathlib import Path
from asset_paths import resource_file, manifest_file
import json, math, re, struct, zlib, collections
import UnityPy

P = Path(__file__).resolve().parents[1]
manifest = json.loads(manifest_file().read_text())
env = UnityPy.load(manifest['source'])
objects = {(o.assets_file.name, o.path_id): o for o in env.objects}
assets = {a['resource']: a for a in manifest['assets'] if a['type'] == 'Sprite'}

def rnd(v):
    if isinstance(v, float): return round(v, 9)
    if isinstance(v, list): return [rnd(x) for x in v]
    if isinstance(v, dict): return {k: rnd(x) for k, x in v.items()}
    return v

def mul(a, b):
    return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1],
            a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3],
            a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]

def inv(m):
    a,b,c,d,x,y=m;det=a*d-b*c
    assert abs(det)>1e-10
    return [d/det,-b/det,-c/det,a/det,(c*y-d*x)/det,(b*x-a*y)/det]

def affine(pos, angle, scale):
    a=math.radians(angle);c=math.cos(a);s=math.sin(a)
    return [c*scale[0],s*scale[0],-s*scale[1],c*scale[1],pos[0],pos[1]]

def euler_affine(pos, rot, scale):
    # Unity Euler applies Z, then X, then Y. Preserve XY projection of small
    # authored X/Y tilts; source XYZ remains present for a future 3D renderer.
    x,y,z=map(math.radians,rot);cx,sx=math.cos(x),math.sin(x);cy,sy=math.cos(y),math.sin(y);cz,sz=math.cos(z),math.sin(z)
    return [(cy*cz+sy*sx*sz)*scale[0],cx*sz*scale[0],
            (-cy*sz+sy*sx*cz)*scale[1],cx*cz*scale[1],pos[0],pos[1]]

def tf(t):
    q=t.m_LocalRotation;assert abs(q.x)<1e-5 and abs(q.y)<1e-5
    return affine([t.m_LocalPosition.x,t.m_LocalPosition.y],
                  math.degrees(2*math.atan2(q.z,q.w)),[t.m_LocalScale.x,t.m_LocalScale.y])

def transform(go):
    return next(c.component.read() for c in go.m_Component if c.component.type.name=='Transform')

sprites={}
def export_sprite(file, pid):
    if not pid:return None
    o=objects[file,pid];assert o.type.name=='Sprite';s=o.read()
    name=re.sub(r'[^\w.-]','_',s.m_Name)+'_'+str(pid)
    resource='original/effects/ripple/'+name
    if resource not in sprites:
        im=s.image;im.save(resource_file(resource+'.png', write=True))
        sprites[resource]={'sourceFile':file,'sourcePathId':pid,'sourceName':s.m_Name,
            'width':im.width,'height':im.height,'ppu':s.m_PixelsToUnits,
            'logicalSize':[s.m_Rect.width,s.m_Rect.height],
            'trimOffset':[s.m_RD.textureRectOffset.x,s.m_RD.textureRectOffset.y],
            'pivot':[s.m_Pivot.x,s.m_Pivot.y]}
    return resource

effect_objects={}
for o in env.objects:
    if o.type.name=='GameObject':
        go=o.read()
        if go.m_Name.startswith(('Ani_lianyi','Ani_bowen')):effect_objects[go.m_Name]=o

effects={};clip_objects={};path_names={0:''}
for name,o in effect_objects.items():
    go=o.read();t=transform(go);nodes=[];clipnames=[]
    for comp in go.m_Component:
        if comp.component.type.name=='Animator':
            ctrl=comp.component.read().m_Controller.read()
            for ptr in ctrl.m_AnimationClips:
                co=ptr.deref();cd=co.read();clip_objects[cd.m_Name]=co;clipnames.append(cd.m_Name)
    assert len(clipnames)==1,(name,clipnames)
    def walk(tr,path,parent):
        ng=tr.m_GameObject.read();path_names[zlib.crc32(path.encode())]=path
        n={'path':path,'parent':parent,'transform':tf(tr),'active':bool(ng.m_IsActive)}
        for cp in ng.m_Component:
            if cp.component.type.name=='SpriteRenderer':
                sr=cp.component.read();assert not sr.m_FlipX and not sr.m_FlipY
                n.update(sprite=export_sprite(o.assets_file.name,sr.m_Sprite.path_id),
                    color=[sr.m_Color.r,sr.m_Color.g,sr.m_Color.b,sr.m_Color.a],sortingOrder=sr.m_SortingOrder)
        nodes.append(n)
        for ch in tr.m_Children:
            child=ch.read();walk(child,path+'/'+child.m_GameObject.read().m_Name,path)
    for ch in t.m_Children:
        child=ch.read();walk(child,child.m_GameObject.read().m_Name,'')
    effects[name]={'sourceFile':o.assets_file.name,'sourceGameObjectPathId':o.path_id,
        'clip':clipnames[0],'sourceRootTransformOverriddenAtRuntime':tf(t),'nodes':nodes}

attrs={zlib.crc32(s.encode()):s for s in ['m_Color.r','m_Color.g','m_Color.b','m_Color.a','m_IsActive']}
clips={}
for name,o in clip_objects.items():
    d=o.read_typetree();mc=d['m_MuscleClip'];data=mc['m_Clip']['data'];duration=mc['m_StopTime']
    bindings=d['m_ClipBindingConstant']['genericBindings'];pptrs=d['m_ClipBindingConstant']['pptrCurveMapping']
    tracks=[]
    for b in bindings:
        assert b['path'] in path_names,(name,b)
        if b['typeID']==4:
            field,axes={1:('m_LocalPosition','xyz'),2:('m_LocalRotation','xyzw'),3:('m_LocalScale','xyz'),4:('localEulerAnglesRaw','xyz')}[b['attribute']]
            tracks.extend({'nodePath':path_names[b['path']],'property':field+'.'+axis,'keys':[]} for axis in axes)
            continue
        prop='sprite' if b['isPPtrCurve'] else attrs.get(b['attribute'])
        assert prop is not None,(name,b)
        tracks.append({'nodePath':path_names[b['path']],'property':prop,'keys':[]})
    raw=struct.pack('<'+'I'*len(data['m_StreamedClip']['data']),*data['m_StreamedClip']['data']);p=0
    while p<len(raw):
        time,count=struct.unpack_from('<fI',raw,p);p+=8
        for _ in range(count):
            idx,*coeff=struct.unpack_from('<I4f',raw,p);p+=20
            if time>duration+1e-5:continue
            time0=max(0,time)
            value=coeff[3]
            if tracks[idx]['property']=='sprite':
                pi=pptrs[int(value)];assert pi['m_FileID']==0
                value=export_sprite(o.assets_file.name,pi['m_PathID'])
            elif tracks[idx]['property']=='m_IsActive':value=bool(value)
            key={'time':time0,'value':value}
            if tracks[idx]['property'] not in ['sprite','m_IsActive']:key['coefficients']=coeff
            # Streamed clips contain initial sentinel values at -FLT_MAX.
            # Real zero keys supersede them.
            if tracks[idx]['keys'] and tracks[idx]['keys'][-1]['time']==time0:tracks[idx]['keys'][-1]=key
            else:tracks[idx]['keys'].append(key)
    base=data['m_StreamedClip']['curveCount']+data['m_StreamedClip'].get('discreteCurveCount',0)+data['m_DenseClip']['m_CurveCount']
    assert data['m_DenseClip']['m_CurveCount']==0,'Unexpected dense ripple curve'
    for i,v in enumerate(data['m_ConstantClip']['data']):tracks[base+i]['keys']=[{'time':0,'value':v}]
    assert all(t['keys'] for t in tracks),(name,tracks)
    clips[name]={'sourceFile':o.assets_file.name,'sourcePathId':o.path_id,'duration':duration,
        'loop':mc['m_LoopTime'],'sampleRate':d['m_SampleRate'],'tracks':tracks}

class Reader:
    def __init__(self,b):self.b=b;self.p=32
    def floats(self,n):a=struct.unpack_from('<'+'f'*n,self.b,self.p);self.p+=n*4;return list(a)
    def int(self):a=struct.unpack_from('<i',self.b,self.p)[0];self.p+=4;return a
    def string(self):n=self.int();s=self.b[self.p:self.p+n].decode();self.p=(self.p+n+3)//4*4;return s
    def point(self):
        name=self.string();pos=self.floats(3);rot=self.floats(3);scale=self.floats(3)
        if not name:return None
        assert name in effects,name
        return {'effect':name,'sourcePosition':pos,'sourceEulerAngles':rot,'sourceScale':scale,
                'localTransform':euler_affine(pos,rot,scale)}

prefabs={};settings=collections.Counter()
for o in env.objects:
    if o.type.name!='MonoBehaviour':continue
    try:d=o.read(check_read=False);sc=d.m_Script.read()
    except (ValueError,AttributeError,KeyError):continue
    if sc.m_ClassName!='WaterRippleAnimationCtr':continue
    go=d.m_GameObject.read();wt=transform(go);rt=wt.m_Father.read();root=rt.m_GameObject.read()
    resource='original/flower/'+root.m_Name
    assert resource in assets,resource
    major=next(ch.read() for ch in rt.m_Children if ch.read().m_GameObject.read().m_Name=='FlowerMajor')
    a=assets[resource];sp=objects[a['unityFile'],a['pathId']].read();w,h=a['width'],a['height'];ppu=sp.m_PixelsToUnits
    shift=[sp.m_Pivot.x*sp.m_Rect.width-sp.m_RD.textureRectOffset.x-w/2,
           sp.m_Pivot.y*sp.m_Rect.height-sp.m_RD.textureRectOffset.y-h/2]
    to_uv=mul([ppu/w,0,0,ppu/h,shift[0]/w,shift[1]/h],mul(inv(tf(major)),tf(wt)))
    reader=Reader(o.get_raw_data());params=reader.floats(6);settings[tuple(params)]+=1
    promotion=reader.point();up=[reader.point() for _ in range(reader.int())];up=[x for x in up if x];middle=reader.point()
    assert reader.p==len(reader.b),(reader.p,len(reader.b))
    for pt in [promotion,*up,middle]:
        if pt:pt['transform']=mul(to_uv,pt.pop('localTransform'))
    prefabs[resource]={'sourceMonoPathId':o.path_id,'sourceFile':o.assets_file.name,
        'imageSize':[w,h],'majorTransform':tf(major),'waterTransform':tf(wt),
        'promotion':promotion,'up':up,'middle':middle,
        'speeds':{'promotion':params[0],'up':params[2],'middle':params[3]},
        'promotionFallbackDuration':params[1],'initialDelayRange':params[4:6]}

result={'version':1,'source':manifest['source'],
 'coordinateSpace':'effect-root-unity-units-to-cropped-flower-image-centered-uv-y-up',
 'matrixConvention':'[a,b,c,d,tx,ty]: x=a*x+c*y+tx; y=b*x+d*y+ty. Multiply output UV by actual FlowerImage width/height. Effect root transform is overridden, not multiplied.',
 'spriteGeometry':'Cropped PNG centered rectangle: center=(trimOffset+size/2-pivot*logicalSize)/ppu; width=width/ppu; height=height/ppu. Compose child node transforms then per-flower instance transform.',
 'curveEvaluation':'Choose latest key with time<=t. Sprite/active are step keys. For color keys with coefficients [a,b,c,d], value=((a*dt+b)*dt+c)*dt+d where dt=t-key.time. Clamp displayed color to [0,1]. Otherwise use key.value.',
 'behavior':{'initialDelayRange':[.1,.4],'initialUp':'up','initialMiddle':'middle','initialPhase':'uniform normalized [0,1] per animator','bottomAndDown':'none',
   'promotedToUp':'promotion at normalizedTime 0; wait clip length, release promotion then play up with random normalized phase',
   'promotedToMiddle':'middle with random normalized phase','click':'no standalone click ripple call found; ripple nodes belong to flower waterRipple child; release on remove'},
 'clips':clips,'effects':effects,'sprites':sprites,'prefabs':dict(sorted(prefabs.items()))}
out=resource_file('original/data/water-ripple-animations.json', write=True);out.write_text(json.dumps(rnd(result),ensure_ascii=False,indent=2))
print(json.dumps({'prefabs':len(prefabs),'effects':list(effects),'clips':list(clips),'sprites':len(sprites),'settings':[(list(k),v) for k,v in settings.items()]},ensure_ascii=False))
