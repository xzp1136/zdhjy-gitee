import { loadFlowerAsset } from './FlowerAssets';
import { JsonAsset, Label, Node } from 'cc';
import { dismissPopup, label, loadFrame, modal, popupButton, popupFrame, popupIcon, popupInset, preloadPopupFrames,
    presentPopup, sprite, tap, uiNode } from './FlowerUI';

const A = 'original/';

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

/** Optional preloading avoids showing cards one at a time at the end of a level. */
export async function preloadWinResult(level: number): Promise<void> {
    const skin = preloadPopupFrames(['coin', 'star', 'victory']);
    if (level === 1) {
        const bouquets = loadFirstLevelPreview().then(data => {
            const paths = new Set<string>();
            for (const bouquet of data.bouquets) for (const layer of bouquet.layers) paths.add(layer.resource);
            return Promise.all(Array.from(paths, path => loadFrame(path)));
        });
        await Promise.all([skin, bouquets]);
    } else {
        await skin;
    }
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
    const x = (index % 3 - 1) * 196;
    const y = index < 3 ? 275 : 52;
    const card = await popupInset(parent, `UnlockBouquet${index}`, x, y, 181, 211);
    const bounds = previewBounds(bouquet.layers);
    const scale = Math.min(151 / bounds.width, 150 / bounds.height);
    const art = uiNode(card, 'Bouquet', 0, 18, 151, 150);
    for (let i = 0; i < bouquet.layers.length; i++) {
        const layer = bouquet.layers[i];
        const part = await sprite(art, `Layer${i}`, layer.resource,
            (layer.x - bounds.x) * scale, (layer.y - bounds.y) * scale,
            layer.width * scale, layer.height * scale);
        part.angle = layer.angle ?? 0;
    }
    const name = label(card, 'BouquetName', bouquet.name, 0, -76, 24, 156, '#7c4d27').getComponent(Label)!;
    name.overflow = Label.Overflow.SHRINK;
    name.enableWrapText = false;
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
    if (!parent.isValid) return parent;
    const overlay = modal(parent, 'WinResultOverlay');
    await popupFrame(overlay, '通关成功', 678, preview ? 1020 : 824);

    if (preview) {
        label(overlay, 'NextBouquetsTitle', '解锁新花束', 0, 410, 30, 510, '#694727', 'display');
        for (let i = 0; i < preview.bouquets.length; i++) await bouquetCard(overlay, preview.bouquets[i], i);
    } else {
        await popupIcon(overlay, 'SuccessStar', 'victory', 0, 216, 220);
        label(overlay, 'CompletedLevel', `第 ${level} 关完成`, 0, 66, 41, 550, '#2b67a9', 'display');
    }

    const reward = await popupInset(overlay, 'Rewards', 0, preview ? -158 : -100, 523, 152);
    label(reward, 'Title', '通关奖励', 0, 41, 31, 420, '#80512a', 'display');
    await popupIcon(reward, 'CoinsIcon', 'coin', -159, -20, 67);
    label(reward, 'CoinsEarned', `+${Math.max(0, coinsReward)}`, -71, -20, 35, 113, '#80512a', 'display');
    await popupIcon(reward, 'StarsIcon', 'star', 62, -20, 67);
    label(reward, 'StarsEarned', `+${Math.max(0, stars)}`, 151, -20, 35, 113, '#80512a', 'display');

    const next = await popupButton(overlay, 'NextLevel', nextLabel, 0, preview ? -348 : -257, 309, 105);
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
        const home = await popupButton(overlay, 'BackHome', '返回主页', 0, -350, 204, 72, 'blue');
        tap(home, () => leave(onHome));
    }
    presentPopup(overlay, {openDuration: 0.5, closeDuration: 0.3, openSound: true});
    return overlay;
}
