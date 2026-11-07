from pathlib import Path
from collections import Counter
import struct,re,json,hashlib
import argparse
PROJECT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Statically extract original order/flower/vase tables; never executes original game code.')
parser.add_argument('--wat',type=Path,required=True,help='WABT wasm2wat output for the original expanded/game.wasm')
args=parser.parse_args()
manifest=json.loads((PROJECT/'assets/resources/original/manifest.json').read_text())
source=Path(manifest['source']);wasm=source.parent.parent/'expanded/game.wasm'
WASM=wasm.read_bytes()
expected='9f5a09f6a716a3d240fcf8d045fc80feb9012f0cb0a7459151ab135270863e92'
assert hashlib.sha256(WASM).hexdigest()==expected,'Unsupported original binary: function indices must be verified again.'
web=source.read_bytes();p=20
while p<struct.unpack_from('<I',web,16)[0]:
 off,n,l=struct.unpack_from('<III',web,p);p+=12;name=web[p:p+l].decode();p+=l
 if name.endswith('global-metadata.dat'):META=web[off:off+n]
def leb(p):
 v=shift=0
 while True:
  a=WASM[p];p+=1;v|=(a&127)<<shift;shift+=7
  if a<128:return v,p
p=8;sections={}
while p<len(WASM):
 t=WASM[p];n,q=leb(p+1);sections[t]=(q,q+n);p=q+n
p,_=sections[11];count,p=leb(p);segments=[]
for _ in range(count):
 flag,p=leb(p);assert flag==0 and WASM[p]==0x41;p+=1;base,p=leb(p);assert WASM[p]==0x0b;p+=1;n,p=leb(p);segments.append((base,WASM[p:p+n]));p+=n
MEM=bytearray(max(base+len(blob) for base,blob in segments))
for base,blob in segments:MEM[base:base+len(blob)]=blob
functions={};current=None;wanted={56133,56134,56139,56140,56141,56142}
for line in args.wat.open():
 if line.startswith('  (func (;'):
  number=int(line.split('(;')[1].split(';')[0]);current=number if number in wanted else None
 if current is not None:functions.setdefault(current,[]).append(line.rstrip('\n'))
assert set(functions)==wanted,'Missing expected WAT function indices.'
DEST=PROJECT/'assets/resources/original/data';DEST.mkdir(exist_ok=True)
def literal(v):
 if (v>>29)!=5 or not(v&1):return v
 idx=(v&0x1fffffff)>>1;n,s=struct.unpack_from('<II',META,256+idx*8)
 return META[98152+s:98152+s+n].decode('utf8')
def emulate(fn):
 lines=functions[fn]
 header=lines[:lines.index('    end')];sp=int(next(l for l in header if 'local.tee' in l).split()[-1]);lines=lines[lines.index('    end')+1:]
 stack=[];loc={i:0 for i in range(10)};loc[sp]=10000000;writes={};objs={};nxt=20000000;root=None
 def read(a):return writes.get(a,struct.unpack_from('<I',MEM,a)[0] if 0<=a<len(MEM)-3 else 0)
 def popn(n):
  v=stack[-n:];del stack[-n:];return v
 for i,line in enumerate(lines):
  t=line.strip().rstrip(')').split();op=t[0];args=t[1:];off=int(next((x[7:] for x in args if x.startswith('offset=')),0))
  if op in ['i32.const','i64.const']:stack.append(int(args[0]))
  elif op=='local.get':stack.append(loc[int(args[0])])
  elif op=='local.set':loc[int(args[0])]=stack.pop()
  elif op=='local.tee':loc[int(args[0])]=stack[-1]
  elif op=='i32.add':a,b=popn(2);stack.append(a+b)
  elif op=='i32.load':stack.append(read(stack.pop()+off))
  elif op in ['i32.store','i64.store']:
   a,v=popn(2);writes[a+off]=v&0xffffffff
   if op=='i64.store':writes[a+off+4]=(v>>32)&0xffffffff
  elif op=='global.set':stack.pop()
  elif op=='call':
   call=int(args[0])
   if call==1900:
    cls=stack.pop();ptr=nxt;nxt+=256;objs[ptr]={'type':cls,'list':None,'dict':None};stack.append(ptr)
   elif call==34422:
    ptr,method=popn(2);objs[ptr]['dict']={};root=ptr
   elif call==35169:
    ptr,method=popn(2);objs[ptr]['list']=[]
   elif call==50463:
    ptr,item,method=popn(3)
    # IL2CPP generic shared List<int>.Add takes the value by address.
    if method==struct.unpack_from('<I',MEM,3387788)[0]:item=read(item)
    objs[ptr]['list'].append(item)
   elif call==34391:
    ptr,key,obj,method=popn(4);objs[ptr]['dict'][read(key)]=obj
   else:raise ValueError(('call',call,fn,i))
  else:raise ValueError(('unsupported',op,fn,i))
 assert not stack,(fn,stack)
 def resolve(v):
  if v in objs:
   obj=objs[v]
   if obj['list'] is not None:return [resolve(x) for x in obj['list']]
   if obj['dict'] is not None:return {str(k):resolve(x) for k,x in obj['dict'].items()}
   return {str(off):resolve(read(v+off)) for off in range(8,64,4)}
  return literal(v)
 return resolve(root)
def mapped(fn,fields):
 raw=emulate(fn);out=[]
 for key,row in raw.items():
  d={name:row[str(off)] for off,name in fields.items()};assert d['index']==int(key),(fn,key,d);out.append(d)
 return out
orderfields={8:'index',12:'remark',16:'orderList',20:'diffValue'}
itemfields={8:'index',12:'type',16:'uiPath',20:'flowerPrefabPath',24:'name',28:'sound',32:'layerOrderValue',36:'flowerSize',40:'unlockLevel',44:'playUpSound',48:'nameSound',52:'collectionNum',56:'rewardNum'}
vasefields={8:'index',12:'name',16:'explain',20:'uiPrefabPath',24:'uiResPath',28:'uiResPathTwo',32:'orderInfo',36:'flowerResIndex',40:'unlockLevel',44:'collectionNum',48:'rewardNum'}
outputs={}
for title,fn in [('OrderLevelConfig',56133),('OrderLevelConfigA',56139),('OrderLevelConfigB',56140),('OrderLevelConfigC',56141)]:outputs[title]=mapped(fn,orderfields)
outputs['ItemDataConfig']=mapped(56134,itemfields)
for item in outputs['ItemDataConfig']:item['flowerSize']=struct.unpack('<f',struct.pack('<I',item['flowerSize']))[0]
outputs['VaseInfoConfig']=mapped(56142,vasefields)
result={'source':'Original IL2CPP static constructors, statically evaluated from supplied game.wasm; no game code executed.','sourceWasm':str(wasm),'sourceWasmSha256':expected,'sourceMetadataSha256':hashlib.sha256(META).hexdigest(),'status':'extracted-original','versionSelection':'Unverified: OrderLevelConfig/A/B/C selection is runtime logic. Preserve all variants.','functionIndices':{'OrderLevelConfig':56133,'OrderLevelConfigA':56139,'OrderLevelConfigB':56140,'OrderLevelConfigC':56141,'ItemDataConfig':56134,'VaseInfoConfig':56142},'tables':outputs}
(DEST/'original-order-flower-vase-tables.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'output':str(DEST/'original-order-flower-vase-tables.json'),'counts':{k:len(v) for k,v in outputs.items()}},ensure_ascii=False))
