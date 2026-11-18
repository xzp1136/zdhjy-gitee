import { JsonAsset, Node } from 'cc';
import { loadFlowerAsset } from './FlowerAssets';
export const FLOWER_WORLD_UNIT = 750 / 10.8;
export const FLOWER_PHYSICS_REVISION = 'contact-stable-20261118';
export const FLOWER_PHYSICS_STEP = 1 / 30;
export const FLOWER_PHYSICS_MAX_STEPS = 3;
export const FLOWER_PHYSICS_PAIR_BUDGET = 4096;
// Independent per-step budgets leave room for the player's foreground even
// when the lower layers contain a large overlapping pile.
export const FLOWER_PHYSICS_FINE_BUDGETS = [1024, 256, 1536] as const;
export const FLOWER_PHYSICS_OVERLAP_LIMIT = .006;
export const FLOWER_PHYSICS_CROWD_OVERLAP_LIMIT = .06;
type Point = {x: number; y: number};
type Pose = Point & {angle: number};
export type PhysicsFixture = {kind: string; matrix: number[]; offset: Point; density: number; friction: number; restitution: number;
    m_Size?: Point; m_Radius?: number; m_Direction?: number; m_Points?: {m_Paths: Point[][]}};
export type OriginalBody = {mass: number; autoMass: boolean; gravityScale: number; constraints: number; fixtures: PhysicsFixture[]};
export type OriginalPhysics = {fixedTimeStep: number; maximumFrameTime: number; velocityIterations: number; positionIterations: number;
    contactOffset: number; maxAngularSpeed: number; collisionMatrix: number[]; walls: PhysicsFixture[]; flowers: Record<string, OriginalBody>;
    flow: {updateInterval: number; updateStep: number; directionInterval: number[]; linearDrag: number; angularDrag: number; torqueImpulse: number;
        layers: {layer: number; strength: number; maxSpeed: number}[]};
    spawn: {center: number[]; xRange: number[]; yRange: number[]; jitterRadius: number; angleRange: number[]; initialImpulseRange: number[]}};
let pending: Promise<OriginalPhysics> | null = null;
export function loadOriginalPhysics(): Promise<OriginalPhysics> {
    if (!pending) pending = new Promise<OriginalPhysics>((resolve,reject) => loadFlowerAsset('original/data/flower-runtime-physics',JsonAsset,
        (error,asset) => error ? reject(error) : resolve(asset.json as OriginalPhysics))).catch(error => {pending=null;throw error;});
    return pending;
}


type Capsule = {ax:number; ay:number; bx:number; by:number; radius:number};
type State = {
    id:string; shapes:readonly Capsule[]; local:Float64Array; world:Float64Array; mass:number;
    geometryAngle:number; geometryScale:number; worldDirty:boolean;
    localMinX:number; localMinY:number; localMaxX:number; localMaxY:number; radius:number;
    x:number; y:number; angle:number; vx:number; vy:number; spin:number; previous:Pose;
    display:Pose; smoothUntil:number;
    band:number; baseScale:number; scale:number; active:boolean; ready:boolean; readyAt:number;
    initialized:boolean; resumePose?:Pose; direction:Point; nextDirection:number; impulse:Point;
    sleeping:boolean; driven:boolean; wakeDepth:number; activeUntil:number; index:number; previousGroupSize:number;
    correctionX:number; correctionY:number; corrections:number; contactAxes:Map<State,Point>;
    quietTime:number; quietX:number; quietY:number; quietAngle:number; touchUntil:number;
    minX:number; minY:number; maxX:number; maxY:number;
};
type Bucket = {epoch:number; indices:number[]};
type Contact = {nx:number; ny:number; depth:number};
const profiles = new WeakMap<OriginalPhysics,Map<string,readonly Capsule[]>>();
const CELL_SIZE=2, SOLVER_PASSES=3, SLOP=.0025, CONTACT_SKIN=.005;
const MAX_CORRECTION=.15, MAX_SPIN=8*Math.PI/180, REST_DELAY=.7, REST_STEP=.002, REST_RANGE=.02;
const WAKE_MARGIN=.35, WAKE_MAX_DEPTH=2, ACTIVE_WINDOW=.8;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const angleDelta=(a:number,b:number)=>((b-a+540)%360+360)%360-180;
const indexOrder=(a:number,b:number)=>a-b;
function transformed(f:PhysicsFixture,x:number,y:number):Point {
    const m=f.matrix;x+=f.offset.x;y+=f.offset.y;
    return {x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]};
}
function boxPoints(f:PhysicsFixture):Point[] {
    const x=f.m_Size!.x/2,y=f.m_Size!.y/2;
    return [transformed(f,-x,-y),transformed(f,x,-y),transformed(f,x,y),transformed(f,-x,y)];
}
function simplify(f:PhysicsFixture):Capsule {
    const m=f.matrix,sx=Math.hypot(m[0],m[1]),sy=Math.hypot(m[2],m[3]),p=transformed(f,0,0);
    if(f.kind==='CircleCollider2D')return {ax:p.x,ay:p.y,bx:p.x,by:p.y,radius:f.m_Radius!*Math.max(sx,sy)};
    if(f.kind==='CapsuleCollider2D'){
        const vertical=f.m_Direction===0,width=f.m_Size!.x*sx,height=f.m_Size!.y*sy;
        const radius=(vertical?width:height)/2,segment=Math.max(0,(vertical?height:width)/2-radius);
        const dx=segment*(vertical?m[2]/sy:m[0]/sx),dy=segment*(vertical?m[3]/sy:m[1]/sx);
        return {ax:p.x-dx,ay:p.y-dy,bx:p.x+dx,by:p.y+dy,radius};
    }
    // Only the small polygon minority uses an approximate principal-axis
    // capsule. Detailed artwork click polygons remain unchanged in FlowerPool.
    const points=f.kind==='PolygonCollider2D'
        ?f.m_Points!.m_Paths.reduce<Point[]>((a,path)=>a.concat(path.map(q=>transformed(f,q.x,q.y))),[])
        :f.kind==='BoxCollider2D'?boxPoints(f):[];
    if(!points.length)throw Error('Unsupported flower shape: '+f.kind);
    let mx=0,my=0,xx=0,yy=0,xy=0;
    for(const q of points){mx+=q.x;my+=q.y;}mx/=points.length;my/=points.length;
    for(const q of points){const x=q.x-mx,y=q.y-my;xx+=x*x;yy+=y*y;xy+=x*y;}
    const theta=.5*Math.atan2(2*xy,xx-yy),ux=Math.cos(theta),uy=Math.sin(theta);
    let lo=Infinity,hi=-Infinity,bottom=Infinity,top=-Infinity;
    for(const q of points){const a=q.x*ux+q.y*uy,b=-q.x*uy+q.y*ux;lo=Math.min(lo,a);hi=Math.max(hi,a);bottom=Math.min(bottom,b);top=Math.max(top,b);}
    const radius=Math.max(.01,(top-bottom)/2),segment=Math.max(0,(hi-lo)/2-radius);
    const x=(lo+hi)/2*ux-(bottom+top)/2*uy,y=(lo+hi)/2*uy+(bottom+top)/2*ux;
    return {ax:x-ux*segment,ay:y-uy*segment,bx:x+ux*segment,by:y+uy*segment,radius};
}

