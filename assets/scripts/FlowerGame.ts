import { loadFlowerAsset } from './FlowerAssets';
import { _decorator, AudioClip, AudioSource, BlockInputEvents, Color, Component, game, Graphics, Label, Mask, Node, Sprite, SpriteFrame, sys, tween, Tween, UITransform, UIOpacity, Vec3 } from 'cc';
import { bindFlowerViewport, configureFlowerViewport } from './FlowerViewport';
import { vibrateFlowerTap } from './FlowerHaptics';
import { createHome, HOME_FRAME_PATHS } from './FlowerHome';
import { DEBUG } from 'cc/env';
import { FlowerRules, FlowerEvent, FlowerLevelConfig, FlowerOrder, FlowerPiece } from './FlowerRules';
import { FlowerLoadingView } from './FlowerLoading';
import { runStartupTasks } from './FlowerStartup';
import { FlowerCatalog, flowerSpritePath } from './FlowerCatalog';
import { FlowerBouquetView, preloadBouquets } from './FlowerBouquet';
import { ORIGINAL_POOL_GEOMETRY, FlowerPoolView } from './FlowerPool';
import { FlowerEffectHandle, FlowerEffects } from './FlowerEffects';
import { createWinResult, preloadWinResult } from './FlowerResults';
import { createPause, preloadPause } from './FlowerPause';
import { createFailure, preloadFailure } from './FlowerFailure';
import { createTimeContinue, preloadContinue } from './FlowerContinue';
import { rewardedVideo } from './FlowerRewardedVideo';
import { fade, fittedSprite, label, loadFrame, message, panel, preloadTypography, sprite, tap, uiNode } from './FlowerUI';
const { ccclass, property } = _decorator;
const A = 'original/';
const ORDER_X = [-280, -98, 87, 270];

/** Saved progress must always point at a board present in the shipped catalog. */
export function normalizePlayableLevel(value: number, available: Iterable<number>): number {
    // Creator release builds assume array spreads are arrays; catalog keys are an iterator.
    const levels = Array.from(available).filter(level => Number.isInteger(level) && level > 0).sort((a, b) => a - b);
    if (!levels.length) throw new Error('当前版本没有可用关卡');
    const requested = Number.isFinite(value) ? Math.floor(value) : levels[0];
    let selected = levels[0];
    for (const level of levels) { if (level > requested) break; selected = level; }
    return selected;
}

const LEVEL_FRAME_PATHS = ['background/background', 'background/poor', 'water/water', 'background/displaystand',
    'background/shadow', 'order/setting', 'order/time', 'order/star128', 'order/num_board', 'order/pb',
    'order/pb_full', 'order/flower icon', 'order/commonvase', 'order/ads', 'order/quest1', 'order/quest2',
    'order/quest3', 'order/new', 'order/plate', 'order/plate green_mask', 'order/tools bg', 'ui/itemicon/gold',
    'ui/game/guidehand', 'ui/game/lock', 'ui/itemicon/compose', 'ui/itemicon/shuffle', 'ui/itemicon/clear'].map(path => A + path);

/** Original FlowerCtr callback 44390: smooth travel, a 20% pick-up, then settle. */
export function flowerFlightPhase(progress: number): { travel: number; pickup: number; settle: number; rotation: number } {
    const t = Math.min(1, Math.max(0, progress));
    const smooth = (value: number) => value * value * (3 - 2 * value);
    const pickup = Math.min(1, t / 0.2), settle = Math.max(0, (t - 0.2) / 0.8);
    return { travel: smooth(t), pickup: 1 - Math.pow(1 - pickup, 3),
        settle: smooth(settle), rotation: t > 0.2 ? smooth(t) : 0 };
}

const cloneOrder = (order: FlowerOrder): FlowerOrder => ({ ...order, needs: order.needs.map(need => ({ ...need })) });

/** Presentation advances only when a flight lands; the rules may already be ahead. */
export class FlowerPresentationState {
    orders: (FlowerOrder | null)[];
    buffer: string[];
    collected: number;
    stars: number;
    readonly total: number;
    constructor(rules: FlowerRules) {
        this.orders = rules.orders.map(order => order ? cloneOrder(order) : null);
        this.buffer = [...rules.buffer];
        this.total = rules.normalFlowerCount;
        this.collected = Math.round(rules.progress * this.total);
        this.stars = rules.stars;
    }
    move(event: Extract<FlowerEvent, { type: 'move' }>, flower: FlowerPiece): void {
        if (event.from === 'buffer') this.buffer = this.buffer.filter(id => id !== event.flowerId);
        if (event.to === 'buffer') {
            if (!this.buffer[event.slot]) this.buffer[event.slot] = event.flowerId;
        } else if (event.to === 'order') {
            const order = this.orders[event.slot];
            if (!order || order.id !== event.orderId) throw new Error('Visual order does not match the arriving flower');
            const need = order.needs.find(item => item.filled < item.required);
            if (!need || need.kind !== flower.kind) throw new Error('Visual flower does not match the current group');
            need.filled++; order.filled++; this.collected++;
        }
    }
    complete(order: FlowerOrder, stars: number): void {
        this.orders[order.slot] = null;
        this.stars += stars;
    }
    add(order: FlowerOrder): void { this.orders[order.slot] = cloneOrder(order); }
    get percent(): number {
        if (!this.total) return 0;
        // Same f32 operation order as the original display curve in FlowerRules.
        const f = Math.fround, collected = f(this.collected), total = f(this.total), p = f(collected / total);
        const distance = f(f(0.95) - p), weighted = f(f(collected * f(1.7)) / total);
        return Math.floor(f(f(p + f(distance * f(weighted * f(1 - p)))) * 100));
    }
}

type OrderView = { root: Node; bouquet?: FlowerBouquetView; remaining?: Label; icon?: Sprite; request?: Sprite; newBadge?: Node; tip?: FlowerEffectHandle };

@ccclass('FlowerGame')
export class FlowerGame extends Component {
    @property([SpriteFrame])
    loadingFrames: SpriteFrame[] = [];
    private startupLoading: FlowerLoadingView | null = null;
    private startupRevision = 0;
    private preparedLevels = new Map<number, Promise<FlowerLevelConfig>>();
    private content!: Node;
    private rules: FlowerRules | null = null;
    private sceneMode: 'home' | 'game' = 'home';
    private paused = false;
    private busy = false;
    private collecting = false;
    private tapQueue: { id: string; events: FlowerEvent[]; stars: number }[] = [];
    private queuedTaps = new Set<string>();
    private earlyFlights = new Map<string, { node: Node; done: Promise<boolean> }>();
    private revision = 0;
    private clock = 0;
    private catalog: FlowerCatalog | null = null;
    private pool: FlowerPoolView | null = null;
    private orderEffects: FlowerEffects | null = null;
    private toolsRoot!: Node;
    private ordersRoot!: Node;
    private trayRoot!: Node;
    private flowerRoot!: Node;
    private belowWaterRoot!: Node;
    private hud!: Node;
    private topHud!: Node;
    private timer!: Label;
    private progressLabel!: Label;
    private score!: Label;
    private progressBar!: Node;
    private hand: Node | null = null;
    private handTarget: Node | null = null;
    private music!: AudioSource;
    private effects!: AudioSource;
    private effectsCache = new Map<string, AudioClip>();
    private water: Node | null = null;
    private finished = false;
    private ready = false;
    private visual: FlowerPresentationState | null = null;
    private orderViews = new Map<number, OrderView>();
    private trayCells: Node[] = [];
    private trayCapacity = 0;
    private progressTarget = -1;
    private pendingAnimations = new Set<() => void>();
    private nodeAnimations = new Map<Node, Set<() => void>>();
    private finishEntrance: (() => void) | null = null;
    private firstPlayFrame = false;

