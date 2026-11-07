import { loadFlowerAsset } from './FlowerAssets';
import { Button, Color, JsonAsset, Label, Node, Sprite } from 'cc';
import { dismissPopup, label, loadFrame, modal, presentPopup, slicedSprite, sprite, tap, uiNode } from './FlowerUI';

const A = 'original/';
const SCALE = 750 / 1052;
const UNITY_SCALE = 750 / 1080;
const screenX = (x: number) => (x - 526) * SCALE;
const screenY = (y: number) => 667 - (y - 88) * SCALE;

export interface BouquetPreviewLayer {
    resource: string;
    x: number;
    y: number;
    width: number;
    height: number;
    angle?: number;
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

const sharedFrames = [
    `${A}ui/over/bg`, `${A}ui/itemicon/gold`, `${A}ui/over/output_icon_1`, `${A}extras/green_button_931`,
];

/** Optional preloading avoids showing cards one at a time at the end of a level. */
export async function preloadWinResult(level: number): Promise<void> {
    const paths = [...sharedFrames];
    if (level === 1) {
        const data = await loadFirstLevelPreview();
        paths.push(`${A}ui/over/tittle`, `${A}ui/over/bunchcard`, `${A}ui/over/new`);
        for (const bouquet of data.bouquets) paths.push(...bouquet.layers.map(layer => layer.resource));
    }
    await Promise.all([...new Set(paths)].map(path => loadFrame(path)));
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

async function bouquetCard(parent: Node, bouquet: BouquetPreview, index: number): Promise<void> {
    const x = screenX([260, 527, 793][index % 3]);
    const y = screenY(index < 3 ? 645 : 985);
    const card = await sprite(parent, `UnlockBouquet${index}`, `${A}ui/over/bunchcard`, x, y, 240 * SCALE, 320 * SCALE);
    const bounds = previewBounds(bouquet.layers);
    const scale = Math.min(151 / bounds.width, 165 / bounds.height);
    const art = uiNode(card, 'Bouquet', 0, 27, 151, 165);
    for (let i = 0; i < bouquet.layers.length; i++) {
        const layer = bouquet.layers[i];
        const part = await sprite(art, `Layer${i}`, layer.resource,
            (layer.x - bounds.x) * scale, (layer.y - bounds.y) * scale,
            layer.width * scale, layer.height * scale);
        part.angle = layer.angle ?? 0;
    }
    await sprite(card, 'NewBouquet', `${A}ui/over/new`, 70.5, 99.6, 46.5, 39.6);
    label(card, 'BouquetName', bouquet.name, 0, -84.3, 27.8, 168, '#c64b4f');
}

/**
 * First-level win matches the observed six-bouquet preview. Other levels show
 * only their actual result and rewards until a corresponding preview is verified.
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
    let preview: PreviewData | null = null;
    if (level === 1) {
        try {
            await preloadWinResult(level);
            preview = await loadFirstLevelPreview();
        } catch (error) {
            // Never substitute guessed bouquet names or unrelated art.
            console.warn('[FlowerResults] Verified preview unavailable; showing earned rewards.', error);
            await preloadWinResult(0);
        }
    } else await preloadWinResult(level);
    const overlay = modal(parent, 'WinResultOverlay', '#141414eb');

    if (preview) {
        await sprite(overlay, 'NextBouquetsTitle', `${A}ui/over/tittle`, 0, screenY(365), 960 * SCALE);
        for (let i = 0; i < preview.bouquets.length; i++) await bouquetCard(overlay, preview.bouquets[i], i);
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
    // The first-level reference has exactly one action.
    if (!preview && level !== 1 && onHome) {
        const home = label(overlay, 'BackHome', '返回主页', 0, -560, 25, 280, '#fff1cd');
        tap(home, () => leave(onHome));
    }
    presentPopup(overlay, {openDuration: 0.5, closeDuration: 0.3, openSound: true});
    return overlay;
}
