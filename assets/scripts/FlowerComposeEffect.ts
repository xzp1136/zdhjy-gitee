import { Color, gfx, Graphics, Material, Node, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { FlowerButterflyStarlight } from './FlowerButterflyStarlight';
import { fade, uiNode } from './FlowerUI';

type Point = { x: number; y: number };
type Curve = (t: number) => Point;
type RGB = readonly [number, number, number];
type Palette = { halo: RGB; silk: RGB };

const GOLD: Palette = {halo: [244, 143, 50], silk: [255, 218, 127]};
const ROSE: Palette = {halo: [214, 79, 161], silk: [255, 174, 220]};
const AQUA: Palette = {halo: [62, 124, 223], silk: [151, 252, 246]};
const PEARL: RGB = [255, 251, 226];
const TAU = 2 * Math.PI;
const clamp = (t: number) => Math.max(0, Math.min(1, t));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export const COMPOSE_WAND_PATH = 'greenhouse/compose-wand';
export const COMPOSE_RELEASE = 1.50;
const WAND_SETTLE = 0.26;
const WAND_RELEASE_TAIL = 0.28;
const WAND_TRAIL_TIME = 0.42;
const WAND_SPARK_STEP = 0.045;
const WAND_SPARK_LIFE = 0.54;
export const COMPOSE_WAND_DURATION = COMPOSE_RELEASE + WAND_RELEASE_TAIL;
export const COMPOSE_STAR_INTERVAL = 0.075;
export const COMPOSE_SEEK_DURATION = 0.43;

function bezier(start: Point, a: Point, b: Point, end: Point, t: number): Point {
    const u = 1 - t;
    return {
        x: start.x * u ** 3 + 3 * a.x * u * u * t + 3 * b.x * u * t * t + end.x * t ** 3,
        y: start.y * u ** 3 + 3 * a.y * u * u * t + 3 * b.y * u * t * t + end.y * t ** 3,
    };
}

class ComposeLight {
    readonly root: Node;
    private readonly art: Graphics;
    private readonly light: FlowerButterflyStarlight;
    private readonly ink = new Color();

    constructor(parent: Node, name: string, private readonly palette: Palette) {
        this.root = uiNode(parent, name, 0, 0, 1, 1);
        this.art = this.root.addComponent(Graphics);
        this.light = new FlowerButterflyStarlight(this.root, palette !== AQUA);
    }

    begin(): void { this.art.clear(); this.light.beginFrame(); }
    end(): void { this.light.endFrame(); }

    private diamond(point: Point, radius: number, angle: number, rgb: RGB, alpha: number): void {
        this.art.fillColor = this.ink.set(...rgb, Math.round(alpha * 255));
        for (let corner = 0; corner < 8; corner++) {
            const heading = angle + corner * Math.PI / 4;
            const length = radius * (corner % 2 === 1 ? 0.25 : corner % 4 === 0 ? 0.75 : 1);
            const x = point.x + Math.cos(heading) * length, y = point.y + Math.sin(heading) * length;
            if (corner === 0) this.art.moveTo(x, y);
            else this.art.lineTo(x, y);
        }
        this.art.close(); this.art.fill();
    }

    glint(point: Point, radius: number, alpha: number, turn = 0): void {
        if (alpha < 0.01) return;
        this.halo(point, radius * 1.46, alpha * 0.83);
        this.diamond(point, radius * 0.84, turn, this.palette.halo, alpha * 0.87);
        this.diamond(point, radius * 0.64, turn, PEARL, alpha);
        this.light.draw('star', point.x, point.y, radius * 1.12, alpha, turn, this.palette !== GOLD);
    }

    halo(point: Point, radius: number, alpha: number): void {
        this.light.draw('point', point.x, point.y, radius, alpha, 0, this.palette !== GOLD);
    }

    ribbon(path: Curve, tail: number, head: number, width: number, strength: number): void {
        if (head - tail < 0.002 || strength < 0.01) return;
        const segments = 16;
        const points = Array.from({length: segments + 1}, (_, index) => path(mix(tail, head, index / segments)));
        const normals = points.map((_, index) => {
            const a = points[Math.max(0, index - 1)], b = points[Math.min(segments, index + 1)];
            const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1;
            return {x: -dy / length, y: dx / length};
        });
        const bands = [
            {color: this.palette.halo, width: 1, opacity: 113},
            {color: this.palette.silk, width: 0.55, opacity: 192},
            {color: PEARL, width: 0.16, opacity: 243},
        ];
        const taper = (index: number) => Math.sin(Math.PI * index / (segments + 2)) ** 0.75;
        for (const band of bands) {
            const radius = width * band.width;
            for (let i = 1; i <= segments; i++) {
                const a = points[i - 1], b = points[i], u = normals[i - 1], v = normals[i];
                const ra = radius * taper(i - 1), rb = radius * taper(i);
                const art = this.art;
                art.fillColor = this.ink.set(...band.color, Math.round(band.opacity * strength * (i / segments) ** 0.92));
                art.moveTo(a.x + u.x * ra, a.y + u.y * ra);
                art.lineTo(b.x + v.x * rb, b.y + v.y * rb);
                art.lineTo(b.x - v.x * rb, b.y - v.y * rb);
                art.lineTo(a.x - u.x * ra, a.y - u.y * ra);
                art.close(); art.fill();
            }
        }
        const sparks = 22;
        for (let i = 0; i < sparks; i++) {
            const age = (i + 0.5) / sparks, phase = i * 2.39996;
            const origin = path(mix(head, tail, age));
            const drift = (5 + 34 * age) * (0.4 + 0.6 * Math.sin(phase) ** 2);
            const star = i % 5 === 0;
            const radius = (star ? 9 : 4.5) * (1 - age * 0.55);
            const x = origin.x + Math.cos(phase) * drift, y = origin.y + Math.sin(phase) * drift - 8 * age;
            const alpha = (1 - age * 0.88) * strength;
            this.light.draw(star ? 'star' : 'point', x, y, radius, alpha, phase, i % 3 !== 0 && this.palette !== GOLD);
            if (star) this.diamond({x, y}, radius * 0.55, phase, PEARL, alpha * 0.85);
        }
    }

    burst(point: Point, progress: number, size: number, water = false): void {
        const t = clamp(progress), alpha = (1 - t) ** 1.6, spread = easeOut(t);
        if (alpha < 0.01) return;
        for (let i = 0; i < 2; i++) {
            const radius = size * (0.25 + spread * (0.86 + i * 0.28));
            this.art.strokeColor = this.ink.set(...(i === 0 ? PEARL : this.palette.halo), Math.round(alpha * (i === 0 ? 215 : 140)));
            this.art.lineWidth = i === 0 ? 3.4 : 6.5;
            this.art.ellipse(point.x, point.y, radius, radius * (water ? 0.58 : 0.82));
            this.art.stroke();
        }
        this.glint(point, size * (0.52 + 0.23 * spread), alpha, t * 0.8);
        for (let i = 0; i < 15; i++) {
            const angle = i * 2.39996;
            const radius = size * (0.16 + spread * (0.60 + (i % 5) * 0.23));
            const fleck = {x: point.x + Math.cos(angle) * radius,
                y: point.y + Math.sin(angle) * radius * (water ? 0.55 : 0.92) + (water ? 46 : 24) * t * (1 - t)};
            const star = i % 3 === 0;
            const sparkleRadius = (star ? 11 : 6) * (1 - t * 0.52);
            this.light.draw(star ? 'star' : 'point', fleck.x, fleck.y, sparkleRadius, alpha, angle + t, i % 2 === 0 && this.palette !== GOLD);
            if (star) this.diamond(fleck, 6.6 * (1 - t * 0.5), angle + t, PEARL, alpha);
        }
    }
}

/** Wand pose and its historical tip samples use the same curve. */
export class FlowerComposeCast {
    readonly root: Node;
    private readonly wand: Node;
    private readonly wandEmission: Sprite;
    private readonly emissionColor = new Color();
    private readonly aura: ComposeLight;
    private readonly trail: ComposeLight;
    private readonly launch: ComposeLight;
    private readonly tipOffset: Point;
    private readonly uprightAngle: number;

    constructor(parent: Node, frame: SpriteFrame, private readonly button: Point, private readonly pivot: Point) {
        this.root = uiNode(parent, 'ComposeCast', 0, 0, 1, 1);
        this.aura = new ComposeLight(this.root, 'WandAura', GOLD);
        const width = 188, height = width * frame.originalSize.height / frame.originalSize.width;
        this.wand = uiNode(this.root, 'ComposeWand', 0, 0, width, height);
        this.wand.getComponent(UITransform)!.setAnchorPoint(0.16, 0.12);
        const sprite = this.wand.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM; sprite.trim = false; sprite.spriteFrame = frame;
        const emission = uiNode(this.wand, 'WandEmission', 0, 0, width, height);
        emission.getComponent(UITransform)!.setAnchorPoint(0.16, 0.12);
        this.wandEmission = emission.addComponent(Sprite);
        this.wandEmission.sizeMode = Sprite.SizeMode.CUSTOM;
        this.wandEmission.trim = false;
        this.wandEmission.spriteFrame = frame;
        const glow = new Material();
        glow.initialize({effectName: 'builtin-sprite', defines: {USE_TEXTURE: true}, states: {blendState: {targets: [{
            blend: true, blendSrc: gfx.BlendFactor.SRC_ALPHA, blendDst: gfx.BlendFactor.ONE,
            blendDstAlpha: gfx.BlendFactor.ONE_MINUS_SRC_ALPHA,
        }]}}});
        this.wandEmission.customMaterial = glow;
        emission.once(Node.EventType.NODE_DESTROYED, () => glow.destroy());
        this.tipOffset = {x: width * 0.32, y: height * 0.53};
        this.uprightAngle = Math.atan2(this.tipOffset.x, this.tipOffset.y) * 180 / Math.PI;
        this.trail = new ComposeLight(this.root, 'WandRibbon', GOLD);
        this.launch = new ComposeLight(this.root, 'WandRelease', GOLD);
    }

    private pose(time: number) {
        const rise = easeOut(clamp(time / WAND_SETTLE));
        const swing = clamp((time - WAND_SETTLE) / (COMPOSE_RELEASE - WAND_SETTLE));
        const retreat = smooth(clamp((time - COMPOSE_RELEASE - 0.11) / (WAND_RELEASE_TAIL - 0.11)));
        const rock = 26 * Math.sin(swing * TAU * 2) * Math.sin(swing * Math.PI) ** 0.45;
        return {
            x: mix(this.button.x, this.pivot.x, rise),
            y: mix(this.button.y, this.pivot.y, rise) - 48 * retreat,
            angle: mix(0, this.uprightAngle, rise) + rock,
            scale: mix(0.46, 1, rise) - 0.24 * retreat,
            alpha: clamp(time / 0.07) * (1 - retreat),
        };
    }

    private wandPoint(time: number, reach: number): Point {
        const pose = this.pose(time), radians = pose.angle * Math.PI / 180;
        const scale = pose.scale * reach, x = this.tipOffset.x * scale, y = this.tipOffset.y * scale;
        return {x: pose.x + x * Math.cos(radians) - y * Math.sin(radians), y: pose.y + x * Math.sin(radians) + y * Math.cos(radians)};
    }

    tip(time: number): Point { return this.wandPoint(time, 1); }

    private drawSwingTrail(time: number, afterRelease: number): void {
        const head = Math.min(time, COMPOSE_RELEASE), tail = Math.max(WAND_SETTLE, time - WAND_TRAIL_TIME);
        const strength = clamp((head - WAND_SETTLE) / 0.10) * (1 - smooth(afterRelease));
        // The crystal's outer edge traces the arc, with the light drawn in front of the wand.
        const path = (sample: number) => this.wandPoint(sample, 1.66);
        this.trail.ribbon(path, tail, head, 25, strength);
        this.trail.ribbon(sample => {
            const point = path(sample), drift = (time - sample) / WAND_TRAIL_TIME;
            return {x: point.x + 14 * drift * Math.cos(sample * 12), y: point.y + 26 * drift};
        }, tail, head, 9, strength * 0.68);
        this.trail.glint(path(head), 23, strength * 0.91, -time * 4.5);

        // Sample fixed birth times so the stars hang in the air while the wand reverses.
        const newest = Math.floor((head - WAND_SETTLE) / WAND_SPARK_STEP);
        const oldest = Math.max(0, Math.ceil((time - WAND_SETTLE - WAND_SPARK_LIFE) / WAND_SPARK_STEP));
        for (let tick = oldest; tick <= newest; tick++) {
            const birth = WAND_SETTLE + tick * WAND_SPARK_STEP;
            const age = Math.max(0, time - birth), life = clamp(age / WAND_SPARK_LIFE);
            const origin = path(birth), phase = tick * 2.39996;
            const position = {x: origin.x + Math.cos(phase) * (9 + age * 69),
                y: origin.y + 10 + Math.sin(phase) * 12 + age * 51};
            const twinkle = 0.72 + 0.28 * Math.cos(age * 21 + phase);
            const alpha = clamp(age / 0.045) * (1 - life) ** 1.35 * twinkle * (1 - afterRelease);
            const radius = (tick % 3 === 0 ? 19 : 11) * (1 - life * 0.45);
            this.trail.glint(position, radius, alpha, phase + age);
        }
    }

    draw(time: number): void {
        const pose = this.pose(time), tip = this.tip(time);
        const charge = smooth(clamp((time - WAND_SETTLE) / (COMPOSE_RELEASE - WAND_SETTLE)));
        const afterRelease = clamp((time - COMPOSE_RELEASE) / WAND_RELEASE_TAIL);
        const shine = charge * (1 - afterRelease) ** 1.5;
        this.wand.setPosition(pose.x, pose.y, 0); this.wand.angle = pose.angle;
        this.wand.setScale(pose.scale, pose.scale, 1); fade(this.wand, Math.round(pose.alpha * 255));
        this.wandEmission.color = this.emissionColor.set(255, 228, 172, Math.round(shine * 86));
        this.aura.begin(); this.trail.begin(); this.launch.begin();
        this.aura.halo(tip, 26 + 12 * charge, shine * pose.alpha * 0.62);
        this.drawSwingTrail(time, afterRelease);
        if (time < COMPOSE_RELEASE) {
            this.launch.glint(tip, 23, pose.alpha * clamp((time - 0.10) / 0.24), -time * 3);
        } else {
            this.launch.burst(this.tip(COMPOSE_RELEASE), afterRelease, 72);
        }
        this.aura.end(); this.trail.end(); this.launch.end();
    }
}

/** Each star keeps its own ribbon so it can follow a live flower or a returning flight. */
export class FlowerComposeStar {
    readonly root: Node;
    private readonly light: ComposeLight;

    constructor(parent: Node, private readonly index: number, private readonly launch: Point,
        readonly onArrival: () => void) {
        this.light = new ComposeLight(parent, `ComposeStar-${index}`, [GOLD, ROSE, AQUA][index % 3]);
        this.root = this.light.root;
    }

    seek(progress: number, target: Point): void {
        const side = this.index % 3 - 1;
        const dx = target.x - this.launch.x;
        const path = (t: number) => bezier(this.launch, {x: this.launch.x + side * 205 + dx * 0.24, y: this.launch.y + 55 + side * 23},
            {x: target.x - side * 80 - dx * 0.15, y: target.y - 50}, target, smooth(t));
        const point = path(progress);
        this.light.begin();
        this.light.ribbon(path, Math.max(0, progress - 0.50), progress, 18, 1);
        this.light.glint(point, 25 + 6 * Math.sin(Math.PI * progress), 1, progress * 2.3 + side * 0.3);
        this.light.end();
    }

    position(progress: number, from: Vec3, target: Vec3, travel: (t: number) => number): Point {
        const eased = travel(progress), arch = Math.sin(Math.PI * progress);
        const lane = (this.index % 3 - 1) * 39;
        return {x: mix(from.x, target.x, eased) + arch * (lane + 22 * Math.sin(progress * TAU)),
            y: mix(from.y, target.y, eased) + arch * 30 - Math.sin(TAU * progress) * (1 - progress) * 21};
    }

    carry(progress: number, from: Vec3, target: Vec3, travel: (t: number) => number, landing = 0): void {
        const path = (t: number) => this.position(t, from, target, travel);
        const flower = path(progress), phase = progress * TAU * 1.65 + this.index * 0.9;
        const wrapStrength = (1 - clamp((progress - 0.72) / 0.28)) * (0.82 + 0.18 * Math.sin(progress * Math.PI));
        const wrap = (t: number) => {
            const angle = phase + t * 4.8, radius = mix(58, 32, progress);
            return {x: flower.x + Math.cos(angle) * radius, y: flower.y + Math.sin(angle) * radius * 0.62 + 7};
        };
        this.light.begin();
        this.light.ribbon(path, Math.max(0, progress - 0.46), progress, 22, 1 - landing);
        this.light.ribbon(wrap, 0.15, 1, 9, wrapStrength);
        this.light.glint(wrap(1), 16, wrapStrength, phase);
        if (progress < 0.55) this.light.burst(from, progress / 0.55, 53, true);
        if (progress === 1) this.light.burst(target, landing, 37);
        this.light.end();
    }
}
