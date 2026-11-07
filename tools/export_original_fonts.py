#!/usr/bin/env python3
"""Export embedded original UI fonts and audit scene Text font references.
Requires UnityPy; optional fontTools validates glyph coverage.
"""
from pathlib import Path
from asset_paths import resource_file, manifest_file
from io import BytesIO
import json, struct, collections, hashlib
import UnityPy
try:
    from fontTools.ttLib import TTFont
except ImportError:
    TTFont = None
P=Path(__file__).resolve().parents[1]
manifest=json.loads(manifest_file().read_text())
env=UnityPy.load(manifest['source'])
fontrecords=[];maps={};fonts={}
ui_text=''.join(path.read_text() for path in (P/'assets/scripts').glob('Flower*.ts'))
# Current UI symbols and all CJK present in scripts, including product copy.
required={ord(c) for c in ui_text if '\u4e00'<=c<='\u9fff'}|set(map(ord,'0123456789x%+-×: /！？，。'))
for o in env.objects:
    if o.type.name!='Font':continue
    f=o.read()
    if f.m_Name not in ['AlibabaPuHuiTi-2-65-Medium','ZhanKuXiaoLOGOTi-2']:continue
    raw=bytes(f.m_FontData);out=resource_file('original/fonts/'+f.m_Name+'.ttf', write=True);out.write_bytes(raw)
    record={'sourceFile':o.assets_file.name,'pathId':o.path_id,'name':f.m_Name,'bytes':len(raw),
        'resource':'original/fonts/'+f.m_Name,'sha256':hashlib.sha256(raw).hexdigest()}
    if TTFont:
        ff=TTFont(BytesIO(raw));cmap=ff.getBestCmap();maps[f.m_Name]=cmap
        record.update(cmapCount=len(cmap),glyphCount=ff['maxp'].numGlyphs,
            missingScriptCharacters=''.join(chr(c) for c in sorted(required-set(cmap))),
            familyNames=sorted({n.toUnicode() for n in ff['name'].names if n.nameID in (1,2,4,6)}))
    fonts[(o.assets_file.name,o.path_id)]=f.m_Name;fontrecords.append(record)
if maps:
    resource_file('original/fonts/font-coverage.json', write=True).write_text(json.dumps({
        'body': ''.join(chr(c) for c in sorted(maps['AlibabaPuHuiTi-2-65-Medium'])),
        'display': ''.join(chr(c) for c in sorted(maps['ZhanKuXiaoLOGOTi-2'])),
    }, ensure_ascii=False, indent=2))
texts=[];counts=collections.Counter();missing_by_font=collections.defaultdict(set)
for o in env.objects:
    if o.type.name!='MonoBehaviour':continue
    try:
        a=o.read(check_read=False);sc=a.m_Script.read()
        if sc.m_ClassName!='Text':continue
        raw=o.get_raw_data()
        if len(raw)<148:continue
        fi,pi=struct.unpack_from('<iq',raw,88);le=struct.unpack_from('<i',raw,144)[0]
        if le<0 or le>len(raw)-148:continue
        text=raw[148:148+le].decode('utf8');go=a.m_GameObject.read();name=go.m_Name
        fontfile=o.assets_file.name if fi==0 else o.assets_file.externals[fi-1].path.split('/')[-1]
        fname=fonts.get((fontfile,pi),'external-or-builtin')
        counts[(fontfile,pi,fname)]+=1
        missing=''.join(sorted({c for c in text if not c.isspace() and ord(c) not in maps.get(fname,{})})) if fname in maps else None
        if missing:missing_by_font[fname].update(missing)
        # Full hierarchy for useful, stable mapping.
        path=name;cur=go
        for _ in range(25):
            tr=next((c.component.read() for c in cur.m_Component if c.component.type.name in ['Transform','RectTransform']),None)
            if tr is None or tr.m_Father.path_id==0:break
            cur=tr.m_Father.read().m_GameObject.read();path=cur.m_Name+'/'+path
        texts.append({'sourceFile':o.assets_file.name,'pathId':o.path_id,'path':path,'name':name,'text':text,
            'fontFile':fontfile,'fontPathId':pi,'fontName':fname,'fontSize':struct.unpack_from('<i',raw,100)[0],
            'fontStyle':struct.unpack_from('<i',raw,104)[0],
            'colorRGBA':[round(x*255) for x in struct.unpack_from('<4f',raw,44)],
            'missingInAssignedFont':missing})
    except (KeyError,AttributeError,IndexError,UnicodeDecodeError,ValueError):
        continue
out={'source':manifest['source'],'fonts':fontrecords,
    'usageCounts':[{'file':k[0],'pathId':k[1],'fontName':k[2],'count':v} for k,v in counts.items()],
    'missingOriginalTextCharacters':{k:''.join(sorted(v)) for k,v in missing_by_font.items()},'texts':texts}
(P/'docs/reference/original-font-usage.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(json.dumps({'fonts':fontrecords,'usageCounts':out['usageCounts'],'textRecords':len(texts),'missingOriginalTextCharacters':out['missingOriginalTextCharacters']},ensure_ascii=False))
