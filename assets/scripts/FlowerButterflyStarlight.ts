import { Color, Node, Rect, Size, Sprite, SpriteFrame, Texture2D } from 'cc';
import { uiNode } from './FlowerUI';

type LightShape = 'star' | 'point';
type LightFrames = Record<LightShape, SpriteFrame[]>;

const CELL = 96;
const HALO_COLORS = [[242, 89, 172], [52, 185, 228], [253, 167, 50]] as const;
let sharedFrames: LightFrames | undefined;

/** Store the soft halos and pin-sharp highlights in one texture for both butterflies. */
function starlightFrames(): LightFrames {
    if (sharedFrames) return sharedFrames;
    const width = CELL * HALO_COLORS.length, height = CELL * 2;
    const pixels = new Uint8Array(width * height * 4);
    const frames: LightFrames = {star: [], point: []};
    const texture = new Texture2D();
    texture.name = 'ButterflyStarlight';
    texture.reset({width, height, format: Texture2D.PixelFormat.RGBA8888});
    const shapes: LightShape[] = ['star', 'point'];
    for (let row = 0; row < shapes.length; row++) {
        const shape = shapes[row];
        const star = shape === 'star';
        for (let py = 0; py < CELL; py++) {
            const y = (py + 0.5) * 2 / CELL - 1;
            for (let px = 0; px < CELL; px++) {
                const x = (px + 0.5) * 2 / CELL - 1;
                const r2 = x * x + y * y;
                const edge = Math.max(0, 1 - r2) ** 0.85;
                const ray = star ? Math.max(crossRay(x, y), crossRay(y, x * 0.94)) : 0;
                const halo = star ? 0.54 * Math.exp(-5.2 * r2) + ray * 0.42
                    : 0.62 * Math.exp(-7.8 * r2) + 0.18 * Math.exp(-20 * r2);
                const hotX = x + (star ? 0 : 0.075), hotY = y + (star ? 0 : 0.065);
                const hot = Math.max(Math.exp(-44 * (hotX * hotX + hotY * hotY)), ray * 0.95);
                const alpha = hot + halo * (1 - hot);
                const pearl = alpha > 0 ? hot / alpha : 0;
                for (let column = 0; column < HALO_COLORS.length; column++) {
                    const color = HALO_COLORS[column];
                    const offset = ((row * CELL + py) * width + column * CELL + px) * 4;
                    pixels[offset] = Math.round(color[0] + (255 - color[0]) * pearl);
                    pixels[offset + 1] = Math.round(color[1] + (255 - color[1]) * pearl);
                    pixels[offset + 2] = Math.round(color[2] + (255 - color[2]) * pearl);
                    pixels[offset + 3] = Math.round(alpha * edge * 255);
                }
            }
        }
        for (let column = 0; column < HALO_COLORS.length; column++) {
            const frame = new SpriteFrame();
            frame.name = `ButterflyStarlight-${shape}-${column}`;
            frame.reset({texture, rect: new Rect(column * CELL, row * CELL, CELL, CELL), originalSize: new Size(CELL, CELL)});
            frame.packable = false;
            frames[shape].push(frame);
        }
    }
    texture.uploadData(pixels);
    sharedFrames = frames;
    return frames;
}

function crossRay(side: number, along: number): number {
    const taper = Math.max(0, 1 - Math.abs(along));
    const width = 0.031 + 0.124 * taper ** 2;
    return Math.exp(-((side / width) ** 2)) * taper ** 1.2;
}

/** Reuse the same particles until this pairing's flight node is destroyed. */
export class FlowerButterflyStarlight {
    private readonly root: Node;
    private readonly frames = starlightFrames();
    private readonly particles: Sprite[] = [];
    private readonly ink = new Color();
    private used = 0;

    constructor(parent: Node, private readonly pink: boolean) {
        this.root = uiNode(parent, 'Starlight', 0, 0, 1, 1);
    }

    beginFrame(): void { this.used = 0; }

    draw(shape: LightShape, x: number, y: number, radius: number, alpha: number, angle: number, tinted: boolean): void {
        if (alpha <= 0.01) return;
        let sprite = this.particles[this.used++];
        if (!sprite) {
            sprite = uiNode(this.root, 'LightParticle', 0, 0, 1, 1).addComponent(Sprite);
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            this.particles.push(sprite);
        }
        const column = tinted ? (this.pink ? 0 : 1) : 2;
        const frame = this.frames[shape][column];
        if (sprite.spriteFrame !== frame) sprite.spriteFrame = frame;
        sprite.color = this.ink.set(255, 255, 255, Math.round(alpha * 255));
        const diameter = radius * (shape === 'star' ? 3.6 : 6.1);
        sprite.node.setPosition(x, y);
        sprite.node.setScale(diameter, diameter, 1);
        sprite.node.angle = angle * 180 / Math.PI;
        sprite.node.active = true;
    }

    endFrame(): void {
        for (let i = this.used; i < this.particles.length; i++) this.particles[i].node.active = false;
    }
}
