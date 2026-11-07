import { Node, Sprite, sys } from 'cc';
import { dismissPopup, label, loadFrame, message, modal, presentPopup, slicedSprite, sprite, tap, uiNode } from './FlowerUI';

const A = 'original/';
const U = 750 / 1080;
const artPaths = [
    'extras/wood_bg_860', 'ui/over/tittlefail', 'ui/over/image8', 'extras/pink_484',
    'extras/green_button_931', 'ui/over/homeicon', 'ui/over/buttonback',
    'ui/over/output_icon_5', 'ui/over/jmtili', 'extras/bg1_816',
];

export async function preloadFailure(): Promise<void> {
    await Promise.all(artPaths.map(path => loadFrame(A + path)));
}

/** Keep texture borders in native pixels; scale only the visual child. */
async function slicedArt(parent: Node, name: string, path: string, x: number, y: number,
    width: number, height: number, left: number, right: number, top: number, bottom: number): Promise<Node> {
    const root = uiNode(parent, name, x, y, width * U, height * U);
    const visual = await sprite(root, 'Visual', path, 0, 0, width, height);
    visual.setScale(U, U, 1);
    const renderer = visual.getComponent(Sprite)!;
    const frame = renderer.spriteFrame!.clone();
    frame.insetLeft = left; frame.insetRight = right; frame.insetTop = top; frame.insetBottom = bottom;
    renderer.spriteFrame = frame; renderer.type = Sprite.Type.SLICED;
    visual.on(Node.EventType.NODE_DESTROYED, () => frame.destroy());
    return root;
}

/** Display an ended round; retry never claims to charge hearts or play an ad. */
export async function createFailure(
    parent: Node,
    reason: string,
    onRetry: () => void,
    onHome: () => void,
): Promise<Node> {
    await preloadFailure();
    const overlay = modal(parent, 'FailureOverlay', '#141414eb');
    await slicedArt(overlay, 'WoodenFrame', `${A}extras/wood_bg_860`, 0, -27 * U, 944, 850, 100, 100, 100, 100);
    await sprite(overlay, 'FailureTitle', `${A}ui/over/tittlefail`, 0, 548 * U, 839 * U, 269 * U);
    await sprite(overlay, 'FlowerShopIllustration', `${A}ui/over/image8`, 0, 61 * U, 806 * U, 543.1 * U);

    const rawEnergy = sys.localStorage.getItem('zdhjy.energy');
    const energy = rawEnergy == null || rawEnergy === '' ? 5 : Number(rawEnergy);
    const energyBar = await sprite(overlay, 'Energy', `${A}ui/over/buttonback`, -353 * U, 711 * U, 220 * U, 100 * U);
    await sprite(energyBar, 'Heart', `${A}ui/over/output_icon_5`, -55 * U, 1.4 * U, 65 * U, 65 * U);
    label(energyBar, 'EnergyValue', String(Number.isFinite(energy) && energy >= 0 ? Math.floor(energy) : 5), 3 * U, 0, 40 * U, 75 * U);
    const addEnergy = await sprite(energyBar, 'EnergyInfo', `${A}ui/over/jmtili`, 69.6 * U, 1.4 * U, 46 * U, 47 * U);
    let informationOpen = false;
    tap(addEnergy, () => {
        if (informationOpen) return;
        informationOpen = true;
        void message(overlay, '体力', '当前版本可直接重试关卡', '知道了', () => { informationOpen = false; });
    });

    let leaving = false;
    const leave = (callback: () => void) => {
        if (leaving || informationOpen) return;
        leaving = true;
        dismissPopup(overlay, callback);
    };
    const home = await slicedArt(overlay, 'FailureHome', `${A}extras/pink_484`, -248 * U, -324 * U, 264, 180, 115, 123, 0, 0);
    await sprite(home, 'Icon', `${A}ui/over/homeicon`, -58 * U, 8 * U, 60 * U, 62.4 * U);
    label(home, 'Text', '主页', 31 * U, 8 * U, 50 * U, 200 * U, '#c33740');
    tap(home, () => leave(onHome));
    const retry = await slicedSprite(overlay, 'Retry', `${A}extras/green_button_931`, 189 * U, -324 * U, 398 * U, 180 * U);
    label(retry, 'Text', '再来一局', 0, 8 * U, 50 * U, 370 * U, '#69a32a');
    tap(retry, () => leave(onRetry));
    presentPopup(overlay, {openDuration: 0.5, closeDuration: 0.3, openSound: true});
    return overlay;
}
