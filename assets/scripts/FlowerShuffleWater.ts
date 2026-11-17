import { Color, Graphics, Node } from 'cc';
import { uiNode } from './FlowerUI';

export const SHUFFLE_CENTER_Y = -195;
export const SHUFFLE_GATHER = 0.48;
export const SHUFFLE_RELEASE = 0.77;
export const SHUFFLE_RISE = 0.34;
export const SHUFFLE_BATCH_INTERVAL = 0.05;
export const SHUFFLE_WATER_TAIL = 0.14;

interface SurfaceRipple { x: number; y: number; at: number; radius: number }

function ramp(time: number, start: number, end: number): number {
    return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

/** A single graphics layer inside the water mask, driven by the pool clock. */
export class FlowerShuffleWater {
    private readonly node: Node;
    private readonly art: Graphics;
    private readonly ink = new Color();
    private readonly splashes: SurfaceRipple[] = [];

    constructor(parent: Node) {
        this.node = uiNode(parent, 'ShuffleWater', 0, SHUFFLE_CENTER_Y);
        this.art = this.node.addComponent(Graphics);
        this.art.lineCap = Graphics.LineCap.ROUND;
    }

    addSplash(x: number, y: number, at: number, radius: number): void {
        this.splashes.push({ x, y: y - SHUFFLE_CENTER_Y, at, radius });
    }

    private color(r: number, g: number, b: number, alpha: number): Color {
        return this.ink.set(r, g, b, Math.round(Math.max(0, Math.min(255, alpha))));
    }

    private ring(x: number, y: number, radius: number, width: number, alpha: number): void {
        const g = this.art;
        g.lineWidth = width;
        g.strokeColor = this.color(190, 252, 255, alpha);
        g.ellipse(x, y, radius, radius * 0.79);
        g.stroke();
    }

    private spiral(angle: number, radius: number, alpha: number): void {
        const g = this.art;
        // Both edges meet at the ends so the stream tapers without visible joins.
        for (let edge = 0; edge < 2; edge++) {
            for (let segment = 0; segment <= 20; segment++) {
                const p = (edge === 0 ? segment : 20 - segment) / 20;
                const theta = angle + p * 1.9;
                const width = Math.sin(Math.PI * p) * (2 + 3 * p);
                const r = radius * (1 - p * 0.47) + width * (edge === 0 ? 1 : -1);
                const x = Math.cos(theta) * r, y = Math.sin(theta) * r * 0.79;
                if (edge === 0 && segment === 0) g.moveTo(x, y);
                else g.lineTo(x, y);
            }
        }
        g.close();
        g.fillColor = this.color(196, 250, 255, alpha);
        g.fill();
    }

    draw(time: number): void {
        const g = this.art;
        g.clear();
        const pull = ramp(time, 0.05, SHUFFLE_GATHER);
        const light = pull * (1 - ramp(time, SHUFFLE_RELEASE + 0.02, 1.15));
        const burst = ramp(time, SHUFFLE_GATHER, 0.61);
        const crest = Math.pow(light, 1.25);

        if (light > 0.004) {
            const radius = 50 + 26 * burst + 6 * Math.sin(time * 15);
            // Layer soft edges under a smaller crisp rim so the center reads on bright water.
            for (let band = 0; band < 6; band++) {
                const size = radius * (1.25 - band * 0.115);
                g.fillColor = this.color(28, 143, 201, (14 + band * 4) * crest);
                g.ellipse(0, 0, size, size * 0.79);
                g.fill();
            }
            this.ring(0, 0, radius, 35, 22 * crest);
            this.ring(0, 0, radius, 22, 43 * crest);
            this.ring(0, 0, radius, 12, 75 * crest);
            this.ring(0, 0, radius, 5, 179 * crest);
            this.ring(0, 0, radius - 2, 1.7, 220 * crest);

            const spin = time * 9.5;
            for (let arm = 0; arm < 3; arm++) {
                this.spiral(spin + arm * Math.PI * 2 / 3, 208 - 61 * pull, light * (arm === 0 ? 203 : 136));
            }
            for (let i = 0; i < 12; i++) {
                const orbit = 87 + (i * 29 % 66) + burst * 21;
                const angle = i * 2.39996 + spin * (0.54 + (i % 3) * 0.12);
                const x = Math.cos(angle) * orbit, y = Math.sin(angle) * orbit * 0.79;
                this.ring(x, y, 2.5 + i % 4, 1.4, (95 + (i % 4) * 29) * light);
            }
        }
        for (let wave = 0; wave < 2; wave++) {
            const age = time - SHUFFLE_GATHER - wave * 0.12;
            if (age <= 0 || age >= 0.53) continue;
            const p = age / 0.53;
            const radius = 69 + 225 * (1 - (1 - p) ** 2);
            const alpha = Math.sin(Math.PI * p) * (1 - p);
            this.ring(0, 0, radius, 10 - 5 * p, 54 * alpha);
            this.ring(0, 0, radius + 2, 2.5, 199 * alpha);
        }
        for (const splash of this.splashes) {
            const p = (time - splash.at) / (SHUFFLE_RISE + SHUFFLE_WATER_TAIL);
            if (p <= 0 || p >= 1) continue;
            const a = Math.sin(Math.PI * p) * (1 - p);
            this.ring(splash.x, splash.y, 12 + splash.radius * p, 2.8 - 1.5 * p, 185 * a);
            for (let i = 0; i < 3; i++) {
                const angle = i * 2.39 + splash.x * 0.037;
                const radius = (9 + splash.radius * p) * 0.75;
                const x = splash.x + Math.cos(angle) * radius;
                const y = splash.y + Math.sin(angle) * radius * 0.72 + Math.sin(Math.PI * p) * 18;
                g.fillColor = this.color(216, 255, 255, 210 * a);
                g.circle(x, y, 3 - 1.8 * p);
                g.fill();
            }
        }
    }

    dispose(): void { this.node.destroy(); }
}
