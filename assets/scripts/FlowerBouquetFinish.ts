import { Color, Graphics } from 'cc';

export const BOUQUET_FINISH_DURATION = 0.66;
const TAU = Math.PI * 2;
const clamp = (p: number) => Math.max(0, Math.min(1, p));
const easeOut = (p: number) => 1 - (1 - p) ** 3;
const bloom = (p: number, rise: number, peak: number, end: number) =>
    clamp((p - rise) / (peak - rise)) * (1 - clamp((p - peak) / (end - peak))) ** 1.45;

const GOLD_BANDS = [
    { width: 3.15, r: 250, g: 143, b: 33, opacity: 29 },
    { width: 1.74, r: 255, g: 161, b: 38, opacity: 87 },
    { width: 1.02, r: 255, g: 210, b: 81, opacity: 226 },
    { width: 0.39, r: 255, g: 248, b: 195, opacity: 255 },
];
const SILK_BANDS = [
    { width: 2.14, r: 252, g: 137, b: 108, opacity: 28 },
    { width: 0.93, r: 255, g: 182, b: 130, opacity: 123 },
    { width: 0.32, r: 255, g: 241, b: 218, opacity: 228 },
];
type RGB = readonly [number, number, number];
type RibbonPoint = { x: number; y: number; nx: number; ny: number; depth: number; u: number };
const PEARL: RGB = [255, 250, 217];
const ROSE: RGB = [255, 216, 207];
const AMBER: RGB = [255, 211, 114];
const OUTER_STARS: { x: number; y: number; when: number; size: number; color: RGB }[] = [
    { x: 76, y: -12, when: 0.30, size: 21, color: AMBER },
    { x: -68, y: 26, when: 0.43, size: 19, color: PEARL },
    { x: 72, y: 51, when: 0.56, size: 23, color: ROSE },
    { x: -53, y: 71, when: 0.68, size: 14, color: AMBER },
];
const LIGHT_STREAKS: { x: number; y: number; delay: number; length: number; color: RGB }[] = [
    { x: -77, y: -39, delay: 0.19, length: 34, color: PEARL },
    { x: -56, y: -13, delay: 0.29, length: 43, color: AMBER },
    { x: 68, y: -44, delay: 0.25, length: 46, color: AMBER },
    { x: 84, y: -13, delay: 0.37, length: 32, color: ROSE },
    { x: -80, y: 4, delay: 0.46, length: 24, color: ROSE },
];

/** Paints the completed bouquet on either side of the actual basket art. */
export class FlowerBouquetFinish {
    private readonly ink = new Color();

    constructor(private readonly back: Graphics, private readonly front: Graphics) {}

    draw(x: number, y: number, p: number): void {
        this.gather(x, y - 42, p);
        this.flare(x, y + 9, p);
        this.ribbon(x, y, p, false);
        this.ribbon(x, y + 16, p, true);
        this.lightStreaks(x, y, p);
        this.petals(x, y, p);
        this.sparkles(x, y, p);
        this.outerStars(x, y, p);
    }

    drawRewardStar(start: { x: number; y: number }, end: { x: number; y: number }, elapsed: number): void {
        const art = this.front;
        for (let star = 0; star < 3; star++) {
            const p = (elapsed - 0.22 - star * 0.06) / 0.30;
            if (p < 0 || p >= 1) continue;
            const t = p * p * (3 - 2 * p), crest = Math.sin(Math.PI * t);
            const offset = (star - 1) * 21 * (1 - t);
            const x = start.x + (end.x - start.x) * t + offset;
            const y = start.y + (end.y - start.y) * t + (17 + star * 11) * crest;
            const size = 8.5 + 4 * Math.sin(Math.PI * p);
            art.fillColor = this.color(255, 214 + star * 12, 113, 245 * Math.min(1, (1 - p) * 5));
            for (let i = 0; i < 10; i++) {
                const angle = i * Math.PI / 5 + 0.26 * p - Math.PI / 2;
                const radius = size * (i % 2 ? .48 : 1);
                const px = x + Math.cos(angle) * radius, py = y + Math.sin(angle) * radius;
                if (i === 0) art.moveTo(px, py);
                else art.lineTo(px, py);
            }
            art.close(); art.fill();
        }
    }

    private color(r: number, g: number, b: number, alpha: number): Color {
        return this.ink.set(r, g, b, Math.round(255 * clamp(alpha / 255)));
    }

    private glow(art: Graphics, x: number, y: number, rx: number, ry: number, strength: number): void {
        if (strength <= 0.02) return;
        for (let step = 0; step < 6; step++) {
            const scale = 1 - step * 0.13;
            art.fillColor = this.color(255, 168 + step * 14, 58 + step * 26, strength * (5 + step * 4));
            art.ellipse(x, y, rx * scale, ry * scale);
            art.fill();
        }
    }

