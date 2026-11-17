import { JsonAsset, Node } from 'cc';
import { loadFlowerAsset } from './FlowerAssets';

export const FLOWER_WORLD_UNIT = 750 / 10.8;
type Point = {x: number; y: number};
type Bounds = {minX: number; minY: number; maxX: number; maxY: number};

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

const STILL_SPEED=.02, STILL_ANGULAR_SPEED=2*Math.PI/180, REST_DELAY=.8;
const POSITION_SLOP=.008,MAX_PAIR_CORRECTION=.025,CONTACT_FLOW_FACTOR=.08;
// Most flower AABBs are around one metre wide. This keeps each broad-phase
// bucket short while still covering large compound flowers correctly.
const GRID_SIZE=1.5;
type State = {id: string; profile: OriginalBody; local: Bounds; band: number; active: boolean; ready: boolean; readyAt: number;
    resumePose?: {x:number;y:number;angle:number}; initialized: boolean; registered: boolean; resting: boolean; quietTime: number;
    neighbours: Set<string>; direction: Point; nextDirection: number; impulse: Point; x: number; y: number; angle: number;
    vx: number; vy: number; angularVelocity: number; scale: number; baseScale: number;
    previous: {x: number; y: number; angle: number}};

function emptyBounds(): Bounds {return {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};}
function include(bounds: Bounds,x: number,y: number): void {
    bounds.minX=Math.min(bounds.minX,x);bounds.minY=Math.min(bounds.minY,y);
    bounds.maxX=Math.max(bounds.maxX,x);bounds.maxY=Math.max(bounds.maxY,y);
}
function transformedPoint(fixture: PhysicsFixture,x: number,y: number): Point {
    const [a,b,c,d,tx,ty]=fixture.matrix;
    return {x:a*x+c*y+tx,y:b*x+d*y+ty};
}
/** Converts every original fixture kind to one conservative local AABB. */
function fixtureBounds(fixture: PhysicsFixture): Bounds {
    const bounds=emptyBounds(),ox=fixture.offset?.x??0,oy=fixture.offset?.y??0;
    if(fixture.kind==='CircleCollider2D'){
        const [a,b,c,d]=fixture.matrix,center=transformedPoint(fixture,ox,oy),radius=fixture.m_Radius??0;
        const rx=radius*Math.hypot(a,c),ry=radius*Math.hypot(b,d);
        include(bounds,center.x-rx,center.y-ry);include(bounds,center.x+rx,center.y+ry);
    } else if(fixture.kind==='PolygonCollider2D'){
        for(const path of fixture.m_Points?.m_Paths??[])for(const point of path){
            const mapped=transformedPoint(fixture,point.x+ox,point.y+oy);include(bounds,mapped.x,mapped.y);
        }
    } else {
        // Box and capsule bounds are both their source rectangle. AABB is
        // intentionally conservative for the capsule's rounded corners.
        const size=fixture.m_Size??{x:0,y:0},halfX=size.x/2,halfY=size.y/2;
        for(const x of [ox-halfX,ox+halfX])for(const y of [oy-halfY,oy+halfY]){
            const mapped=transformedPoint(fixture,x,y);include(bounds,mapped.x,mapped.y);
        }
    }
    if(!Number.isFinite(bounds.minX))return {minX:-.5,minY:-.5,maxX:.5,maxY:.5};
    return bounds;
}
function bodyBounds(profile: OriginalBody): Bounds {
    const result=emptyBounds();
    for(const fixture of profile.fixtures){const b=fixtureBounds(fixture);include(result,b.minX,b.minY);include(result,b.maxX,b.maxY);}
    return Number.isFinite(result.minX)?result:{minX:-.5,minY:-.5,maxX:.5,maxY:.5};
}

/**
 * Lightweight deterministic flower simulation for mini-game runtimes.
 *
 * It deliberately owns no RigidBody2D/Collider2D components. Narrow phase is
 * AABB-only and broad phase is a per-depth spatial hash, so inactive flowers
 * and different visual layers have zero collision cost.
 */
export class FlowerPhysics {
    readonly root: Node;
    private readonly states=new Map<string,State>();
    private readonly walls: Bounds[];
    private accumulator=0;
    private clock=0;
    private flowTimer=0;
    private flowIndex=0;
    private disposed=false;

