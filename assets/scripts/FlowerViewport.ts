import { Node, ResolutionPolicy, screen, sys, UITransform, view } from 'cc';

export interface FlowerViewport {
    width: number; height: number;
    safeLeft: number; safeRight: number; safeTop: number; safeBottom: number;
    topShift: number; bottomShift: number; centerY: number;
}
interface Area { x: number; y: number; width: number; height: number }
interface WechatViewport {
    getMenuButtonBoundingClientRect?: () => { bottom: number; width: number; height: number };
    getWindowInfo?: () => { windowWidth: number };
    getSystemInfoSync?: () => { windowWidth: number };
}

/** Inputs are in Cocos design units; safe-area coordinates start at bottom left. */
export function calculateFlowerViewport(width: number, height: number, safe?: Area, capsuleBottom?: number): FlowerViewport {
    width = Number.isFinite(width) && width > 0 ? width : 750;
    height = Number.isFinite(height) && height > 0 ? height : 1334;
    const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
    const valid = safe && [safe.x, safe.y, safe.width, safe.height].every(Number.isFinite) && safe.width > 0 && safe.height > 0;
    const left = valid ? clamp(safe!.x, 0, width) : 0;
    const right = valid ? clamp(safe!.x + safe!.width, left, width) : width;
    const bottom = valid ? clamp(safe!.y, 0, height) : 0;
    let top = valid ? clamp(safe!.y + safe!.height, bottom, height) : height;
    if (Number.isFinite(capsuleBottom) && capsuleBottom! > height / 2 && capsuleBottom! < height) {
        top = Math.min(top, capsuleBottom! - 8);
    }
    const safeTop = top - height / 2, safeBottom = bottom - height / 2;
    return {width, height, safeLeft: left - width / 2, safeRight: right - width / 2, safeTop, safeBottom,
        // The pause hit area reaches y=611; keep it inside the device/capsule boundary.
        topShift: Math.min((height - 1334) / 2, safeTop - 611),
        bottomShift: safeBottom + 667, centerY: (safeTop + safeBottom) / 2};
}

export function getFlowerViewport(): FlowerViewport {
    const size = view.getVisibleSize();
    let safe: Area | undefined, capsuleBottom: number | undefined;
    try { safe = sys.getSafeAreaRect(false); } catch (_) { /* Desktop previews may not expose a safe rectangle. */ }
    if (sys.platform === sys.Platform.WECHAT_GAME) {
        const wx = (globalThis as unknown as {wx?: WechatViewport}).wx;
        try {
            const menu = wx?.getMenuButtonBoundingClientRect?.();
            const info = wx?.getWindowInfo?.() ?? wx?.getSystemInfoSync?.();
            if (menu && menu.width > 0 && menu.height > 0 && info && info.windowWidth > 0) {
                const pixelsPerPoint = screen.windowSize.width / info.windowWidth;
                capsuleBottom = (screen.windowSize.height - menu.bottom * pixelsPerPoint - view.getViewportRect().y) / view.getScaleY();
            }
        } catch (_) { /* Use the device safe rectangle when the capsule API is unavailable. */ }
    }
    return calculateFlowerViewport(size.width, size.height, safe, capsuleBottom);
}

/** Keep the entire render surface active. Short/wide displays gain horizontal room. */
export function configureFlowerViewport(owner: Node): void {
    let policy = -1, applying = false;
    const apply = () => {
        if (applying || !owner.isValid) return;
        const size = screen.windowSize;
        const next = size.height / size.width >= 1334 / 750 ? ResolutionPolicy.FIXED_WIDTH : ResolutionPolicy.FIXED_HEIGHT;
        if (next === policy) return;
        applying = true; policy = next;
        try { view.setDesignResolutionSize(750, 1334, next); }
        finally { applying = false; }
    };
    apply();
    screen.on('window-resize', apply);
    owner.on(Node.EventType.NODE_DESTROYED, () => screen.off('window-resize', apply));
}

/** Layout only moves anchors; animations retain ownership of their visual children. */
export function bindFlowerViewport(owner: Node, apply: (viewport: FlowerViewport) => void): () => void {
    const update = () => { if (owner.isValid) apply(getFlowerViewport()); };
    const dispose = () => {
        view.off('canvas-resize', update); view.off('design-resolution-changed', update);
        owner.off(Node.EventType.NODE_DESTROYED, dispose);
    };
    view.on('canvas-resize', update); view.on('design-resolution-changed', update);
    owner.on(Node.EventType.NODE_DESTROYED, dispose);
    update();
    return dispose;
}

export function coverFlowerArt(node: Node, viewport: FlowerViewport, artWidth = 750, artHeight = 1334): void {
    const scale = Math.max(viewport.width / artWidth, viewport.height / artHeight);
    node.getComponent(UITransform)!.setContentSize(artWidth * scale, artHeight * scale);
    node.setPosition(0, 0, 0);
}
