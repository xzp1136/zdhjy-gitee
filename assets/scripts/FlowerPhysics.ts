import { BoxCollider2D, CircleCollider2D, Collider2D, Contact2DType, ERigidBody2DType, IPhysics2DContact, JsonAsset, Node, PhysicsSystem2D, PolygonCollider2D, RigidBody2D, Vec2 } from 'cc';
import { loadFlowerAsset } from './FlowerAssets';

export const FLOWER_WORLD_UNIT = 750 / 10.8;
// Simulation nodes use Cocos' native 32 units/metre. Render nodes separately use
// the original camera conversion; velocity/impulse/mass stay in Unity metres.
const PTM = 32;
type Point = {x: number; y: number};
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

// Cocos-side tuning for the reported contact jitter; not Unity source values.
const STILL_SPEED=.02,STILL_ANGULAR_SPEED=2*Math.PI/180;
const REST_POSITION_RANGE=.03,REST_ANGLE_RANGE=3,REST_DELAY=.8,CONTACT_GRACE=.12;
type State = {contacts: Map<IPhysics2DContact,Node>; neighbours: Set<Node>; neighbourSeen: Map<Node,number>; resting: boolean; quietTime: number;
    quietPose: {x:number;y:number;angle:number}|null; node: Node; body: RigidBody2D; colliders: Collider2D[]; profile: OriginalBody; band: number; active: boolean; ready: boolean; readyAt: number; resumePose?: {x:number;y:number;angle:number}; initialized: boolean; registered: boolean;
    direction: Vec2; nextDirection: number; impulse: Point; previous: {x: number; y: number; angle: number}; scale: number; baseScale: number; massDirty: boolean};

/** Restore original rigid bodies, per-depth filtering and 40963/40964 flow.
 * Curved capsules become convex polygons within Box2D's original contact slop;
 * Cocos partitions those polygons to its supported vertex count. */
