import { Color, Graphics, Node, Sprite, SpriteFrame, UIOpacity, UITransform, Vec3 } from 'cc';
import { FlowerButterflyStarlight } from './FlowerButterflyStarlight';
import { fade, uiNode } from './FlowerUI';

export const BUTTERFLY_WING_HEIGHT = 48;
export const BUTTERFLY_PAIR_OFFSET = new Vec3(50, 11, 0);

const TAU = Math.PI * 2;
const TRAIL_PARTICLES = 56;
const TRAIL_LIFETIME = 0.60;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Two hinged wings and the light shed during one pairing. Coordinates are in the flight layer. */
export class FlowerButterflyFlight {
    readonly root: Node;
    readonly takeoff: Vec3;
    private readonly butterfly: Node;
    private readonly left: Node;
    private readonly right: Node;
    private readonly body: Node;
    private readonly opacity: UIOpacity;
    private readonly light: FlowerButterflyStarlight;
    private readonly hinge: number;

    constructor(parent: Node, frame: SpriteFrame, private readonly slot: Vec3, pink: boolean) {
        this.root = uiNode(parent, 'ButterflyPair', 0, 0, 1, 1);
        this.light = new FlowerButterflyStarlight(this.root, pink);
        this.takeoff = new Vec3(slot.x + 13, slot.y + 8, slot.z);
        this.butterfly = uiNode(this.root, 'Butterfly', 0, 0, 1, 1);
        this.opacity = this.butterfly.addComponent(UIOpacity);
        const { width, height } = frame.originalSize;
        const wingWidth = BUTTERFLY_WING_HEIGHT * width / height;
        // Both images depict a left wing. Their inner tips share the body's hinge.
        const anchor = 0.94;
        this.hinge = wingWidth * (anchor - 0.5);
        this.left = this.makeWing('LeftWing', frame, wingWidth, anchor);
        this.right = this.makeWing('RightWing', frame, wingWidth, anchor);
        this.body = uiNode(this.butterfly, 'Body', 0, 0, 1, 1);
        this.drawBody(pink);
        this.merge(0);
    }

    private makeWing(name: string, frame: SpriteFrame, width: number, anchor: number): Node {
        const wing = uiNode(this.butterfly, name, 0, 0, width, BUTTERFLY_WING_HEIGHT);
        // Set the pivot near the middle of the long edge, where the wing attaches.
        wing.getComponent(UITransform)!.setAnchorPoint(anchor, 0.46);
        const sprite = wing.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.trim = false;
        sprite.spriteFrame = frame;
        return wing;
    }

    private drawBody(pink: boolean): void {
        const body = this.body.addComponent(Graphics);
        const edge = pink ? new Color(165, 87, 125) : new Color(55, 129, 144);
        const shell = pink ? new Color(247, 165, 184) : new Color(141, 220, 205);
        const shine = pink ? new Color(255, 231, 207) : new Color(229, 255, 226);
        body.fillColor = edge;
        body.ellipse(0, -3.4, 2.9, 12); body.fill();
        body.ellipse(0, 3.2, 3.6, 5.2); body.fill();
        body.circle(0, 9.6, 3); body.fill();
        body.fillColor = shell;
        body.ellipse(0.15, -2.5, 2.15, 10.4); body.fill();
        body.ellipse(0.1, 3.8, 2.95, 4.3); body.fill();
        body.circle(0.1, 10, 2.5); body.fill();
        body.fillColor = shine;
        body.ellipse(-0.64, 0.3, 0.85, 7); body.fill();
        body.circle(-0.6, 10.6, 0.96); body.fill();
        body.lineWidth = 1.15;
        body.strokeColor = edge;
        for (const side of [-1, 1]) {
            body.moveTo(side * 1.2, 11.5);
            body.quadraticCurveTo(side * 2.8, 19, side * 7, 19);
            body.stroke();
            body.fillColor = shell;
            body.circle(side * 7, 19, 1.1); body.fill();
        }
    }

    merge(progress: number): void {
        const t = smooth(progress), apart = 1 - t;
        this.butterfly.setPosition(this.slot.x + 13 * t, this.slot.y + 8 * t, this.slot.z);
        this.left.setPosition(this.hinge * apart, 0, 0);
        this.right.setPosition((BUTTERFLY_PAIR_OFFSET.x - this.hinge) * apart, BUTTERFLY_PAIR_OFFSET.y * apart, 0);
        this.left.angle = 7 * Math.sin(Math.PI * t);
        this.right.angle = -11 * Math.sin(Math.PI * t);
        const spread = 1 + 0.12 * Math.sin(Math.PI * t);
        this.left.setScale(spread, 1, 1);
        this.right.setScale(-spread, 1, 1);
        this.body.active = progress > 0.56;
        if (this.body.active) fade(this.body, Math.min(255, Math.round((progress - 0.56) * 810)));
        this.light.beginFrame();
        if (progress > 0.64) this.burst(this.takeoff, (progress - 0.64) * 1.9, 30);
        this.light.endFrame();
    }

