import { Color, Font, Label, Node, Sprite, SpriteFrame, UITransform } from 'cc';
import { label, loadFrame, loadGameFont, sprite, uiNode } from './FlowerUI';

// The source art is 1080 × 2400. Keep the game's existing unit scale so that
// pool physics, effects and other screens can keep their original units.
export const BOARD_UNIT = 750 / 1080;
export const BOARD_WIDTH = 1080 * BOARD_UNIT;
export const BOARD_HEIGHT = 2400 * BOARD_UNIT;
export const boardX = (x: number): number => (x - 540) * BOARD_UNIT;
export const boardY = (y: number): number => (1200 - y) * BOARD_UNIT;
// The tag centers in the PSD also anchor the vessels and the flower flights.
export const ORDER_X = [166.5, 427.5, 696.5, 958.5].map(boardX);
// The older vessels rest behind the top edge of the existing order tags.
export const BOUQUET_BASE_Y = boardY(653);
export const TRAY_X = [189.5, 329.5, 470.5, 610.5, 753.5, 893.5].map(boardX);
export const TRAY_Y = boardY(796.5);
export const TOOL_X = [295.5, 540.5, 785.5].map(boardX);
export const TOOL_Y = boardY(2067);
export const TOOL_NAMES = ['compose', 'shuffle', 'clear'];

const SKIN = 'greenhouse/';
export const skinPath = (name: string): string => SKIN + name;
const BOARD_IMAGES = ['ambient', 'greenhouse', 'pool', 'order-tag',
    'slot', 'slot-locked', 'pause', 'timer', 'stars', 'progress-track', 'progress-fill-cap', 'progress-flower', 'tool-base',
    ...TOOL_NAMES.map(name => 'tool-' + name)];
let hudFont: Font;
let orderFont: Font;

export async function preloadBoardSkin(): Promise<void> {
    const [hud, order] = await Promise.all([
        loadGameFont(skinPath('Baloo-Regular')), loadGameFont(skinPath('BalooBhaina-Regular')),
        Promise.all(BOARD_IMAGES.map(name => loadFrame(skinPath(name)))),
    ]);
    hudFont = hud;
    orderFont = order;
}

/** Position the full PSD layer rectangle, including its transparent margins. */
export async function boardSprite(parent: Node, name: string, asset: string,
    x: number, y: number, width: number, height: number): Promise<Node> {
    const node = await sprite(parent, name, skinPath(asset), x, y, width * BOARD_UNIT, height * BOARD_UNIT);
    node.getComponent(Sprite)!.trim = false;
    return node;
}

const FLOWER_ICON_SHADOWS = [
    { name: 'FlowerShadowSoft', x: 4.2, y: -5.4, spread: 1.65, alpha: 38 },
    { name: 'FlowerShadowNear', x: 3.0, y: -3.9, spread: 0.55, alpha: 74 },
];

/** The two tinted silhouettes reuse the icon's texture and sit behind its face. */
export class OrderFlowerIcon {
    readonly node: Node;
    private readonly flower: Sprite;
    private readonly shadows: Sprite[];

    constructor(parent: Node, frame: SpriteFrame, kind: string) {
        this.node = uiNode(parent, 'OrderFlowerIcon', 0, 9 * BOARD_UNIT);
        this.shadows = FLOWER_ICON_SHADOWS.map(({ name, x, y, alpha }) => {
            const shadow = uiNode(this.node, name, x * BOARD_UNIT, y * BOARD_UNIT).addComponent(Sprite);
            shadow.color = new Color(88, 57, 30, alpha);
            return shadow;
        });
        this.flower = uiNode(this.node, 'FlowerType', 0, 0).addComponent(Sprite);
        for (const layer of [...this.shadows, this.flower]) {
            layer.sizeMode = Sprite.SizeMode.CUSTOM;
            layer.trim = true;
        }
        this.setFlower(frame, kind);
    }

    setFlower(frame: SpriteFrame, kind: string): void {
        const { width, height } = frame.rect;
        // Tilt long stems further so they can use the width of the oval tag.
        const angle = height >= width * 2 ? -71 : kind.startsWith('cdcs') ? -38 : 0;
        const radians = angle * Math.PI / 180;
        const c = Math.abs(Math.cos(radians)), s = Math.abs(Math.sin(radians));
        const scale = BOARD_UNIT * Math.min(148 / (width * c + height * s), 82 / (width * s + height * c));
        const layers = [...this.shadows, this.flower];
        layers.forEach((layer, index) => {
            const blur = (FLOWER_ICON_SHADOWS[index]?.spread ?? 0) * BOARD_UNIT * 2;
            layer.spriteFrame = frame;
            layer.node.angle = angle;
            layer.node.getComponent(UITransform)!.setContentSize(width * scale + blur, height * scale + blur);
        });
    }
}

export function boardLabel(parent: Node, name: string, value: string, x: number, y: number,
    size: number, width: number, style: 'number' | 'order' | 'caption' = 'number'): Label {
    const text = label(parent, name, value, x, y, size * BOARD_UNIT, width * BOARD_UNIT,
        '#ffffff', style === 'caption' ? 'display' : 'body').getComponent(Label)!;
    if (style !== 'caption') {
        text.font = style === 'order' ? orderFont : hudFont;
        text.useSystemFont = false;
    }
    text.enableOutline = true;
    text.outlineColor = new Color(27, 19, 13);
    text.outlineWidth = (style === 'order' ? 2 : 3) * BOARD_UNIT;
    return text;
}

/** Keep the original height and rounded ends as the progress width grows. */
export async function createProgressFill(parent: Node): Promise<Node> {
    const center = boardX(382 + 91 / 2);
    const node = await boardSprite(parent, 'ProgressFill', 'progress-fill-cap', center, boardY(403.5), 91, 25);
    const renderer = node.getComponent(Sprite)!;
    const frame = renderer.spriteFrame!.clone();
    frame.insetLeft = frame.insetRight = 13;
    renderer.spriteFrame = frame;
    renderer.type = Sprite.Type.SLICED;
    node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
    node.setPosition(boardX(382), boardY(403.5));
    node.active = false;
    node.on(Node.EventType.NODE_DESTROYED, () => frame.destroy());
    return node;
}

export function setProgressFill(node: Node, percent: number): void {
    // The PSD sample is 91 px wide at 25%, including its two rounded caps.
    const width = Math.max(1, 19 + 288 * percent / 100);
    node.active = percent > 0;
    node.getComponent(UITransform)!.setContentSize(width * BOARD_UNIT, 25 * BOARD_UNIT);
}
