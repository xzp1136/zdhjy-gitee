import { loadFlowerAsset } from './FlowerAssets';
import { Color, EventTouch, JsonAsset, Node, Sprite, SpriteFrame, Tween, UITransform, UIOpacity, Vec3 } from 'cc';
import { FlowerPiece } from './FlowerRules';
import { flowerSpritePath } from './FlowerCatalog';
import { loadFrame, uiNode } from './FlowerUI';

const LEFT = -325, RIGHT = 325, BOTTOM = -520, TOP = 130;
const SURFACE_COUNT = 21;
const PREVIEW_COUNT = 16;
const DESIGN_SCALE = 750 / 1052;
const WHITE = new Color(255, 255, 255, 255);
const UNDERWATER = new Color(208, 225, 225, 255);
const LAYER_SCALE = [1, 0.9, 0.8, 0.7];
const LAYER_ALPHA = [255, 150, 95, 0];
// One pixel-to-design conversion preserves the size differences between the
// original flower sprites, instead of fitting every species to the same box.
const FLOWER_PIXEL_SCALE = 0.5;
const NEAR_RADIUS = 190;
const MOTION_RESPONSE = 9;
const SHUFFLE_GATHER_TIME = 0.28;
const SHUFFLE_BATCH_INTERVAL = 0.05;
const SHUFFLE_SETTLE_TIME = 0.35;

type Point = { x: number; y: number };
type ScatterTarget = Point & { at: number };
type MotionData = {
    flowerManager: { values: Record<string, number> };
    spawn: { batchSizeMinInclusive: number; batchSizeMaxExclusive: number; batchInterval: number;
        finalWait: number; visibleScaleIn: { duration: number } };
};
type PromotionMotion = {
    start: number; duration: number; sourceBand: number; switchProgress: number; switched: boolean;
    fromX: number; fromY: number; fromScale: number; fromAngle: number; toAngle: number;
    fromAlpha: number; overshoot: number;
};
type Matrix2D = number[];
type RippleKey = { time: number; value: number | string | boolean | null; coefficients?: number[] };
type RippleTrack = { nodePath: string; property: string; keys: RippleKey[] };
type RippleClip = { duration: number; loop: boolean; tracks: RippleTrack[] };
type RipplePoint = { effect: string; transform: Matrix2D };
type RippleProfile = {
    up: RipplePoint[]; middle: RipplePoint | null; promotion: RipplePoint | null;
    speeds: { up: number; middle: number; promotion: number };
    initialDelayRange: number[]; promotionFallbackDuration: number;
};
type RippleSourceNode = {
    path: string; parent: string; transform: Matrix2D; active: boolean;
    sprite?: string; color: number[]; sortingOrder: number;
};
type RippleData = {
    clips: Record<string, RippleClip>;
    effects: Record<string, { clip: string; nodes: RippleSourceNode[] }>;
    sprites: Record<string, { width: number; height: number; ppu: number; logicalSize: number[]; trimOffset: number[]; pivot: number[] }>;
    prefabs: Record<string, RippleProfile>;
};
type AffineNode = { outer: Node; inner: Node };
type RippleRuntimeNode = {
    affine: AffineNode; source: RippleSourceNode; sprite: Sprite | null; art: Node | null;
    frame: string | null; color: number[]; scaleX: number; scaleY: number;
};
let rippleData: Promise<RippleData> | null = null;
let motionData: Promise<MotionData> | null = null;

function loadMotionData(): Promise<MotionData> {
    if (!motionData) motionData = new Promise((resolve, reject) => {
        loadFlowerAsset('original/data/original-motion-settings', JsonAsset, (error, asset) => {
            if (error) { motionData = null; reject(error); }
            else resolve(asset.json as MotionData);
        });
    });
    return motionData;
}

function loadRippleData(): Promise<RippleData> {
    if (!rippleData) rippleData = new Promise((resolve, reject) => {
        loadFlowerAsset('original/data/water-ripple-animations', JsonAsset, (error, asset) => {
            if (error) { rippleData = null; reject(error); }
            else resolve(asset.json as RippleData);
        });
    });
    return rippleData;
}

/** Original streamed-clip coefficients are absolute cubic values, not tangents. */
export function sampleRippleTrack(track: RippleTrack, time: number): number | string | boolean | null {
    let low = 0, high = track.keys.length - 1;
    while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (track.keys[middle].time <= time) low = middle; else high = middle - 1;
    }
    const key = track.keys[low], c = key.coefficients;
    if (!c) return key.value;
    const dt = Math.max(0, time - key.time);
    return ((c[0] * dt + c[1]) * dt + c[2]) * dt + c[3];
}

/** Two rotations around a signed scale preserve the original projected matrix,
 * including the few water points with nonzero Unity X/Y tilt. */
function applyAffine(target: AffineNode, matrix: Matrix2D): void {
    const [a, b, c, d, x, y] = matrix;
    const angle = 0.5 * Math.atan2(2 * (a * b + c * d), a * a + c * c - b * b - d * d);
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    const u = a * cosine + b * sine, v = c * cosine + d * sine;
    const sx = Math.hypot(u, v), sy = sx > 1e-10 ? (a * d - b * c) / sx : 0;
    target.outer.setPosition(x, y);
    target.outer.angle = angle * 180 / Math.PI;
    target.outer.setScale(sx, sy, 1);
    target.inner.angle = sx > 1e-10 ? Math.atan2(-v, u) * 180 / Math.PI : 0;
}

function affineNode(parent: Node, name: string, matrix: Matrix2D): AffineNode {
    const outer = uiNode(parent, name, 0, 0, 1, 1);
    const inner = uiNode(outer, 'Basis', 0, 0, 1, 1);
    const result = { outer, inner }; applyAffine(result, matrix); return result;
}

class RipplePlayer {
    readonly root: Node;
    readonly clip: RippleClip;
    private readonly nodes = new Map<string, RippleRuntimeNode>();

