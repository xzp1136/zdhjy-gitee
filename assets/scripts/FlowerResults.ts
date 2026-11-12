import { loadFlowerAsset } from './FlowerAssets';
import { _decorator, Color, Component, JsonAsset, Label, Node, Sprite } from 'cc';
import { FlowerEffects } from './FlowerEffects';
import { OriginalFlower, OriginalVase } from './FlowerCatalog';
import { dismissPopup, label, loadFrame, modal, presentPopup, slicedSprite, sprite, tap, uiNode } from './FlowerUI';

const A = 'original/';
const SCALE = 750 / 1052;
const UNITY_SCALE = 750 / 1080;
const screenY = (y: number) => 667 - (y - 88) * SCALE;

export interface BouquetPreviewLayer {
    resource: string;
    x: number;
    y: number;
    width: number;
    height: number;
    angle?: number;
    flipX?: boolean;
    flipY?: boolean;
}
export interface BouquetPreview {
    name: string;
    layers: BouquetPreviewLayer[];
}
interface PreviewData { level: number; bouquets: BouquetPreview[] }

let firstLevelPreview: Promise<PreviewData> | null = null;
function loadFirstLevelPreview(): Promise<PreviewData> {
    if (!firstLevelPreview) firstLevelPreview = new Promise<PreviewData>((resolve, reject) => {
        loadFlowerAsset(`${A}data/win-preview-level1`, JsonAsset, (error, asset) => {
            if (error) { firstLevelPreview = null; reject(error); return; }
            const data = asset.json as PreviewData;
            if (data?.level !== 1 || data.bouquets?.length !== 6 || data.bouquets.some(b => !b.name || !b.layers?.length)) {
                firstLevelPreview = null;
                reject(new Error('The observed first-level bouquet preview is incomplete.'));
                return;
            }
            resolve(data);
        });
    });
    return firstLevelPreview;
}

type Slot = {group: number; variantIndex: number; x: number; y: number; scaleX: number; scaleY: number; angle: number};
type Layout = {name: string; baseLayers: BouquetPreviewLayer[]; foregroundLayers: BouquetPreviewLayer[]; flowerSlots: Slot[]};
type Metric = {width: number; height: number; centerOffsetX: number; centerOffsetY: number};
const previews = new Map<number, Promise<PreviewData>>();
function json<T>(path: string): Promise<T> {
    return new Promise((resolve,reject) => loadFlowerAsset(A + 'data/' + path, JsonAsset,
        (error,asset) => error ? reject(error) : resolve(asset.json as T)));
}

/** OverUIControl.FindUnlockFlower/SetVaseInfo (42822/42827): next-level vases,
 * one uniformly selected species per group from the full type catalog. Preview
 * species are decorative and are not filtered by gameplay unlock level. */
export function buildUnlockPreview(level: number, vases: OriginalVase[], flowers: OriginalFlower[],
    layouts: Record<string, Layout>, metrics: Record<string, Metric>, random: () => number = Math.random): PreviewData {
    const bouquets = vases.filter(vase => vase.unlockLevel === level + 1).map(vase => {
        const layout = layouts[String(vase.index)];
        if (!layout) throw new Error(`Missing original unlock vase layout: ${vase.index}`);
        const groups = vase.orderInfo.map(([type]) => {
            const choices = flowers.filter(flower => flower.type === type);
            if (!choices.length) throw new Error(`Missing original flower type: ${type}`);
            return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
        });
        const layers = [...layout.baseLayers];
        for (const slot of layout.flowerSlots) {
            const resource = A + 'flower/' + groups[slot.group].flowerPrefabPath[slot.variantIndex];
            const metric = metrics[resource];
            if (!metric) throw new Error(`Missing original preview sprite: ${resource}`);
            const angle = slot.angle * Math.PI / 180;
            const dx = metric.centerOffsetX * slot.scaleX, dy = metric.centerOffsetY * slot.scaleY;
            layers.push({resource, x: slot.x + dx * Math.cos(angle) - dy * Math.sin(angle),
                y: slot.y + dx * Math.sin(angle) + dy * Math.cos(angle),
                width: Math.abs(metric.width * slot.scaleX), height: Math.abs(metric.height * slot.scaleY),
                angle: slot.angle, flipX: slot.scaleX < 0, flipY: slot.scaleY < 0});
        }
        layers.push(...layout.foregroundLayers);
        return {name: vase.name, layers};
    });
    return {level, bouquets};
}

async function loadUnlockPreview(level: number): Promise<PreviewData> {
    if (level === 1) return loadFirstLevelPreview();
    let pending = previews.get(level);
    if (!pending) {
        pending = Promise.all([json<{tables: {VaseInfoConfig: OriginalVase[]; ItemDataConfig: OriginalFlower[]}}>('original-order-flower-vase-tables'),
            json<Record<string, Layout>>('bouquet-layouts'), json<Record<string, Metric>>('flower-sprite-metrics')])
            .then(([tables,layouts,metrics]) => buildUnlockPreview(level,tables.tables.VaseInfoConfig,tables.tables.ItemDataConfig,layouts,metrics))
            .catch(error => {previews.delete(level);throw error;});
        previews.set(level,pending);
    }
    return pending;
}

