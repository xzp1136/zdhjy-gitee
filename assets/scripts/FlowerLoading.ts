import { BlockInputEvents, Button, Color, Label, Node, Sprite, SpriteFrame, tween, Tween, UITransform, UIOpacity } from 'cc';
import { loadFrame, uiNode } from './FlowerUI';
import { bindFlowerViewport, coverFlowerArt } from './FlowerViewport';

/** Scene-bound SpriteFrames use this exact order; missing entries load on demand. */
export const LOADING_ART_PATHS: string[] = [
    'original/extras/bgLoad_8', 'original/extras/btz_11',
    'original/extras/pb_0_6', 'original/extras/pb_1_7',
    'original/extras/fl_l_9', 'original/extras/fl_r_4', 'original/extras/fl_b_10',
];
type Retry = () => void | Promise<void>;
const MIN_DISPLAY_MS = 1200;
const COMPLETE_HOLD_MS = 350;
const FADE_SECONDS = 0.18;
const LOADING_TEXT = '加载中...请稍后';
const COMPLETE_TEXT = '加载完成，即将进入游戏';

/** Level0 loading artwork, at its original 750×1334 reference resolution. */
export class FlowerLoadingView {
    readonly root: Node;
    private readonly opacity: UIOpacity;
    private readonly progress = { value: 0 };
    private readonly clones: SpriteFrame[] = [];
    private readonly timers = new Map<ReturnType<typeof setTimeout>, (completed: boolean) => void>();
    private fill!: Node;
    private percent!: Label;
    private caption!: Label;
    private retryButton!: Button;
    private retryNode!: Node;
    private retry: Retry | null = null;
    private target = 0;
    private shownAt = 0;
    private revision = 0;
    private phase: 'loading' | 'error' | 'finishing' | 'disposed' = 'loading';
    private progressDone: ((completed: boolean) => void) | null = null;
    private fadeDone: ((completed: boolean) => void) | null = null;
    private finishing: Promise<boolean> | null = null;
    private readonly destroyed = () => this.dispose();
    private readonly retryClicked = () => {
        if (this.phase !== 'error' || !this.retry) return;
        const retry = this.retry;
        this.revision++; this.cancelWork();
        this.phase = 'loading'; this.finishing = null; this.retry = null;
        this.target = 0; this.progress.value = 0; this.shownAt = Date.now();
        this.opacity.opacity = 255; this.retryButton.interactable = false;
        this.caption.string = LOADING_TEXT; this.renderProgress();
        const revision = this.revision;
        try {
            Promise.resolve(retry()).catch(() => {
                if (this.phase !== 'disposed' && this.revision === revision) this.setError(retry);
            });
        } catch (_) { if (this.root.isValid && this.revision === revision) this.setError(retry); }
    };

    private constructor(parent: Node) {
        this.root = uiNode(parent, 'StartupLoading');
        this.root.addComponent(BlockInputEvents);
        this.opacity = this.root.addComponent(UIOpacity);
        this.root.on(Node.EventType.NODE_DESTROYED, this.destroyed);
        bindFlowerViewport(this.root, viewport => {
            this.root.getComponent(UITransform)!.setContentSize(viewport.width, viewport.height);
        });
    }

    static async create(parent: Node, preloadedFrames: readonly SpriteFrame[] = []): Promise<FlowerLoadingView> {
        if (!parent.isValid) throw new Error('The loading parent is no longer valid.');
        const view = new FlowerLoadingView(parent);
        try {
            const valid = (frame: SpriteFrame | undefined): frame is SpriteFrame => !!frame && frame.isValid
                && frame.originalSize.width > 0 && frame.originalSize.height > 0;
            // The scene-dependency path builds synchronously, without first waiting
            // for a resource callback or the original font's initial load.
            const frames = LOADING_ART_PATHS.every((_, index) => valid(preloadedFrames[index]))
                ? [...preloadedFrames]
                : await Promise.all(LOADING_ART_PATHS.map((path, index) => valid(preloadedFrames[index])
                    ? preloadedFrames[index] : loadFrame(path)));
            if (!parent.isValid || !view.root.isValid || view.phase === 'disposed') {
                throw new Error('The loading view was disposed while artwork loaded.');
            }
            view.build(frames);
            return view;
        } catch (error) { view.dispose(); throw error; }
    }