export class FlowerPhysics {
    readonly root: Node;
    private readonly states = new Map<string,State>();
    private readonly system: PhysicsSystem2D;
    private readonly previousAuto: boolean;
    private accumulator=0;
    private clock=0;
    private flowTimer=0;
    private flowIndex=0;
    private disposed=false;
    constructor(parent: Node, readonly data: OriginalPhysics, private readonly random: () => number = Math.random) {
        this.system=PhysicsSystem2D.instance;
        if (!this.system?.physicsWorld) throw new Error('Flower physics needs the project Box2D 2D engine module.');
        this.previousAuto=this.system.autoSimulation;
        this.system.autoSimulation=false;this.system.enable=true;
        this.system.velocityIterations=data.velocityIterations;this.system.positionIterations=data.positionIterations;
        for(let i=7;i<=11;i++)this.system.collisionMatrix[String(1<<i)]=data.collisionMatrix[i];
        // Physics must not inherit the responsive UI board's translation/scale.
        this.root=new Node('OriginalFlowerPhysics');(parent.scene ?? parent).addChild(this.root);
        const wallNode=new Node('OriginalWaterBoundary');this.root.addChild(wallNode);
        const wall=wallNode.addComponent(RigidBody2D);wall.type=ERigidBody2DType.Static;wall.group=1<<7;
        for(const fixture of data.walls)this.createFixtures(wallNode,fixture,1<<7);
    }
    static preload(): Promise<OriginalPhysics> {return loadOriginalPhysics();}
    private range(a: number,b: number): number {return a+(b-a)*this.random();}
    private direction(): Vec2 {
        // Random.insideUnitCircle.normalized (40967), including its right fallback.
        const angle=this.random()*Math.PI*2, radius=Math.sqrt(this.random());
        return radius*radius<=.001?new Vec2(1,0):new Vec2(Math.cos(angle),Math.sin(angle));
    }
    spawn(): {x: number; y: number; impulse: Point} {
        const s=this.data.spawn,angle=this.random()*Math.PI*2,radius=Math.sqrt(this.random())*s.jitterRadius;
        const x=Math.cos(angle)*radius,y=Math.sin(angle)*radius,speed=this.range(s.initialImpulseRange[0],s.initialImpulseRange[1]);
        const direction=radius>.001?new Vec2(x/radius,y/radius):this.direction();
        return {x:(s.center[0]+this.range(s.xRange[0],s.xRange[1])+x)*FLOWER_WORLD_UNIT,
            y:(s.center[1]+this.range(s.yRange[0],s.yRange[1])+y)*FLOWER_WORLD_UNIT,
            impulse:{x:direction.x*speed,y:direction.y*speed}};
    }
    private createFixtures(node: Node, source: PhysicsFixture, group: number): Collider2D[] {
        const [a,b,c,d,tx,ty]=source.matrix;
        const sx=Math.hypot(a,b),sy=Math.hypot(c,d);
        // Cocos 2D binds only colliders on the rigid body's own node. Bake the
        // original child transforms into fixture coordinates, never child nodes.
        const point=(x: number,y: number)=>new Vec2((a*x+c*y+tx)*PTM,(b*x+d*y+ty)*PTM);
        const colliders: Collider2D[]=[];
        const finish=(collider: Collider2D) => {collider.group=group;collider.density=source.density;collider.friction=source.friction;collider.restitution=source.restitution;collider.apply();colliders.push(collider);};
        const polygon=(points: Vec2[])=>{const shape=node.addComponent(PolygonCollider2D);shape.points=points;finish(shape);};
        const ox=source.offset.x,oy=source.offset.y;
        if(source.kind==='CircleCollider2D') {
            const circle=node.addComponent(CircleCollider2D);circle.offset=point(ox,oy);
            circle.radius=source.m_Radius!*Math.max(sx,sy)*PTM;finish(circle);
        } else if(source.kind==='BoxCollider2D') {
            // Only axis-aligned boxes can use Cocos' non-rotatable BoxCollider2D.
            if(Math.abs(b)<1e-8&&Math.abs(c)<1e-8){
                const box=node.addComponent(BoxCollider2D);box.offset=point(ox,oy);
                box.size.set(source.m_Size!.x*sx*PTM,source.m_Size!.y*sy*PTM);finish(box);
            } else {
                const w=source.m_Size!.x/2,h=source.m_Size!.y/2;
                polygon([point(ox-w,oy-h),point(ox+w,oy-h),point(ox+w,oy+h),point(ox-w,oy+h)]);
            }
        } else if(source.kind==='PolygonCollider2D') {
            for(const path of source.m_Points!.m_Paths)polygon(path.map(p=>point(p.x+ox,p.y+oy)));
        } else if(source.kind==='CapsuleCollider2D') {
            const width=source.m_Size!.x*sx,height=source.m_Size!.y*sy,vertical=source.m_Direction===0;
            const radius=(vertical?width:height)/2,segment=Math.max(0,(vertical?height:width)/2-radius);
            const offset=point(ox,oy);
            if(segment<1e-8) {
                const circle=node.addComponent(CircleCollider2D);circle.offset=offset;circle.radius=radius*PTM;finish(circle);
            } else {
                // Approximation error <= original Physics2D contact offset .01m.
                const steps=Math.max(4,Math.ceil(Math.PI/Math.acos(Math.max(-1,1-this.data.contactOffset/radius))));
                const points: Vec2[]=[];
                for(let end=0;end<2;end++)for(let i=0;i<=steps;i++) {
                    const t=(vertical?(end===0?0:Math.PI):(end===0?-Math.PI/2:Math.PI/2))+i*Math.PI/steps;
                    const x=radius*Math.cos(t)+(vertical?0:(end===0?segment:-segment));
                    const y=radius*Math.sin(t)+(vertical?(end===0?segment:-segment):0);
                    // Dimensions already include the original nonuniform scale.
                    points.push(new Vec2((a/sx*x+c/sy*y)*PTM+offset.x,(b/sx*x+d/sy*y)*PTM+offset.y));
                }
                polygon(points);
            }
        } else throw new Error(`Unsupported original collider: ${source.kind}`);
        return colliders;
    }
    add(id: string,path: string,x: number,y: number,angle: number,baseScale: number,band: number,impulse: Point): void {
        const profile=this.data.flowers[path];if(!profile)throw new Error(`Missing original rigid body: ${path}`);
        const node=new Node('Body-'+id);node.active=false;this.root.addChild(node);
        node.setPosition(x/FLOWER_WORLD_UNIT*PTM,y/FLOWER_WORLD_UNIT*PTM,0);node.angle=angle;
        const body=node.addComponent(RigidBody2D);body.type=ERigidBody2DType.Dynamic;body.gravityScale=profile.gravityScale;
        body.linearDamping=this.data.flow.linearDrag;body.angularDamping=this.data.flow.angularDrag;
        body.fixedRotation=false;body.allowSleep=true;body.enabledContactListener=true;body.group=1<<(8+band);
        const colliders: Collider2D[]=[];for(const fixture of profile.fixtures)colliders.push(...this.createFixtures(node,fixture,body.group));
        const state: State={contacts:new Map(),neighbours:new Set(),neighbourSeen:new Map(),resting:false,quietTime:0,quietPose:null,node,body,colliders,profile,band,active:false,ready:false,readyAt:0,initialized:false,registered:false,direction:this.direction(),nextDirection:0,impulse,
            previous:{x,y,angle},scale:-1,baseScale,massDirty:true};
        this.states.set(id,state);
        // Contact instances are pooled; retain only their identity until end,
        // with the other body node copied from the callback.
        const touching=(_self: Collider2D,other: Collider2D,contact: IPhysics2DContact|null)=>{
            if(contact)state.contacts.set(contact,other.node);
        };
        const leaving=(_self: Collider2D,_other: Collider2D,contact: IPhysics2DContact|null)=>{
            if(contact)state.contacts.delete(contact);
            // Reconcile complete neighbours once per step. Internal polygon
            // fixture seams may end/begin contacts within the same native step.
        };
        for(const collider of colliders){
            collider.on(Contact2DType.BEGIN_CONTACT,touching);
            collider.on(Contact2DType.END_CONTACT,leaving);
        }
    }
    sync(id: string,band: number,scale: number,enabled: boolean,animated?: {x: number;y: number;angle: number},resumePose?: {x:number;y:number;angle:number}, readyAt = 0): void {
        const state=this.states.get(id);if(!state)return;
        const ready=enabled&&band<3&&!animated&&scale>1e-4;
        state.ready=ready;state.readyAt=readyAt;state.resumePose=resumePose;
        const active=ready&&this.clock+1e-8>=readyAt;
        // Disable the body before moving/rebuilding transition fixtures.
        if(!active&&state.active){state.active=false;state.node.active=false;this.clearRest(state);}
        const changed=state.band!==band;
        if(changed){this.clearRest(state);state.direction=this.direction();state.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);state.band=band;state.body.group=1<<(8+band);for(const collider of state.colliders){collider.group=state.body.group;collider.apply();}state.massDirty=true;}
        const nextScale=Math.max(.0001,scale*state.baseScale);
        if(Math.abs(nextScale-state.scale)>1e-6){this.clearRest(state);state.scale=nextScale;state.node.setScale(nextScale,nextScale,1);for(const c of state.colliders)c.apply();state.massDirty=true;}
        if(animated){state.node.setPosition(animated.x/FLOWER_WORLD_UNIT*PTM,animated.y/FLOWER_WORLD_UNIT*PTM,0);state.node.angle=animated.angle;state.previous={...animated};}
        if(active&&!state.active)this.activate(state);
    }
    private activate(state: State): void {
        const pose=state.resumePose;
        if(pose){state.node.setPosition(pose.x/FLOWER_WORLD_UNIT*PTM,pose.y/FLOWER_WORLD_UNIT*PTM,0);state.node.angle=pose.angle;state.previous={...pose};}
        state.active=true;state.node.active=true;state.massDirty=true;this.clearRest(state);
        if(!state.initialized){state.initialized=true;state.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);}
    }
    private normalizeMass(): void {
        for(const state of this.states.values())if(state.active){
            if(state.massDirty&&!state.profile.autoMass){const mass=state.body.getMass();if(mass>1e-12){const ratio=state.profile.mass/mass;for(const c of state.colliders){c.density*=ratio;c.apply();}state.massDirty=false;}}
            if(state.impulse.x||state.impulse.y){state.body.applyLinearImpulseToCenter(new Vec2(state.impulse.x,state.impulse.y),true);state.impulse={x:0,y:0};}
            if(!state.registered){
                state.registered=true;const v=state.body.linearVelocity;
                if(v.x*v.x+v.y*v.y<.0025){const speed=this.range(.05,.12);state.body.linearVelocity=new Vec2(state.direction.x*speed,state.direction.y*speed);}
            }
        }
    }
    private clamp(state: State,max: number): void {
        const v=state.body.linearVelocity,length=Math.hypot(v.x,v.y);
        if(length>max)state.body.linearVelocity=new Vec2(v.x/length*max,v.y/length*max);
    }
    private clearRest(state: State): void {
        state.resting=false;state.quietTime=0;state.quietPose=null;
    }
    private settleContact(state: State): void {
        for(const neighbour of state.contacts.values())state.neighbourSeen.set(neighbour,this.clock);
        for(const [other,lastSeen] of state.neighbourSeen){
            if(!other.isValid||!other.activeInHierarchy||this.clock-lastSeen>CONTACT_GRACE)state.neighbourSeen.delete(other);
        }
        // Track neighbouring bodies, not individual fixtures of compound shapes.
        // Tiny polygon seam contacts can disappear for a single step. Do not
        // repeatedly wake an island for that flicker; removed/disabled blockers
        // still release it immediately, and genuine separation within .12s.
        const neighbours=new Set(state.neighbourSeen.keys());
        if(neighbours.size!==state.neighbours.size||Array.from(neighbours).some(c=>!state.neighbours.has(c))){
            state.neighbours=neighbours;this.clearRest(state);state.body.wakeUp();
        }
        const v=state.body.linearVelocity;
        if(!neighbours.size||v.x*v.x+v.y*v.y>STILL_SPEED*STILL_SPEED||Math.abs(state.body.angularVelocity)>STILL_ANGULAR_SPEED){
            this.clearRest(state);return;
        }
        // Native sync writes world rotation; Node.angle can still hold an old Euler
        // cache. eulerAngles refreshes it before rest detection and rendering.
        const pose={x:state.node.position.x/PTM,y:state.node.position.y/PTM,angle:state.node.eulerAngles.z},origin=state.quietPose;
        const rotation=origin?Math.abs(((pose.angle-origin.angle+540)%360)-180):0;
        if(!origin||Math.hypot(pose.x-origin.x,pose.y-origin.y)>REST_POSITION_RANGE||rotation>REST_ANGLE_RANGE){
            this.clearRest(state);state.quietPose=pose;
        }
        state.quietTime+=this.data.fixedTimeStep;
        if(state.quietTime+1e-8>=REST_DELAY){
            // An over-constrained contact island may have essentially zero
            // velocity while its positional solver keeps rocking the shapes.
            // Let the settled island sleep; real movement/topology changes
            // above release it, without disabling collisions or freezing art.
            state.resting=true;state.body.sleep();
        }
    }
    private flow(): void {
        this.flowIndex++;
        for(let band=0;band<3;band++){
            const settings=this.data.flow.layers[band];const entries=Array.from(this.states.values()).filter(s=>s.active&&s.band===band);
            entries.forEach((state,i)=>{
                if(state.resting)return;
                this.clamp(state,settings.maxSpeed);
                if((this.flowIndex+i)%Math.max(1,this.data.flow.updateStep))return;
                if(this.clock>=state.nextDirection){state.direction=this.direction();state.nextDirection=this.clock+this.range(...this.data.flow.directionInterval as [number,number]);}
                const v=state.body.linearVelocity,speed=Math.hypot(v.x,v.y),threshold=settings.maxSpeed*.8;
                if(speed<threshold&&state.body.isAwake()){
                    const factor=.35+.65*Math.max(0,Math.min(1,1-speed/Math.max(threshold,.01)));
                    state.body.applyLinearImpulseToCenter(new Vec2(state.direction.x*settings.strength*factor,state.direction.y*settings.strength*factor),true);
                }
                if(!state.contacts.size&&state.body.isAwake()&&Math.abs(state.body.angularVelocity)*180/Math.PI<10&&this.random()<.18)
                    state.body.applyAngularImpulse(this.range(-this.data.flow.torqueImpulse,this.data.flow.torqueImpulse),true);
                this.clamp(state,settings.maxSpeed);
            });
        }
    }
    update(dt: number): void {
        if(this.disposed||!Number.isFinite(dt)||dt<=0)return;
        const world=this.system.physicsWorld;
        world.syncSceneToPhysics();
        this.normalizeMass();
        this.accumulator+=Math.min(dt,this.data.maximumFrameTime);
        while(this.accumulator+1e-9>=this.data.fixedTimeStep){
            for(const state of this.states.values())if(state.ready&&!state.active&&this.clock+1e-8>=state.readyAt)this.activate(state);
            world.syncSceneToPhysics();this.normalizeMass();
            for(const state of this.states.values())if(state.active)this.settleContact(state);
            for(const state of this.states.values())if(state.active&&Math.abs(state.body.angularVelocity)>this.data.maxAngularSpeed*Math.PI/180)
                state.body.angularVelocity=Math.sign(state.body.angularVelocity)*this.data.maxAngularSpeed*Math.PI/180;
            for(const state of this.states.values())if(state.active)state.previous={x:state.node.position.x/PTM*FLOWER_WORLD_UNIT,y:state.node.position.y/PTM*FLOWER_WORLD_UNIT,angle:state.node.eulerAngles.z};
            this.clock+=this.data.fixedTimeStep;this.flowTimer+=this.data.fixedTimeStep;
            if(this.flowTimer+1e-9>=this.data.flow.updateInterval){this.flowTimer=0;this.flow();}
            this.system.step(this.data.fixedTimeStep);world.syncPhysicsToScene();this.accumulator-=this.data.fixedTimeStep;
        }
    }
    pose(id: string): {x: number;y: number;angle: number}|null {
        const state=this.states.get(id);if(!state?.active)return null;
        const x=state.node.position.x/PTM*FLOWER_WORLD_UNIT,y=state.node.position.y/PTM*FLOWER_WORLD_UNIT,angle=state.node.eulerAngles.z;
        const delta=((angle-state.previous.angle+540)%360)-180;
        const alpha=state.band<2?Math.max(0,Math.min(1,this.accumulator/this.data.fixedTimeStep)):1;
        return {x:state.previous.x+(x-state.previous.x)*alpha,y:state.previous.y+(y-state.previous.y)*alpha,
            angle:state.previous.angle+delta*alpha};
    }
    remove(id: string): void {const s=this.states.get(id);if(s){s.node.active=false;s.node.destroy();this.states.delete(id);}}
    dispose(): void {if(this.disposed)return;this.disposed=true;this.root.active=false;this.root.destroy();this.states.clear();this.system.autoSimulation=this.previousAuto;}
}
