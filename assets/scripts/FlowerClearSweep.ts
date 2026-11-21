import { Color, Graphics, Node, Sprite, SpriteFrame, UIOpacity, UITransform, Vec3 } from 'cc';
import { BOARD_UNIT } from './FlowerBoardSkin';
import { uiNode } from './FlowerUI';

export const CLEAR_BRUSH_PATH = 'greenhouse/clear-brush';
export const CLEAR_TOOL_IN_USE_PATH = 'greenhouse/tool-clear-in-use';

const LIFT = 0.34;
const FLICK = 0.26;
const PETAL_FLIGHT = 0.29;
const BRISTLE_ANCHOR = 0.10;
const TRAIL_SAMPLES = 16;
const SPARK_INTERVAL = 0.036;
const SPARK_LIFE = 0.185;
const TRAIL_WASH = [
    {width: 1.18, tint: [190, 238, 250, 17]},
    {width: 0.96, tint: [199, 241, 251, 24]},
    {width: 0.74, tint: [213, 246, 251, 33]},
    {width: 0.51, tint: [231, 250, 247, 37]},
    {width: 0.27, tint: [250, 252, 237, 24]},
] as const;
const clamp = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

type SweepFlower = { node: Node; point: Vec3 };
type TrailSample = {x: number; y: number; nx: number; ny: number; taper: number};

/** One stroke drives the brush and the flowers it actually reaches. */
export class FlowerClearSweep {
    readonly root: Node;
    readonly duration: number;
    private readonly art: Graphics;
    private readonly brush: Node;
    private readonly brushOpacity: UIOpacity;
    private readonly ink = new Color();
    private readonly right: number;
    private readonly left: number;
    private readonly stroke: number;
    private readonly home: Vec3;
    private readonly flowers: ReturnType<FlowerClearSweep['saveFlower']>[];
    private strokeStarted = false;

    constructor(parent: Node, frame: SpriteFrame, button: Vec3, private readonly first: Vec3,
        last: Vec3, flowers: SweepFlower[]) {
        this.root = uiNode(parent, 'ClearSweep', 0, 0, 1, 1);
        this.art = uiNode(this.root, 'SweepDust', 0, 0, 1, 1).addComponent(Graphics);
        const width = frame.originalSize.width * BOARD_UNIT, height = frame.originalSize.height * BOARD_UNIT;
        this.brush = uiNode(this.root, 'ClearBrush', 0, 0, width, height);
        this.brush.getComponent(UITransform)!.setAnchorPoint(0.5, BRISTLE_ANCHOR);
        const sprite = this.brush.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM; sprite.trim = false; sprite.spriteFrame = frame;
        this.brushOpacity = this.brush.addComponent(UIOpacity);
        // Offsets of the brush layer relative to the button's PSD bounds.
        this.home = new Vec3(button.x - 4 * BOARD_UNIT, button.y + 8 * BOARD_UNIT - height * (0.5 - BRISTLE_ANCHOR));
        this.right = last.x + 32;
        this.left = first.x - 37;
        this.stroke = 0.19 + (this.right - this.left) * 0.00049;
        this.duration = LIFT + this.stroke + FLICK;
        this.flowers = flowers.map(flower => this.saveFlower(flower));
    }

    private saveFlower({node, point}: SweepFlower) {
        const opacity = node.getComponent(UIOpacity) ?? node.addComponent(UIOpacity);
        const contact = LIFT + this.stroke * (this.right - point.x - 8) / (this.right - this.left);
        return {node, point, contact, position: node.position.clone(), scale: node.scale.clone(),
            angle: node.angle, opacity, alpha: opacity.opacity};
    }

    private brushPose(time: number) {
        const lift = clamp(time / LIFT), slide = clamp((time - LIFT) / this.stroke);
        const flick = clamp((time - LIFT - this.stroke) / FLICK);
        const reach = smooth(lift), arc = Math.sin(Math.PI * lift);
        const x = lerp(this.home.x, lerp(this.right, this.left, slide), reach) + 33 * arc - 24 * flick;
        const y = lerp(this.home.y, this.first.y - 8, reach) + 94 * arc - 5 * Math.sin(Math.PI * slide) + 54 * smooth(flick);
        return {x, y, reach, arc, slide, flick};
    }