    fly(progress: number, destination: Vec3): void {
        const { x, y, z } = this.flightPoint(progress, destination);
        const rise = Math.sin(Math.PI * progress);
        const turn = Math.max(-28, Math.min(28, (this.takeoff.x - destination.x) * 0.16));
        this.butterfly.setPosition(x, y, z);
        this.butterfly.angle = rise * (turn + 13 * Math.sin(progress * TAU * 1.25));
        const size = 1 + 0.63 * rise;
        this.butterfly.setScale(size, size, 1);
        this.flap(TAU * (5.5 * progress + 0.22 * Math.sin(Math.PI * progress)));
        this.light.beginFrame();
        if (progress < 0.13) this.burst(this.takeoff, 0.68 + progress * 2.46, 30);
        this.trail(progress, destination);
        this.light.endFrame();
    }

    land(progress: number, destination: Vec3): void {
        this.butterfly.setPosition(destination);
        this.flap(TAU * (5.5 + progress * (0.97 - progress * 0.27)));
        const size = 1 + 0.08 * Math.sin(Math.PI * progress) - 0.38 * progress;
        this.butterfly.setScale(size, size, 1);
        this.opacity.opacity = Math.round(255 * (1 - smooth(progress)));
        this.light.beginFrame();
        this.trail(1 + progress * TRAIL_LIFETIME, destination);
        this.burst(destination, progress, 65);
        this.light.endFrame();
    }

    private flap(phase: number): void {
        const spread = (offset: number) => 0.19 + 0.81 * (0.5 + 0.5 * Math.cos(phase + offset)) ** 0.8;
        this.left.setScale(spread(0), 0.96 + 0.04 * Math.cos(phase), 1);
        this.right.setScale(-spread(0.43), 0.96 + 0.04 * Math.cos(phase + 0.43), 1);
        this.left.angle = 8 * Math.sin(phase);
        this.right.angle = -8 * Math.sin(phase + 0.43);
    }

    private flightPoint(progress: number, end: Vec3): Vec3 {
        const t = smooth(progress), bow = Math.sin(Math.PI * progress), start = this.takeoff;
        const sway = (12 + 22 * Math.sin(TAU * progress * 1.05)) * bow;
        const lift = (37 + 10 * Math.sin(TAU * progress * 1.8) + 3 * Math.sin(TAU * progress * 5.5)) * bow;
        return new Vec3(start.x + (end.x - start.x) * t + sway, start.y + (end.y - start.y) * t + lift, start.z);
    }

    private trail(time: number, destination: Vec3): void {
        const first = Math.max(0, Math.ceil((time - TRAIL_LIFETIME) * TRAIL_PARTICLES - 0.5));
        const last = Math.min(TRAIL_PARTICLES - 1, Math.floor(time * TRAIL_PARTICLES - 0.5));
        for (let i = first; i <= last; i++) {
            const emitted = (i + 0.5) / TRAIL_PARTICLES;
            const age = (time - emitted) / TRAIL_LIFETIME;
            const { x, y } = this.flightPoint(emitted, destination);
            const next = this.flightPoint(Math.min(1, emitted + 0.025), destination);
            const dx = next.x - x, dy = next.y - y;
            const distance = Math.max(0.01, Math.hypot(dx, dy));
            const side = i % 2 ? -1 : 1;
            const spread = side * (10 + (15 + i % 4 * 3) * age + 8 * Math.sin(emitted * TAU * 3.2));
            const lag = 12 + 20 * age;
            // Stay on the previous flight path, then drift outward and fall a little as the light cools.
            const px = x - (dy * spread + dx * lag) / distance;
            const py = y + (dx * spread - dy * lag) / distance - 18 * age;
            const alpha = Math.max(0, 1 - age) ** 0.54;
            const twinkle = 0.87 + 0.13 * Math.cos(age * TAU * 2 + i * 2.39996);
            if (i % 5 === 0) {
                const radius = (10 + i % 4 * 1.45) * (1 - 0.32 * age);
                this.light.draw('star', px, py, radius * twinkle, alpha, i * 0.55 + age * 0.8, i % 3 !== 0);
            } else {
                const radius = (2.5 + i % 4 * 0.78) * (1 - 0.44 * age);
                this.light.draw('point', px, py, radius, alpha * twinkle, 0, i % 3 !== 1);
            }
        }
    }

    private burst(center: Vec3, progress: number, reach: number): void {
        const ease = 1 - (1 - progress) ** 2;
        for (let i = 0; i < 15; i++) {
            const angle = i * 2.39996;
            const star = i % 3 === 0;
            const radius = (star ? 8.2 + i % 4 * 1.5 : 2.8 + i % 4 * 0.5) * (1 - progress * 0.44);
            const distance = 8 + ease * (reach * (0.56 + i % 4 * 0.14));
            this.light.draw(star ? 'star' : 'point', center.x + Math.cos(angle) * distance,
                center.y + Math.sin(angle) * distance * 0.74, radius, (1 - progress) ** 1.08, angle + progress, i % 2 === 0);
        }
    }
}
