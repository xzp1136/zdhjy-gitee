import { EffectAsset, JsonAsset, Material, Node, Sprite, SpriteFrame, Texture2D, UITransform, Vec4 } from 'cc';
import { loadFlowerAsset } from './FlowerAssets';
import { uiNode } from './FlowerUI';

type HalfParameters = {waterCut: number; cutSoftness: number; cutTilt: number; curveStrength: number; curveCenter: number;
    curveWidth: number; curvePower: number; waveStrength: number; waveSpeed: number; waveDensity: number};
type SourceWater = {half: HalfParameters; water: {floats: Record<string,number>; colors: Record<string,{r:number;g:number;b:number;a:number}>;
    textures: Record<string,{resource:string;wrapU:number;wrapV:number;filter:number}>}};
type Assets = {source: SourceWater; half: EffectAsset; water: EffectAsset; flow: Texture2D; detail: Texture2D};
let pending: Promise<Assets>|null=null;
const scalars=['_FlowTimeScale','_BaseDistortion','_DetailStrength','_Perspective','_EdgeProtectWidth','_WaterFloatStrength','_WaterFloatSpeed',
    '_WaterFloatScale','_EdgeFloatStrength','_EdgeAlphaFloat','_HighlightThreshold','_HighlightSoftness','_HighlightStrength','_WaterAlpha'];
const vectors=['_Color','_WaterColor','_HighlightColor','_FlowTiling','_DetailTiling','_FlowSpeed','_DetailSpeed'];
function load<T>(path: string,type: new (...args:any[])=>T): Promise<T> {
    return new Promise((resolve,reject)=>loadFlowerAsset(path,type as any,(error,asset)=>error?reject(error):resolve(asset as unknown as T)));
}
function assets(): Promise<Assets> {
    if(!pending)pending=Promise.all([load('original/data/flower-water-materials',JsonAsset),load('original/materials/flower-half-water',EffectAsset),
        load('original/materials/flower-water-surface',EffectAsset)]).then(async ([json,half,water])=>{
            const source=json.json as SourceWater;
            const [flow,detail]=await Promise.all([load(source.water.textures._FlowTex.resource+'/texture',Texture2D),load(source.water.textures._DetailTex.resource+'/texture',Texture2D)]);
            for(const [name,texture] of [['_FlowTex',flow],['_DetailTex',detail]] as const) {
                const setting=source.water.textures[name];
                const wrap=(value: number)=>value===0?Texture2D.WrapMode.REPEAT:value===2?Texture2D.WrapMode.MIRRORED_REPEAT:Texture2D.WrapMode.CLAMP_TO_EDGE;
                texture.setWrapMode(wrap(setting.wrapU),wrap(setting.wrapV));
                texture.setFilters(setting.filter===0?Texture2D.Filter.NEAREST:Texture2D.Filter.LINEAR,setting.filter===0?Texture2D.Filter.NEAREST:Texture2D.Filter.LINEAR);
            }
            return {source,half,water,flow,detail};
        }).catch(error=>{pending=null;throw error;});
    return pending;
}

/** CPU counterpart of the original alpha equation, also used for regression. */
export function originalWaterMask(uv: {x:number;y:number},time: number,p: HalfParameters,under: boolean): number {
    const x=(uv.x-p.curveCenter)/Math.max(p.curveWidth*.5,.0001);
    const cut=Math.max(0,Math.min(1,p.waterCut+p.curveStrength*Math.pow(Math.max(1-x*x,0),Math.max(p.curvePower,.0001))
        +(uv.x-.5)*p.cutTilt+Math.sin((uv.x*p.waveDensity+time*p.waveSpeed)*Math.PI*2)*p.waveStrength));
    const t=Math.max(0,Math.min(1,(uv.y-(cut-p.cutSoftness))/(2*p.cutSoftness))),above=t*t*(3-2*t);
    return under?1-above:above;
}

