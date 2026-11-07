"""Build the six-card first-win preview from exported original geometry.

Containers are verified from VaseInfoConfig. Species are selected from the
observed colors; the sunflower rear group is still an explicit inference.
"""
from pathlib import Path
import json,math
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).resolve().parents[1];D=P/'assets/resources/original/data'
layouts=json.loads((D/'bouquet-layouts.json').read_text());metrics=json.loads((D/'flower-sprite-metrics.json').read_text())
selection=[('1401',['cdsy_dhmd']),('1501',['dys_bbh']),('1901',['zy_hxj']),('2001',['zyj_byjx']),('2201',['xy_sz']),('5201',['zyj_dfyjx','cdtx_xrk'])]
result={'level':1,'source':'original-vase-table-and-prefab-geometry-with-observed-flower-color-selection','note':'Container mappings, names, unlock level and variant indices are original data. Preview species selection is visually inferred; rear sunflowers in the last bouquet are not yet verified.','bouquets':[]}
for vaseId,groups in selection:
 layout=layouts[vaseId];layers=list(layout['baseLayers'])
 for slot in layout['flowerSlots']:
  resource='original/flower/'+groups[slot['group']]+'_'+str(slot['variantIndex']+1).zfill(2);m=metrics[resource];sx=slot['scaleX'];sy=slot['scaleY'];a=math.radians(slot['angle']);dx=m['centerOffsetX']*sx;dy=m['centerOffsetY']*sy
  layers.append({'resource':resource,'x':slot['x']+dx*math.cos(a)-dy*math.sin(a),'y':slot['y']+dx*math.sin(a)+dy*math.cos(a),'width':m['width']*sx,'height':m['height']*sy,'angle':slot['angle']})
 layers+=layout['foregroundLayers'];result['bouquets'].append({'name':layout['name'],'vaseIndex':int(vaseId),'containerPrefab':layout['containerPrefab'],'mappingConfidence':'original-vase-table','flowerSelectionSource':'Observed color/type; rear sunflower group in vase5201 is inferred.','layers':layers})
(D/'win-preview-level1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
out=Image.new('RGB',(900,800),(232,224,208));draw=ImageDraw.Draw(out);font=ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc',26)
for i,b in enumerate(result['bouquets']):
 canvas=Image.new('RGBA',(1000,1000));origin=(500,700)
 for layer in b['layers']:
  im=Image.open(P/'assets/resources'/(layer['resource']+'.png')).convert('RGBA');im=im.resize((max(1,round(layer['width'])),max(1,round(layer['height']))),Image.Resampling.LANCZOS).rotate(layer['angle'],resample=Image.Resampling.BICUBIC,expand=True);canvas.alpha_composite(im,(round(origin[0]+layer['x']-im.width/2),round(origin[1]-layer['y']-im.height/2)))
 im=canvas.crop(canvas.getbbox());im.thumbnail((260,325),Image.Resampling.LANCZOS);x=i%3*300;y=i//3*400;draw.rounded_rectangle((x+10,y+10,x+290,y+390),radius=16,fill=(250,245,227),outline=(191,157,107),width=2);out.paste(im,(x+(300-im.width)//2,y+20+(325-im.height)//2),im);draw.text((x+150,y+360),b['name'],anchor='mm',font=font,fill=(159,74,65))
out.save(P/'docs/reference/win-preview-level1.jpg',quality=94)
print('Rebuilt 6 bouquet previews and contact sheet.')
