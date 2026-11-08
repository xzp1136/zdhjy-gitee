import { sys } from 'cc';

declare const wx: {
    vibrateShort?: (options: {type: 'light'; fail: () => void}) => void;
};

const TAP_INTERVAL_MS = 90;
let lastTapTime = -Infinity;

/** Optional feedback for an accepted flower tap; never delays the game action. */
export function vibrateFlowerTap(): void {
    try {
        // Match the pause menu: only the saved string "off" disables vibration.
        if (sys.localStorage.getItem('zdhjy.vibrate') === 'off') return;
        const now = Date.now();
        if (now >= lastTapTime && now - lastTapTime < TAP_INTERVAL_MS) return;

        if (sys.platform === sys.Platform.WECHAT_GAME) {
            if (typeof wx === 'undefined' || typeof wx.vibrateShort !== 'function') return;
            lastTapTime = now;
            wx.vibrateShort({type: 'light', fail: () => {}});
        } else if (sys.isBrowser && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            lastTapTime = now;
            // The browser API accepts duration only, not an intensity setting.
            navigator.vibrate(12);
        }
    } catch {
        // Storage or platform failures must not interrupt a valid flower move.
    }
}
