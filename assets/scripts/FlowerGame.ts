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
import { BouquetLanding, FlowerBouquetView, preloadBouquets } from './FlowerBouquet';
import { BUTTERFLY_PAIR_OFFSET, BUTTERFLY_WING_HEIGHT, FlowerButterflyFlight } from './FlowerButterflyFlight';
import { BOUQUET_FINISH_DURATION, FlowerBouquetFinish } from './FlowerBouquetFinish';
import { BOUQUET_BLOOM_SECONDS, BOUQUET_GOLD_DELAY, FlowerPetalBloom, preloadFlowerPetals } from './FlowerPetalBloom';
import { BOARD_HEIGHT, BOARD_UNIT, BOARD_WIDTH, BOUQUET_BASE_Y, ORDER_X, TOOL_NAMES, TOOL_X, TOOL_Y,
    TRAY_X, TRAY_Y, boardWater, boardLabel, boardSprite, boardX, boardY, createProgressFill, preloadBoardSkin,
    OrderFlowerIcon, setProgressFill } from './FlowerBoardSkin';
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

type OrderView = {
    root: Node; bouquet?: FlowerBouquetView; remaining?: Label; icon?: OrderFlowerIcon; request?: Node; tip?: FlowerEffectHandle;
    landingEffects?: Set<FlowerEffectHandle>; departing?: boolean;
};
type FlowerMove = Extract<FlowerEvent, { type: 'move' }>;
type ButterflyPair = Extract<FlowerEvent, { type: 'special-paired' }>;
type FlowerFlight = { event: FlowerMove; node: Node; completed: Promise<boolean> };

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
    private collectionWork: Promise<void> | null = null;
    private revision = 0;
    private catalog: FlowerCatalog | null = null;
    private pool: FlowerPoolView | null = null;
    private buildingPool: FlowerPoolView | null = null;
    private orderEffects: FlowerEffects | null = null;
    private toolsRoot!: Node;
    private ordersRoot!: Node;
    private trayRoot!: Node;
    private poolRoot!: Node;
    private belowWaterRoot!: Node;
    private waterSurface!: Sprite;
    private flowerRoot!: Node;
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
    private finished = false;
    private ready = false;
    private visual: FlowerPresentationState | null = null;
    private orderViews = new Map<number, OrderView>();
    private trayCells: Node[] = [];
    private trayCapacity = 0;
    private progressTarget = -1;
    private readonly progressTween = { percent: 0 };
    private pendingAnimations = new Set<() => void>();
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
            if (DEBUG && sys.isBrowser && this.rules && new URLSearchParams(window.location.search).get('previewState') === 'time') {
                this.rules.tick(this.rules.remainingSeconds); this.updateHUD(); void this.endLevel();
            }
        } catch (error) {
            if (!current()) return;
            console.error('[FlowerGame] startup assets', error);
            loading?.setError(() => this.loadStartup());
        }
    }
    onDestroy() { this.startupRevision++; this.startupLoading?.dispose(); this.revision++; this.collectionWork = null; this.cancelAnimations(); Tween.stopAllByTarget(this.progressTween); this.buildingPool?.dispose(); this.pool?.dispose(); this.orderEffects?.dispose(); this.music?.stop(); game.off('flower-settings-changed', this.applyAudioSettings, this); game.off('flower-ui-sound', this.onUISound, this); }
    private current(rev: number): boolean { return this.isValid && this.revision === rev; }
    private cancelAnimations(): void { for (const cancel of Array.from(this.pendingAnimations)) cancel(); this.pendingAnimations.clear(); }
    private animate(node: Node, duration: number, properties: Record<string, unknown>, easing = 'quadOut'): Promise<boolean> {
        const rev = this.revision;
        return new Promise(resolve => {
            let settled = false;
            const finish = (completed: boolean) => {
                if (settled) return; settled = true;
                this.pendingAnimations.delete(cancel); node.off(Node.EventType.NODE_DESTROYED, cancel);
                resolve(completed && this.current(rev));
            };
            const cancel = () => { Tween.stopAllByTarget(node); finish(false); };
            this.pendingAnimations.add(cancel); node.on(Node.EventType.NODE_DESTROYED, cancel);
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
        const from = new Vec3(node.position.x, node.position.y, node.position.z);
        const scale = new Vec3(node.scale.x, node.scale.y, node.scale.z);
        const angle = node.angle, turn = ((targetAngle - angle + 540) % 360) - 180;
        // Original ctor44385 moveDuration=.58, pickedScaleRatio=1.25.
        return this.animateProgress(node, 0.58, progress => {
            const sample = flowerFlightPhase(progress);
            const target = typeof destination === 'function' ? destination() : destination;
            const axis = (initial: number, target: number) => progress <= 0.2
                ? initial * (1 + 0.25 * sample.pickup)
                : initial * 1.25 + (target - initial * 1.25) * sample.settle;
            node.setPosition(from.x + (target.x - from.x) * sample.travel,
                from.y + (target.y - from.y) * sample.travel, from.z);
            node.setScale(axis(scale.x, targetScale.x), axis(scale.y, targetScale.y), 1);
            node.angle = angle + turn * sample.rotation;
        });
    }
    private animateProgress(node: Node, duration: number, draw: (progress: number) => void): Promise<boolean> {
        const rev = this.revision, phase = { progress: 0 };
        const apply = () => { if (node.isValid && this.current(rev)) draw(phase.progress); };
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
            tween(phase).to(duration, { progress: 1 }, { easing: 'linear', onUpdate: apply })
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
        this.collectionWork = null;
        this.cancelAnimations(); this.visual = null; this.orderViews.clear(); this.trayCells = []; this.trayCapacity = 0; this.progressTarget = -1;
        this.firstPlayFrame = false;
        this.buildingPool?.dispose(); this.buildingPool = null;
        this.pool?.dispose(); this.pool = null;
        this.orderEffects?.dispose(); this.orderEffects = null;
        Tween.stopAllByTarget(this.progressTween); this.progressTween.percent = 0;
        this.rules = null; this.hand = null; this.handTarget = null;
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
    private sound(name: string, volume = 0.7) {
        if (sys.localStorage.getItem('zdhjy.sound') === 'off') return;
        const cached = this.effectsCache.get(name);
        if (cached) { this.effects.playOneShot(cached, volume); return; }
        const rev = this.revision;
        loadFlowerAsset(A + 'audio/' + name, AudioClip, (err, clip) => {
            if (!err && this.current(rev) && sys.localStorage.getItem('zdhjy.sound') !== 'off') {
                this.effectsCache.set(name, clip);
                this.effects.playOneShot(clip, volume);
            }
        });
    }
    private onUISound(name?: string): void { if (name) this.sound(name); }
    private async preloadEffects(): Promise<void> {
        const names = ['click', 'open', 'close', 'flowerstart', 'flowerhit', 'vasesuccss', 'flowerfuqi',
            'level_new', 'level_checkceng', 'level_daluan', 'bgm_home', 'bgm_level', 'combine', 'hudiefly', 'starAdd'];
        await Promise.all(names.map(name =>
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
                loadFrame(A + 'ui/game/guidehand'), loadFrame(A + 'ui/game/lock'), loadFrame(A + 'order/commonvase'), preloadBoardSkin(),
                FlowerPoolView.preload(flowers), preloadBouquets(config.orders?.map(order => order.vaseId)),
                FlowerEffects.preload(), preloadFlowerPetals(), preloadPause(), preloadFailure(), preloadContinue(), preloadWinResult(level),
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
        const buildSprite = async (...args: Parameters<typeof boardSprite>): Promise<Node> => {
            if (!this.current(rev)) throw new Error('Level build was superseded');
            const node = await boardSprite(...args);
            if (!this.current(rev)) { node.destroy(); throw new Error('Level build was superseded'); }
            return node;
        };
        try {
            this.rules = new FlowerRules(config, this.read('coins', 0));
            this.visual = new FlowerPresentationState(this.rules);
            if (!this.current(rev)) return;
            const ambient = await buildSprite(content, 'RoomOutsideBoard', 'ambient', 0, 0, 1080, 2400);
            const board = uiNode(content, 'LevelBoard', 0, 0, BOARD_WIDTH, BOARD_HEIGHT);
            board.active = false;
            await buildSprite(board, 'Greenhouse', 'greenhouse', 0, 0, 1080, 2400);
            await buildSprite(board, 'WoodenPool', 'pool', boardX(542), boardY(1399.5), 1060, 1133);
            const waterWidth = 990 * BOARD_UNIT, waterHeight = 1060 * BOARD_UNIT;
            const waterMask = uiNode(board, 'WaterSurface', boardX(545), boardY(1420), waterWidth, waterHeight);
            const mask = waterMask.addComponent(Mask); mask.type = Mask.Type.GRAPHICS_STENCIL;
            const shape = mask.subComp as Graphics;
            shape.roundRect(-waterWidth / 2, -waterHeight / 2, waterWidth, waterHeight, 48 * BOARD_UNIT);
            shape.fill();
            // Scale both depth roots together to the new skin. Native body sizes,
            // contact layers and fixed-step simulation remain in original local units.
            const poolScale=Math.min(waterWidth/ORIGINAL_POOL_GEOMETRY.waterWidth,waterHeight/ORIGINAL_POOL_GEOMETRY.waterHeight);
            const poolY=-ORIGINAL_POOL_GEOMETRY.waterY*poolScale;
            this.belowWaterRoot=uiNode(waterMask,'UnderwaterFlowers',0,poolY);
            this.belowWaterRoot.setScale(poolScale,poolScale,1);
            this.waterSurface=await boardWater(waterMask,waterWidth,waterHeight);
            this.poolRoot=uiNode(waterMask,'FloatingFlowers',0,poolY);
            this.poolRoot.setScale(poolScale,poolScale,1);
            this.ordersRoot = uiNode(board, 'Orders');
            this.trayRoot = uiNode(board, 'TemporarySlots');
            this.flowerRoot = uiNode(board, 'FlowerFlights');
            const orderEffects = await FlowerEffects.create(board);
            if (!this.current(rev)) { orderEffects.dispose(); return; }
            this.orderEffects = orderEffects;
            this.hud = uiNode(board, 'HUD');
            this.topHud = uiNode(this.hud, 'TopHUD');
            this.toolsRoot = uiNode(this.hud, 'Tools');
            bindFlowerViewport(board, viewport => {
                if (!this.current(rev)) return;
                const top = boardY(248), bottom = boardY(2172);
                const scale = Math.min((viewport.safeRight - viewport.safeLeft) / BOARD_WIDTH,
                    (viewport.safeTop - viewport.safeBottom) / (top - bottom));
                const x = (viewport.safeLeft + viewport.safeRight) / 2;
                const y = Math.min(viewport.safeTop - top * scale, Math.max(viewport.safeBottom - bottom * scale, 0));
                board.setPosition(x, y, 0); board.setScale(scale, scale, 1);
                const w = Math.max(viewport.width, BOARD_WIDTH * scale), h = Math.max(viewport.height, BOARD_HEIGHT * scale);
                const cover = Math.max(w / BOARD_WIDTH, h / BOARD_HEIGHT);
                ambient.getComponent(UITransform)!.setContentSize(BOARD_WIDTH * cover, BOARD_HEIGHT * cover);
                this.positionGuide();
            });
            await this.buildHUD(); if (!this.current(rev)) return;
            await this.renderOrders(); if (!this.current(rev)) return;
            await this.renderTray(); if (!this.current(rev)) return;
            await this.buildTools(); if (!this.current(rev)) return;
            // Present the room while node/fixture creation yields to real frames.
            // ready stays false, so neither gameplay nor the countdown can start.
            this.updateHUD(); board.active = true;
            await this.spawnFlowers();
            if (!this.isValid || rev !== this.revision) return;
            // Original SpawnFlower emits 3–4 flowers every .05s, each scaling
            // from zero over .35s. Reveal the room before playing that sequence.
            this.pool!.playEntrance();
            this.firstPlayFrame = true;
            this.ready = true; this.bgm('bgm_level'); this.updateHUD();
            board.active = true;
            if (DEBUG) console.info(`[FlowerGame] level ${level} visible in ${Date.now() - entryStarted}ms (build ${Date.now() - buildStarted}ms), physics=${this.pool?.physicsRevision}`);
            this.sound('flowerstart');
            const entrance = await Promise.all([this.waitForPoolEntrance(),
                ...Array.from(this.orderViews.keys()).map(slot => this.enterBouquet(slot, slot * 0.06))]);
            if (entrance.some(completed => !completed) || !this.current(rev)) return;
            // Do not compete with flower activation/first render on the phone.
            if (this.catalog?.levels.has(level + 1)) void this.prepareLevelAssets(level + 1)
                .catch(error => console.warn('[FlowerGame] next level preload', error));
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
        const pause = await boardSprite(this.topHud, 'Pause', 'pause', boardX(65.5), boardY(315.5), 121, 121);
        tap(pause, () => this.pauseGame());
        const level = boardLabel(this.topHud, 'Level', `第${this.rules!.level}关`, boardX(16), boardY(398.5), 40, 122, 'caption');
        level.horizontalAlign = Label.HorizontalAlign.LEFT;
        level.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
        await boardSprite(this.topHud, 'Hourglass', 'timer', boardX(334), boardY(320), 218, 86);
        await boardSprite(this.topHud, 'Star', 'stars', boardX(638.5), boardY(319.5), 225, 83);
        this.timer = boardLabel(this.topHud, 'Time', '00:00', boardX(353.5), boardY(323), 42, 140);
        this.score = boardLabel(this.topHud, 'Score', '0', boardX(652), boardY(323.5), 42, 110);
        await boardSprite(this.topHud, 'ProgressTrack', 'progress-track', boardX(540), boardY(404.5), 324, 39);
        this.progressBar = await createProgressFill(this.topHud);
        this.progressLabel = boardLabel(this.topHud, 'Percent', '0%', boardX(540), boardY(405.5), 42, 125);
        await boardSprite(this.topHud, 'ProgressFlower', 'progress-flower', boardX(689), boardY(401), 56, 56);
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
            const unlocked = rules.isOrderSlotUnlocked(slot);
            if (order) view.bouquet = await FlowerBouquetView.create(root, order);
            const visual = view.bouquet?.root ?? uiNode(root, 'OrderVisual', 0, BOUQUET_BASE_Y);
            if (!unlocked) {
                await sprite(visual, 'LockedBouquet', A + 'order/commonvase', 0, 110 * BOARD_UNIT, 174 * BOARD_UNIT, 220 * BOARD_UNIT);
            }
            const tagY = boardY(686) - BOUQUET_BASE_Y;
            const tag = await boardSprite(visual, 'OrderTag', 'order-tag', 0, tagY, 203, 118);
            view.request = tag;
            if (!unlocked) {
                boardLabel(tag, 'UnlockText', '解锁', 0, 0, 35, 150, 'caption');
                const hit = uiNode(visual, 'UnlockBasket', 0, 57 * BOARD_UNIT, 255 * BOARD_UNIT, 298 * BOARD_UNIT);
                tap(hit, () => void this.unlockOrderWithVideo(slot));
            } else if (order) {
                const need = order.needs.find(group => group.filled < group.required);
                if (need) {
                    const frame = await loadFrame(flowerSpritePath(need.kind));
                    view.icon = new OrderFlowerIcon(tag, frame, need.kind);
                    view.remaining = boardLabel(tag, 'Filled', `${need.filled}/${need.required}`, 0, -33 * BOARD_UNIT, 32, 84, 'order');
                }
            }
            if (!this.current(rev)) { root.destroy(); return; }
            previous?.tip?.cancel(); previous?.root.destroy(); this.orderViews.set(slot, view); root.active = true;
            if (enter && order) {
                await this.enterBouquet(slot, 0.005);
            }
        } catch (error) { root.destroy(); if (this.current(rev)) throw error; }
    }
    private async enterBouquet(slot: number, delay: number): Promise<boolean> {
        const bouquet = this.orderViews.get(slot)?.bouquet;
        if (!bouquet) return true;
        const node = bouquet.root, x = node.position.x, y = node.position.y;
        node.setPosition(x - bouquet.entranceOffset, y, 0); node.setScale(0.72, 0.72, 1); fade(node, 0);
        if (delay > 0 && !await this.waitFor(delay)) return false;
        if (!node.isValid) return false;
        const opacity = node.getComponent(UIOpacity)!;
        tween(opacity).to(0.1, { opacity: 255 }, {easing: 'quadOut'}).start();
        node.on(Node.EventType.NODE_DESTROYED, () => Tween.stopAllByTarget(opacity));
        const slide = this.animate(node, 0.3, { position: new Vec3(x + 20 * 750 / 1080, y, 0) }, 'cubicOut');
        const grow = this.animate(node, 0.3, { scale: new Vec3(1.05, 1.05, 1) }, 'backOut');
        if ((await Promise.all([slide, grow])).some(done => !done)) return false;
        if (!await this.animate(node, 0.05, { position: new Vec3(x, y, 0), scale: new Vec3(1, 1, 1) }, 'quadOut')) return false;
        const view = this.orderViews.get(slot);
        if (this.visual?.orders[slot]?.isNew && view?.bouquet === bouquet) {
            this.sound('level_new');
            void this.waitFor(0).then(current => {
                if (!current || this.orderViews.get(slot) !== view) return;
                this.orderEffects?.play('new-order', node);
                if (view.request) view.tip = this.orderEffects?.play('order-tip', view.request,
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
        const view = this.orderViews.get(slot), bouquet = view?.bouquet;
        if (!bouquet) return true;
        const node = bouquet.root;
        view.tip?.cancel();
        view.departing = true;
        for (const landing of Array.from(view.landingEffects ?? [])) landing.cancel();
        const bloom = new FlowerPetalBloom(bouquet.placedFlowers);
        try {
            const opened = this.animateProgress(node, BOUQUET_BLOOM_SECONDS, progress => bloom.draw(progress));
            const glow = this.playBouquetGold(node);
            if ((await Promise.all([opened, glow])).some(done => !done)) return false;
        } finally {
            bloom.dispose();
        }
        const opacity = node.getComponent(UIOpacity) ?? node.addComponent(UIOpacity);
        tween(opacity).delay(0.06).to(0.28, {opacity: 0}, {easing: 'quadOut'}).start();
        node.on(Node.EventType.NODE_DESTROYED, () => Tween.stopAllByTarget(opacity));
        if (!await this.animate(node, 0.34, {position: new Vec3(node.position.x, node.position.y + 60 * 750 / 1080, 0)}, 'cubicIn')) return false;
        view.root.destroy(); this.orderViews.delete(slot);
        return this.waitFor(0);
    }
    private async playBouquetGold(node: Node): Promise<boolean> {
        if (!await this.waitFor(BOUQUET_GOLD_DELAY) || !node.isValid) return false;
        const board = this.ordersRoot.parent;
        if (!board?.isValid) return false;
        const back = uiNode(board, 'BouquetGoldBack', 0, 0, 1, 1);
        back.setSiblingIndex(this.ordersRoot.getSiblingIndex());
        const front = uiNode(board, 'BouquetGoldFront', 0, 0, 1, 1);
        front.setSiblingIndex(this.hud.getSiblingIndex());
        const backArt = back.addComponent(Graphics);
        const frontArt = front.addComponent(Graphics);
        frontArt.lineCap = Graphics.LineCap.ROUND;
        const gold = new FlowerBouquetFinish(backArt, frontArt);
        const anchor = this.mapPoint(node, new Vec3(0, 93, 0), board);
        const starStart = this.mapPoint(node, new Vec3(0, 111, 0), board);
        const starEnd = this.score && this.mapPoint(this.score.node, new Vec3(-26, 0, 0), board);
        try {
            return await this.animateProgress(node, BOUQUET_FINISH_DURATION, progress => {
                backArt.clear(); frontArt.clear();
                gold.draw(anchor.x, anchor.y, progress);
                if (starEnd) gold.drawRewardStar(starStart, starEnd, progress * BOUQUET_FINISH_DURATION);
            });
        } finally {
            for (const layer of [back, front]) {
                if (layer.isValid) { layer.active = false; layer.destroy(); }
            }
        }
    }
    private async refreshOrder(slot: number): Promise<void> {
        const rev = this.revision, order = this.visual!.orders[slot], view = this.orderViews.get(slot);
        if (!order || !view?.bouquet) return;
        await view.bouquet.sync(order);
        if (!this.current(rev)) return;
        const need = order.needs.find(group => group.filled < group.required);
        if (view.remaining) view.remaining.string = need ? `${need.filled}/${need.required}` : '';
        if (view.icon) {
            view.icon.node.active = !!need;
            if (need) {
                const frame = await loadFrame(flowerSpritePath(need.kind));
                if (!this.current(rev)) return;
                view.icon.setFlower(frame, need.kind);
            }
        }
    }
    private async renderTray() {
        const rev = this.revision, parent = this.trayRoot, rules = this.rules!, visual = this.visual!;
        for (let i = 0; i < 6; i++) {
            if (this.trayCells[i] && (i !== 5 || this.trayCapacity === rules.bufferCapacity)) continue;
            const previous = this.trayCells[i];
            const locked = i === 5 && rules.bufferCapacity === 5;
            const cell = await boardSprite(parent, `Slot${i}`, locked ? 'slot-locked' : 'slot', TRAY_X[i], TRAY_Y, 133, 93);
            cell.active = false;
            if (!this.current(rev)) { cell.destroy(); return; }
            previous?.destroy(); this.trayCells[i] = cell; cell.active = true;
            const slot = locked ? tap(cell, () => this.buySlot()).node : cell;
            slot.setSiblingIndex(i);
        }
        this.trayCapacity = rules.bufferCapacity;
        for (const node of [...parent.children]) {
            if (node.name.startsWith('Buffered-') && !visual.buffer.includes(node.name.slice(9))) node.destroy();
        }
        for (let i = 0; i < visual.buffer.length; i++) {
            const id = visual.buffer[i], flower = rules.flowers.find(piece => piece.id === id)!;
            let node = parent.getChildByName('Buffered-' + id);
            if (!node) node = await fittedSprite(parent, 'Buffered-' + id, flowerSpritePath(flower.kind, flower.variant), TRAY_X[i], TRAY_Y, 54, 48);
            if (!this.current(rev)) return;
            node.setPosition(TRAY_X[i], TRAY_Y, 0);
        }
    }
    private async spawnFlowers() {
        const rev = this.revision, rules = this.rules!;
        let building: FlowerPoolView | null = null;
        try {
            const pool = await FlowerPoolView.create(this.poolRoot, rules.flowers, rules.level,
                id => { if (this.current(rev)) void this.collect(id); }, rules.layerMaxCounts, this.belowWaterRoot,
                {isCurrent: () => this.current(rev), deferEntrance: true,
                    onCreate: pool => { building = pool; this.buildingPool = pool; }});
            if (!this.current(rev)) { pool.dispose(); return; }
            pool.setSurfaceListener(flower => {
                if (!this.current(rev)) return;
                const name = this.catalog?.flowersByKind.get(flower.kind)?.playUpSound;
                if (typeof name === 'string' && name) this.sound(name);
            });
            pool.ensureOrdersReachable(rules.orders);
            this.pool = pool;
            pool.setWaterSurface(this.waterSurface);
        } finally { if (this.buildingPool === building) this.buildingPool = null; }
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
        const parent = this.toolsRoot;
        const rev = this.revision;
        for (const n of [...parent.children]) { n.removeFromParent(); n.destroy(); }
        for (let i = 0; i < 3; i++) {
            const name = TOOL_NAMES[i];
            const locked = this.rules!.level < i + 2;
            const root = await boardSprite(parent, `Tool${i}`, locked ? 'tool-base' : 'tool-' + name, TOOL_X[i], TOOL_Y, 205, 194);
            if (!this.current(rev)) { root.destroy(); return; }
            if (locked) {
                await sprite(root, 'Lock', A + 'ui/game/lock', 0, 14, 42);
                if (!this.current(rev)) { root.destroy(); return; }
                boardLabel(root, 'UnlockLevel', `${i + 2} 关`, 0, -35, 36, 135, 'caption');
                tap(root, () => this.notice('道具未解锁', `完成前面的关卡后，第${i + 2}关可使用此道具。`));
                continue;
            }
            const count = this.read(name, 2);
            const badge = panel(root, 'Count', 53, 49, 36, 36, '#fff3d7', 18);
            const face = panel(badge, 'Face', 0, 0, 32, 32, count > 0 ? '#6e8838' : '#bd5638', 16);
            if (count > 0) {
                label(face, 'Number', String(count), 0, 0, 24, 36, '#fffce9', 'display');
            } else {
                const plus = face.getComponent(Graphics)!;
                plus.fillColor = new Color().fromHEX('#fffce9');
                plus.roundRect(-9, -2.5, 18, 5, 2);
                plus.roundRect(-2.5, -9, 5, 18, 2);
                plus.fill();
            }
            tap(root, () => this.useTool(i));
        }
    }
    private startFlowerFlight(event: FlowerMove, node: Node, landing?: BouquetLanding | null, pair?: ButterflyPair): FlowerFlight {
        if (node.parent !== this.flowerRoot) node.setParent(this.flowerRoot, true);
        const ripple = node.getChildByName('Ripple'); if (ripple) ripple.active = false;
        const size = node.getComponent(UITransform)!;
        let destination = () => event.to === 'waiting'
            ? this.mapPoint(this.toolsRoot, new Vec3(TOOL_X[2], TOOL_Y, 0), this.flowerRoot)
            : this.mapPoint(this.trayRoot, new Vec3(TRAY_X[event.slot], TRAY_Y, 0), this.flowerRoot);
        const fit = Math.min(54 / size.width, 48 / size.height);
        let scale = new Vec3(fit, fit, 1), angle = 0;
        const wing = pair && node.getChildByName('FlowerImage');
        if (wing) {
            wing.setScale(1, 1, 1);
            const wingFit = BUTTERFLY_WING_HEIGHT / wing.getComponent(UITransform)!.height;
            scale = new Vec3(-wingFit, wingFit, 1);
            destination = () => this.butterflyTrayPoint(pair).add(BUTTERFLY_PAIR_OFFSET);
        }
        if (event.to === 'order') {
            // Use the resting anchor even if the new vase has not entered yet.
            const x = ORDER_X[event.slot] + (landing?.position.x ?? 0);
            const y = BOUQUET_BASE_Y + (landing?.position.y ?? 0);
            destination = () => this.mapPoint(this.ordersRoot, new Vec3(x, y, 0), this.flowerRoot);
            if (landing) {
                scale = new Vec3(landing.width / size.width, landing.height / size.height, 1);
                angle = landing.angle;
            }
        }
        node.setSiblingIndex(this.flowerRoot.children.length - 1);
        return { event, node, completed: this.flyFlower(node, destination, scale, angle) };
    }
    private async collect(id: string): Promise<void> {
        const rules = this.rules;
        if (!this.ready || this.firstPlayFrame || this.paused || this.finished || !rules || rules.status !== 'playing'
            || (this.busy && !this.collectionWork)) return;
        const orders = rules.orders.map(order => order && cloneOrder(order));
        const starsBefore = rules.stars;
        const events = rules.select(id);
        const move = events[0];
        if (move?.type !== 'move') return;
        const pair = events[1]?.type === 'special-paired' ? events[1] : undefined;
        const starsEarned = rules.stars - starsBefore;
        vibrateFlowerTap(); this.sound('click');
        if (this.hand) { Tween.stopAllByTarget(this.hand); this.hand.destroy(); this.hand = null; this.handTarget = null; }
        const rev = this.revision;
        const previous = this.collectionWork;
        const work = (async () => {
            // Select reserves the destination synchronously. Start the clicked flower
            // now, then keep tray compaction and order changes in rules event order.
            const order = move.to === 'order' ? orders[move.slot] : null;
            const node = this.pool?.take(id);
            const flight = node?.isValid && node.parent
                ? this.startFlowerFlight(move, node, order && FlowerBouquetView.landingFor(order), pair)
                : undefined;
            if (previous) await previous;
            if (this.current(rev)) await this.animateEvents(events, rev, flight, starsEarned);
        })().catch(error => { if (this.current(rev)) console.error('[FlowerGame] collect animation', error); });
        this.collectionWork = work; this.busy = true;
        try {
            await work;
        } finally {
            if (this.current(rev) && this.collectionWork === work) {
                this.collectionWork = null; this.busy = false;
                if (!this.paused && rules.status !== 'playing') void this.endLevel();
            }
        }
    }
    private async animateEvents(events: FlowerEvent[], rev = this.revision, startedFlight?: FlowerFlight,
        starsEarned = this.rules!.stars - this.visual!.stars) {
        const rules = this.rules!, visual = this.visual!;
        const completionCount = events.filter(event => event.type === 'order-completed').length;
        const starsPerCompletion = completionCount ? starsEarned / completionCount : 0;
        for (let index = 0; index < events.length; index++) {
            const event = events[index];
            if (!this.current(rev)) return;
            if (event.type === 'flower-revealed') {
                const flower = rules.flowers.find(piece => piece.id === event.flowerId);
                if (flower) await this.pool?.reveal(flower);
                continue;
            }
            if (event.type === 'order-completed') {
                visual.complete(event.order, starsPerCompletion); this.updateHUD(); this.sound('vasesuccss');
                if (!await this.removeBouquet(event.order.slot)) return;
                continue;
            }
            if (event.type === 'order-added') {
                this.pool?.ensureOrdersReachable(rules.orders);
                visual.add(event.order); await this.renderOrder(event.order.slot, true);
                continue;
            }
            if (event.type === 'special-paired') {
                const target = events.slice(index + 1).find((item): item is FlowerMove => item.type === 'move' && item.to === 'order');
                if (!await this.animateButterfly(event, target, startedFlight, rev)) return;
                continue;
            }
            if (event.type !== 'move') continue;
            const next = events[index + 1];
            // Keep the second wing visible until the pair has fused in the tray.
            if (next?.type === 'special-paired' && next.flowerIds[1] === event.flowerId) continue;
            const flower = rules.flowers.find(piece => piece.id === event.flowerId)!;
            const landingOrder = event.to === 'order' ? visual.orders[event.slot] : null;
            const landingGroup = landingOrder?.needs.findIndex(need => need.filled < need.required) ?? -1;
            const group = landingOrder && landingGroup >= 0 ? landingOrder.needs[landingGroup] : null;
            const completesGroup = !!group && group.filled + 1 === group.required;
            const completesOrder = completesGroup && landingOrder.filled + 1 === landingOrder.required;
            const landingView = event.to === 'order' ? this.orderViews.get(event.slot) : undefined;
            const landingBouquet = landingView?.bouquet;
            const landing = landingOrder && landingBouquet?.landing(landingOrder);
            const flight = startedFlight?.event === event ? startedFlight : undefined;
            let node = flight?.node ?? this.pool?.take(event.flowerId) ?? this.trayRoot.getChildByName('Buffered-' + event.flowerId);
            if (!node && event.from === 'waiting') {
                const waiting = this.mapPoint(this.toolsRoot, new Vec3(TOOL_X[2], TOOL_Y, 0), this.flowerRoot);
                node = await fittedSprite(this.flowerRoot, 'Waiting-' + event.flowerId, flowerSpritePath(flower.kind, flower.variant), waiting.x, waiting.y, 54, 48);
            }
            if (!this.current(rev)) return;
            const activeFlight = flight ?? (node?.isValid && node.parent ? this.startFlowerFlight(event, node, landing) : undefined);
            if (activeFlight && !await activeFlight.completed) return;
            if (!this.current(rev)) return;
            // Swap the flight for the permanent flower at exactly the same slot.
            if (node?.isValid) node.active = false;
            visual.move(event, flower);
            if (event.to === 'order') {
                if (completesGroup) {
                    const view = this.orderViews.get(event.slot);
                    if (view?.bouquet && visual.orders[event.slot]) await view.bouquet.sync(visual.orders[event.slot]!);
                    if (view?.remaining && group) view.remaining.string = `${group.required}/${group.required}`;
                } else await this.refreshOrder(event.slot);
            }
            if (!this.current(rev)) return;
            node?.destroy();
            if (event.from === 'buffer' || event.to === 'buffer' || event.to === 'waiting') await this.renderTray();
            if (!this.current(rev)) return;
            this.updateHUD();
            if (landingBouquet && landing) {
                // Original DelayPlayFlowerSpineEffect yields one frame. Do not
                // delay the group pulse or attach this effect to the flying PNG.
                void this.waitFor(0).then(current => {
                    if (!current || !landingBouquet.root.isValid) return;
                    this.sound('flowerhit');
                    if (completesOrder || landingView.departing) return;
                    const effect = this.orderEffects?.play('landing', landingBouquet.root, landing.effectPosition);
                    if (!effect) return;
                    const active = landingView.landingEffects ??= new Set();
                    active.add(effect);
                    void effect.finished.then(() => active.delete(effect));
                });
            }
            if (completesGroup && !completesOrder) {
                if (!await this.pulseBouquetGroup(event.slot, landingGroup)) return;
                const order = visual.orders[event.slot];
                if (order?.needs.some(need => need.filled < need.required)) {
                    await this.refreshOrder(event.slot);
                    if (!this.current(rev)) return;
                    const view = this.orderViews.get(event.slot);
                    if (view?.bouquet) this.orderEffects?.play('group-switch', view.bouquet.root, {x: 0, y: 145 * 750 / 1080});
                    if (view?.request) {
                        view.tip?.cancel();
                        view.tip = this.orderEffects?.play('order-tip', view.request, {x: 0, y: -3}) ?? undefined;
                    }
                    this.sound('level_checkceng');
                }
            }
        }
    }
    private butterflyTrayPoint(pair: ButterflyPair): Vec3 {
        const stored = this.trayRoot.getChildByName('Buffered-' + pair.flowerIds[0]);
        const point = stored?.position ?? new Vec3(TRAY_X[pair.slot], TRAY_Y);
        return this.mapPoint(this.trayRoot, point, this.flowerRoot);
    }
    private async animateButterfly(pair: ButterflyPair, target: FlowerMove | undefined, startedFlight: FlowerFlight | undefined,
        rev: number): Promise<boolean> {
        const [firstId, secondId] = pair.flowerIds;
        const incoming = startedFlight?.event.flowerId === secondId ? startedFlight : undefined;
        let butterfly: FlowerButterflyFlight | undefined;
        try {
            if ((incoming && !await incoming.completed) || !this.current(rev)) return false;
            const pink = pair.specialId === 2001;
            const frame = await loadFrame(flowerSpritePath(pink ? 'hd_02' : 'hd_01')).catch(error => {
                if (this.current(rev)) console.warn('[FlowerGame] butterfly art', error);
                return null;
            });
            if (!this.current(rev)) return false;
            if (frame) {
                const effect = new FlowerButterflyFlight(this.flowerRoot, frame, this.butterflyTrayPoint(pair), pink);
                butterfly = effect;
                const stored = this.trayRoot.getChildByName('Buffered-' + firstId);
                if (stored) stored.active = false;
                if (incoming?.node.isValid) incoming.node.active = false;
                let combined = false;
                if (!await this.animateProgress(effect.root, pair.delaySeconds + 0.13, t => {
                    effect.merge(t);
                    if (!combined && t >= 0.60) {
                        combined = true;
                        this.sound('combine', 0.50);
                    }
                })) return false;
            }

            this.visual!.buffer = this.visual!.buffer.filter(id => id !== firstId && id !== secondId);
            await this.renderTray();
            if (!this.current(rev)) return false;
            if (!butterfly) return true;

            const effect = butterfly, start = effect.takeoff;
            const order = target && this.visual!.orders[target.slot];
            const bouquet = order && order.id === target.orderId ? this.orderViews.get(target.slot)?.bouquet : undefined;
            const landing = bouquet && bouquet.landing(order);
            const perch = new Vec3(landing?.effectPosition.x ?? 0, (landing?.effectPosition.y ?? 76) + 16);
            const destination = () => {
                if (!target) return new Vec3(start.x + 8, start.y + 100, start.z);
                if (bouquet?.root.isValid) return this.mapPoint(bouquet.root, perch, this.flowerRoot);
                return this.mapPoint(this.ordersRoot, new Vec3(ORDER_X[target.slot] + perch.x, BOUQUET_BASE_Y + perch.y), this.flowerRoot);
            };
            const end = destination();
            const duration = 0.88 + Math.min(0.36, Math.hypot(end.x - start.x, end.y - start.y) / 1300);
            this.sound('hudiefly', 0.64);
            if (!await this.animateProgress(effect.root, duration, t => effect.fly(t, destination()))) return false;
            this.sound('starAdd', 0.46);
            return await this.animateProgress(effect.root, 0.24, t => effect.land(t, destination()));
        } finally {
            if (incoming?.node.isValid) incoming.node.destroy();
            if (butterfly?.root.isValid) butterfly.root.destroy();
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
            const fill = this.progressBar;
            Tween.stopAllByTarget(this.progressTween);
            tween(this.progressTween).to(0.16, { percent }, { easing: 'quadOut', onUpdate: () => {
                if (fill.isValid) setProgressFill(fill, this.progressTween.percent);
            }}).start();
        }
    }
    update(dt: number) {
        this.orderEffects?.setPaused(this.paused);
        this.orderEffects?.update(dt);
        if (this.sceneMode !== 'game' || this.paused || !this.rules || this.finished || !this.ready) return;
        const entering = this.pool?.entering;
        this.pool?.update(dt);
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
                const completed = await new Promise<boolean>(resolve => {
                    const duration = this.pool?.shuffle(need ? {kind: need.kind, count: need.required - need.filled} : undefined, resolve);
                    if (duration) this.sound('level_daluan');
                    else resolve(false);
                });
                if (!completed) return;
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
        // Accepted flights may finish landing behind the modal.
        if ((this.busy && !this.collectionWork) || this.paused || this.finished || this.rules?.status !== 'playing') return;
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