    private gather(x: number, y: number, p: number): void {
        const charge = clamp(p / 0.18);
        const shine = bloom(p, 0, 0.15, 0.39);
        this.glow(this.back, x, y, 45 + 40 * charge, 30, shine * 1.05);
        if (p >= 0.2) return;
        const strength = Math.sin(Math.PI * charge * 0.83);
        for (let i = 0; i < 8; i++) {
            const angle = TAU * i / 8 + 0.7 + charge * 0.62;
            const radius = 92 - charge * (66 + i % 3 * 4);
            const xx = Math.cos(angle) * radius, yy = Math.sin(angle) * radius * 0.58;
            const line = this.front;
            line.lineWidth = 1.7 + i % 3 * 0.42;
            line.strokeColor = this.color(255, 204, 102, 211 * strength);
            line.moveTo(x + xx * 1.22, y + yy * 1.19);
            line.lineTo(x + xx, y + yy);
            line.stroke();
            line.fillColor = this.color(255, 249, 222, 200 * strength);
            line.ellipse(x + xx, y + yy, 1.8, 1.8); line.fill();
        }
    }

    private flare(x: number, y: number, p: number): void {
        const impact = bloom(p, 0.12, 0.23, 0.62);
        const flash = bloom(p, 0.15, 0.24, 0.44);
        if (impact <= 0.01) return;
        const expansion = easeOut(clamp((p - 0.13) / 0.41));
        this.glow(this.back, x, y, 65 + expansion * 39, 53 + expansion * 22, impact * 2.6);
        this.glow(this.front, x, y, 44 + expansion * 14, 35, flash * 0.85);
        const radius = 23 + expansion * 69;
        const baseline = y - 54;
        const art = this.back;
        art.lineWidth = 8 * impact + 1;
        art.strokeColor = this.color(239, 153, 46, 95 * impact);
        art.ellipse(x, baseline, radius, radius * 0.31); art.stroke();
        const front = this.front;
        for (let band = 0; band < 2; band++) {
            const r = radius + band * 5;
            front.lineWidth = band ? 1 : 2.9;
            front.strokeColor = this.color(255, band ? 202 : 244, band ? 77 : 182, (band ? 146 : 232) * impact);
            for (let i = 0; i <= 20; i++) {
                const angle = Math.PI * i / 20;
                const xx = x + r * Math.cos(angle), yy = baseline - r * 0.31 * Math.sin(angle);
                if (i === 0) front.moveTo(xx, yy);
                else front.lineTo(xx, yy);
            }
            front.stroke();
        }

        for (let i = 0; i < 8; i++) {
            const direction = (i - 3.5) * 0.34;
            const height = (49 + (i * 23 % 41)) * (0.35 + expansion * 0.65);
            const xx = x + Math.sin(direction) * height * 0.95;
            const yy = y - 28 + Math.cos(direction) * height;
            const width = (3.6 + i % 3) * impact;
            art.fillColor = this.color(255, 205 + i % 2 * 24, 100 + i % 2 * 35, 104 * impact);
            art.moveTo(x - width, y - 23); art.lineTo(xx - width * 0.65, yy - 7);
            art.lineTo(xx, yy + 13); art.lineTo(xx + width * 0.65, yy - 7);
            art.lineTo(x + width, y - 23); art.close(); art.fill();
        }
        this.glint(x - 32, y + 34, 17 * flash, flash, 1.45);
        this.glint(x + 62, y - 5, 12 * impact, impact * 0.89, 1.15);
        const echo = bloom(p, 0.27, 0.43, 0.61);
        this.glint(x - 64, y + 15, 11 * echo, echo * 0.74, 1.4);
    }

