#!/usr/bin/env python3
"""Export embedded main-pack AudioClips; preserve existing bundle exports."""
from pathlib import Path
from asset_paths import resource_file, manifest_file
import json, hashlib, re
import UnityPy
P=Path(__file__).resolve().parents[1]
manifest=json.loads(manifest_file().read_text())
env=UnityPy.load(manifest['source']);out=[]
for obj in env.objects:
    if obj.type.name!='AudioClip':continue
    d=obj.read()
    for name,data in d.samples.items():
        filename=re.sub(r'[^\w. -]','_',name)
        target=resource_file('original/audio/'+filename, write=True)
        reused=False
        if target.exists():
            if target.read_bytes()==data:reused=True
            else:target=target.with_name(target.stem+'_main'+target.suffix)
        if not reused:target.write_bytes(data)
        out.append({'sourceFile':obj.assets_file.name,'sourcePathId':obj.path_id,'sourceName':d.m_Name,
            'resource':'original/audio/'+target.stem,'file':str(target.relative_to(P)),
            'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'reusedIdenticalExport':reused,
            'duration':d.m_Length,'frequency':d.m_Frequency,'channels':d.m_Channels})
assert len(out)==25,len(out)
resource_file('original/data/original-main-audio.json', write=True).write_text(json.dumps({'source':manifest['source'],'clips':out},ensure_ascii=False,indent=2))
print(json.dumps(out,ensure_ascii=False))