type Reveal = {node: Node; at: number; duration: number; settle: number; peak: number; lift: number;
    y: number; started: boolean; onStart?: () => void; onComplete?: () => void; completed: boolean};
/** Timings/eases from original 42828..42833, independent of popup scaling. */
@_decorator.ccclass('FlowerResultReveal')
export class FlowerResultReveal extends Component {
    private clock = 0;
    private items: Reveal[] = [];
    add(node: Node, at: number, duration: number, settle: number, peak: number, lift: number,
        onStart?: () => void, onComplete?: () => void): void {
        this.items.push({node,at,duration,settle,peak,lift,y:node.position.y,started:false,onStart,onComplete,completed:false});
        node.setScale(0,0,1);node.setPosition(node.position.x,node.position.y + lift,0);
    }
    update(dt: number): void {
        if (!Number.isFinite(dt) || dt <= 0) return;
        this.clock += dt;
        const outBack = (t: number) => 1 + 2.70158 * Math.pow(t - 1,3) + 1.70158 * Math.pow(t - 1,2);
        for (const item of this.items) {
            if (item.completed || !item.node.isValid || this.clock < item.at) continue;
            if (!item.started) {item.started=true;item.onStart?.();}
            const time = this.clock - item.at, p = Math.min(1,time / item.duration);
            const settling = Math.min(1,Math.max(0,(time-item.duration)/item.settle));
            const scale = time < item.duration ? outBack(p)*item.peak : item.peak+(1-item.peak)*(1-Math.pow(1-settling,2));
            item.node.setScale(scale,scale,1);
            item.node.setPosition(item.node.position.x,item.y+item.lift*Math.pow(1-p,3),0);
            if (time >= item.duration+item.settle) {item.completed=true;item.onComplete?.();}
        }
    }
}

const sharedFrames = [
    `${A}ui/over/bg`, `${A}ui/itemicon/gold`, `${A}ui/over/output_icon_1`, `${A}extras/green_button_931`,
];

/** Optional preloading avoids showing cards one at a time at the end of a level. */
export async function preloadWinResult(level: number): Promise<void> {
    const paths = [...sharedFrames];
    if (level > 0) {
        const data = await loadUnlockPreview(level);
        paths.push(`${A}ui/over/tittle`, `${A}ui/over/bunchcard`, `${A}ui/over/new`);
        for (const bouquet of data.bouquets) paths.push(...bouquet.layers.map(layer => layer.resource));
        if (data.bouquets.length) await FlowerEffects.preload();
    }
    await Promise.all(Array.from(new Set(paths)).map(path => loadFrame(path)));
}

function previewBounds(layers: BouquetPreviewLayer[]) {
    let left = Infinity, bottom = Infinity, right = -Infinity, top = -Infinity;
    for (const layer of layers) {
        const angle = (layer.angle ?? 0) * Math.PI / 180;
        const halfWidth = (Math.abs(Math.cos(angle)) * layer.width + Math.abs(Math.sin(angle)) * layer.height) / 2;
        const halfHeight = (Math.abs(Math.sin(angle)) * layer.width + Math.abs(Math.cos(angle)) * layer.height) / 2;
        left = Math.min(left, layer.x - halfWidth); right = Math.max(right, layer.x + halfWidth);
        bottom = Math.min(bottom, layer.y - halfHeight); top = Math.max(top, layer.y + halfHeight);
    }
    return { width: right - left, height: top - bottom, x: (left + right) / 2, y: (bottom + top) / 2 };
}

async function bouquetCard(parent: Node, bouquet: BouquetPreview, index: number, count: number): Promise<Node> {
    const inRow = Math.min(3,count-Math.floor(index/3)*3);
    const x = (index%3-(inRow-1)/2)*275*UNITY_SCALE;
    const rows = Math.ceil(count / 3);
    const y = 219 * UNITY_SCALE + ((rows - 1) / 2 - Math.floor(index / 3)) * 353 * UNITY_SCALE;
    const card = await sprite(parent, `UnlockBouquet${index}`, `${A}ui/over/bunchcard`, x, y, 245 * UNITY_SCALE, 333 * UNITY_SCALE);
    const bounds = previewBounds(bouquet.layers);
    const scale = Math.min(151 / bounds.width, 165 / bounds.height);
    const art = uiNode(card, 'Bouquet', 0, 27, 151, 165);
    for (let i = 0; i < bouquet.layers.length; i++) {
        const layer = bouquet.layers[i];
        const part = await sprite(art, `Layer${i}`, layer.resource,
            (layer.x - bounds.x) * scale, (layer.y - bounds.y) * scale,
            layer.width * scale, layer.height * scale);
        part.angle = layer.angle ?? 0;
        part.setScale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1, 1);
    }
    await sprite(card, 'NewBouquet', `${A}ui/over/new`, 70.5, 99.6, 46.5, 39.6);
    label(card, 'BouquetName', bouquet.name, 0, -84.3, 27.8, 168, '#c64b4f');
    return card;
}

