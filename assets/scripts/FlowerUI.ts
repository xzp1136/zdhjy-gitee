import { loadFlowerAsset } from './FlowerAssets';
import { BlockInputEvents, Button, Color, Font, game, Graphics, JsonAsset, Label, Node, Sprite, SpriteFrame, sys, tween, Tween, UITransform, UIOpacity, Vec3 } from 'cc';
import { ButtonMotionOptions, FlowerButtonMotion } from './FlowerButtonMotion';
import { bindFlowerViewport } from './FlowerViewport';

const frames = new Map<string, Promise<SpriteFrame>>();
type Typeface = 'body' | 'display';
const typefaces: Partial<Record<Typeface, Font>> = {};
let coverage: Record<Typeface, Set<string>> = {body: new Set(), display: new Set()};
let typography: Promise<void> | null = null;
const quotedWechatFonts = new WeakSet<Font>();

function quoteWechatFontFamily(font: Font): void {
    if (sys.platform !== sys.Platform.WECHAT_GAME || quotedWechatFonts.has(font)) return;
    const family = font._nativeAsset;
    if (typeof family !== 'string' || !family) return;
    // WeChat returns the native family verbatim; Cocos inserts it into the
    // canvas font shorthand. CSS quoting preserves punctuation and controls.
    font._nativeAsset = `"${family.replace(/["\\\x00-\x1f\x7f]/g,
        character => '\\' + character.charCodeAt(0).toString(16) + ' ')}"`;
    quotedWechatFonts.add(font);
}

const fonts = new Map<string, Promise<Font>>();
export function loadGameFont(path: string): Promise<Font> {
    if (!fonts.has(path)) fonts.set(path, new Promise<Font>((resolve, reject) => {
        loadFlowerAsset(path, Font, (error, font) => {
            if (error) { fonts.delete(path); reject(error); return; }
            quoteWechatFontFamily(font);
            resolve(font);
        });
    }));
    return fonts.get(path)!;
}

/** Load the two embedded original fonts before constructing any visible UI. */
export function preloadTypography(): Promise<void> {
    if (!typography) typography = Promise.all([
        loadGameFont('original/fonts/AlibabaPuHuiTi-2-65-Medium'),
        loadGameFont('original/fonts/ZhanKuXiaoLOGOTi-2'),
        new Promise<JsonAsset>((resolve, reject) => loadFlowerAsset('original/fonts/font-coverage', JsonAsset,
            (error, asset) => error ? reject(error) : resolve(asset))),
    ]).then(([body, display, chars]) => {
        typefaces.body = body; typefaces.display = display;
        const data = chars.json as Record<Typeface, string>;
        coverage = {body: new Set(data.body), display: new Set(data.display)};
    }).catch(error => { typography = null; throw error; });
    return typography;
}

/** Resource paths are relative to assets/without the file extension. */
export function loadFrame(path: string): Promise<SpriteFrame> {
    if (!frames.has(path)) frames.set(path, new Promise((resolve, reject) => {
        loadFlowerAsset(`${path}/spriteFrame`, SpriteFrame, (error, frame) => {
            if (error) { frames.delete(path); reject(error); } else resolve(frame);
        });
    }));
    return frames.get(path)!;
}

export function uiNode(parent: Node, name: string, x = 0, y = 0, width = 750, height = 1334): Node {
    const node = new Node(name);
    node.layer = parent.layer;
    node.addComponent(UITransform).setContentSize(width, height);
    node.setPosition(x, y);
    parent.addChild(node);
    return node;
}

export async function sprite(parent: Node, name: string, path: string, x: number, y: number, width: number, height?: number): Promise<Node> {
    const frame = await loadFrame(path);
    const h = height ?? width * frame.originalSize.height / frame.originalSize.width;
    const node = uiNode(parent, name, x, y, width, h);
    const renderer = node.addComponent(Sprite);
    renderer.sizeMode = Sprite.SizeMode.CUSTOM;
    if (path.startsWith('original/flower/') || path.startsWith('original/uiflower/')
        || path.startsWith('greenhouse/toys/')) renderer.trim = false;
    renderer.spriteFrame = frame;
    return node;
}