    draw(progress: number, onStroke: () => void): void {
        const time = progress * this.duration;
        const {x, y, reach, arc, slide, flick} = this.brushPose(time);
        const press = Math.sin(Math.PI * clamp((time - LIFT) / 0.13));
        const size = lerp(1, 1.58, reach) - 0.44 * flick;
        this.brush.setPosition(x, y);
        this.brush.setScale(size * (1 + 0.13 * press), size * (1 - 0.13 * press), 1);
        this.brush.angle = -29 * reach + 11 * arc - 15 * Math.sin(Math.PI * slide) - 7 * press + 61 * flick;
        this.brushOpacity.opacity = Math.round(255 * (1 - smooth(flick)));
        this.art.clear();

        if (time >= LIFT && !this.strokeStarted) {
            this.strokeStarted = true;
            onStroke();
        }
        this.drawTrail(time);
        const shine = Math.sin(Math.PI * flick);
        for (const flower of this.flowers) {
            if (time < flower.contact || !flower.node.isValid) continue;
            const t = clamp((time - flower.contact) / PETAL_FLIGHT);
            const push = 1 - (1 - t) ** 2;
            const hop = Math.sin(Math.PI * t ** 0.76);
            const fall = smooth(clamp((t - 0.33) / 0.67));
            const pop = 1 + 0.28 * hop - 0.64 * fall;
            flower.node.setPosition(flower.position.x - 88 * push, flower.position.y + 73 * hop + 9 * t);
            flower.node.setScale(flower.scale.x * pop, flower.scale.y * pop, flower.scale.z);
            flower.node.angle = flower.angle + 91 * push;
            flower.opacity.opacity = Math.round(flower.alpha * (1 - fall));
            if (t < 1) this.drawContact(flower.point, t);
            if (shine > 0.01) this.drawSlotShine(flower.point, flick, shine);
        }
    }

    private drawTrail(time: number): void {
        const ground = smooth(clamp((time - LIFT + 0.04) / 0.15));
        const life = lerp(0.059, 0.203, ground);
        const stop = LIFT + this.stroke + 0.065;
        const first = Math.max(0.027, time - life), last = Math.min(time, stop);
        const span = last - first;
        if (span <= 0.008) return;
        const fade = (1 - smooth(clamp((time - stop) / life))) * smooth(clamp(span / 0.045));
        const points = Array.from({length: TRAIL_SAMPLES}, (_, i) => {
            const along = i / (TRAIL_SAMPLES - 1);
            const stamp = lerp(first, last, along);
            const {x, y} = this.brushPose(stamp);
            const drift = clamp((time - stamp) / life) ** 2;
            return {
                x: x + 13 * Math.sin(stamp * 24) * drift,
                y: y + (19 + 12 * Math.cos(stamp * 22)) * drift,
                taper: Math.sin(Math.PI * along * 0.88) ** 0.84 * (0.35 + 0.65 * along)
                    * (1 + 0.12 * Math.sin(stamp * 25 + time * 2)),
            };
        });
        const samples = points.map((point, i) => {
            const before = points[Math.max(0, i - 1)], after = points[Math.min(points.length - 1, i + 1)];
            const dx = after.x - before.x, dy = after.y - before.y, distance = Math.hypot(dx, dy) || 1;
            return {...point, nx: -dy / distance, ny: dx / distance};
        });
        const width = lerp(13, 37, ground);
        // Layer translucent contours so the wash gets brighter toward its centre.
        for (const layer of TRAIL_WASH) {
            const [red, green, blue, alpha] = layer.tint;
            this.art.fillColor = this.ink.set(red, green, blue, Math.round(fade * alpha));
            this.drawTrailBand(samples, width * layer.width, -width * 0.08);
        }
        const leading = samples.slice(4);
        this.art.fillColor = this.ink.set(255, 232, 169, Math.round(fade * 42));
        this.drawTrailBand(leading, width * 0.32, -width * 0.52);
        this.art.fillColor = this.ink.set(255, 251, 221, Math.round(fade * 87));
        this.drawTrailBand(leading, width * 0.17, -width * 0.52);
        this.drawTrailSparks(time, stop);
    }

    private drawTrailBand(samples: TrailSample[], width: number, offset: number): void {
        const atEdge = (index: number, side: number) => {
            const sample = samples[index], tailCap = smooth(clamp(index / 3));
            const shift = (offset + width * side) * sample.taper * tailCap;
            return {x: sample.x + sample.nx * shift, y: sample.y + sample.ny * shift};
        };
        const edge = samples.map((_, index) => atEdge(index, 1));
        for (let i = samples.length - 1; i >= 0; i--) edge.push(atEdge(i, -1));
        this.art.moveTo(edge[0].x, edge[0].y);
        for (let i = 1; i < edge.length - 1; i++) {
            const point = edge[i], next = edge[i + 1];
            this.art.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
        }
        const tail = edge[edge.length - 1];
        this.art.lineTo(tail.x, tail.y);
        this.art.close(); this.art.fill();
    }