    get displayedProgress(): number { return this.progress.value; }

    private art(parent: Node, name: string, frame: SpriteFrame, x: number, y: number, width: number, height: number,
        insets?: [number, number]): Node {
        const node = uiNode(parent, name, x, y, width, height);
        const sprite = node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        if (insets) {
            const clone = frame.clone(); this.clones.push(clone);
            clone.insetLeft = insets[0]; clone.insetRight = insets[1]; clone.insetTop = 0; clone.insetBottom = 0;
            sprite.spriteFrame = clone; sprite.type = Sprite.Type.SLICED;
        } else sprite.spriteFrame = frame;
        return node;
    }

    private text(parent: Node, name: string, value: string, x: number, y: number, width: number, height: number,
        outlineAlpha: number, shrink = false): Label {
        const node = uiNode(parent, name, x, y, width, height);
        const label = node.addComponent(Label);
        label.useSystemFont = true; label.fontFamily = 'sans-serif';
        label.fontSize = 32; label.lineHeight = 38; label.string = value;
        label.horizontalAlign = Label.HorizontalAlign.CENTER; label.verticalAlign = Label.VerticalAlign.CENTER;
        label.enableWrapText = false; label.overflow = shrink ? Label.Overflow.SHRINK : Label.Overflow.CLAMP;
        label.color = new Color(255, 255, 255, 255);
        label.enableOutline = true; label.outlineWidth = 1; label.outlineColor = new Color(0, 0, 0, outlineAlpha);
        return label;
    }

    private build(frames: SpriteFrame[]): void {
        const background = this.art(this.root, 'Background', frames[0], 0, 0, 750, 1334);
        const title = this.art(this.root, 'Title', frames[1], 0, 337, 1112 * 0.67, 345 * 0.67);
        const progress = uiNode(this.root, 'Progress');
        this.art(progress, 'ProgressBackground', frames[2], 0, -399.5, 500, 57.8, [35, 35]);
        this.fill = this.art(progress, 'ProgressFill', frames[3], -250, -399.5, 500, 57.8, [41, 38]);
        this.fill.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
        this.art(progress, 'FlowerLeft', frames[4], -254, -399.5, 105, 109);
        this.art(progress, 'FlowerRight', frames[5], 244, -399.5, 88, 87);
        this.art(progress, 'CaptionFlowerLeft', frames[6], -146, -461, 39, 38);
        this.art(progress, 'CaptionFlowerRight', frames[6], 146, -461, 39, 38);
        this.percent = this.text(progress, 'ProgressText', '0%', 0, -395, 240, 50, 217);
        this.caption = this.text(progress, 'ProgressCaption', LOADING_TEXT, 0, -461, 245, 70, 255, true);
        this.retryNode = uiNode(progress, 'RetryHit', 0, -425, 570, 145);
        this.retryButton = this.retryNode.addComponent(Button);
        this.retryButton.transition = Button.Transition.NONE;
        this.retryButton.interactable = false;
        this.retryNode.on(Button.EventType.CLICK, this.retryClicked);
        bindFlowerViewport(this.root, viewport => {
            coverFlowerArt(background, viewport);
            title.setPosition(0, 337 + viewport.topShift, 0);
            progress.setPosition(0, viewport.bottomShift, 0);
        });
        this.shownAt = Date.now(); this.renderProgress();
    }