    async start() {
        configureFlowerViewport(this.node);
        this.music = this.node.addComponent(AudioSource);
        this.effects = this.node.addComponent(AudioSource);
        this.music.loop = true;
        this.music.volume = 0.38;
        game.on('flower-settings-changed', this.applyAudioSettings, this);
        game.on('flower-ui-sound', this.onUISound, this);
        try {
            const loading = await FlowerLoadingView.create(this.node, this.loadingFrames);
            if (!this.isValid) { loading.dispose(); return; }
            this.startupLoading = loading;
            await this.loadStartup();
        } catch (error) { console.error('[FlowerGame] startup screen', error); }
    }
    private async loadStartup(): Promise<void> {
        const attempt = ++this.startupRevision, loading = this.startupLoading;
        const current = () => this.isValid && attempt === this.startupRevision && this.startupLoading === loading;
        const previewLevel = DEBUG && sys.isBrowser ? Number(new URLSearchParams(window.location.search).get('previewLevel')) : 0;
        const previewingLevel = Number.isInteger(previewLevel) && previewLevel > 0;
        try {
            this.catalog ??= await FlowerCatalog.load();
            if (!current()) return;
            const level = normalizePlayableLevel(previewingLevel ? previewLevel : this.read('level', 1), this.catalog.levels.keys());
            if (!previewingLevel) this.write('level', level);
            const complete = await runStartupTasks([
                ...HOME_FRAME_PATHS.map(path => () => loadFrame(path)),
                () => preloadTypography(), () => this.preloadEffects(), () => this.prepareLevelAssets(level),
            ], (done, total) => loading?.setProgress(total ? done / total : 0), current,
            () => previewingLevel ? this.startLevel(level) : this.showHome());
            if (!complete || !current()) return;
            if (loading && !await loading.finish()) return;
            if (!current()) return;
            this.startupLoading = null;
            // Development-only entry for exercising the real time-out flow.
            if (DEBUG && sys.isBrowser && this.rules && new URLSearchParams(window.location.search).get('previewState') === 'win') {
                // Presentation-only preview: no wallet/progress/reward mutations.
                this.paused = true;
                await createWinResult(this.content,level,level === 2 ? 105 : 3,10,
                    () => { void this.startLevel(level + 1); });
            }
            if (DEBUG && sys.isBrowser && this.rules && new URLSearchParams(window.location.search).get('previewState') === 'time') {
                this.rules.tick(this.rules.remainingSeconds); this.updateHUD(); void this.endLevel();
            }
        } catch (error) {
            if (!current()) return;
            console.error('[FlowerGame] startup assets', error);
            loading?.setError(() => this.loadStartup());
        }
    }
    onDestroy() { this.startupRevision++; this.startupLoading?.dispose(); this.revision++; this.clearFlowerTaps(); this.cancelAnimations(); this.pool?.dispose(); this.orderEffects?.dispose(); this.music?.stop(); game.off('flower-settings-changed', this.applyAudioSettings, this); game.off('flower-ui-sound', this.onUISound, this); }
    private current(rev: number): boolean { return this.isValid && this.revision === rev; }
    private cancelAnimations(): void { for (const cancel of Array.from(this.pendingAnimations)) cancel(); this.pendingAnimations.clear(); }
    private cancelNodeAnimations(node: Node): void {
        for (const cancel of Array.from(this.nodeAnimations.get(node) ?? [])) cancel();
    }
    private animate(node: Node, duration: number, properties: Record<string, unknown>, easing = 'quadOut'): Promise<boolean> {
        const rev = this.revision;
        return new Promise(resolve => {
            let settled = false;
            const finish = (completed: boolean) => {
                if (settled) return; settled = true;
                this.pendingAnimations.delete(cancel); node.off(Node.EventType.NODE_DESTROYED, cancel);
                const callbacks = this.nodeAnimations.get(node);
                callbacks?.delete(cancel);
                if (!callbacks?.size) this.nodeAnimations.delete(node);
                resolve(completed && this.current(rev));
            };
            const cancel = () => { Tween.stopAllByTarget(node); finish(false); };
            this.pendingAnimations.add(cancel); node.on(Node.EventType.NODE_DESTROYED, cancel);
            if (!this.nodeAnimations.has(node)) this.nodeAnimations.set(node, new Set());
            this.nodeAnimations.get(node)!.add(cancel);
            tween(node).to(duration, properties, { easing: easing as 'quadOut' }).call(() => finish(true)).start();
        });
    }
    private waitFor(seconds: number): Promise<boolean> {
        const rev = this.revision;
        return new Promise(resolve => {
            let settled = false;
            const finish = () => { if (settled) return; settled = true; this.pendingAnimations.delete(cancel); resolve(this.current(rev)); };
            const cancel = () => { this.unschedule(finish); if (settled) return; settled = true; this.pendingAnimations.delete(cancel); resolve(false); };
            this.pendingAnimations.add(cancel); this.scheduleOnce(finish, seconds);
        });
    }
    private flyFlower(node: Node, destination: Vec3 | (() => Vec3), targetScale: Vec3, targetAngle: number): Promise<boolean> {
        const rev = this.revision;
        const from = new Vec3(node.position.x, node.position.y, node.position.z);
        const scale = new Vec3(node.scale.x, node.scale.y, node.scale.z);
        const angle = node.angle, turn = ((targetAngle - angle + 540) % 360) - 180;
        const phase = { progress: 0 };
        const apply = () => {
            if (!node.isValid || !this.current(rev)) return;
            const sample = flowerFlightPhase(phase.progress);
            const target = typeof destination === 'function' ? destination() : destination;
            const axis = (initial: number, target: number) => phase.progress <= 0.2
                ? initial * (1 + 0.25 * sample.pickup)
                : initial * 1.25 + (target - initial * 1.25) * sample.settle;
            node.setPosition(from.x + (target.x - from.x) * sample.travel,
                from.y + (target.y - from.y) * sample.travel, from.z);
            node.setScale(axis(scale.x, targetScale.x), axis(scale.y, targetScale.y), 1);
            node.angle = angle + turn * sample.rotation;
        };
        return new Promise(resolve => {
            let settled = false;
            const finish = (completed: boolean) => {
                if (settled) return;
                settled = true; this.pendingAnimations.delete(cancel);
                node.off(Node.EventType.NODE_DESTROYED, cancel);
                resolve(completed && this.current(rev));
            };
            const cancel = () => { Tween.stopAllByTarget(phase); finish(false); };
            this.pendingAnimations.add(cancel); node.on(Node.EventType.NODE_DESTROYED, cancel);
            // Original ctor44385 moveDuration=.58, pickedScaleRatio=1.25.
            tween(phase).to(0.58, { progress: 1 }, { easing: 'linear', onUpdate: apply })
                .call(() => { phase.progress = 1; apply(); finish(true); }).start();
        });
    }
    /** Resolve against the pool's animation clock, never a separate wall timer. */
    private waitForPoolEntrance(): Promise<boolean> {
        if (!this.pool?.entering) return Promise.resolve(true);
        const rev = this.revision;
        return new Promise(resolve => {
            let settled = false;
            const settle = (completed: boolean) => {
                if (settled) return;
                settled = true;
                if (this.finishEntrance === finish) this.finishEntrance = null;
                this.pendingAnimations.delete(cancel);
                resolve(completed && this.current(rev));
            };
            const finish = () => settle(true);
            const cancel = () => settle(false);
            this.finishEntrance = finish;
            this.pendingAnimations.add(cancel);
        });
    }
    private applyAudioSettings() {
        if (sys.localStorage.getItem('zdhjy.music') === 'off') this.music.stop();
        else if (this.music.clip && !this.music.playing) this.music.play();
    }
    private read(key: string, fallback: number) {
        const stored = sys.localStorage.getItem('zdhjy.' + key);
        // The WeChat adapter returns an empty string for a missing storage key.
        if (stored == null || stored === '') return fallback;
        const value = Number(stored);
        return Number.isFinite(value) ? value : fallback;
    }
    private write(key: string, value: number) { sys.localStorage.setItem('zdhjy.' + key, String(value)); }
    private clear(mode: 'home' | 'game') {
        this.revision++; this.sceneMode = mode; this.paused = false; this.busy = false; this.finished = false; this.ready = false;
        this.clearFlowerTaps(); this.collecting = false;
        this.cancelAnimations(); this.visual = null; this.orderViews.clear(); this.trayCells = []; this.trayCapacity = 0; this.progressTarget = -1;
        this.firstPlayFrame = false;
        this.pool?.dispose(); this.pool = null;
        this.orderEffects?.dispose(); this.orderEffects = null;
        this.rules = null; this.hand = null; this.handTarget = null; this.water = null;
        if (this.content) { this.content.removeFromParent(); this.content.destroy(); }
        this.content = uiNode(this.node, 'GameContent');
        this.content.addComponent(Mask).type = Mask.Type.GRAPHICS_RECT;
        const content = this.content;
        bindFlowerViewport(content, viewport => content.getComponent(UITransform)!.setContentSize(viewport.width, viewport.height));
        if (this.startupLoading?.root.isValid) this.startupLoading.root.setSiblingIndex(this.node.children.length - 1);
    }
    async showHome() {
        this.clear('home');
        this.busy = true;
        const rev = this.revision, content = this.content;
        await createHome(content, () => { if (this.current(rev) && this.ready && !this.busy) void this.startLevel(this.read('level', 1)); }, this.read('level', 1));
        if (!this.current(rev)) return;
        this.busy = false; this.ready = true;
        this.bgm('bgm_home');
    }
    private bgm(name: string) {
        const rev = this.revision;
        loadFlowerAsset(A + 'audio/' + name, AudioClip, (err, clip) => {
            if (err || !this.isValid || rev !== this.revision) return;
            this.music.stop(); this.music.clip = clip;
            if (sys.localStorage.getItem('zdhjy.music') !== 'off') this.music.play();
        });
    }
    private sound(name: string) {
        if (sys.localStorage.getItem('zdhjy.sound') === 'off') return;
        const cached = this.effectsCache.get(name);
        if (cached) { this.effects.playOneShot(cached, 0.7); return; }
        const rev = this.revision;
        loadFlowerAsset(A + 'audio/' + name, AudioClip, (err, clip) => {
            if (!err && this.current(rev) && sys.localStorage.getItem('zdhjy.sound') !== 'off') { this.effectsCache.set(name, clip); this.effects.playOneShot(clip, 0.7); }
        });
    }
    private onUISound(name?: string): void { if (name) this.sound(name); }
    private async preloadEffects(): Promise<void> {
        await Promise.all(['click', 'open', 'close', 'flowerstart', 'flowerhit', 'vasesuccss', 'flowerfuqi', 'level_new', 'level_checkceng', 'bgm_home', 'bgm_level'].map(name =>
            new Promise<void>((resolve, reject) => {
                loadFlowerAsset(A + 'audio/' + name, AudioClip, (error, clip) => {
                    if (error) { reject(error); return; }
                    this.effectsCache.set(name, clip); resolve();
                });
            })));
    }
    /** Prepare the exact board before exposing the homepage's Play button. */
    private prepareLevelAssets(level: number): Promise<FlowerLevelConfig> {
        const cached = this.preparedLevels.get(level);
        if (cached) return cached;
        const task = (async () => {
            this.catalog ??= await FlowerCatalog.load();
            const config = this.catalog.level(level);
            const flowers = new FlowerRules(config).flowers;
            await Promise.all([
                ...LEVEL_FRAME_PATHS.map(path => loadFrame(path)),
                FlowerPoolView.preload(flowers), preloadBouquets(config.orders?.map(order => order.vaseId)),
                FlowerEffects.preload(), preloadPause(), preloadFailure(), preloadContinue(), preloadWinResult(level),
            ]);
            return config;
        })().catch(error => { this.preparedLevels.delete(level); throw error; });
        this.preparedLevels.set(level, task);
        return task;
    }
    async startLevel(level = 1) {
        const entryStarted = Date.now();
        const previousRevision = this.revision;
        this.busy = true;
        let config: FlowerLevelConfig;
        try { config = await this.prepareLevelAssets(level); }
        catch (error) {
            if (!this.current(previousRevision)) return;
            this.busy = false;
            if (this.startupLoading) throw error;
            await message(this.content, '加载失败', '资源暂未准备好，请重试', '重试', () => { void this.startLevel(level); });
            return;
        }
        if (!this.current(previousRevision)) return;
        const buildStarted = Date.now();
        this.clear('game'); this.busy = true;
        const rev = this.revision;
        const content = this.content;
        const buildSprite = async (...args: Parameters<typeof sprite>): Promise<Node> => {
            if (!this.current(rev)) throw new Error('Level build was superseded');
            const node = await sprite(...args);
            if (!this.current(rev)) { node.destroy(); throw new Error('Level build was superseded'); }
            return node;
        };
        try {
            this.rules = new FlowerRules(config, this.read('coins', 0));
            this.visual = new FlowerPresentationState(this.rules);
            if (!this.current(rev)) return;
            const board = uiNode(content, 'LevelBoard');
            board.active = false;
            const shop = await buildSprite(board, 'FlowerShop', A + 'background/background', 0, 435, 750, 600);
            // Original view crops the room above the wooden display stand.
            const geometry = ORIGINAL_POOL_GEOMETRY;
            const pool = await buildSprite(board, 'WoodenPool', A + 'background/poor', 0, geometry.woodY, geometry.woodWidth, geometry.woodHeight);
            const frame = pool.getComponent(Sprite)!.spriteFrame!.clone();
            frame.insetLeft = 155; frame.insetRight = 155; frame.insetTop = 110; frame.insetBottom = 314;
            pool.getComponent(Sprite)!.spriteFrame = frame;
            pool.getComponent(Sprite)!.type = Sprite.Type.SLICED;
            pool.on(Node.EventType.NODE_DESTROYED, () => frame.destroy());
            this.belowWaterRoot=uiNode(board,'UnderwaterFlowers');
            const waterMask = uiNode(board, 'WaterSurface', 0, geometry.waterY, geometry.waterWidth, geometry.waterHeight);
            const mask = waterMask.addComponent(Mask); mask.type = Mask.Type.GRAPHICS_STENCIL;
            const shape = mask.subComp as Graphics; shape.clear(); shape.roundRect(-geometry.waterWidth / 2, -geometry.waterHeight / 2, geometry.waterWidth, geometry.waterHeight, 42); shape.fill();
            this.water = await buildSprite(waterMask, 'WaterCaustics', A + 'water/water', 0, 0, geometry.waterWidth, geometry.waterHeight);
            // Original WMat shader supplies alpha/color; no extra opacity tween.
            const stand = await buildSprite(board, 'DisplayStand', A + 'background/displaystand', 0, 338, 750, 72);
            const shadows = await buildSprite(board, 'OrderShadows', A + 'background/shadow', 0, 337, 705, 43);
            this.ordersRoot = uiNode(board, 'Orders');
            this.trayRoot = uiNode(board, 'TemporarySlots');
            this.flowerRoot = uiNode(board, 'FloatingFlowers');
            const orderEffects = await FlowerEffects.create(board);
            if (!this.current(rev)) { orderEffects.dispose(); return; }
            this.orderEffects = orderEffects;
            this.hud = uiNode(board, 'HUD');
            this.topHud = uiNode(this.hud, 'TopHUD');
            this.toolsRoot = uiNode(this.hud, 'Tools');
            // World artwork/anchors stay fixed as in CameraWidthAdapter. Only
            // edge HUD and room backdrop adapt; viewport size never changes density.
            bindFlowerViewport(board, viewport => {
                if (!this.current(rev)) return;
                const { topShift: top, bottomShift: bottom } = viewport;
                // Keep the counters above the tallest fitted bouquet, while the
                // pause button remains inside the notch/capsule safe boundary.
                this.topHud.setPosition(0, top + Math.min(40, Math.max(0, viewport.safeTop - top - 611)), 0);
                this.ordersRoot.setPosition(0, 0, 0);
                this.trayRoot.setPosition(0, 0, 0);
                this.toolsRoot.setPosition(0, bottom, 0);
                this.flowerRoot.setPosition(0, 0, 0);
                orderEffects.root.setPosition(0, 0, 0);
                stand.getComponent(UITransform)!.setContentSize(viewport.width, 72);
                stand.setPosition(0, 338, 0);
                shadows.setPosition(0, 337, 0);
                const roofBottom = 135;
                const ratio = Math.max(viewport.width / 750, (viewport.height / 2 - roofBottom) / 600);
                shop.getComponent(UITransform)!.setContentSize(750 * ratio, 600 * ratio);
                shop.setPosition(0, roofBottom + 300 * ratio, 0);
                this.positionGuide();
            });
            await this.buildHUD(); if (!this.current(rev)) return;
            await this.renderOrders(); if (!this.current(rev)) return;
            await this.renderTray(); if (!this.current(rev)) return;
            await this.spawnFlowers(); if (!this.current(rev)) return;
            await this.buildTools();
            if (!this.isValid || rev !== this.revision) return;
            // Original SpawnFlower emits 3–4 flowers every .05s, each scaling
            // from zero over .35s. Reveal the room before playing that sequence.
            this.pool!.playEntrance();
            this.firstPlayFrame = true;
            this.ready = true; this.bgm('bgm_level'); this.updateHUD();
            board.active = true;
            if (DEBUG) console.info(`[FlowerGame] level ${level} visible in ${Date.now() - entryStarted}ms (build ${Date.now() - buildStarted}ms)`);
            if (this.catalog?.levels.has(level + 1)) void this.prepareLevelAssets(level + 1)
                .catch(error => console.warn('[FlowerGame] next level preload', error));
            this.sound('flowerstart');
            const entrance = await Promise.all([this.waitForPoolEntrance(),
                ...Array.from(this.orderViews.keys()).map(slot => this.enterBouquet(slot, slot * 0.06))]);
            if (entrance.some(completed => !completed) || !this.current(rev)) return;
            if (level === 1) await this.showGuide();
        } catch (e) {
            if (!this.current(rev)) return;
            this.busy = false; this.paused = true;
            if (this.startupLoading) throw e;
            console.error('[FlowerGame] build', e);
            void message(content, '关卡暂不可用', e instanceof Error ? e.message : '请返回主页后重试。', '返回主页', () => this.showHome());
        }
    }
    private async buildHUD() {
        const pause = await sprite(this.topHud, 'Pause', A + 'order/setting', -334, 585, 52); tap(pause, () => this.pauseGame());
        label(this.topHud, 'Level', `第${this.rules!.level}关`, -217, 560, 45 * 750 / 1080, 145);
        const info = await sprite(this.topHud, 'Counters', A + 'order/num_board', 0, 562, 272, 60);
        await sprite(info, 'Hourglass', A + 'order/time', -110, 0, 26, 38);
        this.timer = label(info, 'Time', '03:00', -45, 0, 42 * 750 / 1080, 105).getComponent(Label)!;
        await sprite(info, 'Star', A + 'order/star128', 40, 0, 42);
        this.score = label(info, 'Score', '0', 92, 0, 42 * 750 / 1080, 70).getComponent(Label)!;
        await sprite(this.topHud, 'ProgressTrack', A + 'order/pb', 7, 512, 240, 23);
        this.progressBar = await sprite(this.topHud, 'ProgressFill', A + 'order/pb_full', 7, 512, 240, 23);
        const fill = this.progressBar.getComponent(Sprite)!;
        fill.type = Sprite.Type.FILLED; fill.fillType = Sprite.FillType.HORIZONTAL; fill.fillStart = 0; fill.fillRange = 0;
        this.progressLabel = label(this.topHud, 'Percent', '0%', 0, 512, 42 * 750 / 1080, 160, '#ffd714').getComponent(Label)!;
        await sprite(this.topHud, 'ProgressFlower', A + 'order/flower icon', 114, 512, 38);
    }
    private async renderOrders() {
        await Promise.all([0, 1, 2, 3].map(slot => this.renderOrder(slot)));
    }
    private async renderOrder(slot: number, enter = false): Promise<void> {
        const rev = this.revision, parent = this.ordersRoot, rules = this.rules!;
        const order = this.visual!.orders[slot];
        const previous = this.orderViews.get(slot);
        const root = uiNode(parent, `Order${slot}`, ORDER_X[slot], 0);
        root.active = false;
        const view: OrderView = { root };
        try {
            if (!rules.isOrderSlotUnlocked(slot)) {
                await sprite(root, 'LockedBouquet', A + 'order/commonvase', 0, 420, 154, 195);
                await sprite(root, 'VideoIcon', A + 'order/ads', 0, 447, 44);
                label(root, 'UnlockText', '解锁', 0, 402, 26, 130);
                const hit = uiNode(root, 'UnlockHit', 0, 420, 170, 200);
                tap(hit, () => void this.unlockOrderWithVideo(slot));
            } else if (order) {
                view.bouquet = await FlowerBouquetView.create(root, order);
                if (order.isNew) {
                    const unit = 750 / 1080;
                    view.newBadge = await sprite(root, 'New', A + 'order/new', 110 * unit,
                        Math.min(510, view.bouquet.top + 10), 48 * unit, 58 * unit);
                    view.newBadge.active = false;
                }
                const unfinished = order.needs.filter(need => need.filled < need.required);
                const request = await sprite(root, 'Request', A + 'order/quest' + Math.min(3, unfinished.length || 1), 0, 326, 110, 60);
                view.request = request.getComponent(Sprite)!;
                const need = unfinished[0];
                if (need) {
                    const icon = await fittedSprite(root, 'FlowerType', flowerSpritePath(need.kind), -23, 326, 51, 49);
                    icon.angle = need.kind.startsWith('cdcs') ? -38 : 0;
                    view.icon = icon.getComponent(Sprite)!;
                    view.remaining = label(root, 'Remaining', `x${need.required - need.filled}`, 25, 326, 28, 55, '#18150d').getComponent(Label)!;
                }
            }
            if (!this.current(rev)) { root.destroy(); return; }
            previous?.tip?.cancel(); previous?.root.destroy(); this.orderViews.set(slot, view); root.active = true;
            if (enter && order) {
                void this.enterBouquet(slot, 0.005);
            }
        } catch (error) { root.destroy(); if (this.current(rev)) throw error; }
    }
    private async enterBouquet(slot: number, delay: number): Promise<boolean> {
        const bouquet = this.orderViews.get(slot)?.bouquet;
        if (!bouquet) return true;
        const node = bouquet.root, x = node.position.x, y = node.position.y, scale = bouquet.displayScale;
        node.setPosition(x - bouquet.entranceOffset, y, 0); node.setScale(scale * 0.72, scale * 0.72, 1); fade(node, 0);
        if (delay > 0 && !await this.waitFor(delay)) return false;
        if (!node.isValid) return false;
        const opacity = node.getComponent(UIOpacity)!;
        tween(opacity).to(0.1, { opacity: 255 }, {easing: 'quadOut'}).start();
        node.on(Node.EventType.NODE_DESTROYED, () => Tween.stopAllByTarget(opacity));
        const slide = this.animate(node, 0.3, { position: new Vec3(x + 20 * 750 / 1080, y, 0) }, 'cubicOut');
        const grow = this.animate(node, 0.3, { scale: new Vec3(scale * 1.05, scale * 1.05, 1) }, 'backOut');
        if ((await Promise.all([slide, grow])).some(done => !done)) return false;
        if (!await this.animate(node, 0.05, { position: new Vec3(x, y, 0), scale: new Vec3(scale, scale, 1) }, 'quadOut')) return false;
        const view = this.orderViews.get(slot);
        if (this.visual?.orders[slot]?.isNew && view?.bouquet === bouquet) {
            if (view.newBadge) view.newBadge.active = true;
            this.sound('level_new');
            void this.waitFor(0).then(current => {
                if (!current || this.orderViews.get(slot) !== view) return;
                this.orderEffects?.play('new-order', node);
                if (view.request) view.tip = this.orderEffects?.play('order-tip', view.request.node,
                    {x: 0, y: -3}, {newVaseTip: true}) ?? undefined;
            });
        }
        return true;
    }
    private async pulseBouquetGroup(slot: number, group: number): Promise<boolean> {
        const nodes = this.orderViews.get(slot)?.bouquet?.groupFlowers(group) ?? [];
        const pulses = nodes.map(async (node, index) => {
            const scale = new Vec3(node.scale.x, node.scale.y, node.scale.z);
            if (index > 0 && !await this.waitFor(index * 0.05)) return false;
            if (!node.isValid) return false;
            if (!await this.animate(node, 0.12, {scale: new Vec3(scale.x * 1.18, scale.y * 1.18, 1)}, 'backOut')) return false;
            return this.animate(node, 0.1, {scale}, 'quadOut');
        });
        if ((await Promise.all(pulses)).some(done => !done)) return false;
        return this.waitFor(0.05);
    }
    private async removeBouquet(slot: number): Promise<boolean> {
        const view = this.orderViews.get(slot), node = view?.bouquet?.root;
        if (!node) return true;
        // The outgoing view owns its animation. Detach it from the slot before
        // building the next order so neither view can destroy the other.
        this.orderViews.delete(slot);
        this.cancelNodeAnimations(node);
        view!.tip?.cancel();
        if (view!.newBadge) view!.newBadge.active = false;
        if (view!.request) view!.request.node.active = false;
        if (view!.icon) view!.icon.node.active = false;
        if (view!.remaining) view!.remaining.node.active = false;
        this.orderEffects?.play('complete', node, {x: 0, y: 145 * 750 / 1080});
        const scale = view!.bouquet!.displayScale;
        if (!await this.animate(node, 0.16, {scale: new Vec3(scale * 1.16, scale * 1.16, 1)}, 'quadOut')) return false;
        if (!await this.animate(node, 0.1, {scale: new Vec3(scale, scale, 1)}, 'quadInOut')) return false;
        const opacity = node.getComponent(UIOpacity) ?? node.addComponent(UIOpacity);
        tween(opacity).delay(0.06).to(0.28, {opacity: 0}, {easing: 'quadOut'}).start();
        node.on(Node.EventType.NODE_DESTROYED, () => Tween.stopAllByTarget(opacity));
        if (!await this.animate(node, 0.34, {position: new Vec3(node.position.x, node.position.y + 60 * 750 / 1080, 0)}, 'cubicIn')) return false;
        view!.root.destroy();
        return this.waitFor(0);
    }
    private async refreshOrder(slot: number): Promise<void> {
        const rev = this.revision, order = this.visual!.orders[slot], view = this.orderViews.get(slot);
        if (!order || !view?.bouquet) return;
        await view.bouquet.sync(order);
        if (!this.current(rev)) return;
        const unfinished = order.needs.filter(need => need.filled < need.required), need = unfinished[0];
        if (view.remaining) view.remaining.string = need ? `x${need.required - need.filled}` : '';
        if (view.icon) {
            view.icon.node.active = !!need;
            if (need) {
                const frame = await loadFrame(flowerSpritePath(need.kind));
                if (!this.current(rev)) return;
                view.icon.spriteFrame = frame;
                const scale = Math.min(51 / frame.originalSize.width, 49 / frame.originalSize.height);
                view.icon.node.getComponent(UITransform)!.setContentSize(frame.originalSize.width * scale, frame.originalSize.height * scale);
                view.icon.node.angle = need.kind.startsWith('cdcs') ? -38 : 0;
            }
        }
        if (view.request) {
            view.request.node.active = !!need;
            if (need) {
                const frame = await loadFrame(A + 'order/quest' + Math.min(3, unfinished.length));
                if (!this.current(rev) || !view.request.isValid) return;
                view.request.spriteFrame = frame;
            }
        }
    }
    private async renderTray() {
        const rev = this.revision, parent = this.trayRoot, rules = this.rules!, visual = this.visual!;
        for (let i = 0; i < 6; i++) {
            if (this.trayCells[i] && (i !== 5 || this.trayCapacity === rules.bufferCapacity)) continue;
            const previous = this.trayCells[i];
            const cell = await sprite(parent, `Slot${i}`, A + 'order/plate', -243 + i * 97, 252, 88, 57);
            cell.active = false;
            if (i === 5 && rules.bufferCapacity === 5) {
                await sprite(cell, 'Green', A + 'order/plate green_mask', 0, 0, 80, 49);
                await sprite(cell, 'Coin', A + 'ui/itemicon/gold', -20, 0, 31);
                label(cell, 'Price', '60', 17, 0, 22, 45, '#e8284c');
                tap(cell, () => this.buySlot());
            }
            if (!this.current(rev)) { cell.destroy(); return; }
            previous?.destroy(); this.trayCells[i] = cell; cell.active = true; cell.setSiblingIndex(i);
        }
        this.trayCapacity = rules.bufferCapacity;
        for (const node of [...parent.children]) {
            if (node.name.startsWith('Buffered-') && !visual.buffer.includes(node.name.slice(9))) node.destroy();
        }
        for (let i = 0; i < visual.buffer.length; i++) {
            const id = visual.buffer[i], flower = rules.flowers.find(piece => piece.id === id)!;
            let node = parent.getChildByName('Buffered-' + id);
            if (!node) node = await fittedSprite(parent, 'Buffered-' + id, flowerSpritePath(flower.kind, flower.variant), -243 + i * 97, 252, 54, 48);
            if (!this.current(rev)) return;
            node.setPosition(-243 + i * 97, 252, 0);
        }
    }
    private async spawnFlowers() {
        const rev = this.revision, rules = this.rules!;
        const pool = await FlowerPoolView.create(this.flowerRoot, rules.flowers, rules.level,
            id => { if (this.current(rev)) void this.collect(id); }, rules.layerMaxCounts, this.belowWaterRoot);
        if (!this.current(rev)) { pool.dispose(); return; }
        pool.setWaterSurface(this.water!.getComponent(Sprite)!);
        pool.setSurfaceListener(flower => {
            if (!this.current(rev)) return;
            const name = this.catalog?.flowersByKind.get(flower.kind)?.playUpSound;
            if (typeof name === 'string' && name) this.sound(name);
        });
        this.pool = pool;
    }
    private async showGuide() {
        const rev = this.revision;
        const target = this.rules!.flowers.find(f => f.status === 'pool' && f.kind === this.rules!.orders[0]?.kind);
        if (!target || this.sceneMode !== 'game') return;
        const n = this.pool?.nodeMap.get(target.id); if (!n) return;
        const point = this.mapPoint(n.parent!, n.position, this.hud);
        const hand = await sprite(this.hud, 'GuideHand', A + 'ui/game/guidehand', point.x + 40, point.y - 72, 112);
        if (!this.current(rev) || this.busy || target.status !== 'pool' || !n.isValid) { hand.destroy(); return; }
        this.hand = hand; this.handTarget = n; this.positionGuide();
        tween(hand).repeatForever(tween().to(1 / 3, { scale: new Vec3(1.1, 1.1, 1) })
            .to(1 / 3, { scale: new Vec3(1, 1, 1) })).start();
    }
    private mapPoint(from: Node, point: Vec3, to: Node): Vec3 {
        const world = from.getComponent(UITransform)!.convertToWorldSpaceAR(point);
        return to.getComponent(UITransform)!.convertToNodeSpaceAR(world);
    }
    private positionGuide(): void {
        const target = this.handTarget;
        if (!this.hand?.isValid || !target?.isValid || !target.parent) return;
        const point = this.mapPoint(target.parent, target.position, this.hud);
        this.hand.setPosition(point.x + 40, point.y - 72, 0);
    }
    private async buildTools() {
        for (const n of [...this.toolsRoot.children]) { n.removeFromParent(); n.destroy(); }
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * 234;
            const root = await sprite(this.toolsRoot, `Tool${i}`, A + 'order/tools bg', x, -585, 125);
            if (this.rules!.level < i + 2) {
                await sprite(root, 'Lock', A + 'ui/game/lock', 0, 12, 39);
                label(root, 'UnlockLevel', `${i + 2} 关`, 0, -37, 27, 115);
                tap(root, () => this.notice('道具未解锁', `完成前面的关卡后，第${i + 2}关可使用此道具。`));
            } else {
                const names = ['compose', 'shuffle', 'clear'];
                await sprite(root, 'Icon', A + 'ui/itemicon/' + names[i], 0, 8, 70);
                label(root, 'ToolName', ['合成', '打乱', '清除'][i], 0, -41, 27, 100);
                const count = this.read(names[i], 2);
                const badge = panel(root, 'Count', 55, 42, 37, 37, count ? '#72ba2b' : '#f2313d', 18);
                label(badge, 'Number', count ? String(count) : '+', 0, 0, 25, 37);
                tap(root, () => this.useTool(i));
            }
        }
    }
    private clearFlowerTaps(): void { this.tapQueue.length = 0; this.queuedTaps.clear(); this.earlyFlights.clear(); }
    private async collect(id: string) {
        const rules = this.rules;
        if (!this.ready || this.firstPlayFrame || this.paused || this.finished || !rules || rules.status !== 'playing'
            || (this.busy && !this.collecting) || this.queuedTaps.has(id)
            || !rules.flowers.some(flower => flower.id === id && flower.status === 'pool')) return;
        // Accept each tap synchronously and launch its flight immediately. Only
        // presentation commits are serialized, so an old basket animation cannot
        // hold the next flower in the water or reserve the same destination twice.
        const orders = rules.orders.map(order => order ? cloneOrder(order) : null);
        const stars = rules.stars;
        const events = rules.select(id);
        if (!events.length) return;
        this.tapQueue.push({ id, events, stars: rules.stars - stars }); this.queuedTaps.add(id);
        const firstMove = events.find(event => event.type === 'move' && event.flowerId === id);
        if (firstMove?.type === 'move') this.launchEarlyFlight(firstMove, orders[firstMove.slot]);
        vibrateFlowerTap(); this.sound('click');
        if (this.hand) { Tween.stopAllByTarget(this.hand); this.hand.destroy(); this.hand = null; this.handTarget = null; }
        if (this.collecting) return;
        const rev = this.revision;
        this.collecting = true; this.busy = true;
        try {
            while (this.current(rev) && this.rules === rules && !this.finished && this.tapQueue.length) {
                const next = this.tapQueue.shift()!;
                await this.animateEvents(next.events, rev, next.stars);
                if (!this.current(rev)) return;
                this.queuedTaps.delete(next.id);
            }
        } catch (error) { if (this.current(rev)) console.error('[FlowerGame] collect animation', error); }
        finally {
            if (this.current(rev)) { this.clearFlowerTaps(); this.collecting = false; this.busy = false; }
        }
        if (this.current(rev) && this.rules === rules && !this.paused && rules.status !== 'playing') void this.endLevel();
    }
    private launchEarlyFlight(event: Extract<FlowerEvent, { type: 'move' }>, order: FlowerOrder | null): void {
        if (event.from !== 'pool' || !this.pool || !this.flowerRoot) return;
        const node = this.pool.take(event.flowerId);
        if (!node?.isValid) return;
        node.setParent(this.flowerRoot, true);
        const size = node.getComponent(UITransform)!;
        let destination = () => this.mapPoint(this.trayRoot, new Vec3(-243 + event.slot * 97, 252), this.flowerRoot);
        let scale = new Vec3(54 / size.width, 54 / size.width, 1), angle = 0;
        if (event.to === 'order' && order) {
            const bouquet = this.visual?.orders[event.slot]?.id === order.id ? this.orderViews.get(event.slot)?.bouquet : undefined;
            const landing = bouquet?.landing(order);
            if (bouquet && landing) {
                destination = () => this.mapPoint(bouquet.root.parent!, bouquet.restingPoint(landing.position), this.flowerRoot);
                scale = new Vec3(landing.width * bouquet.displayScale / size.width, landing.height * bouquet.displayScale / size.height, 1); angle = landing.angle;
            } else destination = () => this.mapPoint(this.ordersRoot, new Vec3(ORDER_X[event.slot], 443), this.flowerRoot);
        }
        this.earlyFlights.set(event.flowerId, { node, done: this.flyFlower(node, destination, scale, angle) });
    }
    private async animateEvents(events: FlowerEvent[], rev = this.revision, earnedStars?: number) {
        const rules = this.rules!, visual = this.visual!;
        const completionCount = events.filter(event => event.type === 'order-completed').length;
        const starsPerCompletion = completionCount ? (earnedStars ?? (rules.stars - visual.stars)) / completionCount : 0;
        for (const event of events) {
            if (!this.current(rev)) return;
            if (event.type === 'flower-revealed') {
                const flower = rules.flowers.find(piece => piece.id === event.flowerId);
                if (flower) await this.pool?.reveal(flower);
                continue;
            }
            if (event.type === 'order-completed') {
                visual.complete(event.order, starsPerCompletion); this.updateHUD(); this.sound('vasesuccss');
                void this.removeBouquet(event.order.slot);
                continue;
            }
            if (event.type === 'order-added') {
                // The old slot animation may still be fading. Rebuild the slot
                // immediately so the collection stream cannot stall on it.
                visual.add(event.order); await this.renderOrder(event.order.slot, true);
                continue;
            }
            if (event.type === 'special-paired') {
                visual.buffer = visual.buffer.filter(id => !event.flowerIds.includes(id));
                await this.renderTray(); if (!this.current(rev)) return;
                const path = `${A}flower/${event.specialId === 2000 ? 'hd_01' : 'hd_02'}`;
                const start = this.mapPoint(this.trayRoot, new Vec3(-243 + event.slot * 97, 252, 0), this.topHud);
                const butterfly = await fittedSprite(this.topHud, 'PairedButterfly', path, start.x, start.y, 54, 68);
                this.sound('combine');
                if (!await this.waitFor(event.delaySeconds)) return;
                // Both anchors share the top group, so a resize moves the whole
                // butterfly path without changing the original local tween.
                const destination = this.mapPoint(this.ordersRoot, new Vec3(0, 447, 0), this.topHud);
                await this.animate(butterfly, 0.32, { position: destination, scale: new Vec3(1.6, 1.6, 1) }, 'sineOut');
                butterfly.destroy(); continue;
            }
            if (event.type !== 'move') continue;
            const flower = rules.flowers.find(piece => piece.id === event.flowerId)!;
            const landingOrder = event.to === 'order' ? visual.orders[event.slot] : null;
            const landingGroup = landingOrder?.needs.findIndex(need => need.filled < need.required) ?? -1;
            const group = landingOrder && landingGroup >= 0 ? landingOrder.needs[landingGroup] : null;
            const completesGroup = !!group && group.filled + 1 === group.required;
            const landingBouquet = event.to === 'order' ? this.orderViews.get(event.slot)?.bouquet : undefined;
            const landingEffectPoint = landingOrder && landingBouquet?.landing(landingOrder)?.effectPosition;
            const early = event.from === 'pool' ? this.earlyFlights.get(event.flowerId) : undefined;
            let node = early?.node ?? this.pool?.take(event.flowerId) ?? this.trayRoot.getChildByName('Buffered-' + event.flowerId);
            if (!node && event.from === 'waiting') {
                const waiting = this.mapPoint(this.toolsRoot, new Vec3(234, -585, 0), this.flowerRoot);
                node = await fittedSprite(this.flowerRoot, 'Waiting-' + event.flowerId, flowerSpritePath(flower.kind, flower.variant), waiting.x, waiting.y, 54, 48);
            }
            if (!this.current(rev)) return;
            if (node?.isValid && node.parent) {
                if (node.parent !== this.flowerRoot) node.setParent(this.flowerRoot, true);
                const ripple = node.getChildByName('Ripple'); if (ripple) ripple.active = false;
                const size = node.getComponent(UITransform)!;
                let destination = () => event.to === 'waiting'
                    ? this.mapPoint(this.toolsRoot, new Vec3(234, -585, 0), this.flowerRoot)
                    : this.mapPoint(this.trayRoot, new Vec3(-243 + event.slot * 97, 252, 0), this.flowerRoot);
                let scale = new Vec3(54 / size.width, 54 / size.width, 1), angle = 0;
                if (event.to === 'order') {
                    const order = visual.orders[event.slot], bouquet = this.orderViews.get(event.slot)?.bouquet;
                    const landing = order && bouquet?.landing(order);
                    if (landing && bouquet) {
                        // A flower clicked during pool entry arrives after the
                        // basket settles. Target the resting attachment, not
                        // its temporary offscreen slide position.
                        destination = () => this.mapPoint(bouquet.root.parent!, bouquet.restingPoint(landing.position), this.flowerRoot);
                        scale = new Vec3(landing.width * bouquet.displayScale / size.width, landing.height * bouquet.displayScale / size.height, 1);
                        angle = landing.angle;
                    } else destination = () => this.mapPoint(this.ordersRoot, new Vec3(ORDER_X[event.slot], 443, 0), this.flowerRoot);
                }
                node.setSiblingIndex(this.flowerRoot.children.length - 1);
                if (early) {
                    if (!await early.done || !this.current(rev)) return;
                    this.earlyFlights.delete(event.flowerId);
                    // A newly added order may not have existed when this flight
                    // started. Settle into its now available attachment slot.
                    const target = destination();
                    if (Math.hypot(node.position.x - target.x, node.position.y - target.y) > 1) {
                        if (!await this.animate(node, 0.1, { position: target, scale, angle })) return;
                    }
                } else if (!await this.flyFlower(node, destination, scale, angle)) return;
            }
            if (!this.current(rev)) return;
            // Swap the flight for the permanent flower at exactly the same slot.
            visual.move(event, flower);
            if (event.to === 'order') await this.refreshOrder(event.slot);
            if (!this.current(rev)) return;
            node?.destroy();
            if (event.from === 'buffer' || event.to === 'buffer' || event.to === 'waiting') await this.renderTray();
            this.updateHUD();
            if (event.to === 'order' && landingBouquet && landingEffectPoint && this.orderEffects) {
                // Capture before the next event can replace/destroy this vase.
                // Original one-frame-delayed landing FX are independent objects.
                const effects = this.orderEffects;
                const point = this.mapPoint(landingBouquet.root,
                    new Vec3(landingEffectPoint.x, landingEffectPoint.y, 0), effects.root);
                void this.waitFor(0).then(current => {
                    if (!current || effects !== this.orderEffects) return;
                    this.sound('flowerhit');
                    effects.playAt('landing', point);
                });
            }
            if (completesGroup) {
                // Decorative pulses must not delay another already flying flower
                // from committing its landing, progress or replacement order.
                void this.pulseBouquetGroup(event.slot, landingGroup);
                const order = visual.orders[event.slot];
                if (order?.needs.some(need => need.filled < need.required)) {
                    const view = this.orderViews.get(event.slot);
                    if (view?.bouquet) this.orderEffects?.play('group-switch', view.bouquet.root, {x: 0, y: 145 * 750 / 1080});
                    if (view?.request) {
                        view.tip?.cancel();
                        view.tip = this.orderEffects?.play('order-tip', view.request.node, {x: 0, y: -3}) ?? undefined;
                    }
                    this.sound('level_checkceng');
                }
            }
        }
    }
    private updateHUD() {
        if (!this.rules || !this.timer) return;
        const sec = Math.ceil(this.rules.remainingSeconds);
        this.timer.string = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
        this.timer.color = sec <= 30 ? new Color(255, 114, 105) : Color.WHITE;
        const percent = this.visual?.percent ?? 0;
        this.score.string = String(this.visual?.stars ?? 0); this.progressLabel.string = `${percent}%`;
        if (percent !== this.progressTarget) {
            this.progressTarget = percent;
            const fill = this.progressBar.getComponent(Sprite)!;
            Tween.stopAllByTarget(fill);
            tween(fill).to(0.16, { fillRange: percent / 100 }, { easing: 'quadOut' }).start();
        }
    }
    update(dt: number) {
        this.orderEffects?.setPaused(this.paused);
        this.orderEffects?.update(dt);
        if (this.sceneMode !== 'game' || this.paused || !this.rules || this.finished || !this.ready) return;
        this.clock += dt;
        const entering = this.pool?.entering;
        this.pool?.update(dt);
        if (this.hand?.isValid) this.positionGuide();
        if (entering && !this.pool?.entering) this.finishEntrance?.();
        // GamePlay.MoveNext (41073) yields one frame, then starts the countdown
        // while the flower creation coroutine is still playing.
        if (this.firstPlayFrame) { this.firstPlayFrame = false; this.busy = false; return; }
        const events = this.rules.tick(dt);
        for (const event of events) {
            if (event.type !== 'flower-revealed') continue;
            const flower = this.rules.flowers.find(piece => piece.id === event.flowerId);
            if (flower) void this.pool?.reveal(flower).catch(error => console.error('[FlowerGame] reveal', error));
        }
        this.updateHUD();
        if (!this.busy && this.rules.status !== 'playing') this.endLevel();
    }
    private async notice(title: string, body: string) {
        if (this.paused || this.busy || this.finished) return;
        this.clearFlowerTaps();
        this.paused = true;
        const rev = this.revision;
        await message(this.content, title, body, '知道了', () => { if (this.current(rev)) this.paused = false; });
    }
    private async buySlot() {
        if (this.paused || this.busy) return;
        const events = this.rules!.buyExtraBufferSlot();
        if (!events.length) { this.notice('金币不足', '扩展暂存格需要60金币，可以返回主页通过每日签到或新手礼包获得。'); return; }
        this.busy = true;
        const rev = this.revision;
        try { this.write('coins', this.rules!.coins); this.sound('switch'); await this.renderTray(); }
        finally { if (this.current(rev)) this.busy = false; }
    }
    private async unlockOrderWithVideo(slot: number) {
        const rules = this.rules;
        if (!rules || this.paused || this.busy || this.finished || rules.status !== 'playing' || rules.isOrderSlotUnlocked(slot)) return;
        const rev = this.revision;
        let requested = false;
        this.clearFlowerTaps();
        this.paused = true;
        await message(this.content, '解锁花束位', '增加一个花束位置，同时整理更多订单。', '解锁', () => {
            if (!this.current(rev) || requested) return;
            requested = true;
            this.paused = false; this.busy = true;
            void rewardedVideo.claim(`order-slot-${slot}`, async () => {
                const events = rules.unlockOrderSlot(slot);
                if (!events.length) return false;
                // Clear the former lock even if the remaining order queue is empty.
                await this.renderOrder(slot);
                if (!this.current(rev)) return false;
                await this.animateEvents(events, rev);
                return true;
            }, () => this.current(rev) && this.rules === rules && rules.status === 'playing')
                .catch(error => { if (this.current(rev)) console.error('[FlowerGame] order slot reward', error); })
                .then(() => {
                    if (!this.current(rev)) return;
                    this.busy = false;
                    if (rules.status !== 'playing') void this.endLevel();
                });
        });
    }
    private async useTool(index: number) {
        if (this.paused || this.busy || this.finished) return;
        const key = ['compose', 'shuffle', 'clear'][index];
        const count = this.read(key, 2);
        if (count <= 0) { await this.refillToolWithVideo(index); return; }
        this.busy = true;
        const rev = this.revision, rules = this.rules!;
        try {
            if (index === 1) {
                const order = this.rules!.orders.find(candidate => !!candidate);
                const need = order?.needs.find(candidate => candidate.filled < candidate.required);
                const duration = this.pool?.shuffle(need ? {kind: need.kind, count: need.required - need.filled} : undefined) || 0;
                if (!duration) return;
                this.sound('switch');
                if (!await this.waitFor(duration)) return;
            }
            else {
                const events = index === 2 ? this.rules!.clearBuffer() : this.rules!.collectMatchingOrder();
                const consumed = events.some(event => event.type === 'move') || (index === 2 && this.rules!.buffer.length > 0);
                // The original clear button consumes a use when only butterfly
                // slots are occupied, although those special objects stay put.
                if (!events.length && !consumed) return;
                this.sound('collect');
                await this.animateEvents(events, rev);
                if (!this.current(rev)) return;
                if (!consumed) return;
            }
            if (this.current(rev)) { this.write(key, count - 1); await this.buildTools(); }
        } finally { if (this.current(rev)) this.busy = false; }
        if (this.current(rev) && rules.status !== 'playing') void this.endLevel();
    }
    private async refillToolWithVideo(index: number) {
        const rules = this.rules, key = ['compose', 'shuffle', 'clear'][index], title = ['合成', '打乱', '清除'][index];
        if (!rules || !key || this.paused || this.busy || this.finished || rules.status !== 'playing') return;
        const rev = this.revision;
        let requested = false;
        this.clearFlowerTaps();
        this.paused = true;
        await message(this.content, '道具已用完', `领取${title}道具 × 1`, '领取', () => {
            if (!this.current(rev) || requested) return;
            requested = true;
            this.paused = false; this.busy = true;
            void rewardedVideo.claim(`tool-${key}`, async () => {
                const count = this.read(key, 2);
                if (count > 0) return false;
                // Config56047 PropInfo.num=1; PropView.AddProp42438 adds stock
                // and refreshes UI. It does not automatically use the new prop.
                this.write(key, count + 1);
                await this.buildTools();
                return true;
            }, () => this.current(rev) && this.rules === rules && rules.status === 'playing')
                .catch(error => { if (this.current(rev)) console.error('[FlowerGame] tool reward', error); })
                .then(() => { if (this.current(rev)) this.busy = false; });
        });
    }
    private async pauseGame() {
        // Accepted flights must finish committing behind the modal. New input
        // is blocked by paused; restart/home cancel all work via the revision.
        if ((this.busy && !this.collecting) || this.paused || this.finished || this.rules?.status !== 'playing') return;
        this.paused = true;
        const rev = this.revision, level = this.rules!.level;
        await createPause(this.content, {
            onResume: () => { if (this.current(rev)) this.paused = false; },
            onRestart: () => { if (this.current(rev)) void this.startLevel(level); },
            onHome: () => { if (this.current(rev)) void this.showHome(); },
        });
    }
    private async endLevel() {
        if (this.finished || this.paused || !this.rules) return;
        this.clearFlowerTaps();
        this.finished = true;
        const rev = this.revision, rules = this.rules, content = this.content;
        const won = rules.status === 'won'; const level = rules.level;
        const availableLevels = this.catalog ? this.catalog.levels.keys() : [level];
        const nextLevel = normalizePlayableLevel(level + 1, availableLevels);
        this.sound(won ? 'win' : 'lose');
        if (won) {
            this.write('level', normalizePlayableLevel(Math.max(this.read('level', 1), nextLevel),
                this.catalog ? this.catalog.levels.keys() : [level]));
            this.write('stars', this.read('stars', 0) + this.rules.stars);
            this.write('coins', this.rules.coins);
        }
        if (won) {
            await createWinResult(content, level, rules.stars, rules.coinReward,
                () => { if (this.current(rev)) void this.startLevel(nextLevel); }, () => { if (this.current(rev)) void this.showHome(); },
                nextLevel > level ? '下一关' : '再玩一次');
        } else {
            const failure = () => this.current(rev) ? createFailure(content, rules.failureReason || 'time',
                () => { if (this.current(rev)) void this.startLevel(level); }, () => { if (this.current(rev)) void this.showHome(); }) : Promise.resolve(null);
            if (this.rules.failureReason === 'time') {
                await createTimeContinue(content, rules.coins, () => {
                    if (!this.current(rev)) return false;
                    const events = rules.reviveTime();
                    if (!events.length) return false;
                    this.write('coins', this.rules!.coins); this.finished = false;
                    this.sound('time_add'); this.updateHUD(); return true;
                }, () => { void failure(); }, () => {
                    if (!this.current(rev)) return false;
                    const events = rules.reviveTimeWithReward();
                    if (!events.length) return false;
                    this.finished = false;
                    this.sound('time_add'); this.updateHUD(); return true;
                });
            } else await failure();
        }
    }
}
