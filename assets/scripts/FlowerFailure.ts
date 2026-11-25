import { Node, sys } from 'cc';
import { dismissPopup, label, message, modal, popupButton, popupFrame, popupIcon, popupInset, preloadPopupFrames,
    presentPopup, tap } from './FlowerUI';
import { rewardedVideo } from './FlowerRewardedVideo';

export async function preloadFailure(): Promise<void> {
    await preloadPopupFrames(['wilted', 'heart', 'plus', 'video']);
}

/** Display an ended round. Retry is free in the current rules. */
export async function createFailure(parent: Node, reason: string, onRetry: () => void, onHome: () => void,
    onRevive?: () => boolean | Promise<boolean>): Promise<Node> {
    await preloadFailure();
    if (!parent.isValid) return parent;
    const overlay = modal(parent, 'FailureOverlay');
    await popupFrame(overlay, '挑战结束', 650, 705);
    await popupIcon(overlay, 'WiltedFlower', 'wilted', 0, 129, 235);
    const hint = reason === 'buffer' ? '暂存区已满，挑战失败' : '本关时间用完了';
    label(overlay, 'FailureReason', hint, 0, -25, 42, 510, '#8f462d', 'display');
    const reviveHint = reason === 'buffer' ? '复活将解锁一个槽位，并清空暂存花朵' : '复活可增加 120 秒，继续完成花束';
    label(overlay, 'RetryHint', onRevive ? reviveHint : '再试一次，把花束整理好吧！', 0, -83, 28, 540, '#694727');

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

    let leaving = false, claiming = false;
    const leave = (callback: () => void) => {
        if (leaving || informationOpen || claiming) return;
        leaving = true;
        dismissPopup(overlay, callback);
    };
    if (onRevive) {
        const home = await popupButton(overlay, 'FailureHome', '主页', -215, -248, 156, 93, 'blue');
        tap(home, () => leave(onHome));
        const retry = await popupButton(overlay, 'Retry', '重玩', -29, -248, 178, 93, 'coral');
        tap(retry, () => leave(onRetry));
        const revive = await popupButton(overlay, 'Revive', '复活', 198, -248, 226, 101, 'green', 'video');
        tap(revive, () => {
            if (leaving || informationOpen || claiming) return;
            claiming = true;
            void rewardedVideo.claim(`failure-${reason}`, onRevive, () => overlay.isValid && !leaving)
                .then(granted => {
                    if (granted && overlay.isValid) { leaving = true; dismissPopup(overlay); }
                })
                .catch(() => {
                    if (overlay.isValid && !leaving) {
                        void message(overlay, '复活未完成', '请再试一次。', '知道了');
                    }
                })
                .then(() => { claiming = false; });
        });
    } else {
        const home = await popupButton(overlay, 'FailureHome', '主页', -157, -248, 193, 93, 'blue');
        tap(home, () => leave(onHome));
        const retry = await popupButton(overlay, 'Retry', '再来一局', 107, -248, 295, 101);
        tap(retry, () => leave(onRetry));
    }
    presentPopup(overlay, {openDuration: 0.5, closeDuration: 0.3, openSound: true});
    return overlay;
}
