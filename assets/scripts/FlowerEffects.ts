import { loadFlowerAsset } from './FlowerAssets';
import { JsonAsset, Node, sp, UITransform, Vec3 } from 'cc';
import { uiNode } from './FlowerUI';

export type FlowerEffectKind = 'landing' | 'complete' | 'group-switch' | 'order-tip' | 'new-order';
export type FlowerEffectOptions = { newVaseTip?: boolean };
export type FlowerEffectHandle = {
    readonly node: Node;
    /** True after normal completion or the original bounded-loop lifetime. */
    readonly finished: Promise<boolean>;
    cancel(): void;
};

type EffectChoice = {
    resource: string; animation: string; track: number; duration: number;
    prefabScale: number[]; sourceSkeletonDataScale: number;
};
type EffectRole = { choices: EffectChoice[]; newVaseMode?: { loop: boolean; lifetime: number } };
type EffectManifest = { roles: Record<string, EffectRole>; scalePolicy: { unityPixelsPerWorldUnit: number } };
type EffectAssets = { manifest: EffectManifest; skeletons: Map<string, sp.SkeletonData> };
type ActiveEffect = { skeleton: sp.Skeleton; node: Node; remaining: number | null; finish(completed: boolean): void };
const UI_SCALE = 750 / 1080;
const ROLE: Record<FlowerEffectKind, string> = {
    landing: 'flowerPut', complete: 'vaseComplete', 'group-switch': 'vaseSwitch',
    'order-tip': 'orderTip', 'new-order': 'orderNewVase',
};
let assetPromise: Promise<EffectAssets> | null = null;

function loadEffectAssets(): Promise<EffectAssets> {
    if (!assetPromise) {
        assetPromise = new Promise<EffectManifest>((resolve, reject) => {
            loadFlowerAsset('original/data/order-spine-effects', JsonAsset, (error, asset) => {
                if (error) reject(error); else resolve(asset.json as EffectManifest);
            });
        }).then(async manifest => {
            const paths = new Set<string>();
            for (const role of Object.values(ROLE)) {
                const choices = manifest.roles[role]?.choices;
                if (!choices?.length) throw new Error(`Missing original Spine effect role: ${role}`);
                for (const choice of choices) paths.add(choice.resource);
            }
            const skeletons = new Map<string, sp.SkeletonData>();
            await Promise.all([...paths].map(path => new Promise<void>((resolve, reject) => {
                loadFlowerAsset(path, sp.SkeletonData, (error, asset) => {
                    if (error) reject(error);
                    else { skeletons.set(path, asset); resolve(); }
                });
            })));
            return { manifest, skeletons };
        }).catch(error => { assetPromise = null; throw error; });
    }
    return assetPromise;
}

/** Original Spine effects, independent of moving/destroyed order views.
 * Call update(dt) for the original five-second new-vase tip, setPaused for
 * pause/resume, and dispose on scene replacement. Other clips self-complete.
 */
export class FlowerEffects {
    readonly root: Node;
    private readonly active = new Set<ActiveEffect>();
    private paused = false;
    private disposed = false;
    private readonly ownerDestroyed = () => this.dispose();

    private constructor(private readonly parent: Node, private readonly assets: EffectAssets,
        private readonly random: () => number) {
        this.root = uiNode(parent, 'OrderEffects');
        parent.on(Node.EventType.NODE_DESTROYED, this.ownerDestroyed);
        this.root.on(Node.EventType.NODE_DESTROYED, this.ownerDestroyed);
    }

    static async preload(): Promise<void> { await loadEffectAssets(); }

    static async create(parent: Node, random: () => number = Math.random): Promise<FlowerEffects> {
        const assets = await loadEffectAssets();
        if (!parent.isValid) throw new Error('The effect parent was destroyed while Spine resources loaded.');
        return new FlowerEffects(parent, assets, random);
    }

    get activeCount(): number { return this.active.size; }