    constructor(parent: Node, readonly data: OriginalPhysics, private readonly random: () => number = Math.random) {
        this.root=new Node('FlowerAABBWorld');(parent.scene??parent).addChild(this.root);
        this.walls=data.walls.map(fixtureBounds);
    }
    static preload(): Promise<OriginalPhysics> {return loadOriginalPhysics();}
    private range(a: number,b: number): number {return a+(b-a)*this.random();}
    private direction(): Point {const angle=this.random()*Math.PI*2;return {x:Math.cos(angle),y:Math.sin(angle)};}
    spawn(): {x: number; y: number; impulse: Point} {
        const s=this.data.spawn,angle=this.random()*Math.PI*2,radius=Math.sqrt(this.random())*s.jitterRadius;
        const x=Math.cos(angle)*radius,y=Math.sin(angle)*radius,speed=this.range(s.initialImpulseRange[0],s.initialImpulseRange[1]);
        const direction=radius>.001?{x:x/radius,y:y/radius}:this.direction();
        return {x:(s.center[0]+this.range(s.xRange[0],s.xRange[1])+x)*FLOWER_WORLD_UNIT,
            y:(s.center[1]+this.range(s.yRange[0],s.yRange[1])+y)*FLOWER_WORLD_UNIT,
            impulse:{x:direction.x*speed,y:direction.y*speed}};
    }
    add(id: string,path: string,x: number,y: number,angle: number,baseScale: number,band: number,impulse: Point): void {
        const profile=this.data.flowers[path];if(!profile)throw new Error(`Missing original rigid body: ${path}`);
        const state: State={id,profile,local:bodyBounds(profile),band,active:false,ready:false,readyAt:0,initialized:false,registered:false,
            resting:false,quietTime:0,neighbours:new Set(),direction:this.direction(),nextDirection:0,impulse:{...impulse},
            x:x/FLOWER_WORLD_UNIT,y:y/FLOWER_WORLD_UNIT,angle,vx:0,vy:0,angularVelocity:0,scale:-1,baseScale,
            previous:{x,y,angle}};
        this.states.set(id,state);
    }
    sync(id: string,band: number,scale: number,enabled: boolean,animated?: {x: number;y: number;angle: number},
        resumePose?: {x:number;y:number;angle:number},readyAt=0): void {
        const state=this.states.get(id);if(!state)return;
        const ready=enabled&&band<3&&!animated&&scale>1e-4;
        state.ready=ready;state.readyAt=readyAt;state.resumePose=resumePose;
        const active=ready&&this.clock+1e-8>=readyAt;
        if(!active&&state.active){state.active=false;this.clearRest(state);}
        if(state.band!==band){state.band=band;state.direction=this.direction();state.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);this.clearRest(state);}
        const nextScale=Math.max(.0001,scale*state.baseScale);
        if(Math.abs(nextScale-state.scale)>1e-6){state.scale=nextScale;this.clearRest(state);}
        if(animated){state.x=animated.x/FLOWER_WORLD_UNIT;state.y=animated.y/FLOWER_WORLD_UNIT;state.angle=animated.angle;state.previous={...animated};}
        if(active&&!state.active)this.activate(state);
    }
    private activate(state: State): void {
        const pose=state.resumePose;
        if(pose){state.x=pose.x/FLOWER_WORLD_UNIT;state.y=pose.y/FLOWER_WORLD_UNIT;state.angle=pose.angle;state.previous={...pose};}
        state.active=true;this.clearRest(state);
        if(!state.initialized){state.initialized=true;state.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);}
        if(state.impulse.x||state.impulse.y){state.vx+=state.impulse.x;state.vy+=state.impulse.y;state.impulse={x:0,y:0};}
        if(!state.registered){
            state.registered=true;const speed=Math.hypot(state.vx,state.vy);
            if(speed<.05){const drift=this.range(.05,.12);state.vx=state.direction.x*drift;state.vy=state.direction.y*drift;}
        }
    }
    private clearRest(state: State): void {state.resting=false;state.quietTime=0;}
    private worldBounds(state: State): Bounds {
        const local=state.local,scale=state.scale,cx=(local.minX+local.maxX)*.5*scale,cy=(local.minY+local.maxY)*.5*scale;
        const hx=(local.maxX-local.minX)*.5*scale,hy=(local.maxY-local.minY)*.5*scale;
        // Keep the collision envelope independent from visual rotation. A
        // rotated AABB grows and shrinks every frame; crowded flowers then
        // repeatedly push their neighbours even when their centres are still.
        const centerX=state.x+cx,centerY=state.y+cy;
        return {minX:centerX-hx,minY:centerY-hy,maxX:centerX+hx,maxY:centerY+hy};
    }
    private clamp(state: State,max: number): void {
        const length=Math.hypot(state.vx,state.vy);if(length>max){state.vx=state.vx/length*max;state.vy=state.vy/length*max;}
    }
    private separate(a: State,b: State,contacts: Map<string,Set<string>>): boolean {
        const aa=this.worldBounds(a),bb=this.worldBounds(b);
        const overlapX=Math.min(aa.maxX,bb.maxX)-Math.max(aa.minX,bb.minX),overlapY=Math.min(aa.maxY,bb.maxY)-Math.max(aa.minY,bb.minY);
        if(overlapX<=-this.data.contactOffset||overlapY<=-this.data.contactOffset)return false;
        contacts.get(a.id)!.add(b.id);contacts.get(b.id)!.add(a.id);
        if(overlapX<=0||overlapY<=0)return true;
        if(overlapX<overlapY){
            const normal=(aa.minX+aa.maxX)<(bb.minX+bb.maxX)?1:-1;
            const move=Math.min(MAX_PAIR_CORRECTION,Math.max(0,overlapX-POSITION_SLOP)*.25);
            a.x-=normal*move;b.x+=normal*move;
            const relative=(b.vx-a.vx)*normal;if(relative<0){const impulse=-relative*.5;a.vx-=impulse*normal;b.vx+=impulse*normal;}
        } else {
            const normal=(aa.minY+aa.maxY)<(bb.minY+bb.maxY)?1:-1;
            const move=Math.min(MAX_PAIR_CORRECTION,Math.max(0,overlapY-POSITION_SLOP)*.25);
            a.y-=normal*move;b.y+=normal*move;
            const relative=(b.vy-a.vy)*normal;if(relative<0){const impulse=-relative*.5;a.vy-=impulse*normal;b.vy+=impulse*normal;}
        }
        return true;
    }
    private contain(state: State,contacts: Set<string>): void {
        for(let index=0;index<this.walls.length;index++){
            const body=this.worldBounds(state),wall=this.walls[index];
            const overlapX=Math.min(body.maxX,wall.maxX)-Math.max(body.minX,wall.minX),overlapY=Math.min(body.maxY,wall.maxY)-Math.max(body.minY,wall.minY);
            if(overlapX<=-this.data.contactOffset||overlapY<=-this.data.contactOffset)continue;
            contacts.add(`wall:${index}`);
            if(overlapX<=0||overlapY<=0)continue;
            if(overlapX<overlapY){const normal=(body.minX+body.maxX)<(wall.minX+wall.maxX)?-1:1;state.x+=normal*(overlapX+this.data.contactOffset);if(state.vx*normal<0)state.vx=0;}
            else {const normal=(body.minY+body.maxY)<(wall.minY+wall.maxY)?-1:1;state.y+=normal*(overlapY+this.data.contactOffset);if(state.vy*normal<0)state.vy=0;}
        }
    }
    private collisionPass(active: State[]): Map<string,Set<string>> {
        const contacts=new Map<string,Set<string>>(),buckets=new Map<string,State[]>(),pairs=new Set<string>();
        for(const state of active){
            contacts.set(state.id,new Set());const bounds=this.worldBounds(state);
            const minX=Math.floor(bounds.minX/GRID_SIZE),maxX=Math.floor(bounds.maxX/GRID_SIZE),minY=Math.floor(bounds.minY/GRID_SIZE),maxY=Math.floor(bounds.maxY/GRID_SIZE);
            for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){
                const key=`${state.band}:${x}:${y}`,bucket=buckets.get(key);if(bucket)bucket.push(state);else buckets.set(key,[state]);
            }
        }
        for(const bucket of buckets.values())for(let i=0;i<bucket.length;i++)for(let j=i+1;j<bucket.length;j++){
            const a=bucket[i],b=bucket[j],key=a.id<b.id?`${a.id}\0${b.id}`:`${b.id}\0${a.id}`;
            if(!pairs.has(key)){pairs.add(key);this.separate(a,b,contacts);}
        }
        for(const state of active)this.contain(state,contacts.get(state.id)!);
        return contacts;
    }
    private reconcileRest(active: State[],contacts: Map<string,Set<string>>,dt: number): void {
        for(const state of active){
            const next=contacts.get(state.id)!;
            const changed=next.size!==state.neighbours.size||Array.from(next).some(id=>!state.neighbours.has(id));
            if(changed){state.neighbours=next;this.clearRest(state);}
            const still=Math.hypot(state.vx,state.vy)<=STILL_SPEED&&Math.abs(state.angularVelocity)<=STILL_ANGULAR_SPEED;
            if(!next.size||!still){this.clearRest(state);continue;}
            state.quietTime+=dt;
            if(state.quietTime+1e-8>=REST_DELAY){state.resting=true;state.vx=0;state.vy=0;state.angularVelocity=0;}
        }
    }
    private flow(): void {
        this.flowIndex++;
        for(let band=0;band<3;band++){
            const settings=this.data.flow.layers[band],entries=Array.from(this.states.values()).filter(s=>s.active&&s.band===band);
            entries.forEach((state,index)=>{
                if(state.resting)return;
                this.clamp(state,settings.maxSpeed);
                if((this.flowIndex+index)%Math.max(1,this.data.flow.updateStep))return;
                if(this.clock>=state.nextDirection){state.direction=this.direction();state.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);}
                const speed=Math.hypot(state.vx,state.vy),threshold=settings.maxSpeed*.8;
                if(speed<threshold){const factor=(.35+.65*Math.max(0,Math.min(1,1-speed/Math.max(threshold,.01))))
                        *(state.neighbours.size?CONTACT_FLOW_FACTOR:1);
                    state.vx+=state.direction.x*settings.strength*factor;state.vy+=state.direction.y*settings.strength*factor;}
                if(!state.neighbours.size&&Math.abs(state.angularVelocity)*180/Math.PI<10&&this.random()<.18)
                    state.angularVelocity+=this.range(-this.data.flow.torqueImpulse,this.data.flow.torqueImpulse);
                this.clamp(state,settings.maxSpeed);
            });
        }
    }
    private step(dt: number): void {
        for(const state of this.states.values())if(state.ready&&!state.active&&this.clock+1e-8>=state.readyAt)this.activate(state);
        const active=Array.from(this.states.values()).filter(state=>state.active);
        const linearDamping=Math.exp(-this.data.flow.linearDrag*dt),angularDamping=Math.exp(-this.data.flow.angularDrag*dt);
        for(const state of active){
            state.previous={x:state.x*FLOWER_WORLD_UNIT,y:state.y*FLOWER_WORLD_UNIT,angle:state.angle};
            if(state.resting)continue;
            state.vx*=linearDamping;state.vy*=linearDamping;state.angularVelocity*=angularDamping;
            if(state.neighbours.size)state.angularVelocity*=.9;
            const maxAngular=this.data.maxAngularSpeed*Math.PI/180;state.angularVelocity=Math.max(-maxAngular,Math.min(maxAngular,state.angularVelocity));
            state.x+=state.vx*dt;state.y+=state.vy*dt;state.angle+=state.angularVelocity*dt*180/Math.PI;
        }
        let contacts=new Map<string,Set<string>>();
        const passes=Math.max(1,Math.min(2,this.data.positionIterations));
        for(let pass=0;pass<passes;pass++)contacts=this.collisionPass(active);
        this.reconcileRest(active,contacts,dt);
        this.clock+=dt;this.flowTimer+=dt;
        if(this.flowTimer+1e-9>=this.data.flow.updateInterval){this.flowTimer%=this.data.flow.updateInterval;this.flow();}
    }
    update(dt: number): void {
        if(this.disposed||!Number.isFinite(dt)||dt<=0)return;
        this.accumulator+=Math.min(dt,this.data.maximumFrameTime);
        while(this.accumulator+1e-9>=this.data.fixedTimeStep){this.step(this.data.fixedTimeStep);this.accumulator-=this.data.fixedTimeStep;}
    }
    pose(id: string): {x: number;y: number;angle: number}|null {
        const state=this.states.get(id);if(!state?.active)return null;
        const x=state.x*FLOWER_WORLD_UNIT,y=state.y*FLOWER_WORLD_UNIT,delta=((state.angle-state.previous.angle+540)%360)-180;
        const alpha=state.band<2?Math.max(0,Math.min(1,this.accumulator/this.data.fixedTimeStep)):1;
        return {x:state.previous.x+(x-state.previous.x)*alpha,y:state.previous.y+(y-state.previous.y)*alpha,angle:state.previous.angle+delta*alpha};
    }
    remove(id: string): void {this.states.delete(id);}
    dispose(): void {if(this.disposed)return;this.disposed=true;this.states.clear();this.root.destroy();}
}
