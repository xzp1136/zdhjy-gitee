import { Color, Graphics } from 'cc';

type Point = {x: number; y: number};
export type CollectionPulse = 'water' | 'tray' | 'order';

/** A tapered ribbon that trails behind the flower and contracts on landing. */
export class FlowerFlightTrail {
    private readonly color = new Color();

    constructor(private readonly art: Graphics) {}

    draw(from: Point, current: Point, progress: number, width: number, height: number): void {
        const art = this.art;
        art.clear();
        const dx = current.x - from.x, dy = current.y - from.y;
        const distance = Math.hypot(dx, dy);
        const strength = Math.min(1, progress * 9, (1 - progress) * 5);
        if (distance < 3 || strength <= 0) return;
        const ux = dx / distance, uy = dy / distance;
        const depth = Math.hypot(width * ux, height * uy);
        const span = Math.hypot(width * uy, height * ux);
        const inset = Math.min(8, distance * 0.18);
        // Short flights can trail behind the flower's rear edge at pickup.
        const pickupReach = Math.min(distance, depth) * 0.45;
        const length = Math.min(distance - inset + pickupReach, 224, 64 + depth * 1.16) * Math.sqrt(strength);
        const reach = Math.min(28, 11 + span * 0.14) * strength;
        const hx = current.x - ux * inset;
        const hy = current.y - uy * inset;
        for (let band = 0; band < 2; band++) {
            const radius = reach * (band === 0 ? 1 : 0.54);
            for (let i = 0; i < 8; i++) {
                const fromTail = i / 8, toTail = (i + 1) / 8;
                const a = (1 - fromTail) ** 0.85 * radius, b = (1 - toTail) ** 0.85 * radius;
                const ax = hx - ux * length * fromTail, ay = hy - uy * length * fromTail;
                const bx = hx - ux * length * toTail, by = hy - uy * length * toTail;
                const alpha = Math.round(strength * (1 - (fromTail + toTail) / 2) ** 1.05 * (band === 0 ? 155 : 239));
                art.fillColor = this.color.set(255, band === 0 ? 199 : 246, band === 0 ? 116 : 207, alpha);
                art.moveTo(ax - uy * a, ay + ux * a);
                art.lineTo(bx - uy * b, by + ux * b);
                art.lineTo(bx + uy * b, by - ux * b);
                art.lineTo(ax + uy * a, ay - ux * a);
                art.close(); art.fill();
            }
        }
    }
}

/** Water kicks at pickup; cream glints acknowledge the actual destination. */
export function drawCollectionPulse(art: Graphics, ink: Color, kind: CollectionPulse, progress: number, extent: number): void {
    art.clear();
    const rise = 1 - (1 - progress) ** 2, alpha = (1 - progress) ** 1.6;
    const water = kind === 'water';
    const radius = extent * (0.42 + rise * (water ? 0.92 : 0.62));
    const squash = water ? 0.65 : kind === 'tray' ? 0.66 : 0.86;
    art.lineWidth = water ? 4.2 : 3.2;
    art.strokeColor = ink.set(water ? 84 : 255, water ? 222 : 187, water ? 246 : 92, Math.round(118 * alpha));
    art.ellipse(0, 0, radius, radius * squash); art.stroke();
    art.lineWidth = 1.8;
    art.strokeColor = ink.set(255, 252, water ? 250 : 221, Math.round(222 * alpha));
    art.ellipse(0, 0, radius * 0.94, radius * squash * 0.94); art.stroke();
    for (let i = 0; i < 6; i++) {
        const angle = i * 2.39996 + 0.6;
        const reach = radius * (water ? 1.02 : 0.86 + i % 3 * 0.18);
        const size = (i % 3 === 0 ? 3.6 : 2.2) * (1 - 0.55 * progress);
        art.fillColor = ink.set(255, water ? 246 : 234, water ? 255 : 165, Math.round(240 * alpha));
        art.ellipse(Math.cos(angle) * reach, Math.sin(angle) * reach * squash, size, size); art.fill();
    }
}