    /** localPoint is the original attachment pivot in anchor coordinates, not
     * the cropped flower PNG's center. Position is captured when play is called;
     * the effect does not inherit the anchor's exit motion or shrink animation.
     */
    play(kind: FlowerEffectKind, anchor: Node, localPoint: { x: number; y: number } = { x: 0, y: 0 },
        options: FlowerEffectOptions = {}): FlowerEffectHandle | null {
        if (this.disposed || !this.root.isValid || !anchor.isValid) return null;
        const transform = anchor.getComponent(UITransform);
        if (!transform) throw new Error('A Spine effect anchor needs a UITransform.');
        const role = this.assets.manifest.roles[ROLE[kind]];
        // Original FlowerSpineEft1/2/3 uses uniform Random.Range, unrelated to kind.
        const index = role.choices.length === 1 ? 0
            : Math.min(role.choices.length - 1, Math.max(0, Math.floor(this.random() * role.choices.length)));
        const choice = role.choices[index], asset = this.assets.skeletons.get(choice.resource)!;
        const mode = kind === 'order-tip' && options.newVaseTip ? role.newVaseMode : undefined;
        const loop = !!mode?.loop;
        if (loop && !(mode!.lifetime > 0)) throw new Error('A looping original effect must have a finite lifetime.');
        const world = transform.convertToWorldSpaceAR(new Vec3(localPoint.x, localPoint.y, 0));
        const position = this.root.getComponent(UITransform)!.convertToNodeSpaceAR(world);
        const node = uiNode(this.root, `Spine-${kind}`, position.x, position.y, 1, 1);
        let skeleton: sp.Skeleton;
        try {
            skeleton = node.addComponent(sp.Skeleton);
            // The original seven materials use _STRAIGHT_ALPHA_INPUT.
            skeleton.premultipliedAlpha = false;
            skeleton.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
            skeleton.skeletonData = asset;
            skeleton.loop = loop;
            skeleton.paused = this.paused;
            const importedScale = asset.scale > 0 ? asset.scale : 1;
            const scale = UI_SCALE * this.assets.manifest.scalePolicy.unityPixelsPerWorldUnit
                * choice.sourceSkeletonDataScale / importedScale;
            node.setScale(scale * choice.prefabScale[0], scale * choice.prefabScale[1], 1);
        } catch (error) { node.active = false; node.destroy(); throw error; }

        let resolve!: (completed: boolean) => void;
        const finished = new Promise<boolean>(done => { resolve = done; });
        let settled = false;
        const destroyed = () => finish(false);
        const finish = (completed: boolean) => {
            if (settled) return;
            settled = true;
            this.active.delete(effect);
            node.off(Node.EventType.NODE_DESTROYED, destroyed);
            if (skeleton.isValid) {
                skeleton.setCompleteListener(null);
                skeleton.setInterruptListener(null);
                skeleton.setEndListener(null);
                skeleton.clearTracks();
            }
            if (node.isValid) { node.active = false; node.destroy(); }
            resolve(completed);
        };
        const effect: ActiveEffect = { skeleton, node, remaining: loop ? mode!.lifetime : null, finish };
        this.active.add(effect);
        node.on(Node.EventType.NODE_DESTROYED, destroyed);
        skeleton.setCompleteListener(() => { if (!loop) finish(true); });
        skeleton.setInterruptListener(() => finish(false));
        skeleton.setEndListener(() => finish(false));
        try {
            if (!skeleton.setAnimation(choice.track, choice.animation, loop)) {
                throw new Error(`Cannot play original Spine animation: ${choice.resource}/${choice.animation}`);
            }
        } catch (error) { finish(false); throw error; }
        return { node, finished, cancel: () => finish(false) };
    }

    setPaused(paused: boolean): void {
        this.paused = paused;
        for (const effect of this.active) if (effect.skeleton.isValid) effect.skeleton.paused = paused;
    }

    update(dt: number): void {
        if (this.disposed || this.paused || !Number.isFinite(dt) || dt <= 0) return;
        for (const effect of [...this.active]) {
            if (effect.remaining === null) continue;
            effect.remaining -= dt;
            if (effect.remaining <= 1e-8) effect.finish(true);
        }
    }

    clear(): void { for (const effect of [...this.active]) effect.finish(false); }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.parent.off(Node.EventType.NODE_DESTROYED, this.ownerDestroyed);
        this.root.off(Node.EventType.NODE_DESTROYED, this.ownerDestroyed);
        this.clear();
        if (this.root.isValid) { this.root.active = false; this.root.destroy(); }
    }
}