    constructor(parent: Node, point: RipplePoint, width: number, height: number,
        private readonly data: RippleData, private readonly frames: Map<string, SpriteFrame>) {
        const source = data.effects[point.effect];
        this.clip = data.clips[source.clip];
        const m = point.transform;
        const basis = affineNode(parent, point.effect, [m[0] * width, m[1] * height,
            m[2] * width, m[3] * height, m[4] * width, m[5] * height]);
        this.root = basis.outer;
        const createNode = (definition: RippleSourceNode): RippleRuntimeNode => {
            const existing = this.nodes.get(definition.path); if (existing) return existing;
            const parentSource = definition.parent ? source.nodes.find(node => node.path === definition.parent) : null;
            const owner = parentSource ? createNode(parentSource).affine.inner : basis.inner;
            const affine = affineNode(owner, definition.path, definition.transform);
            affine.outer.active = definition.active;
            const art = definition.sprite ? uiNode(affine.inner, 'Sprite', 0, 0, 1, 1) : null;
            const sprite = art ? art.addComponent(Sprite) : null;
            if (sprite) sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            const state: RippleRuntimeNode = { affine, source: definition, art, sprite, frame: '',
                color: definition.color.slice(), scaleX: Math.hypot(definition.transform[0], definition.transform[1]),
                scaleY: Math.hypot(definition.transform[2], definition.transform[3]) };
            this.nodes.set(definition.path, state);
            if (definition.sprite) this.setFrame(state, definition.sprite);
            if (sprite) sprite.color = new Color(...state.color.map(value => Math.round(value * 255)) as [number, number, number, number]);
            return state;
        };
        for (const node of source.nodes.slice().sort((a, b) => a.sortingOrder - b.sortingOrder)) createNode(node);
    }

    private setFrame(state: RippleRuntimeNode, resource: string | null): void {
        if (!state.sprite || !state.art || state.frame === resource) return;
        state.frame = resource;
        if (!resource) { state.sprite.spriteFrame = null; state.art.active = false; return; }
        const geometry = this.data.sprites[resource], frame = this.frames.get(resource);
        if (!geometry || !frame) throw new Error(`Missing original water frame: ${resource}`);
        state.art.active = true; state.sprite.spriteFrame = frame;
        state.art.getComponent(UITransform)!.setContentSize(geometry.width / geometry.ppu, geometry.height / geometry.ppu);
        state.art.setPosition(
            (geometry.trimOffset[0] + geometry.width / 2 - geometry.pivot[0] * geometry.logicalSize[0]) / geometry.ppu,
            (geometry.trimOffset[1] + geometry.height / 2 - geometry.pivot[1] * geometry.logicalSize[1]) / geometry.ppu);
    }

    sample(elapsed: number): void {
        const duration = this.clip.duration;
        const time = this.clip.loop && duration > 0 ? ((elapsed % duration) + duration) % duration : clamp(elapsed, 0, duration);
        for (const track of this.clip.tracks) {
            const state = this.nodes.get(track.nodePath); if (!state) continue;
            const value = sampleRippleTrack(track, time);
            if (track.property === 'sprite') this.setFrame(state, value as string | null);
            else if (track.property === 'm_IsActive') state.affine.outer.active = !!value;
            else if (track.property.startsWith('m_Color.')) {
                const index = 'rgba'.indexOf(track.property.slice(-1));
                if (index >= 0 && state.sprite) {
                    state.color[index] = clamp(value as number, 0, 1);
                    state.sprite.color = new Color(...state.color.map(channel => Math.round(channel * 255)) as [number, number, number, number]);
                }
            } else if (track.property === 'm_LocalScale.x' || track.property === 'm_LocalScale.y') {
                if (track.property.endsWith('x')) state.scaleX = value as number; else state.scaleY = value as number;
                const m = state.source.transform;
                const sx = state.scaleX / (Math.hypot(m[0], m[1]) || 1), sy = state.scaleY / (Math.hypot(m[2], m[3]) || 1);
                applyAffine(state.affine, [m[0] * sx, m[1] * sx, m[2] * sy, m[3] * sy, m[4], m[5]]);
            }
        }
    }

    dispose(): void { if (this.root.isValid) { this.root.active = false; this.root.destroy(); } }
}
export type FlowerClickShape =
    | { type: 'polygon'; paths: number[][][] }
    | { type: 'ellipse'; center: number[]; axisX: number[]; axisY: number[] };
type FlowerClickShapes = Record<string, FlowerClickShape>;
let clickShapes: Promise<FlowerClickShapes> | null = null;

function loadClickShapes(): Promise<FlowerClickShapes> {
    if (!clickShapes) clickShapes = new Promise((resolve, reject) => {
        loadFlowerAsset('original/data/flower-click-shapes', JsonAsset, (error, asset) => {
            if (error) { clickShapes = null; reject(error); }
            else resolve((asset.json as { shapes: FlowerClickShapes }).shapes);
        });
    });
    return clickShapes;
}