/** Fit irregular flower art into a UI slot without stretching its petals. */
export async function fittedSprite(parent: Node, name: string, path: string, x: number, y: number, width: number, height: number): Promise<Node> {
    const frame = await loadFrame(path);
    const ratio = Math.min(width / frame.originalSize.width, height / frame.originalSize.height);
    return sprite(parent, name, path, x, y, frame.originalSize.width * ratio, frame.originalSize.height * ratio);
}

const POPUP_ART = 'greenhouse/popup/';
const popupInsets: Record<string, [number, number, number, number]> = {
    [POPUP_ART + 'frame']: [49, 43, 49, 47],
    [POPUP_ART + 'inset']: [28, 27, 28, 27],
    [POPUP_ART + 'button-green']: [42, 0, 42, 0],
    [POPUP_ART + 'button-blue']: [42, 0, 42, 0],
    [POPUP_ART + 'button-coral']: [42, 0, 42, 0],
};

/** Scale the artwork at the 1080px art baseline and keep the hit area independent. */
async function slicedSprite(parent: Node, name: string, path: string, x: number, y: number, width: number, height: number): Promise<Node> {
    const border = popupInsets[path];
    if (!border) throw new Error(`Missing verified slice borders: ${path}`);
    const unit = 750 / 1080;
    const root = uiNode(parent, name, x, y, width, height);
    const visual = await sprite(root, 'SlicedVisual', path, 0, 0, width / unit, height / unit);
    visual.setScale(unit, unit, 1);
    const renderer = visual.getComponent(Sprite)!;
    const frame = renderer.spriteFrame!.clone();
    [frame.insetLeft, frame.insetTop, frame.insetRight, frame.insetBottom] = border;
    renderer.spriteFrame = frame;
    renderer.type = Sprite.Type.SLICED;
    visual.on(Node.EventType.NODE_DESTROYED, () => frame.destroy());
    return root;
}

export function label(parent: Node, name: string, text: string, x: number, y: number, fontSize: number, width = 300, color = '#ffffff', face: Typeface = 'body'): Node {
    const node = uiNode(parent, name, x, y, width, fontSize * 1.5);
    const component = node.addComponent(Label);
    // These are subset fonts. A local-only sentence with missing characters must
    // use the system fallback as a whole, including on native renderers.
    if (typefaces[face] && Array.from(text).every(char => /\s/u.test(char) || coverage[face].has(char))) {
        component.font = typefaces[face]!;
        component.useSystemFont = false;
    } else component.fontFamily = 'sans-serif';
    component.string = text;
    component.fontSize = fontSize;
    component.lineHeight = fontSize * 1.22;
    component.horizontalAlign = Label.HorizontalAlign.CENTER;
    component.verticalAlign = Label.VerticalAlign.CENTER;
    component.overflow = Label.Overflow.NONE;
    component.color = new Color().fromHEX(color);
    return node;
}

const popupFrameNames = ['frame', 'inset', 'title', 'close', 'button-green', 'button-blue', 'button-coral'];
export const preloadPopupFrames = (art: readonly string[] = []): Promise<SpriteFrame[]> =>
    Promise.all([...popupFrameNames, ...art].map(key => loadFrame(POPUP_ART + key)));

export function popupIcon(parent: Node, name: string, art: string, x: number, y: number, width: number, height = width): Promise<Node> {
    return fittedSprite(parent, name, POPUP_ART + art, x, y, width, height);
}

export function popupInset(parent: Node, name: string, x: number, y: number, width: number, height: number): Promise<Node> {
    return slicedSprite(parent, name, POPUP_ART + 'inset', x, y, width, height);
}

function popupHeading(parent: Node, name: string, text: string, x: number, y: number, size: number, width: number, outline: string): Node {
    const node = label(parent, name, text, x, y, size, width, '#fffdf0', 'display');
    const heading = node.getComponent(Label)!;
    heading.enableWrapText = false;
    heading.enableOutline = true;
    heading.outlineColor = new Color().fromHEX(outline);
    heading.outlineWidth = 2;
    const transform = node.getComponent(UITransform)!;
    // Fit the finished label and outline between the plaque ornaments.
    node.on(Node.EventType.SIZE_CHANGED, () => {
        const scale = width / Math.max(width, transform.width);
        node.setScale(scale, scale, 1);
    });
    return node;
}

