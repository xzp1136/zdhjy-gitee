// Test adapter backed by the exact Box2D JS package bundled with Creator 3.8.7.
// It models Cocos' component plumbing only; collision resolution is real Box2D.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('./typescript.cjs');
const engine=[process.env.COCOS_ENGINE,'/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/resources/3d/engine','C:/ProgramData/cocos/editors/Creator/3.8.7/resources/resources/3d/engine'].filter(Boolean).find(root=>fs.existsSync(path.join(root,'node_modules/@cocos/box2d/package.json')));
if(!engine)throw Error('Set COCOS_ENGINE to the engine directory supplied with Creator 3.8.7.');
const partition={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(engine,'cocos/physics-2d/framework/utils/polygon-partition.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:partition.exports,require(){return {logID(...args){throw Error('Cocos polygon partition '+args);}};}});
const b2=require(path.join(engine,'node_modules/@cocos/box2d'));
module.exports=function physicsCC(Node){
 // Match Creator's rotation quaternion and cached angle independently. Generic
 // Euler conversion folds planar rotations outside [-90,90] into X/Y flips.
 Object.defineProperties(Node.prototype,{
  angle:{configurable:true,get(){return this._angleCache??0;},set(v){this._angleCache=v;this._rotationAngle=v;this._eulerDirty=false;}},
  rotation:{configurable:true,get(){const a=(this._rotationAngle??0)*Math.PI/360;return {x:0,y:0,z:Math.sin(a),w:Math.cos(a)};}},
  eulerAngles:{configurable:true,get(){if(this._eulerDirty){this._angleCache=Math.asin(Math.sin((this._rotationAngle??0)*Math.PI/180))*180/Math.PI;this._eulerDirty=false;}return {x:0,y:0,z:this.angle};}}
 });
 const angleOf=node=>{const q=node.rotation;return Math.atan2(2*q.w*q.z,1-2*q.z*q.z);};
 const world=new b2.World(new b2.Vec2(0,0)), bodies=new Set(),colliders=new Set();let writing=false;
 const factory=world.m_contactManager.m_contactFactory,liveContacts=new Set(),create=factory.Create.bind(factory),destroyContact=factory.Destroy.bind(factory);
 factory.Create=(...args)=>{const c=create(...args);if(c&&liveContacts.has(c))throw Error('Box2D contact reused while active');if(c)liveContacts.add(c);return c;};
 factory.Destroy=c=>{if(!liveContacts.delete(c))throw Error('Box2D contact destroyed twice');return destroyContact(c);};
 class Vec2 extends b2.Vec2 {set(x,y){this.Set(x,y);return this;}}
 const Contact2DType={BEGIN_CONTACT:'begin-contact',END_CONTACT:'end-contact'};
 const contacts=new Map();
 const listener=new b2.ContactListener();
 listener.BeginContact=native=>{const a=native.GetFixtureA().GetUserData(),b=native.GetFixtureB().GetUserData();if(!a||!b)return;const contact={colliderA:a,colliderB:b};contacts.set(native,contact);if(a.rb.enabledContactListener)a.emit(Contact2DType.BEGIN_CONTACT,a,b,contact);if(b.rb.enabledContactListener)b.emit(Contact2DType.BEGIN_CONTACT,b,a,contact);};
 listener.EndContact=native=>{const c=contacts.get(native);if(!c)return;const a=c.colliderA,b=c.colliderB;if(a.rb.enabledContactListener)a.emit(Contact2DType.END_CONTACT,a,b,c);if(b.rb.enabledContactListener)b.emit(Contact2DType.END_CONTACT,b,a,c);contacts.delete(native);};

 world.SetContactListener(listener);
 const system={autoSimulation:true,enable:true,velocityIterations:8,positionIterations:3,collisionMatrix:{},
  physicsWorld:{syncSceneToPhysics(){for(const rb of [...bodies]){if(!rb.node.isValid){world.DestroyBody(rb.impl);bodies.delete(rb);continue;}rb.impl.SetActive(rb.node.activeInHierarchy);if(rb.node.activeInHierarchy)for(const c of colliders)if(c.rb===rb&&!c.fixtures.length&&c.node.isValid)c.apply();rb.impl.SetType(rb.type);rb.impl.SetTransformVec(new b2.Vec2(rb.node.position.x/32,rb.node.position.y/32),angleOf(rb.node));rb.impl.SetLinearDamping(rb.linearDamping);rb.impl.SetAngularDamping(rb.angularDamping);}},
   syncPhysicsToScene(){writing=true;for(const rb of bodies){if(!rb.node.activeInHierarchy)continue;const p=rb.impl.GetPosition();rb.node.setPosition(p.x*32,p.y*32);rb.node._rotationAngle=rb.impl.GetAngle()*180/Math.PI;rb.node._eulerDirty=true;}writing=false;}},
  step(dt){world.Step(dt,this.velocityIterations,this.positionIterations);}};
 class RigidBody2D{
  type=2;group=1;gravityScale=0;linearDamping=0;angularDamping=0;fixedRotation=false;allowSleep=true;
  ensure(){if(!this.impl){const d=new b2.BodyDef();d.type=this.type;d.gravityScale=0;d.active=this.node.activeInHierarchy;d.position.Set(this.node.position.x/32,this.node.position.y/32);d.angle=angleOf(this.node);this.impl=world.CreateBody(d);bodies.add(this);}return this.impl;}
  getMass(){return this.ensure().GetMass();}
  get linearVelocity(){return this.ensure().GetLinearVelocity().Clone();}set linearVelocity(v){this.ensure().SetLinearVelocity(v);}
  get angularVelocity(){return this.ensure().GetAngularVelocity();}set angularVelocity(v){this.ensure().SetAngularVelocity(v);}
  isAwake(){return this.ensure().IsAwake();}
  sleep(){this.ensure().SetAwake(false);}
  wakeUp(){this.ensure().SetAwake(true);}
  // Creator 3.8.7's JS backend uses the body origin in this convenience method.
  applyLinearImpulseToCenter(v,w){const b=this.ensure();b.ApplyLinearImpulse(v,b.GetPosition(),w);}
  getWorldCenter(out){const p=this.ensure().GetWorldCenter();out.x=p.x*32;out.y=p.y*32;return out;}
  applyLinearImpulse(v,p,w){this.ensure().ApplyLinearImpulse(v,new b2.Vec2(p.x/32,p.y/32),w);}
  applyAngularImpulse(v,w){this.ensure().ApplyAngularImpulse(v,w);}
 }
 class Collider2D{
  events=new Map();
  on(name,fn){if(!this.events.has(name))this.events.set(name,new Set());this.events.get(name).add(fn);}
  off(name,fn){this.events.get(name)?.delete(fn);}
  emit(name,...args){for(const fn of this.events.get(name)||[])fn(...args);}
  group=1;density=1;friction=.2;restitution=0;offset=new Vec2();fixtures=[];
  apply(){const root=this.node;if(!root.getComponent(RigidBody2D))throw Error('Cocos colliders must share the rigid body node');
   const rb=root.getComponent(RigidBody2D),body=rb.ensure();this.rb=rb;colliders.add(this);if(!root.activeInHierarchy)body.SetActive(false);for(const f of this.fixtures)body.DestroyFixture(f);this.fixtures=[];if(!this.node.activeInHierarchy)return;
   const scale=root.scale.x;let x=this.node===root?0:this.node.position.x,y=this.node===root?0:this.node.position.y,a=(this.node===root?0:this.node.angle)*Math.PI/180;
   const point=p=>new b2.Vec2((x+p.x*Math.cos(a)-p.y*Math.sin(a))*scale/32,(y+p.x*Math.sin(a)+p.y*Math.cos(a))*scale/32);
   const create=shape=>{const def=new b2.FixtureDef();def.shape=shape;def.userData=this;def.density=this.density;def.friction=this.friction;def.restitution=this.restitution;def.filter.categoryBits=this.group;def.filter.maskBits=system.collisionMatrix[String(this.group)]??0xffff;this.fixtures.push(body.CreateFixture(def));};
   if(this instanceof CircleCollider2D){const c=new b2.CircleShape(this.radius*scale/32);c.m_p.Copy(point(this.offset));create(c);}
   else {const ps=this instanceof BoxCollider2D?[-1,1].flatMap(sy=>[-1,1].map(sx=>({x:this.offset.x+sx*this.size.width/2,y:this.offset.y+sy*this.size.height/2}))):this.points;
    if(this instanceof BoxCollider2D){const shape=new b2.PolygonShape();shape.Set(ps.map(point));create(shape);}
    else {const polys=partition.exports.ConvexPartition(ps);if(!polys)throw Error('Original polygon does not partition');for(const poly of polys){let vertices=[];for(const p of poly){vertices.push(point(p));if(vertices.length===8){const shape=new b2.PolygonShape();shape.Set(vertices,vertices.length);create(shape);vertices=[vertices[0],vertices[vertices.length-1]];}}if(vertices.length>=3){const shape=new b2.PolygonShape();shape.Set(vertices,vertices.length);create(shape);}}}
   }
  }
 }
 class CircleCollider2D extends Collider2D{radius=1;}
 class BoxCollider2D extends Collider2D{size={width:1,height:1,set(w,h){this.width=w;this.height=h;}};}
 class PolygonCollider2D extends Collider2D{points=[];}
 const destroy=Node.prototype.destroy;
 Node.prototype.destroy=function(){const rb=this.getComponent(RigidBody2D);if(rb?.impl&&bodies.has(rb)){world.DestroyBody(rb.impl);bodies.delete(rb);}return destroy.call(this);};
 return {Node,Vec2,Contact2DType,RigidBody2D,Collider2D,CircleCollider2D,BoxCollider2D,PolygonCollider2D,ERigidBody2DType:{Static:0,Kinematic:1,Dynamic:2},PhysicsSystem2D:{instance:system},world,bodies};
};