/** Real RGB textures with independent water-above/water-below render roots. */
export class FlowerWaterRenderer {
    private readonly materials=new Map<Sprite,Material>();
    private readonly frames=new Map<SpriteFrame,SpriteFrame>();
    private readonly down=new Map<string,{node:Node;image:Sprite}>();
    constructor(private readonly source: Assets,private readonly belowRoot: Node) {}
    static preload(): Promise<Assets> {return assets();}
    static async create(belowRoot: Node): Promise<FlowerWaterRenderer> {return new FlowerWaterRenderer(await assets(),belowRoot);}
    private frozen(frame: SpriteFrame): SpriteFrame {
        let copy=this.frames.get(frame);
        if(!copy){copy=frame.clone();copy.packable=false;this.frames.set(frame,copy);}
        return copy;
    }
    private uv(material: Material,frame: SpriteFrame): void {
        const uv=frame.uv;
        material.setProperty('uvOriginX',new Vec4(uv[0],uv[1],uv[2]-uv[0],uv[3]-uv[1]));
        material.setProperty('uvAxisY',new Vec4(uv[4]-uv[0],uv[5]-uv[1],0,0));
    }
    private half(sprite: Sprite,under: boolean): void {
        let material=this.materials.get(sprite);
        if(!material){material=new Material();material.initialize({effectAsset:this.source.half});this.materials.set(sprite,material);}
        sprite.customMaterial=material;
        this.uv(material,sprite.spriteFrame!);
        const p=this.source.source.half;
        material.setProperty('cut',new Vec4(p.waterCut,p.cutSoftness,p.cutTilt,under?1:0));
        material.setProperty('curve',new Vec4(p.curveStrength,p.curveCenter,p.curveWidth,p.curvePower));
        material.setProperty('wave',new Vec4(p.waveStrength,p.waveSpeed,p.waveDensity,0));
    }
    applySurface(sprite: Sprite): void {
        sprite.spriteFrame=this.frozen(sprite.spriteFrame!);
        const material=new Material();material.initialize({effectAsset:this.source.water});this.materials.set(sprite,material);sprite.customMaterial=material;
        this.uv(material,sprite.spriteFrame);
        const water=this.source.source.water;
        for(let i=0;i<4;i++)material.setProperty('scalars'+i,new Vec4(...[0,1,2,3].map(j=>water.floats[scalars[i*4+j]]??0) as [number,number,number,number]));
        vectors.forEach((name,i)=>{const c=water.colors[name];material.setProperty('inputs'+i,new Vec4(c.r,c.g,c.b,c.a));});
        material.setProperty('flowTexture',this.source.flow);material.setProperty('detailTexture',this.source.detail);
    }
    sync(id: string,image: Sprite,band: number,visible: boolean): void {
        let copy=this.down.get(id);
        if(!copy){
            const size=image.node.getComponent(UITransform)!;
            const node=uiNode(this.belowRoot,'Submerged-'+id,0,0,size.width,size.height);
            const sprite=node.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.spriteFrame=this.frozen(image.spriteFrame!);
            copy={node,image:sprite};this.down.set(id,copy);
            image.spriteFrame=this.frozen(image.spriteFrame!);
        }
        image.grayscale=false;copy.image.grayscale=false;
        image.node.active=visible&&band<2;
        copy.node.active=visible&&(band===1||band===2);
        if(band===1){this.half(image,false);this.half(copy.image,true);}
        else {image.customMaterial=null;copy.image.customMaterial=null;}
        const entry=image.node.parent!;
        copy.node.setPosition(entry.position.x,entry.position.y,0);copy.node.angle=entry.angle;
        copy.node.setScale(entry.scale.x,entry.scale.y,1);
        copy.image.node.getComponent(UITransform)!.setContentSize(image.node.getComponent(UITransform)!.width,image.node.getComponent(UITransform)!.height);
    }
    order(ids: readonly string[]): void {ids.forEach((id,i)=>this.down.get(id)?.node.setSiblingIndex(i));}
    take(id: string,image: Sprite): void {
        const copy=this.down.get(id);
        if(copy){copy.node.active=false;copy.node.destroy();this.down.delete(id);const material=this.materials.get(copy.image);material?.destroy();this.materials.delete(copy.image);}
        image.node.active=true;image.customMaterial=null;
        const material=this.materials.get(image);material?.destroy();this.materials.delete(image);
        // Collection flights outlive the pool. Return their borrowed shared frame
        // before the renderer disposes its private unpacked UV copies.
        for(const [original,frozen] of this.frames)if(image.spriteFrame===frozen){image.spriteFrame=original;break;}
    }
    dispose(): void {for(const {node} of this.down.values()){node.active=false;node.destroy();}this.down.clear();for(const m of this.materials.values())m.destroy();this.materials.clear();for(const f of this.frames.values())f.destroy();this.frames.clear();}
}