    private drawTrailSparks(time: number, stop: number): void {
        const first = Math.ceil(Math.max(0.057, time - SPARK_LIFE) / SPARK_INTERVAL);
        const last = Math.floor(Math.min(time, stop) / SPARK_INTERVAL);
        for (let index = first; index <= last; index++) {
            const stamp = index * SPARK_INTERVAL;
            const age = clamp((time - stamp) / SPARK_LIFE);
            const {x, y} = this.brushPose(stamp);
            const fleckX = x + (index % 3 - 1) * (8 + 31 * age);
            const fleckY = y + 3 + (25 + index % 4 * 8) * age;
            const opacity = Math.sin(Math.PI * age ** 0.65) * 0.73;
            if (index % 3 === 0) this.drawSpark(fleckX, fleckY, 12 - 6 * age, opacity);
            else {
                const radius = 5.5 - 2.1 * age;
                this.art.fillColor = this.ink.set(223, 247, 239, Math.round(opacity * 59));
                this.art.ellipse(fleckX, fleckY, radius * 1.28, radius); this.art.fill();
                this.art.fillColor = this.ink.set(255, 242, 198, Math.round(opacity * 168));
                this.art.ellipse(fleckX, fleckY, radius * 0.62, radius * 0.47); this.art.fill();
            }
        }
    }

    private drawContact(point: Vec3, t: number): void {
        const burst = Math.sin(Math.PI * t ** 0.55);
        const spread = 1 - (1 - t) ** 2, arc = Math.sin(Math.PI * t);
        this.drawSpark(point.x + 10 - 28 * t, point.y + 2 + 41 * t, 12 + 16 * burst, burst * 0.8);
        for (let i = 0; i < 8; i++) {
            const x = point.x + (i % 3 - 1) * 12 - (17 + i * 8) * spread;
            const y = point.y - 9 + arc * (15 + i * 8) + (i - 3) * 7 * t;
            const radius = (5 + i % 3 * 2) * (1 - 0.58 * t);
            this.art.fillColor = this.ink.set(i % 3 === 0 ? 220 : 255, 224 + i % 4 * 9,
                154 + i % 4 * 26, Math.round(181 * (1 - t * t)));
            this.art.moveTo(x - radius, y + radius);
            this.art.bezierCurveTo(x - radius, y - radius * 0.9, x + radius, y - radius, x + radius, y - radius * 0.6);
            this.art.bezierCurveTo(x + radius, y + radius * 0.7, x, y + radius * 0.3, x - radius, y + radius);
            this.art.close(); this.art.fill();
        }
    }

    private drawSlotShine(point: Vec3, phase: number, strength: number): void {
        const {x, y} = point;
        this.art.fillColor = this.ink.set(211, 255, 238, Math.round(53 * strength));
        this.art.roundRect(x - 41, y - 28, 82, 56, 11);
        this.art.fill();
        this.art.strokeColor = this.ink.set(255, 242, 193, Math.round(178 * strength));
        this.art.lineWidth = 2.4;
        this.art.roundRect(x - 41, y - 28, 82, 56, 11);
        this.art.stroke();
        this.drawSpark(x - 32 + 65 * smooth(phase), y + 17, 16, strength * 0.92);
        this.drawSpark(x + 29, y - 16, 8, strength * 0.64);
    }

    private drawSpark(x: number, y: number, radius: number, alpha: number): void {
        this.art.fillColor = this.ink.set(255, 252, 222, Math.round(255 * alpha));
        this.art.moveTo(x, y + radius);
        this.art.lineTo(x + radius * 0.24, y + radius * 0.23);
        this.art.lineTo(x + radius * 0.83, y);
        this.art.lineTo(x + radius * 0.24, y - radius * 0.23);
        this.art.lineTo(x, y - radius);
        this.art.lineTo(x - radius * 0.24, y - radius * 0.23);
        this.art.lineTo(x - radius * 0.83, y);
        this.art.lineTo(x - radius * 0.24, y + radius * 0.23);
        this.art.close(); this.art.fill();
    }

    restoreFlowers(): void {
        for (const flower of this.flowers) {
            if (!flower.node.isValid) continue;
            flower.node.setPosition(flower.position);
            flower.node.setScale(flower.scale);
            flower.node.angle = flower.angle;
            flower.opacity.opacity = flower.alpha;
        }
    }
}