export async function popupFrame(parent: Node, title: string, width: number, height: number, y = 0): Promise<void> {
    const titleY = y + height / 2 - 20;
    await slicedSprite(parent, 'PopupFrame', POPUP_ART + 'frame', 0, y, width, height);
    await sprite(parent, 'TitlePlate', POPUP_ART + 'title', 0, titleY, 359, 111);
    popupHeading(parent, 'Title', title, 0, titleY + 5, 54, 240, '#15559f');
}

export function popupClose(parent: Node, name: string, x: number, y: number, onClose: () => void): Promise<Node> {
    return popupIcon(parent, name, 'close', x, y, 78).then(node => { tap(node, onClose); return node; });
}

type PopupButtonTone = 'green' | 'blue' | 'coral';
const popupButtonOutlines: Record<PopupButtonTone, string> = {green: '#347e16', blue: '#15559f', coral: '#9e2859'};

export async function popupButton(parent: Node, name: string, text: string, x: number, y: number,
    width: number, height: number, tone: PopupButtonTone = 'green', icon?: string): Promise<Node> {
    const button = await slicedSprite(parent, name, POPUP_ART + 'button-' + tone, x, y, width, height);
    if (icon) await popupIcon(button, 'Icon', icon, -width / 2 + 38, 4, 43);
    popupHeading(button, 'Text', text, icon ? 20 : 0, 4, Math.min(36, height * 0.38), width - (icon ? 85 : 26), popupButtonOutlines[tone]);
    return button;
}