/** Segment closest points handle both capsules and zero-length circles.
 * Intersecting segments use projection axes to avoid an undefined/random normal. */
function contact(a:Float64Array,i:number,b:Float64Array,j:number,out:Contact,preferred?:Point):boolean {
    const ux=a[i+2]-a[i],uy=a[i+3]-a[i+1],vx=b[j+2]-b[j],vy=b[j+3]-b[j+1];
    const wx=a[i]-b[j],wy=a[i+1]-b[j+1],aa=ux*ux+uy*uy,cc=vx*vx+vy*vy;
    const bb=ux*vx+uy*vy,dd=ux*wx+uy*wy,ee=vx*wx+vy*wy;
    let s=0,t=0;
    if(aa<1e-12)t=cc<1e-12?0:clamp(ee/cc,0,1);
    else if(cc<1e-12)s=clamp(-dd/aa,0,1);
    else {
        const denominator=aa*cc-bb*bb;
        s=denominator>1e-12?clamp((bb*ee-cc*dd)/denominator,0,1):0;
        t=(bb*s+ee)/cc;
        if(t<0){t=0;s=clamp(-dd/aa,0,1);}
        else if(t>1){t=1;s=clamp((bb-dd)/aa,0,1);}
    }
    const dx=b[j]+t*vx-a[i]-s*ux,dy=b[j+1]+t*vy-a[i+1]-s*uy;
    const radius=a[i+4]+b[j+4],distance2=dx*dx+dy*dy;
    if(distance2>(radius+CONTACT_SKIN)**2)return false;
    if(distance2>1e-14){const distance=Math.sqrt(distance2);out.nx=dx/distance;out.ny=dy/distance;out.depth=radius-distance;return true;}
    out.depth=Infinity;
    for(let axis=0;axis<2;axis++){
        let nx=axis?-vy:-uy,ny=axis?vx:ux,length=Math.hypot(nx,ny);
        if(length<1e-10){nx=axis?0:1;ny=axis?1:0;length=1;}nx/=length;ny/=length;
        const a0=a[i]*nx+a[i+1]*ny,a1=a[i+2]*nx+a[i+3]*ny,b0=b[j]*nx+b[j+1]*ny,b1=b[j+2]*nx+b[j+3]*ny;
        const positive=Math.max(a0,a1)+a[i+4]-Math.min(b0,b1)+b[j+4];
        const negative=Math.max(b0,b1)+b[j+4]-Math.min(a0,a1)+a[i+4];
        const depth=Math.min(positive,negative),sign=positive<=negative?1:-1;
        if(depth<out.depth){out.depth=depth;out.nx=nx*sign;out.ny=ny*sign;}
    }
    if(out.depth>=-CONTACT_SKIN&&preferred)preferAxis(a,b,preferred,out);
    return out.depth>=-CONTACT_SKIN;
}

// Nearly equal separating axes need temporal coherence. Otherwise a flower
// trapped at a wall alternates between two valid push directions every pass.
// Keep the previous axis only while its depth remains close to the minimum;
// a meaningful geometric change still selects a new separating direction.
function preferAxis(a:Float64Array,b:Float64Array,axis:Point,out:Contact):void {
    const nx=axis.x,ny=axis.y;
    let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
    for(let i=0;i<a.length;i+=5){const p=a[i]*nx+a[i+1]*ny,q=a[i+2]*nx+a[i+3]*ny;
        amin=Math.min(amin,Math.min(p,q)-a[i+4]);amax=Math.max(amax,Math.max(p,q)+a[i+4]);}
    for(let i=0;i<b.length;i+=5){const p=b[i]*nx+b[i+1]*ny,q=b[i+2]*nx+b[i+3]*ny;
        bmin=Math.min(bmin,Math.min(p,q)-b[i+4]);bmax=Math.max(bmax,Math.max(p,q)+b[i+4]);}
    const positive=amax-bmin,negative=bmax-amin,depth=Math.min(positive,negative);
    if(depth<=out.depth+Math.max(.02,Math.max(0,out.depth)*.05)){
        const sign=positive<=negative?1:-1;out.depth=depth;out.nx=nx*sign;out.ny=ny*sign;
    }
}