    private ribbon(x: number, y: number, p: number, silk: boolean): void {
        const time = p - (silk ? 0.06 : 0);
        const brightness = bloom(time, 0.055, 0.275, silk ? 0.84 : 0.79);
        if (brightness <= 0.01) return;
        const head = easeOut(clamp((time - 0.055) / 0.44));
        const tail = clamp((time - 0.23) / (silk ? 0.62 : 0.56)) ** 1.68;
        const steps = Math.max(5, Math.ceil(47 * (head - tail)));
        const spin = TAU * (silk ? 1.86 : 2.08);
        const points = Array.from({ length: steps + 1 }, (_, index) => {
            const u = index / steps;
            const lift = tail + (head - tail) * u;
            const angle = lift * spin + (silk ? 0.77 : -0.65) + time * 0.92;
            const depth = Math.sin(angle), side = Math.cos(angle);
            const radius = (silk ? 89 : 78) + Math.sin(lift * Math.PI) * 10 - lift * 9;
            const dx = -depth * radius * spin, dy = 123 + side * 16 * spin;
            const thickness = Math.sin(Math.PI * u) ** 0.56 * (1.28 + (1 - depth) * 2.54);
            const normal = thickness / Math.sqrt(dx * dx + dy * dy);
            return { x: x + side * radius, y: y - 63 + 123 * lift + depth * 16, nx: -dy * normal, ny: dx * normal, depth, u };
        });
        // Keep the rear arc behind the flowers as the highlight travels through a crossing.
        let start = 0;
        while (start < steps) {
            const rear = points[start].depth > 0.13;
            let end = start + 1;
            while (end < steps && end - start < 6 && (points[end].depth > 0.13) === rear) end++;
            const art = rear ? this.back : this.front;
            const light = brightness * (rear ? 0.67 : 1);
            for (const band of silk ? SILK_BANDS : GOLD_BANDS) {
                const { width, r, g, b, opacity } = band;
                art.fillColor = this.color(r, g, b, light * opacity);
                const first = points[start];
                art.moveTo(first.x + first.nx * width, first.y + first.ny * width);
                for (let i = start + 1; i <= end; i++) {
                    const q = points[i];
                    art.lineTo(q.x + q.nx * width, q.y + q.ny * width);
                }
                for (let i = end; i >= start; i--) {
                    const q = points[i];
                    art.lineTo(q.x - q.nx * width, q.y - q.ny * width);
                }
                art.close(); art.fill();
            }
            this.ribbonEdge(art, points, start, end, light, time, silk);
            start = end;
        }

        const shimmer = bloom(time, 0.17, 0.33, silk ? 0.71 : 0.58);
        const leading = points[Math.floor(steps * 0.88)];
        if (shimmer > 0.05 && leading.depth <= 0.13) {
            this.glint(leading.x, leading.y, silk ? 5.2 : 7.4, shimmer * 0.96, 1.22, silk ? ROSE : PEARL);
        }
    }

    private ribbonEdge(art: Graphics, points: RibbonPoint[], start: number, end: number, light: number, time: number, silk: boolean): void {
        const middle = (points[start].u + points[end].u) * 0.5;
        const crest = 0.18 + 0.76 * clamp((time - 0.12) / 0.52);
        const shine = Math.max(0, 1 - Math.abs(middle - crest) * 4.4) ** 2;
        const edge: RGB = silk ? ROSE : PEARL;
        art.lineWidth = silk ? 0.65 + 0.37 * shine : 0.62 + 0.64 * shine;
        art.strokeColor = this.color(...edge, light * (115 + 135 * shine));
        for (let i = start; i <= end; i++) {
            const q = points[i];
            const twist = Math.sin(TAU * (q.u * 1.18 - time * 1.15));
            const offset = (silk ? 1.51 : 1.97) + 0.33 * twist;
            const px = q.x + q.nx * offset, py = q.y + q.ny * offset;
            if (i === start) art.moveTo(px, py);
            else art.lineTo(px, py);
        }
        art.stroke();
    }

    private petals(x: number, y: number, p: number): void {
        for (let i = 0; i < 10; i++) {
            const delay = 0.18 + (i % 4) * 0.033;
            const life = (p - delay) / (1 - delay);
            if (life <= 0 || life >= 1) continue;
            const travel = easeOut(life);
            const reach = 26 + (i * 19 % 66);
            const angle = i * 2.39996;
            const xx = x + Math.cos(angle) * (12 + reach * travel) + Math.sin(life * 5 + angle) * 8 * life;
            const yy = y - 16 + Math.sin(angle) * reach * 0.46 * travel + 89 * life - 44 * life * life;
            const alpha = clamp(life * 10) * (1 - life) ** 1.15;
            const size = (6 + i % 4 * 1.15) * (1 - life * 0.5);
            const rotation = angle + life * (i % 2 ? 2.6 : -2.4);
            const dx = Math.cos(rotation) * size, dy = Math.sin(rotation) * size;
            const fold = 0.48 + 0.24 * Math.cos(life * 8 + i);
            const art = i % 4 === 0 ? this.back : this.front;
            // Curved petal with a pale vein, in gold and natural peach tones.
            const tone = i % 4 === 1 ? ROSE : i % 4 === 2 ? PEARL : AMBER;
            art.fillColor = this.color(...tone, 233 * alpha);
            art.moveTo(xx - dx, yy - dy);
            art.bezierCurveTo(xx - dx * 0.3 - dy * fold, yy - dy * 0.3 + dx * fold,
                xx + dx - dy * fold, yy + dy + dx * fold, xx + dx, yy + dy);
            art.bezierCurveTo(xx + dx + dy * fold, yy + dy - dx * fold,
                xx - dx * 0.3 + dy * fold, yy - dy * 0.3 - dx * fold, xx - dx, yy - dy);
            art.close(); art.fill();
            art.lineWidth = 0.9;
            art.strokeColor = this.color(255, 245, 203, 145 * alpha);
            art.moveTo(xx - dx * 0.55, yy - dy * 0.55); art.lineTo(xx + dx * 0.61, yy + dy * 0.61); art.stroke();
        }
    }