/** Coordinates use the exported cropped PNG center, with positive Y upwards. */
export function flowerShapeContains(shape: FlowerClickShape, point: Point): boolean {
    if (shape.type === 'ellipse') {
        const x = point.x - shape.center[0], y = point.y - shape.center[1];
        const determinant = shape.axisX[0] * shape.axisY[1] - shape.axisX[1] * shape.axisY[0];
        if (Math.abs(determinant) < 1e-12) return false;
        const u = (x * shape.axisY[1] - y * shape.axisY[0]) / determinant;
        const v = (shape.axisX[0] * y - shape.axisX[1] * x) / determinant;
        return u * u + v * v <= 1 + 1e-8;
    }
    return shape.paths.some(path => {
        let inside = false;
        for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
            const a = path[j], b = path[i];
            const cross = (point.x - a[0]) * (b[1] - a[1]) - (point.y - a[1]) * (b[0] - a[0]);
            if (Math.abs(cross) < 1e-9 && point.x >= Math.min(a[0], b[0]) - 1e-9
                && point.x <= Math.max(a[0], b[0]) + 1e-9 && point.y >= Math.min(a[1], b[1]) - 1e-9
                && point.y <= Math.max(a[1], b[1]) + 1e-9) return true;
            if ((a[1] > point.y) !== (b[1] > point.y)
                && point.x < (b[0] - a[0]) * (point.y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
        }
        return inside;
    });
}

type PoolEntry = {
    flower: FlowerPiece;
    node: Node;
    image: Sprite;
    opacity: UIOpacity;
    ripple: Node;
    rippleProfile: RippleProfile;
    rippleStage: 'none' | 'initial' | 'promotion' | 'steady';
    rippleBand: number;
    rippleStart: number;
    ripplePlayers: { player: RipplePlayer; phase: number; speed: number }[];
    hitShape: FlowerClickShape;
    width: number;
    height: number;
    anchorX: number;
    anchorY: number;
    x: number;
    y: number;
    phase: number;
    angle: number;
    band: number;
    displayedBand: number;
    visualBand: number;
    layerOrder: number;
    alpha: number;
    scale: number;
    lift: number;
    bornAt: number;
    entranceAt: number | null;
    promotion: PromotionMotion | null;
    floatResume: number;
};

function seedOf(text: string): number {
    let seed = 2166136261;
    for (let i = 0; i < text.length; i++) seed = Math.imul(seed ^ text.charCodeAt(i), 16777619);
    return seed >>> 0;
}
function randomGenerator(seed: number): () => number {
    return () => {
        seed += 0x6D2B79F5;
        let value = seed;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
}
function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }

/**
 * Layered flower view only. Rules, accepted selections, pause state, and flight
 * animations remain owned by FlowerGame. Call take only after rules accept a move.
 */
export class FlowerPoolView {
    readonly root: Node;
    private readonly nodes = new Map<string, Node>();
    private readonly entries = new Map<string, PoolEntry>();
    private readonly loadedFrames = new Map<string, SpriteFrame>();
    private readonly pendingReveals = new Map<string, { promise: Promise<Node | null>; allowCollected: boolean }>();
    private readonly takenIds = new Set<string>();
    private shapes: FlowerClickShapes = {};
    private ripples!: RippleData;
    private motion!: MotionData;
    private ordered: PoolEntry[] = [];
    private clock = 0;
    private disposed = false;
    private shuffleCount = 0;
    private entranceStarted = false;
    private entranceUntil = 0;
    private scatterTargets = new Map<PoolEntry, ScatterTarget>();
    private readonly framePosition: Point = { x: 0, y: 0 };
    private readonly surfaceCount: number;
    private readonly firstLevel: boolean;
    private readonly configuredLayers: boolean;
    private readonly layerMaxCounts: number[];
    private nextLayerOrder = 0;
    private nextAutoPromotion = 0;
    private motionRandom = randomGenerator(seedOf('flower-pool-motion'));
    private surfaceListener: ((flower: FlowerPiece) => void) | null = null;
    private readonly touchStart = () => {};
    private readonly touchEnd = (event: EventTouch) => {
        if (this.disposed) return;
        const point = event.getUILocation();
        const world = new Vec3(point.x, point.y, 0);
        const candidates = this.ordered.filter(entry => entry.band < 3 && entry.node.isValid && entry.node.activeInHierarchy
            && Number.isFinite(entry.node.scale.x) && Number.isFinite(entry.node.scale.y)
            && Math.abs(entry.node.scale.x) > 1e-6 && Math.abs(entry.node.scale.y) > 1e-6
            && entry.flower.status === 'pool').sort((a, b) => b.node.getSiblingIndex() - a.node.getSiblingIndex());
        for (const entry of candidates) {
            const local = entry.node.getComponent(UITransform)!.convertToNodeSpaceAR(world);
            if (!Number.isFinite(local.x) || !Number.isFinite(local.y)) continue;
            const art = entry.image.node.getComponent(UITransform)!;
            // Butterfly wing flapping changes the image's X scale, not its fixed
            // original bubble collider. The entry transform supplies pool scale/rotation.
            const normalized = { x: (local.x - entry.image.node.position.x) / art.width,
                y: (local.y - entry.image.node.position.y) / art.height };
            if (!flowerShapeContains(entry.hitShape, normalized)) continue;
            this.onSelect(entry.flower.id);
            return;
        }
    };

    private constructor(parent: Node, private readonly level: number, private readonly onSelect: (id: string) => void, count: number, layerMaxCounts?: number[]) {
        this.root = uiNode(parent, 'FlowerPool');
        // Limit the listener to the water, so it cannot intercept the older
        // order-slot buttons above it. HUD and modal siblings remain in front.
        const transform = this.root.getComponent(UITransform)!;
        transform.setContentSize(RIGHT - LEFT, TOP - BOTTOM);
        transform.setAnchorPoint(-LEFT / (RIGHT - LEFT), -BOTTOM / (TOP - BOTTOM));
        this.root.on(Node.EventType.TOUCH_START, this.touchStart);
        this.root.on(Node.EventType.TOUCH_END, this.touchEnd);
        this.firstLevel = level === 1 && count <= 9;
        this.surfaceCount = this.firstLevel ? count : SURFACE_COUNT;
        this.configuredLayers = !!layerMaxCounts && layerMaxCounts.length === 4;
        this.layerMaxCounts = this.configuredLayers
            ? layerMaxCounts!.map(count => Math.max(0, Math.floor(count)))
            : [this.surfaceCount, PREVIEW_COUNT, PREVIEW_COUNT, 0];
    }

    get nodeMap(): ReadonlyMap<string, Node> { return this.nodes; }
    setSurfaceListener(listener: ((flower: FlowerPiece) => void) | null): void { this.surfaceListener = listener; }
    get entering(): boolean { return !this.disposed && this.clock < this.entranceUntil; }
    get visibleIds(): readonly string[] {
        const ids: string[] = [];
        for (const layer of [0, 1, 2]) ids.push(...this.inLayer(layer).map(entry => entry.flower.id));
        return ids;
    }
    get layerCounts(): readonly number[] { return [0, 1, 2, 3].map(layer => this.inLayer(layer).length); }

    /** Original SpawnFlower: 3–4 pieces per .05s batch, four layers round-robin. */
    playEntrance(): number {
        if (this.disposed) return 0;
        if (this.entranceStarted) return Math.max(0, this.entranceUntil - this.clock);
        this.entranceStarted = true;
        const layers = [0, 1, 2, 3].map(layer => this.inLayer(layer));
        const cursors = [0, 0, 0, 0];
        const random = randomGenerator(seedOf(`flower-pool:${this.level}:entrance`));
        const settings = this.motion.spawn;
        let remaining = this.ordered.length, batch = 0;
        while (remaining > 0) {
            const count = settings.batchSizeMinInclusive + Math.floor(random() *
                (settings.batchSizeMaxExclusive - settings.batchSizeMinInclusive));
            let layer = Math.floor(random() * 4);
            for (let i = 0; i < count && remaining; i++) {
                while (cursors[layer] === layers[layer].length) layer = (layer + 1) % 4;
                const entry = layers[layer][cursors[layer]++];
                entry.bornAt = this.clock + batch * settings.batchInterval;
                entry.entranceAt = entry.band < 3 ? entry.bornAt : null;
                entry.node.active = entry.band < 3 && batch === 0;
                entry.scale = entry.band < 3 ? 0 : LAYER_SCALE[3];
                entry.node.setScale(entry.scale, entry.scale, 1);
                this.startRipple(entry, true, entry.entranceAt ?? this.clock);
                layer = (layer + 1) % 4;
                remaining--;
            }
            batch++;
        }
        // SpawnFlower also yields the last batch interval before finalWait.
        const duration = batch ? batch * settings.batchInterval + settings.finalWait : 0;
        this.entranceUntil = this.clock + duration;
        return duration;
    }

    static async create(parent: Node, flowers: FlowerPiece[], level: number, onSelect: (id: string) => void, layerMaxCounts?: number[]): Promise<FlowerPoolView> {
        const available = flowers.filter(flower => flower.status === 'pool');
        if (new Set(available.map(flower => flower.id)).size !== available.length) throw new Error('Pool flower IDs must be unique.');
        const pool = new FlowerPoolView(parent, level, onSelect, available.length, layerMaxCounts);
        try {
            const paths = Array.from(new Set(available.map(flower => pool.path(flower))));
            if (available.some(flower => flower.specialId)) paths.push('original/butterfly/qipao');
            const [loaded, shapes, ripples, motion] = await Promise.all([
                Promise.all(paths.map(async path => [path, await loadFrame(path)] as const)), loadClickShapes(), loadRippleData(), loadMotionData(),
            ]);
            if (!parent.isValid) throw new Error('The flower pool parent was destroyed while loading.');
            const frames = new Map<string, SpriteFrame>(loaded);
            pool.shapes = shapes;
            pool.ripples = ripples;
            pool.motion = motion;
            pool.motionRandom = randomGenerator(seedOf(`flower-pool:${level}:motion`));
            pool.scheduleAutoPromotion();
            for (const [path, frame] of frames) pool.loadedFrames.set(path, frame);
            await Promise.all(Object.keys(ripples.sprites).map(async path => pool.loadedFrames.set(path, await loadFrame(path))));
            if (!parent.isValid) throw new Error('The flower pool parent was destroyed while loading water frames.');
            const random = randomGenerator(seedOf(`flower-pool:${level}`));
            // Configured levels already contain the original sparse order sequence,
            // layer assignment and butterfly insertions. Never regroup those flowers.
            const positionsByKind = new Map<string, number>();
            for (const flower of available) {
                const frame = frames.get(pool.path(flower))!;
                const entry = pool.makeEntry(flower, frame, random, frames.get('original/butterfly/qipao'));
                const kindIndex = positionsByKind.get(flower.kind) ?? 0;
                positionsByKind.set(flower.kind, kindIndex + 1);
                const observed = pool.firstLevel ? pool.firstPosition(flower.kind, kindIndex) : null;
                entry.band = pool.configuredLayers ? flower.initialLayer
                    : pool.ordered.length < pool.surfaceCount ? 0
                    : pool.ordered.length < pool.surfaceCount + PREVIEW_COUNT ? 1
                    : pool.ordered.length < pool.surfaceCount + PREVIEW_COUNT * 2 ? 2 : 3;
                entry.layerOrder = pool.nextLayerOrder++;
                const nearby = pool.inLayer(entry.band);
                const position = observed ?? pool.choosePosition(entry, nearby, random);
                const bounded = pool.limit(entry, position.x, position.y, entry.angle);
                entry.x = entry.anchorX = bounded.x;
                entry.y = entry.anchorY = bounded.y;
                entry.node.setPosition(entry.x, entry.y);
                pool.ordered.push(entry);
                pool.entries.set(flower.id, entry);
                pool.nodes.set(flower.id, entry.node);
            }
            pool.refreshBands(true);
            return pool;
        } catch (error) {
            pool.dispose();
            throw error;
        }
    }

    /** Warm the original shapes, motion tracks and frames without creating nodes. */
    static async preload(flowers: readonly FlowerPiece[]): Promise<void> {
        const [ripples] = await Promise.all([loadRippleData(), loadClickShapes(), loadMotionData()]);
        const paths = new Set(flowers.map(flower => flowerSpritePath(flower.kind, flower.variant)));
        if (flowers.some(flower => flower.specialId)) paths.add('original/butterfly/qipao');
        for (const path of Object.keys(ripples.sprites)) paths.add(path);
        await Promise.all(Array.from(paths).map(path => loadFrame(path)));
    }

    private path(flower: FlowerPiece): string { return flowerSpritePath(flower.kind, flower.variant); }

    private frame(path: string): Promise<SpriteFrame> {
        const cached = this.loadedFrames.get(path);
        if (cached) return Promise.resolve(cached);
        return loadFrame(path).then(frame => {
            if (!this.disposed) this.loadedFrames.set(path, frame);
            return frame;
        });
    }

    /** Add a released difficulty flower to Bottom without rebuilding the board. */
    async reveal(flower: FlowerPiece): Promise<Node | null> {
        if (this.disposed || !this.root.isValid || this.takenIds.has(flower.id)) return null;
        const existing = this.nodes.get(flower.id);
        if (existing) return existing;
        if (flower.status !== 'pool' && flower.status !== 'collected') return null;
        const inFlight = this.pendingReveals.get(flower.id);
        if (inFlight) {
            // A compose event list can reveal and collect the same piece before
            // its animation starts. Its explicit reveal must still create a node.
            if (flower.status === 'collected') inFlight.allowCollected = true;
            return inFlight.promise;
        }
        const pending: { promise: Promise<Node | null>; allowCollected: boolean } = {
            promise: Promise.resolve(null), allowCollected: flower.status === 'collected',
        };
        this.pendingReveals.set(flower.id, pending);
        pending.promise = this.spawnRevealed(flower, pending);
        try { return await pending.promise; }
        finally { if (this.pendingReveals.get(flower.id) === pending) this.pendingReveals.delete(flower.id); }
    }

    private async spawnRevealed(flower: FlowerPiece, pending: { allowCollected: boolean }): Promise<Node | null> {
        const [frame, bubble] = await Promise.all([
            this.frame(this.path(flower)),
            flower.specialId ? this.frame('original/butterfly/qipao') : Promise.resolve(undefined),
        ]);
        if (this.disposed || !this.root.isValid
            || (flower.status !== 'pool' && !(pending.allowCollected && flower.status === 'collected'))) return null;
        const existing = this.nodes.get(flower.id);
        if (existing) return existing;
        const random = randomGenerator(seedOf(`flower-pool:${this.level}:reveal:${flower.id}`));
        const entry = this.makeEntry(flower, frame, random, bubble);
        entry.band = 2; entry.displayedBand = 3;
        entry.layerOrder = this.nextLayerOrder++;
        const position = this.choosePosition(entry, this.inLayer(2), random);
        const bounded = this.limit(entry, position.x, position.y, entry.angle);
        entry.x = entry.anchorX = bounded.x; entry.y = entry.anchorY = bounded.y;
        entry.node.setPosition(entry.x, entry.y);
        this.ordered.push(entry);
        this.entries.set(flower.id, entry); this.nodes.set(flower.id, entry.node);
        this.refreshBands();
        // SpawnDiffFlower calls the same animated SpawnOneFlower path.
        entry.entranceAt = this.clock; entry.scale = 0; entry.alpha = LAYER_ALPHA[2];
        entry.opacity.opacity = entry.alpha; entry.node.setScale(0, 0, 1);
        return entry.node;
    }

    private firstPosition(kind: string, index: number): Point | null {
        const observed: Record<string, number[][]> = {
            cdy_lxq: [[730, 1320], [516, 1000], [257, 1068]],
            dy_zmj: [[730, 1080], [350, 1265], [608, 1500]],
            cdcs_jyc: [[544, 1244], [312, 1466], [858, 1409]],
        };
        const point = observed[kind]?.[index];
        return point ? { x: (point[0] - 526) * DESIGN_SCALE, y: (1023 - point[1]) * DESIGN_SCALE } : null;
    }

    private makeEntry(flower: FlowerPiece, frame: SpriteFrame, random: () => number, bubbleFrame?: SpriteFrame): PoolEntry {
        const original = frame.originalSize;
        if (!(original.width > 0 && original.height > 0)) throw new Error(`Invalid flower dimensions: ${flower.kind}`);
        const hitShape = this.shapes[this.path(flower)];
        if (!hitShape) throw new Error(`Missing original flower click shape: ${this.path(flower)}`);
        const width = flower.specialId ? 126 : original.width * FLOWER_PIXEL_SCALE;
        const height = flower.specialId ? 132 : original.height * FLOWER_PIXEL_SCALE;
        const node = uiNode(this.root, `Flower-${flower.id}`, 0, 0, width, height);
        const ripple = uiNode(node, 'Ripple', 0, 0, width, height);
        if (flower.specialId && bubbleFrame) {
            const bubble = uiNode(node, 'Bubble', 0, 0, width, height);
            const bubbleSprite = bubble.addComponent(Sprite);
            bubbleSprite.sizeMode = Sprite.SizeMode.CUSTOM; bubbleSprite.spriteFrame = bubbleFrame;
        } else random(); // Preserve layout seeds previously consumed by ripple geometry.
        const art = uiNode(node, 'FlowerImage', 0, 0,
            flower.specialId ? 87 : width, flower.specialId ? 118 : height);
        const image = art.addComponent(Sprite);
        // Unity SpriteRenderer opacity does not dim sibling water effects.
        const opacity = art.addComponent(UIOpacity);
        image.sizeMode = Sprite.SizeMode.CUSTOM;
        image.spriteFrame = frame;
        const angle = flower.kind === 'cdcs_jyc' ? [-12, -48, 18][flower.variant - 1] : (random() - 0.5) * 24;
        const entry: PoolEntry = {
            flower, node, image, opacity, ripple, hitShape,
            rippleProfile: this.ripples.prefabs[this.path(flower)], rippleStage: 'none', rippleBand: 3, rippleStart: 0, ripplePlayers: [],
            width, height, anchorX: 0, anchorY: 0, x: 0, y: 0,
            phase: random() * Math.PI * 2, angle, band: 0, displayedBand: -1, visualBand: 0, layerOrder: 0, alpha: 0, scale: 1, lift: 0,
            bornAt: this.clock, entranceAt: null, promotion: null, floatResume: -Infinity,
        };
        node.angle = angle;
        return entry;
    }

    private releaseRipple(entry: PoolEntry): void {
        for (const instance of entry.ripplePlayers) instance.player.dispose();
        entry.ripplePlayers = [];
        entry.ripple.active = false;
        entry.rippleStage = 'none';
    }

    private startRipple(entry: PoolEntry, initial: boolean, at = this.clock): void {
        this.releaseRipple(entry);
        entry.rippleBand = entry.visualBand;
        if (entry.rippleBand >= 2 || !entry.rippleProfile) return;
        entry.rippleStart = at;
        if (initial) {
            const range = entry.rippleProfile.initialDelayRange;
            const random = randomGenerator(seedOf(`flower-water:${entry.flower.id}:delay`));
            entry.rippleStart += range[0] + random() * (range[1] - range[0]);
            entry.rippleStage = 'initial';
        } else entry.rippleStage = entry.rippleBand === 0 && entry.rippleProfile.promotion ? 'promotion' : 'steady';
    }

    private createRipplePlayers(entry: PoolEntry, promotion: boolean): void {
        const profile = entry.rippleProfile;
        const points = promotion ? (profile.promotion ? [profile.promotion] : [])
            : entry.rippleBand === 0 ? profile.up : profile.middle ? [profile.middle] : [];
        const art = entry.image.node.getComponent(UITransform)!;
        const random = randomGenerator(seedOf(`flower-water:${entry.flower.id}:${promotion ? 'promotion' : entry.rippleBand}`));
        for (const point of points) {
            const player = new RipplePlayer(entry.ripple, point, art.width, art.height, this.ripples, this.loadedFrames);
            entry.ripplePlayers.push({ player, phase: promotion ? 0 : random() * player.clip.duration,
                speed: promotion ? profile.speeds.promotion : entry.rippleBand === 0 ? profile.speeds.up : profile.speeds.middle });
        }
        entry.ripple.active = entry.ripplePlayers.length > 0;
    }

    private updateRipple(entry: PoolEntry): void {
        if (entry.rippleStage === 'none' || this.clock < entry.rippleStart) return;
        if (entry.rippleStage === 'initial') entry.rippleStage = 'steady';
        if (!entry.ripplePlayers.length) this.createRipplePlayers(entry, entry.rippleStage === 'promotion');
        if (entry.rippleStage === 'promotion') {
            const duration = entry.ripplePlayers.length
                ? entry.ripplePlayers[0].player.clip.duration / Math.max(0.001, entry.ripplePlayers[0].speed)
                : entry.rippleProfile.promotionFallbackDuration;
            if (this.clock - entry.rippleStart >= duration) {
                const start = entry.rippleStart + duration;
                this.releaseRipple(entry);
                entry.rippleStart = start; entry.rippleStage = 'steady';
                this.createRipplePlayers(entry, false);
            }
        }
        for (const instance of entry.ripplePlayers) instance.player.sample(
            (this.clock - entry.rippleStart) * instance.speed + instance.phase);
    }

    private limit(entry: PoolEntry, x: number, y: number, angle: number, out: Point = { x: 0, y: 0 }): Point {
        const radians = angle * Math.PI / 180;
        const cosine = Math.abs(Math.cos(radians)), sine = Math.abs(Math.sin(radians));
        const halfWidth = (cosine * entry.width + sine * entry.height) / 2 + 12;
        const halfHeight = (sine * entry.width + cosine * entry.height) / 2 + 12;
        out.x = clamp(x, LEFT + halfWidth, RIGHT - halfWidth);
        out.y = clamp(y, BOTTOM + halfHeight, TOP - halfHeight);
        return out;
    }

    /** Best-candidate sampling makes each layer irregular but evenly spread. */
    private choosePosition(entry: PoolEntry, existing: PoolEntry[], random: () => number): Point {
        let best: Point = { x: 0, y: -195 }, bestScore = -Infinity;
        const foreground = this.ordered.filter(other => other !== entry && other.band < entry.band && other.band < 3);
        for (let trial = 0; trial < 48; trial++) {
            const candidate = this.limit(entry, LEFT + random() * (RIGHT - LEFT), BOTTOM + random() * (TOP - BOTTOM), entry.angle);
            let score = Infinity;
            for (const other of existing) {
                const dx = candidate.x - other.anchorX, dy = candidate.y - other.anchorY;
                const radius = (Math.min(entry.width, entry.height) + Math.min(other.width, other.height)) * 0.5;
                score = Math.min(score, (dx * dx + dy * dy) / (radius * radius));
            }
            // Place submerged flowers in visible gaps as well as spacing them
            // within their own layer. A softer radius still permits depth overlap.
            for (const other of foreground) {
                const dx = candidate.x - other.anchorX, dy = candidate.y - other.anchorY;
                const radius = (Math.min(entry.width, entry.height) + Math.min(other.width, other.height)) * 0.3;
                score = Math.min(score, (dx * dx + dy * dy) / (radius * radius));
            }
            // Tie-breaking is also seeded, including an empty layer's first point.
            if (!existing.length && !foreground.length) score = random();
            if (score > bestScore) { bestScore = score; best = candidate; }
        }
        return best;
    }

    private refreshBands(initial = false): void {
        for (const entry of this.ordered) {
            const band = entry.band;
            const previous = entry.displayedBand;
            entry.displayedBand = band;
            if (!entry.promotion) entry.visualBand = band;
            entry.node.active = band < 3 && (entry.entranceAt === null || this.clock >= entry.entranceAt)
                && (!entry.promotion || entry.promotion.sourceBand !== 3 || this.clock >= entry.promotion.start);
            entry.image.grayscale = entry.visualBand !== 0;
            entry.image.color = entry.visualBand === 0 ? WHITE : UNDERWATER;
            if (initial || (previous !== band && !entry.promotion)) this.startRipple(entry, initial);
            if (initial) {
                entry.alpha = LAYER_ALPHA[band];
                entry.scale = LAYER_SCALE[band];
            } else if (!entry.promotion && band < 3 && previous === 3) {
                entry.alpha = 0; entry.scale = 0.7;
            }
            entry.opacity.opacity = entry.alpha;
            entry.node.setScale(entry.scale, entry.scale, 1);
        }
        // Render all three active layers; Down remains inactive. Do not truncate
        // an initial layer when butterfly insertion takes it over its refill cap.
        let sibling = 0;
        for (const layer of [3, 2, 1, 0]) {
            for (const entry of this.inLayer(layer).reverse()) entry.node.setSiblingIndex(sibling++);
        }
    }

    take(id: string): Node | null {
        if (this.disposed) return null;
        const entry = this.entries.get(id);
        if (!entry) return null;
        const removedLayer = entry.band;
        const index = this.ordered.indexOf(entry);
        this.ordered.splice(index, 1);
        this.entries.delete(id); this.nodes.delete(id);
        this.scatterTargets.delete(entry);
        this.takenIds.add(id);
        Tween.stopAllByTarget(entry.node);
        // Tools can take a flower directly from an inactive deep layer.
        entry.node.active = true;
        entry.image.grayscale = false; entry.image.color = WHITE;
        entry.opacity.opacity = 255; entry.node.setScale(1, 1, 1);
        this.releaseRipple(entry);
        const bubble = entry.node.getChildByName('Bubble'); if (bubble) bubble.active = false;
        this.refillVacancy(removedLayer, { x: entry.anchorX, y: entry.anchorY });
        this.refreshBands();
        // Keep ownership and coordinates stable for the caller's flight tween.
        entry.node.setSiblingIndex(this.root.children.length - 1);
        return entry.node;
    }

    private inLayer(layer: number): PoolEntry[] {
        return this.ordered.filter(entry => entry.band === layer).sort((a, b) => a.layerOrder - b.layerOrder);
    }

    private canReceive(layer: number): boolean {
        return layer === 3 || (this.layerMaxCounts[layer] > 0 && this.inLayer(layer).length < this.layerMaxCounts[layer]);
    }

    private firstAvailable(layer: number): PoolEntry | undefined {
        return this.inLayer(layer).find(entry => entry.flower.status === 'pool' && this.clock >= entry.bornAt);
    }

    private nearestAvailable(layer: number, point: Point): PoolEntry | undefined {
        let nearest: PoolEntry | undefined, distance = NEAR_RADIUS * NEAR_RADIUS;
        for (const entry of this.inLayer(layer)) {
            // Original flowers join the manager only when their batch spawns.
            // Down is inactive even after birth, so active alone cannot tell.
            if (entry.flower.status !== 'pool' || this.clock < entry.bornAt) continue;
            const dx = entry.anchorX - point.x, dy = entry.anchorY - point.y;
            const nextDistance = dx * dx + dy * dy;
            if (nextDistance <= distance) { nearest = entry; distance = nextDistance; }
        }
        return nearest;
    }

    private moveToLayer(entry: PoolEntry, layer: number, point?: Point, animate = false): void {
        const from = entry.band;
        entry.band = layer;
        // Unity re-registers a promoted object at the end of its new layer list.
        entry.layerOrder = this.nextLayerOrder++;
        if (point) {
            const target = this.limit(entry, point.x, point.y, entry.angle);
            entry.anchorX = target.x; entry.anchorY = target.y;
        }
        entry.promotion = animate && from !== layer ? this.promotionMotion(entry, from) : null;
        if (layer === 0) this.nudgeNeighbors(entry);
    }

    private promotionMotion(entry: PoolEntry, from: number): PromotionMotion {
        const settings = this.motion.flowerManager.values;
        let delay = 0, duration = settings.middleToUpDuration;
        let overshoot = settings.middleToUpOvershoot, rotation = settings.middleToUpRotateAngle, switchProgress = 0.58;
        if (from === 2 && entry.band === 0) {
            delay = settings.bottomToUpDelay; duration = settings.bottomToUpDuration;
            overshoot = settings.bottomToUpOvershoot; rotation = settings.bottomToUpRotateAngle;
            switchProgress = settings.bottomToUpDepthSwitchProgress;
        } else if (from === 3 && entry.band === 0) {
            delay = settings.downToUpDelay; duration = settings.downToUpDuration;
            overshoot = settings.downToUpOvershoot; rotation = settings.downToUpRotateAngle; switchProgress = 0.52;
        } else if (entry.band === 1 && from === 3) {
            delay = 0.04; duration = 0.38; overshoot = 1.035; rotation = 8; switchProgress = 0.5;
        } else if (entry.band === 1) {
            // Original Bottom→Middle wrapper passes these constants to the
            // common depth transition; it does not reuse Bottom→Up duration.
            delay = 0.03; duration = 0.6; overshoot = 1.025; rotation = 6; switchProgress = 0.5;
        } else if (entry.band === 2) {
            delay = settings.downToBottomDelay; duration = settings.downToBottomDuration;
            overshoot = 1; rotation = 0; switchProgress = 0.35;
        }
        const random = randomGenerator(seedOf(`flower-promote:${entry.flower.id}:${entry.layerOrder}`));
        return { start: this.clock + settings.vacancyStartDelay + delay, duration, sourceBand: from,
            switchProgress, switched: false, fromX: entry.x, fromY: entry.y, fromScale: entry.scale,
            fromAlpha: entry.alpha, fromAngle: entry.angle, toAngle: entry.angle + (random() * 2 - 1) * rotation, overshoot };
    }

    private updatePromotion(entry: PoolEntry): number | null {
        const motion = entry.promotion; if (!motion) return null;
        const progress = clamp((this.clock - motion.start) / motion.duration, 0, 1);
        entry.node.active = motion.sourceBand !== 3 || this.clock >= motion.start;
        const movement = 1 - Math.pow(1 - progress, 3);
        entry.x = motion.fromX + (entry.anchorX - motion.fromX) * movement;
        entry.y = motion.fromY + (entry.anchorY - motion.fromY) * movement;
        const targetScale = LAYER_SCALE[entry.band], peak = targetScale * motion.overshoot;
        if (progress < 0.76) entry.scale = motion.fromScale + (peak - motion.fromScale) * (1 - Math.pow(1 - progress / 0.76, 3));
        else entry.scale = peak + (targetScale - peak) * (1 - Math.pow(1 - (progress - 0.76) / 0.24, 2));
        const angle = motion.fromAngle + (motion.toAngle - motion.fromAngle) * (1 - Math.pow(1 - progress, 2));
        if (!motion.switched && progress >= motion.switchProgress) {
            motion.switched = true; entry.visualBand = entry.band;
            entry.image.grayscale = entry.band !== 0; entry.image.color = entry.band === 0 ? WHITE : UNDERWATER;
            this.startRipple(entry, false, motion.start + motion.duration * motion.switchProgress);
            if (entry.band === 0) this.surfaceListener?.(entry.flower);
        }
        const alphaProgress = clamp((progress - motion.switchProgress) / (1 - motion.switchProgress), 0, 1);
        entry.alpha = motion.fromAlpha + (LAYER_ALPHA[entry.band] - motion.fromAlpha) * (1 - Math.pow(1 - alphaProgress, 3));
        if (progress === 1) {
            entry.angle = motion.toAngle; entry.floatResume = motion.start + motion.duration;
            entry.promotion = null;
        }
        return angle;
    }

    private refillVacancy(layer: number, point: Point): void {
        if (layer === 3 || !this.canReceive(layer)) return;
        let candidate: PoolEntry | undefined;
        if (layer === 0) {
            candidate = this.nearestAvailable(1, point) ?? this.nearestAvailable(2, point)
                ?? this.firstAvailable(1) ?? this.firstAvailable(2) ?? this.firstAvailable(3);
        } else if (layer === 1) {
            candidate = this.nearestAvailable(2, point) ?? this.firstAvailable(2) ?? this.firstAvailable(3);
        } else candidate = this.firstAvailable(3);
        if (!candidate) return;
        const from = candidate.band;
        const sourcePosition = { x: candidate.anchorX, y: candidate.anchorY };
        this.moveToLayer(candidate, layer, point, true);
        this.refillVacancy(from, sourcePosition);
    }

    private nudgeNeighbors(rising: PoolEntry): void {
        for (const entry of this.inLayer(0)) {
            if (entry === rising) continue;
            let dx = entry.anchorX - rising.anchorX, dy = entry.anchorY - rising.anchorY;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length >= 190) continue;
            if (length < 0.01) { dx = Math.cos(entry.phase); dy = Math.sin(entry.phase); }
            const divisor = Math.max(1, length);
            const push = (1 - length / 190) * 20;
            const position = this.limit(entry, entry.anchorX + dx / divisor * push, entry.anchorY + dy / divisor * push, entry.angle);
            entry.anchorX = position.x; entry.anchorY = position.y;
        }
    }

    private scheduleAutoPromotion(): void {
        const settings = this.motion.flowerManager.values;
        this.nextAutoPromotion = this.clock + settings.autoPromoteIntervalMin
            + this.motionRandom() * (settings.autoPromoteIntervalMax - settings.autoPromoteIntervalMin);
    }

    private promoteIdleFlowers(): void {
        if (this.entering || this.firstLevel || this.scatterTargets.size) return;
        const available = (layer: number) => this.inLayer(layer).find(entry =>
            entry.flower.status === 'pool' && !entry.promotion && entry.entranceAt === null && this.clock >= entry.bornAt);
        // Delayed difficulty flowers can arrive after the last surface flower
        // was removed. Fill that vacancy without requiring another click.
        if (this.canReceive(0)) {
            const entry = available(1) ?? available(2) ?? available(3);
            if (entry) {
                const from = entry.band, point = { x: entry.anchorX, y: entry.anchorY };
                this.moveToLayer(entry, 0, point, true);
                this.refillVacancy(from, point); this.refreshBands();
            }
        }
        if (this.clock < this.nextAutoPromotion) return;
        this.scheduleAutoPromotion();
        const settings = this.motion.flowerManager.values;
        if (this.inLayer(0).length >= this.layerMaxCounts[0] + settings.middleAutoUpExtraLimit
            || this.motionRandom() >= settings.autoPromoteChance) return;
        const entry = available(1) ?? available(2);
        if (!entry) return;
        const from = entry.band, point = { x: entry.anchorX, y: entry.anchorY };
        this.moveToLayer(entry, 0, point, true);
        this.refillVacancy(from, point); this.refreshBands();
    }

    update(dt: number): void {
        if (this.disposed || !Number.isFinite(dt) || dt <= 0) return;
        const previousTime = this.clock;
        this.clock += dt;
        // Exponential response remains stable for long frames; clamping dt
        // slowed the entire pool clock below 20 fps.
        const blend = 1 - Math.exp(-dt * MOTION_RESPONSE);
        for (const entry of this.ordered) {
            if (entry.band === 3 || !entry.node.isValid) continue;
            const appearing = entry.entranceAt !== null;
            if (appearing) {
                if (this.clock < entry.entranceAt!) { entry.node.active = false; continue; }
                entry.node.active = true;
                const progress = clamp((this.clock - entry.entranceAt!) / this.motion.spawn.visibleScaleIn.duration, 0, 1);
                entry.scale = LAYER_SCALE[entry.band] * (1 - Math.pow(1 - progress, 3));
                if (progress === 1) entry.entranceAt = null;
            }
            const hadPromotion = !!entry.promotion;
            const promotionAngle = this.updatePromotion(entry);
            const top = entry.visualBand === 0;
            const driftWeight = entry.promotion ? 0 : clamp((this.clock - entry.floatResume) / 0.2, 0, 1);
            const amplitude = (top ? 8 : 4) * driftWeight;
            const speed = 0.75 + (Math.sin(entry.phase * 2.3) + 1) * 0.3;
            const scatter = this.scatterTargets.get(entry);
            let positionBlend = blend;
            if (scatter && scatter.at <= this.clock) {
                // A frame can span the exact release time. Integrate gathering
                // and scattering separately so low fps neither skips a batch
                // nor gives its flowers an extra frame of travel.
                const before = clamp(scatter.at - previousTime, 0, dt);
                const gatherBlend = 1 - Math.exp(-before * MOTION_RESPONSE);
                entry.x += (entry.anchorX - entry.x) * gatherBlend;
                entry.y += (entry.anchorY - entry.y) * gatherBlend;
                entry.anchorX = scatter.x; entry.anchorY = scatter.y;
                positionBlend = 1 - Math.exp(-(dt - before) * MOTION_RESPONSE);
                this.scatterTargets.delete(entry);
            }
            if (!hadPromotion) {
                entry.x += (entry.anchorX - entry.x) * positionBlend;
                entry.y += (entry.anchorY - entry.y) * positionBlend;
                entry.alpha += (LAYER_ALPHA[entry.band] - entry.alpha) * blend;
                if (!appearing) entry.scale += (LAYER_SCALE[entry.band] - entry.scale) * blend;
            }
            entry.lift *= 1 - blend;
            const angle = entry.promotion ? promotionAngle! : entry.angle + Math.sin(this.clock * 0.65 * speed + entry.phase) * (top ? 4.5 : 2.5) * driftWeight;
            const position = this.limit(entry,
                entry.x + Math.sin(this.clock * 0.7 * speed + entry.phase) * amplitude,
                entry.y + Math.cos(this.clock * 0.85 * speed + entry.phase) * amplitude + entry.lift, angle, this.framePosition);
            entry.node.setPosition(position.x, position.y);
            entry.node.angle = angle;
            entry.node.setScale(entry.scale, entry.scale, 1);
            entry.opacity.opacity = Math.round(entry.alpha);
            this.updateRipple(entry);
            if (entry.flower.specialId) {
                entry.image.node.setScale(0.78 + 0.20 * Math.sin(this.clock * 6 + entry.phase), 1, 1);
            }
        }
        this.promoteIdleFlowers();
    }

    /** Returns seconds until the final batch has settled; the caller owns busy state. */
    shuffle(need?: {kind: string; count: number}): number {
        if (this.disposed || this.entering || this.ordered.length < 2) return 0;
        const random = randomGenerator(seedOf(`flower-pool:${this.level}:shuffle:${++this.shuffleCount}`));
        // The original fan cancels promotions before it gathers the flowers.
        for (const entry of this.ordered) {
            if (!entry.promotion) continue;
            entry.promotion = null; entry.visualBand = entry.band; entry.angle = entry.node.angle;
            this.startRipple(entry, false);
        }
        // Original fan promotes missing flowers for the first current group
        // from deeper layers before gathering and redistributing the surface.
        if (need) {
            let missing = Math.max(0, need.count - this.inLayer(0).filter(entry => entry.flower.kind === need.kind).length);
            for (const layer of [1, 2, 3]) {
                for (const entry of this.inLayer(layer).reverse()) {
                    if (!missing) break;
                    if (entry.flower.specialId || entry.flower.kind !== need.kind || entry.flower.status !== 'pool') continue;
                    if (!this.canReceive(0)) {
                        // Preserve all currently exposed targets. Exchange an
                        // unrelated flower so a promotion cannot push a target out.
                        const displaced = this.inLayer(0).reverse().find(candidate => candidate.flower.kind !== need.kind);
                        if (!displaced) continue;
                        this.moveToLayer(displaced, layer);
                    }
                    this.moveToLayer(entry, 0);
                    missing--;
                }
            }
        }
        this.scatterTargets.clear();
        for (const layer of [0, 1, 2]) {
            const placed: PoolEntry[] = [];
            for (const entry of this.inLayer(layer)) {
                const position = this.choosePosition(entry, placed, random);
                this.scatterTargets.set(entry, { x: position.x, y: position.y, at: 0 });
                placed.push({ ...entry, anchorX: position.x, anchorY: position.y });
            }
        }
        let remainingInBatch = 0, scatterOffset = SHUFFLE_GATHER_TIME;
        let scheduled = 0;
        for (const [entry, target] of this.scatterTargets) {
            if (!remainingInBatch) {
                if (scheduled) scatterOffset += SHUFFLE_BATCH_INTERVAL;
                remainingInBatch = 4 + Math.floor(random() * 3);
            }
            target.at = this.clock + scatterOffset;
            remainingInBatch--; scheduled++;
            entry.anchorX = Math.cos(entry.phase) * 30;
            entry.anchorY = -190 + Math.sin(entry.phase) * 30;
        }
        this.refreshBands();
        return scheduled ? scatterOffset + SHUFFLE_SETTLE_TIME : 0;
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.root.off(Node.EventType.TOUCH_START, this.touchStart);
        this.root.off(Node.EventType.TOUCH_END, this.touchEnd);
        for (const entry of this.entries.values()) {
            Tween.stopAllByTarget(entry.node);
        }
        this.entries.clear(); this.nodes.clear(); this.ordered = []; this.scatterTargets.clear();
        this.loadedFrames.clear(); this.pendingReveals.clear(); this.takenIds.clear();
        this.surfaceListener = null;
        if (this.root.isValid) this.root.destroy();
    }
}
