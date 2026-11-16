import { Node, sys } from 'cc';
import { dismissPopup, label, message, modal, popupButton, popupFrame, popupIcon, popupInset, preloadPopupFrames,
    presentPopup, tap } from './FlowerUI';

export async function preloadFailure(): Promise<void> {
    await preloadPopupFrames(['wilted', 'heart', 'plus']);
}

/** Display an ended round. Retry is free in the current rules. */
export async function createFailure(parent: Node, reason: string, onRetry: () => void, onHome: () => void): Promise<Node> {
    await preloadFailure();
    if (!parent.isValid) return parent;
    const overlay = modal(parent, 'FailureOverlay');
    await popupFrame(overlay, '挑战结束', 650, 705);
    await popupIcon(overlay, 'WiltedFlower', 'wilted', 0, 129, 235);
    const hint = reason === 'buffer' ? '暂存位已满' : '本关时间用完了';
    label(overlay, 'FailureReason', hint, 0, -25, 42, 510, '#8f462d', 'display');
    label(overlay, 'RetryHint', '再试一次，把花束整理好吧！', 0, -83, 28, 540, '#694727');

    const rawEnergy = sys.localStorage.getItem('zdhjy.energy');
    const energy = rawEnergy == null || rawEnergy === '' ? 5 : Number(rawEnergy);
    const energyBar = await popupInset(overlay, 'Energy', 0, -148, 218, 60);
    await popupIcon(energyBar, 'Heart', 'heart', -69, 0, 48);
    label(energyBar, 'EnergyValue', String(Number.isFinite(energy) && energy >= 0 ? Math.floor(energy) : 5), 0, 0, 31, 90, '#764827');
    const addEnergy = await popupIcon(energyBar, 'EnergyInfo', 'plus', 73, 0, 50);
    let informationOpen = false;
    tap(addEnergy, () => {
        if (informationOpen) return;
        informationOpen = true;
        void message(overlay, '体力', '当前版本可直接重试关卡', '知道了', () => { informationOpen = false; }, 'heart');
    });

    let leaving = false;
    const leave = (callback: () => void) => {
        if (leaving || informationOpen) return;
        leaving = true;
        dismissPopup(overlay, callback);
    };
    const home = await popupButton(overlay, 'FailureHome', '主页', -157, -248, 193, 93, 'blue');
    tap(home, () => leave(onHome));
    const retry = await popupButton(overlay, 'Retry', '再来一局', 107, -248, 295, 101);
    tap(retry, () => leave(onRetry));
    presentPopup(overlay, {openDuration: 0.5, closeDuration: 0.3, openSound: true});
    return overlay;
}