    private lightStreaks(x: number, y: number, p: number): void {
        for (const streak of LIGHT_STREAKS) {
            const life = clamp((p - streak.delay) / 0.42);
            const shine = Math.sin(life * Math.PI) ** 1.55;
            if (shine <= 0.025) continue;
            const xx = x + streak.x * (0.91 + life * 0.11);
            const tip = y + streak.y + 74 * easeOut(life);
            const tail = tip - streak.length * (0.35 + 0.65 * shine);
            const art = this.front;
            // A long, thin tapered halo keeps the lines separate from the flower faces.
            art.fillColor = this.color(...streak.color, shine * 112);
            art.moveTo(xx, tail);
            art.lineTo(xx + 2, tip - 9);
            art.lineTo(xx, tip + 2);
            art.lineTo(xx - 2, tip - 9);
            art.close(); art.fill();
            art.lineWidth = 0.86;
            art.strokeColor = this.color(...PEARL, 237 * shine);
            art.moveTo(xx, tail + 9); art.lineTo(xx, tip); art.stroke();
            art.fillColor = this.color(...streak.color, 244 * shine);
            art.ellipse(xx, tip, 1.2 + shine * 0.9, 1.4 + shine * 0.8); art.fill();
        }
    }

    private sparkles(x: number, y: number, p: number): void {
        for (let i = 0; i < 23; i++) {
            const delay = 0.16 + (i % 8) * 0.062;
            const life = (p - delay) / (1 - delay);
            if (life <= 0 || life >= 1) continue;
            const alpha = clamp(life * 14) * (1 - life) ** 1.38 * (0.68 + 0.32 * Math.cos(life * 10 + i) ** 2);
            const angle = i * 2.39996;
            const distance = 21 + (i * 29 % 78) * easeOut(life);
            const xx = x + Math.cos(angle) * distance;
            const yy = y + Math.sin(angle) * distance * 0.58 + life * (i % 3 ? 51 : 75) - 8;
            const size = (1.32 + i % 3 * 0.62) * (1 - life * 0.48);
            if (i % 4 === 0) {
                this.glint(xx, yy, size * 3.8, alpha, 1.32);
                continue;
            }
            this.front.fillColor = this.color(255, 171, 57, 89 * alpha);
            this.front.ellipse(xx, yy, size * 2.3, size * 2.3); this.front.fill();
            const tone = i % 5 === 1 ? ROSE : i % 3 === 1 ? PEARL : AMBER;
            this.front.fillColor = this.color(...tone, 245 * alpha);
            this.front.ellipse(xx, yy, size, size); this.front.fill();
        }
    }

    private outerStars(x: number, y: number, p: number): void {
        for (const star of OUTER_STARS) {
            const life = clamp((p - star.when + 0.09) / 0.28);
            const output = bloom(p, star.when - 0.09, star.when, star.when + 0.19);
            if (output <= 0.015) continue;
            const xx = x + star.x * (0.89 + 0.15 * life);
            const yy = y + star.y + 13 * life;
            this.glint(xx, yy, star.size * (0.46 + 0.54 * easeOut(life)), output, 1.44, star.color);
            this.front.fillColor = this.color(...PEARL, 240 * output);
            const core = 1.4 + 1.2 * output;
            this.front.ellipse(xx, yy, core, core); this.front.fill();
        }
    }

    private glint(x: number, y: number, radius: number, strength: number, vertical: number, tone: RGB = PEARL): void {
        if (strength <= 0.015) return;
        this.glow(this.front, x, y, radius * 1.15, radius * 1.6, strength * 1.13);
        const art = this.front;
        art.fillColor = this.color(...tone, strength * 251);
        for (let i = 0; i < 8; i++) {
            const angle = i * TAU / 8;
            const r = radius * (i % 2 ? 0.2 : 1);
            const xx = x + Math.cos(angle) * r, yy = y + Math.sin(angle) * r * vertical;
            if (i === 0) art.moveTo(xx, yy);
            else art.lineTo(xx, yy);
        }
        art.close(); art.fill();
    }
}
