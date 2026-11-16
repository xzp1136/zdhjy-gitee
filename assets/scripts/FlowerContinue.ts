import { Node } from 'cc';
import { dismissPopup, label, message, modal, popupButton, popupClose, popupFrame, popupIcon, popupInset,
    preloadPopupFrames, presentPopup, tap } from './FlowerUI';
import { rewardedVideo } from './FlowerRewardedVideo';

export async function preloadContinue(): Promise<void> {
    await preloadPopupFrames(['alarm', 'coin', 'video']);
}

export async function createTimeContinue(parent: Node, coins: number,
    onPurchase: () => boolean, onDecline: () => void, onVideoReward: () => boolean): Promise<Node> {
    await preloadContinue();
    if (!parent.isValid) return parent;
    const overlay = modal(parent, 'TimeContinueOverlay');
    await popupFrame(overlay, '时间到了', 650, 708);
    await popupIcon(overlay, 'Alarm', 'alarm', 0, 136, 230);
    label(overlay, 'BonusTime', '+120 秒', 0, -15, 48, 458, '#2b67a9', 'display');
    label(overlay, 'Hint', '再加一点时间，继续完成花束！', 0, -77, 29, 540, '#694727');
    const balance = await popupInset(overlay, 'CoinBalance', 0, -146, 222, 57);
    await popupIcon(balance, 'Coin', 'coin', -68, 0, 45);
    label(balance, 'Value', String(coins), 23, 0, 29, 132, '#7a4b23');

    let leaving = false, explaining = false, claiming = false;
    const leave = (action: () => void) => {
        if (leaving || explaining || claiming) return;
        leaving = true; dismissPopup(overlay, action);
    };
    const info = async (title: string, body: string) => {
        if (leaving || explaining || claiming) return;
        explaining = true;
        await message(overlay, title, body, '知道了', () => { explaining = false; });
    };
    await popupClose(overlay, 'Close', 274, 320, () => leave(onDecline));
    const purchase = await popupButton(overlay, 'ContinueWithCoins', '100 继续', -145, -245, 260, 98, 'blue', 'coin');
    tap(purchase, () => {
        if (leaving || explaining || claiming) return;
        if (coins < 100) { void info('金币不足', '继续游戏需要100金币。'); return; }
        if (onPurchase()) { leaving = true; dismissPopup(overlay); }
    });
    const video = await popupButton(overlay, 'ContinueWithVideo', '继续', 145, -245, 260, 98, 'green', 'video');
    tap(video, () => {
        if (leaving || explaining || claiming) return;
        claiming = true;
        void rewardedVideo.claim('time-continue', onVideoReward, () => overlay.isValid && !leaving)
            .then(granted => {
                if (granted && overlay.isValid) { leaving = true; dismissPopup(overlay); }
            })
            .catch(() => {
                claiming = false;
                if (overlay.isValid && !leaving) void info('领取未完成', '请再试一次。');
            })
            .then(() => { claiming = false; });
    });
    presentPopup(overlay, {openSound: true, closeSound: true});
    return overlay;
}
