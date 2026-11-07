import { _decorator, Component } from 'cc';
import { ClipName, sampleOriginalMotion } from './FlowerMotion';

/** Animate only the illustration, leaving the ribbon, text and hit root stationary. */
@_decorator.ccclass('FlowerHomeMotion')
export class FlowerHomeMotion extends Component {
    private clip: ClipName = 'StartIconAni';
    private ready: () => boolean = () => false;
    private interval = 2;
    private time = 0;
    private wasReady = false;
    private baseX = 1;
    private baseY = 1;
    private baseAngle = 0;

    configure(clip: ClipName, ready: () => boolean, random = Math.random): void {
        this.clip = clip; this.ready = ready;
        // UIAnimation.Start 43173 chooses Random.Range(int 2, int 5) once per component.
        this.interval = 2 + Math.min(2, Math.max(0, Math.floor(random() * 3)));
        this.baseX = this.node.scale.x; this.baseY = this.node.scale.y; this.baseAngle = this.node.angle;
        this.time = 0; this.wasReady = false;
    }
    update(dt: number): void {
        if (!this.ready()) { this.restore(); return; }
        if (!this.wasReady) { this.time = 0; this.wasReady = true; }
        const duration = this.clip === 'StartIconAni' ? 1 : 2 / 3;
        this.time = (this.time + Math.max(0, dt)) % (duration + (this.clip === 'StartIconAni' ? this.interval : 0));
        const time = Math.min(duration, this.time);
        if (this.clip === 'StartIconAni') this.node.setScale(
            this.baseX * sampleOriginalMotion(this.clip, time, 0), this.baseY * sampleOriginalMotion(this.clip, time, 1), 1);
        else this.node.angle = this.baseAngle + sampleOriginalMotion(this.clip, time, 2);
    }
    private restore(): void {
        this.wasReady = false; this.time = 0;
        if (!this.node.isValid) return;
        this.node.setScale(this.baseX, this.baseY, 1); this.node.angle = this.baseAngle;
    }
    onDisable(): void { this.restore(); }
    onDestroy(): void { this.restore(); }
}
