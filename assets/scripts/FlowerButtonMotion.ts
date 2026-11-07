import { _decorator, Button, Component, EventTouch, Node, UITransform } from 'cc';

export interface ButtonMotionOptions { pressScale?: number; idlePulse?: boolean; }
const quadInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);

/** ButtonHandler 43784/43785: 0.1 s InOutQuad; one clock prevents tween stacking. */
@_decorator.ccclass('FlowerButtonMotion')
export class FlowerButtonMotion extends Component {
    private visual: Node | null = null;
    private button: Button | null = null;
    private pressScale = 0.9;
    private idlePulse = false;
    private held = false;
    private inside = false;
    private scale = 1;
    private from = 1;
    private to = 1;
    private elapsed = 0.1;
    private idleTime = 0;

    configure(visual: Node, button: Button, options: ButtonMotionOptions): void {
        this.visual = visual; this.button = button;
        this.pressScale = options.pressScale ?? 0.9;
        this.idlePulse = !!options.idlePulse;
        this.node.on(Node.EventType.TOUCH_START, this.press, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.move, this);
        this.node.on(Node.EventType.TOUCH_END, this.release, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.release, this);
    }

    private get available(): boolean {
        return !!this.button?.interactable && this.button.enabledInHierarchy && !!this.visual?.isValid && this.visual.activeInHierarchy;
    }
    private draw(value: number): void {
        this.scale = value;
        if (this.visual?.isValid) this.visual.setScale(value, value, 1);
    }
    private transition(value: number): void {
        this.from = this.scale; this.to = value; this.elapsed = 0;
    }
    private press(): void {
        if (!this.available) return;
        this.held = this.inside = true;
        this.transition(this.pressScale);
    }
    private move(event: EventTouch): void {
        if (!this.held || !this.available || !event.touch) return;
        const inside = this.node.getComponent(UITransform)!.hitTest(event.touch.getLocation(), event.windowId);
        if (inside === this.inside) return;
        this.inside = inside;
        this.transition(inside ? this.pressScale : 1);
    }
    private release(): void {
        if (!this.held) return;
        this.held = this.inside = false;
        this.idleTime = 0;
        this.transition(1);
    }

    update(dt: number): void {
        if (!this.available) { this.reset(); return; }
        dt = Math.max(0, dt);
        if (this.elapsed < 0.1) {
            const step = Math.min(dt, 0.1 - this.elapsed);
            this.elapsed = Math.min(0.1, this.elapsed + step); dt -= step;
            this.draw(this.from + (this.to - this.from) * quadInOut(this.elapsed / 0.1));
            if (this.elapsed < 0.1) return;
        }
        if (this.idlePulse && !this.held && dt > 0) {
            // ButtonHandler 43788: 1.6 s, InOutQuad, infinite Yoyo; 43790 restarts it after release.
            this.idleTime = (this.idleTime + dt) % 3.2;
            const phase = this.idleTime / 1.6;
            const t = phase <= 1 ? phase : 2 - phase;
            this.draw(1 + (this.pressScale - 1) * quadInOut(t));
        }
    }

    private reset(): void {
        this.held = this.inside = false;
        this.elapsed = 0.1; this.idleTime = 0; this.from = this.to = 1;
        this.draw(1);
    }
    onDisable(): void { this.reset(); }
    onDestroy(): void {
        this.reset();
        this.node.off(Node.EventType.TOUCH_START, this.press, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.move, this);
        this.node.off(Node.EventType.TOUCH_END, this.release, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.release, this);
    }
}
