import { Node } from 'cc';
import { dismissPopup, label, loadFrame, message, modal, presentPopup, slicedSprite, sprite, tap } from './FlowerUI';

const A = 'original/';
const art = ['extras/bg1_816', 'extras/bg21_373', 'extras/tittlebg_305', 'extras/tittlede_line_491',
    'extras/image6_704', 'extras/closed_843', 'extras/pink_484', 'extras/green_button_931',
    'extras/adsgreen_992', 'ui/itemicon/gold', 'ui/over/buttonback'];

export async function preloadContinue(): Promise<void> {
    await Promise.all(art.map(path => loadFrame(A + path)));
}

/** The observed time-out offer; only a successful local coin purchase resumes. */
export async function createTimeContinue(parent: Node, coins: number,
    onPurchase: () => boolean, onDecline: () => void): Promise<Node> {
    await preloadContinue();
    const overlay = modal(parent, 'TimeContinueOverlay', '#000000bc');
    const balance = await sprite(overlay, 'CoinBalance', A + 'ui/over/buttonback', -257, 453, 170, 52);
    await sprite(balance, 'Coin', A + 'ui/itemicon/gold', -35, 0, 42);
    label(balance, 'Value', String(coins), 35, 0, 29, 80);
    await sprite(overlay, 'PaperStack', A + 'extras/bg21_373', 0, -104, 615, 87);
    await slicedSprite(overlay, 'Paper', A + 'extras/bg1_816', 0, 137, 656, 522);
    await slicedSprite(overlay, 'TitleBacking', A + 'extras/tittlebg_305', 0, 286, 277, 78);
    await sprite(overlay, 'TitleLeft', A + 'extras/tittlede_line_491', -194, 286, 103, 17);
    const right = await sprite(overlay, 'TitleRight', A + 'extras/tittlede_line_491', 194, 286, 103, 17);
    right.setScale(-1, 1, 1);
    label(overlay, 'Title', '时间到了', 0, 288, 85 * 750 / 1080, 350, '#b8793f', 'display');
    await sprite(overlay, 'ClockGirl', A + 'extras/image6_704', 0, 94, 222, 229);
    label(overlay, 'Hint', '再加120秒你一定可以！', 0, -65, 29, 570, '#4f3b22');
    let leaving = false, explaining = false;
    const leave = (action: () => void) => {
        if (leaving || explaining) return;
        leaving = true; dismissPopup(overlay, action);
    };
    const info = async (title: string, body: string) => {
        if (leaving || explaining) return;
        explaining = true;
        await message(overlay, title, body, '知道了', () => { explaining = false; });
    };
    const close = await sprite(overlay, 'Close', A + 'extras/closed_843', 281, 292, 78, 80);
    tap(close, () => leave(onDecline));
    const purchase = await slicedSprite(overlay, 'ContinueWithCoins', A + 'extras/pink_484', -156, -259, 246, 102);
    await sprite(purchase, 'Coin', A + 'ui/itemicon/gold', -64, 0, 39);
    label(purchase, 'Text', '100 继续', 28, 0, 31, 180, '#d84f56');
    tap(purchase, () => {
        if (leaving || explaining) return;
        if (coins < 100) { void info('金币不足', '继续游戏需要100金币。'); return; }
        if (onPurchase()) { leaving = true; dismissPopup(overlay); }
    });
    const video = await sprite(overlay, 'ContinueWithVideo', A + 'extras/green_button_931', 156, -259, 246, 102);
    await sprite(video, 'VideoIcon', A + 'extras/adsgreen_992', -45, 0, 45);
    label(video, 'Text', '继续', 35, 0, 32, 125, '#659e2a');
    tap(video, () => void info('视频暂不可用', '暂时无法获取视频，请稍后再试。'));
    presentPopup(overlay, { openSound: true, closeSound: true });
    return overlay;
}
