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

const PROGRESS_ART_HEIGHT = 25;
const PROGRESS_FILL_SCALE = 32 / PROGRESS_ART_HEIGHT;
const PROGRESS_CAP_LEFT = 13;
const PROGRESS_CAP_RIGHT = 15;

/** Size the sliced sprite in texture units so the caps keep their proportions. */
export async function createProgressFill(parent: Node): Promise<Node> {
    const node = await sprite(parent, 'ProgressFill', skinPath('progress-fill-cap'), boardX(382), boardY(404.5), 91, PROGRESS_ART_HEIGHT);
    const renderer = node.getComponent(Sprite)!;
    const frame = renderer.spriteFrame!.clone();
    frame.insetLeft = PROGRESS_CAP_LEFT;
    frame.insetRight = PROGRESS_CAP_RIGHT;
    renderer.spriteFrame = frame;
    renderer.type = Sprite.Type.SLICED;
    renderer.trim = false;
    node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
    const scale = BOARD_UNIT * PROGRESS_FILL_SCALE;
    node.setScale(scale, scale, 1);
    node.active = false;
    node.on(Node.EventType.NODE_DESTROYED, () => frame.destroy());
    return node;
}

export function setProgressFill(node: Node, percent: number): void {
    const progress = Math.max(0, Math.min(percent, 100));
    const capWidth = PROGRESS_CAP_LEFT + PROGRESS_CAP_RIGHT;
    const sampleWidth = 91 / PROGRESS_FILL_SCALE;
    // Grow from two full caps to the original 25% sample, then follow the original width curve.
    const width = progress < 25 ? capWidth + (sampleWidth - capWidth) * progress / 25
        : (19 + 288 * progress / 100) / PROGRESS_FILL_SCALE;
    node.active = progress > 0;
    node.getComponent(UITransform)!.setContentSize(width, PROGRESS_ART_HEIGHT);
}

/** Water inside the new pool border, in the same PSD coordinate system. */
export async function boardWater(parent: Node,width: number,height: number): Promise<Sprite> {
    const source=await loadFrame(skinPath('pool')),frame=source.clone();
    const rect=source.rect.clone();rect.x+=38;rect.y+=57;rect.width=990;rect.height=1060;
    frame.rect=rect;
    const size=frame.originalSize.clone();size.width=990;size.height=1060;frame.originalSize=size;
    const offset=frame.offset.clone();offset.x=offset.y=0;frame.offset=offset;frame.packable=false;
    const node=await sprite(parent,'WaterCaustics',skinPath('pool'),0,0,width,height);
    const image=node.getComponent(Sprite)!;image.spriteFrame=frame;image.trim=false;
    node.on(Node.EventType.NODE_DESTROYED,()=>frame.destroy());
    return image;
}