export function panel(parent: Node, name: string, x: number, y: number, width: number, height: number, color: string, radius = 0): Node {
    const node = uiNode(parent, name, x, y, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = new Color().fromHEX(color);
    if (radius > 0) graphics.roundRect(-width / 2, -height / 2, width, height, radius);
    else graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    return node;
}

const buttons = new WeakMap<Node, Button>();
/** The button owns a fixed hit root; only its visual child responds to pressure. */
export function tap(node: Node, callback: () => void, options: ButtonMotionOptions = {}): Button {
    const existing = buttons.get(node);
    if (existing) { existing.node.on(Button.EventType.CLICK, callback); return existing; }
    const transform = node.getComponent(UITransform)!;
    const position = new Vec3(node.position.x, node.position.y, node.position.z);
    const scale = new Vec3(node.scale.x, node.scale.y, node.scale.z);
    const index = node.getSiblingIndex(), angle = node.angle;
    const hit = uiNode(node.parent!, `${node.name}Hit`, position.x, position.y, transform.width, transform.height);
    hit.setPosition(position); hit.setScale(scale); hit.angle = angle;
    hit.getComponent(UITransform)!.setAnchorPoint(transform.anchorPoint);
    hit.setSiblingIndex(index);
    node.setParent(hit); node.setPosition(0, 0, 0); node.setScale(1, 1, 1); node.angle = 0;
    const button = hit.addComponent(Button);
    button.transition = Button.Transition.NONE;
    button.target = node;
    hit.addComponent(FlowerButtonMotion).configure(node, button, options);
    hit.on(Button.EventType.CLICK, () => {
        if (node.isValid && node.activeInHierarchy && button.interactable && button.enabledInHierarchy) callback();
    });
    buttons.set(node, button);
    let destroyingHit = false;
    hit.on(Node.EventType.NODE_DESTROYED, () => { destroyingHit = true; });
    // A caller may destroy the original visual directly (for example a rebuilt tray cell).
    node.on(Node.EventType.NODE_DESTROYED, () => {
        buttons.delete(node);
        if (!destroyingHit && hit.isValid) { hit.removeFromParent(); hit.destroy(); }
    });
    return button;
}

export function fade(node: Node, opacity: number): void {
    (node.getComponent(UIOpacity) ?? node.addComponent(UIOpacity)).opacity = opacity;
}

/** Keep an assembling popup invisible while its scrim already owns input. */
export function modal(parent: Node, name: string, color = '#172548ac'): Node {
    const overlay = panel(parent, name, 0, 0, 750, 1334, color);
    overlay.addComponent(BlockInputEvents);
    bindFlowerViewport(overlay, viewport => {
        overlay.getComponent(UITransform)!.setContentSize(viewport.width, viewport.height);
        const graphics = overlay.getComponent(Graphics)!;
        graphics.clear(); graphics.fillColor = new Color().fromHEX(color);
        graphics.rect(-viewport.width / 2, -viewport.height / 2, viewport.width, viewport.height); graphics.fill();
    });
    fade(overlay, 0);
    return overlay;
}

export interface PopupMotionOptions {
    openDuration?: number;
    closeDuration?: number;
    openSound?: boolean;
    closeSound?: boolean;
}
const popupMotion = new WeakMap<Node, PopupMotionOptions>();
/** BaseViewUI's serialized Panel scale animation; the dimmer itself never scales. */
export function presentPopup(overlay: Node, options: PopupMotionOptions = {}): void {
    if (!overlay.isValid) return;
    if (overlay.getChildByName('PopupLayout')) return;
    popupMotion.set(overlay, options);
    const parts = [...overlay.children];
    const layout = uiNode(overlay, 'PopupLayout');
    const content = uiNode(layout, 'PopupContent');
    for (const child of parts) child.setParent(content);
    bindFlowerViewport(layout, viewport => {
        layout.setPosition((viewport.safeLeft + viewport.safeRight) / 2, viewport.centerY, 0);
        const scale = Math.min(1, (viewport.safeRight - viewport.safeLeft) / 750, (viewport.safeTop - viewport.safeBottom) / 1334);
        layout.setScale(scale, scale, 1);
    });
    content.setScale(0, 0, 1);
    fade(overlay, 255);
    if (options.openSound) game.emit('flower-ui-sound', 'open');
    tween(content).to(options.openDuration ?? 0.4, {scale: new Vec3(1, 1, 1)}, {easing: 'backOut'}).start();
    overlay.on(Node.EventType.NODE_DESTROYED, () => {
        Tween.stopAllByTarget(content);
    });
}

const closing = new WeakSet<Node>();
export function dismissPopup(overlay: Node, onClosed?: () => void): void {
    if (!overlay.isValid || closing.has(overlay)) return;
    closing.add(overlay);
    const content = overlay.getChildByName('PopupLayout')?.getChildByName('PopupContent');
    const options = popupMotion.get(overlay);
    const duration = options?.closeDuration ?? 0.4;
    if (options?.closeSound) game.emit('flower-ui-sound', 'close');
    const finish = () => {
        if (!overlay.isValid) return;
        overlay.removeFromParent(); overlay.destroy(); onClosed?.();
    };
    if (content) {
        Tween.stopAllByTarget(content);
        tween(content).to(duration, {scale: new Vec3(0, 0, 1)}, {easing: 'backIn'}).call(finish).start();
    } else finish();
}

/** All popups block both gameplay and controls underneath them. */
export async function message(parent: Node, title: string, body: string, actionText = '知道了', onAction?: () => void, icon?: string): Promise<Node> {
    await preloadPopupFrames(icon ? [icon] : []);
    if (!parent.isValid) return parent;
    const overlay = modal(parent, 'DialogOverlay');
    await popupFrame(overlay, title, 628, icon ? 580 : 485);
    const bodyY = icon ? -83 : 35;
    if (icon) await popupIcon(overlay, 'DialogIcon', icon, 0, 89, 158);
    await popupInset(overlay, 'MessageSurface', 0, bodyY, 530, icon ? 132 : 187);
    const text = label(overlay, 'Message', body, 0, bodyY, 31, 474, '#694727').getComponent(Label)!;
    text.overflow = Label.Overflow.SHRINK;
    text.node.getComponent(UITransform)!.setContentSize(474, icon ? 104 : 155);
    text.enableWrapText = true;
    const ok = await popupButton(overlay, 'Confirm', actionText, 0, icon ? -211 : -143, 270, 91);
    let accepted = false;
    const button = tap(ok, () => {
        if (accepted) return;
        accepted = true;
        button.interactable = false;
        dismissPopup(overlay, onAction);
    });
    presentPopup(overlay);
    return overlay;
}