    /** Reports completed real work. No timer advances the target by itself. */
    setProgress(value: number): void {
        if (this.phase !== 'loading' || !Number.isFinite(value)) return;
        this.target = Math.max(this.target, Math.min(0.99, Math.max(0, value)));
        const duration = Math.max(0.08, Math.min(0.3, (this.target - this.progress.value) * 0.4));
        void this.animateProgress(this.target, duration);
    }

    private renderProgress(): void {
        if (!this.fill?.isValid || !this.percent?.isValid) return;
        const value = Math.max(0, Math.min(1, this.progress.value));
        this.fill.active = value > 0;
        this.fill.getComponent(UITransform)!.setContentSize(500 * value, 57.8);
        const cap = this.phase === 'finishing' ? 100 : 99;
        this.percent.string = `${Math.min(cap, Math.floor(value * 100 + 1e-6))}%`;
    }

    private animateProgress(value: number, duration: number): Promise<boolean> {
        Tween.stopAllByTarget(this.progress);
        this.progressDone?.(false); this.progressDone = null;
        return new Promise(resolve => {
            this.progressDone = resolve;
            tween(this.progress).to(duration, { value }, { easing: 'sineOut', onUpdate: () => this.renderProgress() })
                .call(() => { this.progressDone = null; this.renderProgress(); resolve(true); }).start();
        });
    }

    finish(): Promise<boolean> {
        if (this.finishing) return this.finishing;
        if (this.phase !== 'loading') return Promise.resolve(false);
        this.phase = 'finishing'; this.target = 1;
        this.retryButton.interactable = false;
        const revision = this.revision;
        this.finishing = (async () => {
            if (!await this.animateProgress(1, 0.12) || !this.current(revision)) return false;
            this.caption.string = COMPLETE_TEXT;
            const hold = Math.max(COMPLETE_HOLD_MS, MIN_DISPLAY_MS - (Date.now() - this.shownAt) - FADE_SECONDS * 1000);
            if (!await this.wait(hold) || !this.current(revision)) return false;
            const faded = await new Promise<boolean>(resolve => {
                this.fadeDone = resolve;
                tween(this.opacity).to(FADE_SECONDS, { opacity: 0 })
                    .call(() => { this.fadeDone = null; resolve(true); }).start();
            });
            if (!faded || !this.current(revision)) return false;
            this.dispose(); return true;
        })();
        return this.finishing;
    }

    setError(onRetry: Retry): void {
        if (this.phase === 'disposed') return;
        this.revision++; this.cancelWork(); this.finishing = null;
        this.phase = 'error'; this.retry = onRetry; this.opacity.opacity = 255;
        this.progress.value = Math.min(this.progress.value, 0.99);
        this.caption.string = '加载失败，点击重试'; this.retryButton.interactable = true;
        this.renderProgress();
    }

    private current(revision: number): boolean {
        return this.phase === 'finishing' && this.revision === revision && this.root.isValid;
    }

    private wait(milliseconds: number): Promise<boolean> {
        return new Promise(resolve => {
            const timer = setTimeout(() => { this.timers.delete(timer); resolve(true); }, Math.max(0, milliseconds));
            this.timers.set(timer, resolve);
        });
    }

    private cancelWork(): void {
        Tween.stopAllByTarget(this.progress); Tween.stopAllByTarget(this.opacity);
        this.progressDone?.(false); this.progressDone = null;
        this.fadeDone?.(false); this.fadeDone = null;
        for (const [timer, resolve] of this.timers) { clearTimeout(timer); resolve(false); }
        this.timers.clear();
    }

    dispose(): void {
        if (this.phase === 'disposed') return;
        this.phase = 'disposed'; this.revision++; this.cancelWork(); this.retry = null;
        this.retryNode?.off(Button.EventType.CLICK, this.retryClicked);
        this.root.off(Node.EventType.NODE_DESTROYED, this.destroyed);
        for (const frame of this.clones) if (frame.isValid) frame.destroy();
        this.clones.length = 0;
        if (this.root.isValid) { this.root.active = false; this.root.removeFromParent(); this.root.destroy(); }
    }
}