/** Numeric flower bodies, per-depth spatial hash, capsule constraints and sleep.
 * No engine physics world, rigid bodies, collider components or contact events. */
export class FlowerPhysics {
    readonly root:Node;
    private readonly states=new Map<string,State>();
    private readonly active:State[]=[];
    private readonly grid=[new Map<number,Bucket>(),new Map<number,Bucket>(),new Map<number,Bucket>()];
    private readonly bounds={left:-Infinity,right:Infinity,bottom:-Infinity,top:Infinity};
    private readonly hit:Contact={nx:0,ny:0,depth:0};
    private readonly best:Contact={nx:0,ny:0,depth:0};
    private marks=new Uint32Array(128);
    private sourceMarks=new Uint32Array(128);
    private parents=new Int32Array(128);
    private groupSize=new Int32Array(128);
    private groupQuiet=new Float64Array(128);
    private groupStrained=new Uint8Array(128);
    private readonly members:number[][]=[[],[],[]];
    private readonly sources:number[][]=[[],[],[]];
    private readonly neighbours:number[]=[];
    private readonly sourceStart=[0,0,0];
    private readonly pairsByBand=[0,0,0];
    private readonly fineByBand=[0,0,0];
    private readonly sourcesByBand=[0,0,0];
    private stamp=0;private sourceStamp=0;private epoch=0;private stepIndex=0;
    private clock=0;private elapsed=0;private accumulator=0;private flowTimer=0;private flowIndex=0;
    private disposed=false;private pairChecks=0;private shapeChecks=0;private steps=0;
    private geometryBuilds=0;private worldSyncs=0;
    private fineLeft=0;
    constructor(parent:Node,readonly data:OriginalPhysics,private readonly random:()=>number=Math.random){
        this.root=new Node('LightweightFlowerPhysics');(parent.scene??parent).addChild(this.root);
        for(const wall of data.walls){
            if(wall.kind!=='BoxCollider2D')throw Error('Lightweight pool boundaries require rectangular walls.');
            const points=boxPoints(wall),xs=points.map(p=>p.x),ys=points.map(p=>p.y);
            const left=Math.min(...xs),right=Math.max(...xs),bottom=Math.min(...ys),top=Math.max(...ys);
            if(right-left<top-bottom){
                if((left+right)/2<data.spawn.center[0])this.bounds.left=Math.max(this.bounds.left,right);
                else this.bounds.right=Math.min(this.bounds.right,left);
            }else if((bottom+top)/2<data.spawn.center[1])this.bounds.bottom=Math.max(this.bounds.bottom,top);
            else this.bounds.top=Math.min(this.bounds.top,bottom);
        }
    }
    static preload():Promise<OriginalPhysics>{return loadOriginalPhysics();}
    get diagnostics(){return {bodies:this.states.size,active:this.active.length,sleeping:this.active.filter(s=>s.sleeping).length,
        steps:this.steps,pairChecks:this.pairChecks,shapeChecks:this.shapeChecks,
        geometryBuilds:this.geometryBuilds,worldSyncs:this.worldSyncs,
        pairsByBand:this.pairsByBand.slice(),fineByBand:this.fineByBand.slice(),sourcesByBand:this.sourcesByBand.slice()};}
    private range(a:number,b:number):number{return a+(b-a)*this.random();}
    private direction():Point {
        const angle=this.random()*Math.PI*2,radius=Math.sqrt(this.random());
        return radius*radius<=.001?{x:1,y:0}:{x:Math.cos(angle),y:Math.sin(angle)};
    }
    spawn():{x:number;y:number;impulse:Point}{
        const s=this.data.spawn,angle=this.random()*Math.PI*2,radius=Math.sqrt(this.random())*s.jitterRadius;
        const x=Math.cos(angle)*radius,y=Math.sin(angle)*radius,speed=this.range(s.initialImpulseRange[0],s.initialImpulseRange[1]);
        const direction=radius>.001?{x:x/radius,y:y/radius}:this.direction();
        return {x:(s.center[0]+this.range(s.xRange[0],s.xRange[1])+x)*FLOWER_WORLD_UNIT,
            y:(s.center[1]+this.range(s.yRange[0],s.yRange[1])+y)*FLOWER_WORLD_UNIT,
            impulse:{x:direction.x*speed,y:direction.y*speed}};
    }
    add(id:string,path:string,x:number,y:number,angle:number,baseScale:number,band:number,impulse:Point):void {
        if(this.disposed||this.states.has(id))throw Error('Cannot add a duplicate or disposed flower body.');
        const profile=this.data.flowers[path];if(!profile)throw Error('Missing flower body: '+path);
        let cache=profiles.get(this.data);if(!cache){cache=new Map();profiles.set(this.data,cache);}
        let shapes=cache.get(path);if(!shapes){shapes=profile.fixtures.map(simplify);cache.set(path,shapes);}
        if(!shapes.length||![x,y,angle,baseScale,impulse.x,impulse.y].every(Number.isFinite)||baseScale<=0
            ||shapes.some(s=>!Object.values(s).every(Number.isFinite)||s.radius<=0))throw Error('Invalid flower geometry: '+path);
        x/=FLOWER_WORLD_UNIT;y/=FLOWER_WORLD_UNIT;
        const state:State={id,shapes,local:new Float64Array(shapes.length*5),world:new Float64Array(shapes.length*5),mass:Math.max(.1,profile.mass||1),
            geometryAngle:NaN,geometryScale:NaN,worldDirty:true,localMinX:0,localMinY:0,localMaxX:0,localMaxY:0,radius:0,
            x,y,angle,vx:0,vy:0,spin:0,previous:{x,y,angle},band,baseScale,scale:baseScale,
            display:{x,y,angle},smoothUntil:0,
            active:false,ready:false,readyAt:0,initialized:false,direction:this.direction(),nextDirection:0,
            impulse:{...impulse},sleeping:false,driven:false,wakeDepth:0,activeUntil:0,index:-1,previousGroupSize:1,
            correctionX:0,correctionY:0,corrections:0,contactAxes:new Map(),
            quietTime:0,quietX:x,quietY:y,quietAngle:angle,touchUntil:-Infinity,
            minX:0,minY:0,maxX:0,maxY:0};
        this.transform(state);this.ensureWorld(state);this.states.set(id,state);
    }
    private wake(s:State,depth=s.wakeDepth):void {
        s.sleeping=false;s.wakeDepth=depth;s.quietTime=0;s.quietX=s.x;s.quietY=s.y;s.quietAngle=s.angle;
    }
    private disturb(s:State,depth=0):void {
        this.wake(s,depth);s.driven=true;s.activeUntil=this.clock+ACTIVE_WINDOW;
    }
    private forgetContacts(s:State):void {
        s.contactAxes.clear();for(const other of this.states.values())other.contactAxes.delete(s);
    }
    private wakeNearby(source:State,band:number):void {
        for(const s of this.states.values())if(s!==source&&s.active&&s.band===band
            &&s.minX<=source.maxX+WAKE_MARGIN&&s.maxX+WAKE_MARGIN>=source.minX
            &&s.minY<=source.maxY+WAKE_MARGIN&&s.maxY+WAKE_MARGIN>=source.minY){
            this.disturb(s,1);s.touchUntil=-Infinity;
        }
    }
    sync(id:string,band:number,scale:number,enabled:boolean,animated?:Pose,resumePose?:Pose,readyAt=0):void {
        const s=this.states.get(id);if(!s||this.disposed)return;
        if(!Number.isFinite(scale)||!Number.isFinite(readyAt))return;
        const changedBand=s.band!==band;
        if(changedBand){this.wakeNearby(s,s.band);this.forgetContacts(s);s.band=band;this.disturb(s);}
        const nextScale=Math.max(.0001,scale*s.baseScale);
        if(Math.abs(s.scale-nextScale)>1e-6){s.scale=nextScale;this.disturb(s);this.transform(s);}
        s.ready=enabled&&band>=0&&band<3&&!animated&&scale>1e-4;s.readyAt=readyAt;s.resumePose=resumePose;
        if(animated){
            s.x=animated.x/FLOWER_WORLD_UNIT;s.y=animated.y/FLOWER_WORLD_UNIT;s.angle=animated.angle;
            s.display.x=s.x;s.display.y=s.y;s.display.angle=s.angle;s.smoothUntil=0;
            s.previous.x=s.x;s.previous.y=s.y;s.previous.angle=s.angle;s.vx=s.vy=s.spin=0;this.transform(s);
        }
        if(changedBand)this.wakeNearby(s,band);
        if(!s.ready){s.active=false;this.wake(s);}
        else if(!s.active&&this.elapsed+1e-8>=readyAt)this.activate(s);
    }
    private activate(s:State):void {
        if(s.initialized)this.forgetContacts(s);
        if(s.resumePose){s.x=s.resumePose.x/FLOWER_WORLD_UNIT;s.y=s.resumePose.y/FLOWER_WORLD_UNIT;s.angle=s.resumePose.angle;}
        s.active=true;this.disturb(s);
        s.previousGroupSize=1;
        if(!s.initialized){
            s.initialized=true;s.vx=s.impulse.x/s.mass;s.vy=s.impulse.y/s.mass;
            if(Math.hypot(s.vx,s.vy)<.05){const speed=this.range(.05,.12);s.vx=s.direction.x*speed;s.vy=s.direction.y*speed;}
            s.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);
        }
        s.previous.x=s.x;s.previous.y=s.y;s.previous.angle=s.angle;this.transform(s);
        s.display.x=s.x;s.display.y=s.y;s.display.angle=s.angle;s.smoothUntil=0;
    }
    private transform(s:State):void {
        if(s.geometryAngle===s.angle&&s.geometryScale===s.scale){this.updateBounds(s);s.worldDirty=true;return;}
        this.geometryBuilds++;
        s.geometryAngle=s.angle;s.geometryScale=s.scale;
        const radians=s.angle*Math.PI/180,c=Math.cos(radians)*s.scale,d=Math.sin(radians)*s.scale,w=s.local;
        s.localMinX=s.localMinY=Infinity;s.localMaxX=s.localMaxY=-Infinity;
        for(let k=0;k<s.shapes.length;k++){
            const p=s.shapes[k],i=k*5;
            w[i]=c*p.ax-d*p.ay;w[i+1]=d*p.ax+c*p.ay;
            w[i+2]=c*p.bx-d*p.by;w[i+3]=d*p.bx+c*p.by;w[i+4]=p.radius*s.scale;
            s.localMinX=Math.min(s.localMinX,Math.min(w[i],w[i+2])-w[i+4]);s.localMaxX=Math.max(s.localMaxX,Math.max(w[i],w[i+2])+w[i+4]);
            s.localMinY=Math.min(s.localMinY,Math.min(w[i+1],w[i+3])-w[i+4]);s.localMaxY=Math.max(s.localMaxY,Math.max(w[i+1],w[i+3])+w[i+4]);
        }
        s.radius=Math.hypot(s.localMaxX-s.localMinX,s.localMaxY-s.localMinY)/2;
        this.updateBounds(s);s.worldDirty=true;
    }
    private updateBounds(s:State):void {
        s.minX=s.x+s.localMinX;s.maxX=s.x+s.localMaxX;s.minY=s.y+s.localMinY;s.maxY=s.y+s.localMaxY;
    }
    private ensureWorld(s:State):void {
        if(!s.worldDirty)return;
        this.worldSyncs++;
        for(let i=0;i<s.world.length;i+=5){
            s.world[i]=s.local[i]+s.x;s.world[i+1]=s.local[i+1]+s.y;
            s.world[i+2]=s.local[i+2]+s.x;s.world[i+3]=s.local[i+3]+s.y;s.world[i+4]=s.local[i+4];
        }
        s.worldDirty=false;
    }
    private translate(s:State,x:number,y:number,correction=false):void {
        if(!x&&!y)return;
        s.x+=x;s.y+=y;s.minX+=x;s.maxX+=x;s.minY+=y;s.maxY+=y;
        s.worldDirty=true;
        if(correction)s.smoothUntil=this.clock+.25;
    }
    private walls(s:State):void {
        const b=this.bounds;
        const dx=s.maxX-s.minX>b.right-b.left?(b.left+b.right-s.minX-s.maxX)/2
            :s.minX<b.left?b.left-s.minX:s.maxX>b.right?b.right-s.maxX:0;
        const dy=s.maxY-s.minY>b.top-b.bottom?(b.bottom+b.top-s.minY-s.maxY)/2
            :s.minY<b.bottom?b.bottom-s.minY:s.maxY>b.top?b.top-s.maxY:0;
        if(dx||dy){this.translate(s,dx,dy,true);if(dx*s.vx<0)s.vx=0;if(dy*s.vy<0)s.vy=0;}
        if(s.minX<=b.left+CONTACT_SKIN||s.maxX>=b.right-CONTACT_SKIN
            ||s.minY<=b.bottom+CONTACT_SKIN||s.maxY>=b.top-CONTACT_SKIN)s.touchUntil=this.clock+.15;
    }
    private compoundAxis(a:State,b:State,out:Contact,preferred?:Point):void {
        // Use one consistent convex envelope for a compound. Switching between
        // individual-lobe contact and a whole-flower response at the touching
        // threshold produces discontinuous corrections in a dense crowd.
        out.depth=Infinity;
        const count=a.world.length+b.world.length;
        for(let axis=-3;axis<count;axis+=axis<0?1:5){
            let nx=axis===-3?1:axis===-2?0:(a.minX+a.maxX-b.minX-b.maxX)/2;
            let ny=axis===-3?0:axis===-2?1:(a.minY+a.maxY-b.minY-b.maxY)/2;
            if(axis>=0){const w=axis<a.world.length?a.world:b.world,k=axis<a.world.length?axis:axis-a.world.length;
                nx=-(w[k+3]-w[k+1]);ny=w[k+2]-w[k];}
            const length=Math.hypot(nx,ny);if(length<1e-8)continue;nx/=length;ny/=length;
            let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
            for(let k=0;k<a.world.length;k+=5){const w=a.world,p=w[k]*nx+w[k+1]*ny,q=w[k+2]*nx+w[k+3]*ny;
                amin=Math.min(amin,Math.min(p,q)-w[k+4]);amax=Math.max(amax,Math.max(p,q)+w[k+4]);}
            for(let k=0;k<b.world.length;k+=5){const w=b.world,p=w[k]*nx+w[k+1]*ny,q=w[k+2]*nx+w[k+3]*ny;
                bmin=Math.min(bmin,Math.min(p,q)-w[k+4]);bmax=Math.max(bmax,Math.max(p,q)+w[k+4]);}
            const positive=amax-bmin,negative=bmax-amin,depth=Math.min(positive,negative);
            if(depth<out.depth){const sign=positive<=negative?1:-1;out.depth=depth;out.nx=nx*sign;out.ny=ny*sign;}
        }
        if(out.depth>=-CONTACT_SKIN&&preferred)preferAxis(a.world,b.world,preferred,out);
    }
    private chargeFine(band:number,cost:number):boolean {
        if(cost>this.fineLeft)return false;
        this.fineLeft-=cost;this.fineByBand[band]+=cost;return true;
    }
    private group(index:number):number {
        while(this.parents[index]!==index){this.parents[index]=this.parents[this.parents[index]];index=this.parents[index];}
        return index;
    }
    private join(a:State,b:State):void {
        const ga=this.group(a.index),gb=this.group(b.index);
        if(ga!==gb){const root=Math.min(ga,gb);this.parents[Math.max(ga,gb)]=root;this.groupSize[root]=this.groupSize[ga]+this.groupSize[gb];}
    }
    private solve(a:State,b:State,band:number):boolean {
        this.ensureWorld(a);this.ensureWorld(b);
        const owner=a.index<b.index?a:b,other=owner===a?b:a,preferred=owner.contactAxes.get(other);
        this.best.depth=-Infinity;
        if(a.world.length>5||b.world.length>5){
            this.shapeChecks++;this.compoundAxis(a,b,this.best,preferred);
            if(this.best.depth < -CONTACT_SKIN){owner.contactAxes.delete(other);return true;}
        }else{
            this.shapeChecks++;
            if(contact(a.world,0,b.world,0,this.hit,preferred)){
                this.best.nx=this.hit.nx;this.best.ny=this.hit.ny;this.best.depth=this.hit.depth;
            }
        }
        if(this.best.depth===-Infinity){owner.contactAxes.delete(other);return true;}
        if(preferred){preferred.x=this.best.nx;preferred.y=this.best.ny;}
        else owner.contactAxes.set(other,{x:this.best.nx,y:this.best.ny});
        this.join(a,b);
        // An isolated pair still separates closely. A dense contact group
        // needs a small size-relative edge allowance rather than attempting
        // to fit every artistic contour with essentially zero overlap.
        const crowded=this.groupSize[this.group(a.index)]>2||a.previousGroupSize>2||b.previousGroupSize>2;
        const allowed=Math.min(crowded?FLOWER_PHYSICS_CROWD_OVERLAP_LIMIT:FLOWER_PHYSICS_OVERLAP_LIMIT,
            Math.min(a.radius,b.radius)*(crowded ? .04 : .01));
        const {nx,ny}=this.best,depth=this.best.depth-allowed;
        a.touchUntil=b.touchUntil=this.clock+.15;
        // Projection alone must not wake resting neighbours: a crowded island
        // otherwise changes effective mass every time a body sleeps, then
        // oscillates forever. Only growth, activation or real motion drives a
        // wake, and that disturbance can propagate through the contact chain.
        if(depth>.02&&(a.driven||b.driven||a.vx*a.vx+a.vy*a.vy>.035**2
            ||b.vx*b.vx+b.vy*b.vy>.035**2||Math.abs(a.spin)>.025||Math.abs(b.spin)>.025)){
            const sourceDepth=Math.min(a.sleeping?Infinity:a.wakeDepth,b.sleeping?Infinity:b.wakeDepth);
            const severe=depth>Math.max(.15,Math.min(a.radius,b.radius)*.2);
            if(sourceDepth<WAKE_MAX_DEPTH||severe){
                const nextDepth=Math.min(WAKE_MAX_DEPTH,sourceDepth+1);
                if(a.sleeping)this.disturb(a,nextDepth);if(b.sleeping)this.disturb(b,nextDepth);
            }
        }
        const ia=a.sleeping?0:1/a.mass,ib=b.sleeping?0:1/b.mass,inverse=ia+ib;if(!inverse)return true;
        if(depth>SLOP){
            const correction=Math.min(MAX_CORRECTION,(depth-SLOP)*.35)/inverse;
            if(ia){a.correctionX-=nx*correction*ia;a.correctionY-=ny*correction*ia;a.corrections++;}
            if(ib){b.correctionX+=nx*correction*ib;b.correctionY+=ny*correction*ib;b.corrections++;}
        }
        const inward=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(inward<0){const impulse=-inward/inverse;a.vx-=nx*impulse*ia;a.vy-=ny*impulse*ia;b.vx+=nx*impulse*ib;b.vy+=ny*impulse*ib;}
        return true;
    }
    private collisions():void {
        for(const members of this.members)members.length=0;
        for(let i=0;i<this.active.length;i++)this.members[this.active[i].band].push(i);
        for(let band=0;band<3;band++){
            const members=this.members[band];
            const sources=this.sources[band];sources.length=0;let hot=false;
            for(const i of members){
                const s=this.active[i];if(s.sleeping)continue;
                sources.push(i);if(s.driven||s.activeUntil>this.clock||s.touchUntil>=this.clock)hot=true;
            }
            if(!sources.length)continue;
            // Motion integrates every fixed step. Only idle background contact
            // work is staggered; entrance/collection/growth gets the full rate.
            if(band&&!hot&&this.stepIndex%(band+1))continue;
            const sourceLimit=hot?48:band===0?6:3,count=Math.min(sourceLimit,sources.length);
            if(sources.length>sourceLimit)sources.sort((i,j)=>{
                const a=this.active[i],b=this.active[j];
                return a.wakeDepth-b.wakeDepth||b.activeUntil-a.activeUntil||i-j;
            });
            const start=this.sourceStart[band]%sources.length;
            this.sourcesByBand[band]+=count;
            let pairsLeft=band===0?1024:band===1?384:2048;this.fineLeft=FLOWER_PHYSICS_FINE_BUDGETS[band];
            let exhausted=false;
            for(let pass=0;pass<SOLVER_PASSES&&!exhausted;pass++){
                const epoch=++this.epoch,grid=this.grid[band];
                for(const i of members){
                    const s=this.active[i];s.correctionX=s.correctionY=s.corrections=0;this.walls(s);
                    for(let x=Math.floor((s.minX-CONTACT_SKIN)/CELL_SIZE);x<=Math.floor((s.maxX+CONTACT_SKIN)/CELL_SIZE);x++)
                        for(let y=Math.floor((s.minY-CONTACT_SKIN)/CELL_SIZE);y<=Math.floor((s.maxY+CONTACT_SKIN)/CELL_SIZE);y++){
                            const key=x*65536+y;let bucket=grid.get(key);
                            if(!bucket){bucket={epoch,indices:[]};grid.set(key,bucket);}
                            if(bucket.epoch!==epoch){bucket.epoch=epoch;bucket.indices.length=0;}bucket.indices.push(i);
                        }
                }
                if(++this.sourceStamp>=0xffffffff){this.sourceMarks.fill(0);this.sourceStamp=1;}
                for(let k=0;k<count;k++)this.sourceMarks[sources[(start+k)%sources.length]]=this.sourceStamp;
                query:for(let k=0;k<count;k++){
                    const i=sources[(start+k)%sources.length],a=this.active[i];
                    if(++this.stamp>=0xffffffff){this.marks.fill(0);this.stamp=1;}
                    const neighbours=this.neighbours;neighbours.length=0;let ordered=true,last=-1;
                    for(let x=Math.floor((a.minX-CONTACT_SKIN)/CELL_SIZE);x<=Math.floor((a.maxX+CONTACT_SKIN)/CELL_SIZE);x++)
                        for(let y=Math.floor((a.minY-CONTACT_SKIN)/CELL_SIZE);y<=Math.floor((a.maxY+CONTACT_SKIN)/CELL_SIZE);y++){
                            const bucket=grid.get(x*65536+y);if(!bucket||bucket.epoch!==epoch)continue;
                            for(const j of bucket.indices){
                                if(j===i||this.marks[j]===this.stamp||(j<i&&this.sourceMarks[j]===this.sourceStamp))continue;
                                this.marks[j]=this.stamp;neighbours.push(j);if(j<last)ordered=false;last=j;
                            }
                        }
                    // A body crossing a grid seam must not reverse contact
                    // order and start seesawing between two resting neighbours.
                    if(!ordered)neighbours.sort(indexOrder);
                    for(const j of neighbours){
                        const b=this.active[j];if(a.sleeping&&b.sleeping)continue;
                        this.pairChecks++;this.pairsByBand[band]++;pairsLeft--;
                        const dx=(a.minX+a.maxX-b.minX-b.maxX)/2,dy=(a.minY+a.maxY-b.minY-b.maxY)/2;
                        if(dx*dx+dy*dy<=(a.radius+b.radius+CONTACT_SKIN)**2
                            &&a.minX<=b.maxX+CONTACT_SKIN&&a.maxX+CONTACT_SKIN>=b.minX
                            &&a.minY<=b.maxY+CONTACT_SKIN&&a.maxY+CONTACT_SKIN>=b.minY){
                            if(!this.chargeFine(band,1)||!this.solve(a,b,band)){
                                exhausted=true;this.sourceStart[band]=(start+k+1)%sources.length;break query;
                            }
                        }
                        if(!pairsLeft){exhausted=true;this.sourceStart[band]=(start+k+1)%sources.length;break query;}
                    }
                }
                // All contacts in a pass see the same geometry. Average their
                // corrections once, so opposite neighbours balance rather
                // than repeatedly undoing each other's immediate projection.
                // For normal game layers, an incomplete sweep must not apply
                // a one-sided push then switch to the opposite subset next
                // frame. Keep only whole passes. Oversized synthetic piles
                // retain bounded partial progress rather than deadlocking.
                if(!exhausted||members.length>48)for(const i of members){const s=this.active[i];if(s.corrections)
                    this.translate(s,s.correctionX/s.corrections,s.correctionY/s.corrections,true);}
            }
            if(!exhausted&&count<sources.length)this.sourceStart[band]=(start+count)%sources.length;
        }
        for(const s of this.active)if(!s.sleeping)this.walls(s);
    }
    private flow():void {
        this.flowIndex++;
        for(let i=0;i<this.active.length;i++){
            const s=this.active[i];if(s.sleeping||s.touchUntil>=this.clock)continue;
            if(this.clock>=s.nextDirection){s.direction=this.direction();s.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);}
            if((this.flowIndex+i)%Math.max(1,this.data.flow.updateStep))continue;
            const setting=this.data.flow.layers[s.band],speed=Math.hypot(s.vx,s.vy),threshold=setting.maxSpeed*.8;
            if(speed<threshold){const force=setting.strength*(.35+.65*clamp(1-speed/Math.max(threshold,.01),0,1))/s.mass;s.vx+=s.direction.x*force;s.vy+=s.direction.y*force;}
            if(this.random()<.18)s.spin+=this.range(-this.data.flow.torqueImpulse,this.data.flow.torqueImpulse);
        }
    }
    private step():void {
        this.stepIndex++;this.clock+=FLOWER_PHYSICS_STEP;this.flowTimer+=FLOWER_PHYSICS_STEP;
        for(let i=0;i<this.active.length;i++){this.parents[i]=i;this.groupSize[i]=1;}
        this.groupQuiet.fill(Infinity,0,this.active.length);this.groupStrained.fill(0,0,this.active.length);
        if(this.flowTimer+1e-9>=this.data.flow.updateInterval){this.flowTimer-=this.data.flow.updateInterval;this.flow();}
        let moving=false;
        for(const s of this.active){
            s.previous.x=s.x;s.previous.y=s.y;s.previous.angle=s.angle;
            if(s.sleeping)continue;moving=true;
            const speed=Math.hypot(s.vx,s.vy),limit=this.data.flow.layers[s.band].maxSpeed;
            if(speed>limit){s.vx*=limit/speed;s.vy*=limit/speed;}
            const drag=1/(1+this.data.flow.linearDrag*FLOWER_PHYSICS_STEP);
            s.vx*=drag;s.vy*=drag;s.spin=clamp(s.spin/(1+this.data.flow.angularDrag*FLOWER_PHYSICS_STEP),-MAX_SPIN,MAX_SPIN);
            this.translate(s,s.vx*FLOWER_PHYSICS_STEP,s.vy*FLOWER_PHYSICS_STEP);
            const angle=angleDelta(0,s.angle+s.spin*FLOWER_PHYSICS_STEP*180/Math.PI);
            if(angle!==s.angle){s.angle=angle;this.transform(s);}
        }
        if(moving)this.collisions();
        for(const s of this.active){
            s.driven=false;
            if(s.sleeping)continue;
            if(s.touchUntil<this.clock){this.wake(s);continue;}
            s.vx*=.65;s.vy*=.65;s.spin*=.6;
            if(s.vx*s.vx+s.vy*s.vy>.035**2||Math.abs(s.spin)>.025){this.wake(s);continue;}
            // A contact may settle either within a small rest region or with
            // negligible current motion. Reset only for a meaningful change
            // in both: tiny residual drift must not keep the island awake.
            const moving=Math.hypot(s.x-s.previous.x,s.y-s.previous.y)>REST_STEP;
            const displaced=Math.hypot(s.x-s.quietX,s.y-s.quietY)>REST_RANGE;
            if((moving&&displaced)||(Math.abs(angleDelta(s.previous.angle,s.angle))>.1&&Math.abs(angleDelta(s.quietAngle,s.angle))>2)){
                this.groupStrained[this.group(s.index)]=1;this.wake(s);
            }
            s.quietTime+=FLOWER_PHYSICS_STEP;
        }
        // Sleep a touching group coherently. A single moving flower must not
        // be left wedged between neighbours that individually froze too early.
        // If a residual projection is still moving it, release that local
        // contact group before attempting to settle the group again.
        for(const s of this.active){const g=this.group(s.index);this.groupQuiet[g]=Math.min(this.groupQuiet[g],s.quietTime);}
        for(const s of this.active){
            const g=this.group(s.index);
            if(!s.sleeping||this.groupSize[g]>1)s.previousGroupSize=this.groupSize[g];
            if(this.groupStrained[g]){if(s.sleeping)this.disturb(s,WAKE_MAX_DEPTH);}
            else if(this.groupQuiet[g]+1e-8>=REST_DELAY){s.sleeping=true;s.vx=s.vy=s.spin=0;}
        }
    }
    update(dt:number):void {
        this.steps=this.pairChecks=this.shapeChecks=this.geometryBuilds=this.worldSyncs=0;
        this.pairsByBand.fill(0);this.fineByBand.fill(0);this.sourcesByBand.fill(0);
        if(this.disposed||!Number.isFinite(dt)||dt<=0)return;
        this.elapsed+=dt;this.active.length=0;
        for(const s of this.states.values()){
            if(s.ready&&!s.active&&this.elapsed+1e-8>=s.readyAt)this.activate(s);
            if(s.active){s.index=this.active.length;this.active.push(s);}
        }
        if(this.active.length>this.marks.length){const size=2**Math.ceil(Math.log2(this.active.length));
            this.marks=new Uint32Array(size);this.sourceMarks=new Uint32Array(size);
            this.parents=new Int32Array(size);this.groupSize=new Int32Array(size);
            this.groupQuiet=new Float64Array(size);this.groupStrained=new Uint8Array(size);}
        this.accumulator=Math.min(this.accumulator+dt,FLOWER_PHYSICS_MAX_STEPS*FLOWER_PHYSICS_STEP);
        while(this.accumulator+1e-9>=FLOWER_PHYSICS_STEP&&this.steps<FLOWER_PHYSICS_MAX_STEPS){
            this.step();this.accumulator-=FLOWER_PHYSICS_STEP;this.steps++;
        }
        // Rendering follows the already-solved logical pose. Its filtered
        // coordinates never feed contact geometry or the next integration step.
        const alpha=clamp(this.accumulator/FLOWER_PHYSICS_STEP,0,1),blend=1-Math.exp(-dt/.05);
        for(const s of this.active){
            const x=s.previous.x+(s.x-s.previous.x)*alpha,y=s.previous.y+(s.y-s.previous.y)*alpha;
            const angle=s.previous.angle+angleDelta(s.previous.angle,s.angle)*alpha;
            if(s.smoothUntil>this.clock){
                s.display.x+=(x-s.display.x)*blend;s.display.y+=(y-s.display.y)*blend;
                s.display.angle+=angleDelta(s.display.angle,angle)*blend;
            }else{s.display.x=x;s.display.y=y;s.display.angle=angle;}
        }
    }
    pose(id:string):Pose|null {
        const s=this.states.get(id);if(!s?.active||this.disposed)return null;
        return {x:s.display.x*FLOWER_WORLD_UNIT,y:s.display.y*FLOWER_WORLD_UNIT,angle:s.display.angle};
    }
    remove(id:string):void {const s=this.states.get(id);if(s){this.wakeNearby(s,s.band);this.forgetContacts(s);this.states.delete(id);}}
    dispose():void {
        if(this.disposed)return;this.disposed=true;this.states.clear();this.active.length=0;
        for(const grid of this.grid)grid.clear();this.root.active=false;this.root.destroy();
    }
}