/**
 * Unlock cards follow original next-level VaseInfoConfig and prefab geometry.
 * The first-level observed six-card selection stays available as its reference.
 * This function displays rewards; the caller owns wallet and progress changes.
 */
export async function createWinResult(
    parent: Node,
    level: number,
    stars: number,
    coinsReward: number,
    onNext: () => void,
    onHome?: () => void,
    nextLabel = '下一关',
): Promise<Node> {
    await preloadWinResult(level);
    const previewData = await loadUnlockPreview(level);
    const preview = previewData.bouquets.length ? previewData : null;
    const overlay = modal(parent, 'WinResultOverlay', '#141414eb');

    let reveal: FlowerResultReveal | null = null;
    if (preview) {
        const effects = await FlowerEffects.create(overlay);
        reveal = overlay.addComponent(FlowerResultReveal);
        const title = await sprite(overlay, 'NextBouquetsTitle', `${A}ui/over/tittle`, 0, screenY(365), 960 * SCALE);
        reveal.add(title,0,.22,.06,1.06,35*UNITY_SCALE,undefined,
            () => effects.play('result-title',title,{x:159*UNITY_SCALE,y:20*UNITY_SCALE}));
        for (let i = 0; i < preview.bouquets.length; i++) {
            const card = await bouquetCard(overlay,preview.bouquets[i],i,preview.bouquets.length);
            reveal.add(card,.5+i*.16,.28,.1,1.06,25*UNITY_SCALE,undefined,() => effects.play('result-card',card));
        }
        // All Spine FX are an overlay sibling so later cards cannot cover them.
        effects.root.setSiblingIndex(overlay.children.length-1);
    } else {
        const title = label(overlay, 'SuccessTitle', '通关成功', 0, 335, 61, 650, '#fff1cd').getComponent(Label)!;
        title.enableOutline = true; title.outlineColor = new Color(194, 124, 80); title.outlineWidth = 2;
        await sprite(overlay, 'SuccessStar', `${A}ui/over/output_icon_1`, 0, 160, 160);
        label(overlay, 'CompletedLevel', `第 ${level} 关完成`, 0, 10, 37, 550, '#fff1cd');
    }

    const reward = uiNode(overlay, 'Rewards', 0, screenY(1365), 760 * SCALE, 350 * SCALE);
    const rewardVisual = await sprite(reward, 'Visual', `${A}ui/over/bg`, 0, 0,
        760 * SCALE / UNITY_SCALE, 350 * SCALE / UNITY_SCALE);
    rewardVisual.setScale(UNITY_SCALE, UNITY_SCALE, 1);
    const rewardSprite = rewardVisual.getComponent(Sprite)!;
    const rewardFrame = rewardSprite.spriteFrame!.clone();
    rewardFrame.insetLeft = 167; rewardFrame.insetRight = 163; rewardFrame.insetTop = 0; rewardFrame.insetBottom = 0;
    rewardSprite.spriteFrame = rewardFrame;
    rewardSprite.type = Sprite.Type.SLICED;
    rewardVisual.on(Node.EventType.NODE_DESTROYED, () => rewardFrame.destroy());
    label(reward, 'Title', '通关奖励', 0, 81.3, 36.1, 480, '#af6c35');
    await sprite(reward, 'CoinsIcon', `${A}ui/itemicon/gold`, -104.2, 0, 83.3, 83.3);
    label(reward, 'CoinsEarned', `+${Math.max(0, coinsReward)}`, -104.2, -69.4, 27.8, 125, '#7b6534');
    await sprite(reward, 'StarsIcon', `${A}ui/over/output_icon_1`, 104.2, 0, 88.9, 88.9);
    label(reward, 'StarsEarned', `+${Math.max(0, stars)}`, 104.2, -69.4, 27.8, 125, '#7b6534');

    if (reveal) reveal.add(reward,1.5,.22,.06,1.04,25*UNITY_SCALE);
    const next = await slicedSprite(overlay, 'NextLevel', `${A}extras/green_button_931`, 0, screenY(1660), 370 * SCALE, 165 * SCALE);
    label(next, 'Text', nextLabel, 0, 3, 41, 250, '#548a1a');
    let leaving = false;
    const leave = (callback: () => void) => {
        if (leaving) return;
        leaving = true;
        nextButton.interactable = false;
        dismissPopup(overlay, callback);
    };
    const nextButton = tap(next, () => leave(onNext));
    if (reveal) {
        nextButton.interactable = false;
        reveal.add(nextButton.node,1.8,.001,.001,1,0,() => {nextButton.interactable=true;});
    }
    // The first-level reference has exactly one action.
    if (!preview && level !== 1 && onHome) {
        const home = label(overlay, 'BackHome', '返回主页', 0, -560, 25, 280, '#fff1cd');
        tap(home, () => leave(onHome));
    }
    presentPopup(overlay, {openDuration: 0.5, closeDuration: 0.3, openSound: true});
    return overlay;
}
