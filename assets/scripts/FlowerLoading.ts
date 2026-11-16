import { BlockInputEvents, Button, Color, Label, Node, Sprite, SpriteFrame, tween, Tween, UITransform, UIOpacity } from 'cc';
import { loadFrame, uiNode } from './FlowerUI';
import { bindFlowerViewport, coverFlowerArt, fitFlowerPortrait } from './FlowerViewport';

/** Scene-bound SpriteFrames use this exact order; missing entries load on demand. */
export const LOADING_ART_PATHS = [
    'startup/garden', 'startup/logo', 'startup/track', 'startup/fill', 'startup/caption', 'startup/notice',
];
type Retry = () => void | Promise<void>;
const MIN_DISPLAY_MS = 1200;
const COMPLETE_HOLD_MS = 350;
const FADE_SECONDS = 0.18;
const COMPLETE_TEXT = '加载完成，即将进入游戏';

/** Loading artwork uses the supplied 1080×2400 design coordinates. */
export class FlowerLoadingView {
    readonly root: Node;
    private readonly opacity: UIOpacity;
    private readonly progress = { value: 0 };
    private readonly clones: SpriteFrame[] = [];
    private readonly timers = new Map<ReturnType<typeof setTimeout>, (completed: boolean) => void>();
    private fill!: Node;
    private loadingCaption!: Node;
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
        this.showStatus(); this.renderProgress();
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

    private art(parent: Node, name: string, frame: SpriteFrame,
        left: number, top: number, width: number, height: number): Node {
        const node = uiNode(parent, name, left + width / 2 - 540, 1200 - top - height / 2, width, height);
        const renderer = node.addComponent(Sprite);
        renderer.sizeMode = Sprite.SizeMode.CUSTOM;
        renderer.trim = false;
        renderer.spriteFrame = frame;
        return node;
    }

    private showStatus(message = '', fillColor = new Color(9, 54, 91)): void {
        this.loadingCaption.active = !message;
        this.caption.node.active = !!message;
        this.caption.color = fillColor;
        this.caption.string = message;
    }

    private build(frames: SpriteFrame[]): void {
        const background = this.art(this.root, 'Background', frames[0], 0, 0, 1080, 2400);
        const artwork = uiNode(this.root, 'Artwork', 0, 0, 1080, 2400);
        this.art(artwork, 'Title', frames[1], 244, 297, 591, 429);
        this.art(artwork, 'HealthNotice', frames[5], 54, 1950, 974, 144);
        const progress = uiNode(artwork, 'Progress', 0, 0);
        this.art(progress, 'ProgressBackground', frames[2], 158, 1797, 771, 94);
        this.fill = this.art(progress, 'ProgressFill', frames[3], 170, 1808, 249, 67);
        this.fill.setPosition(170 - 540, 1200 - 1808 - 67 / 2, 0);
        this.fill.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
        const fillSprite = this.fill.getComponent(Sprite)!;
        const fillFrame = frames[3].clone();
        this.clones.push(fillFrame);
        fillFrame.insetLeft = 24;
        fillFrame.insetRight = 24;
        fillSprite.spriteFrame = fillFrame;
        fillSprite.type = Sprite.Type.SLICED;
        this.loadingCaption = this.art(progress, 'LoadingCaptionArt', frames[4], 468, 1819, 184, 46);
        const status = uiNode(progress, 'ProgressCaption', 20, -643, 540, 66);
        this.caption = status.addComponent(Label);
        this.caption.useSystemFont = true;
        this.caption.fontFamily = 'sans-serif';
        this.caption.fontSize = 44;
        this.caption.lineHeight = 52;
        this.caption.horizontalAlign = Label.HorizontalAlign.CENTER;
        this.caption.verticalAlign = Label.VerticalAlign.CENTER;
        this.caption.enableWrapText = false;
        this.caption.overflow = Label.Overflow.SHRINK;
        this.showStatus();

        this.retryNode = uiNode(progress, 'RetryHit', 2, -644, 772, 94);
        this.retryButton = this.retryNode.addComponent(Button);
        this.retryButton.transition = Button.Transition.NONE;
        this.retryButton.interactable = false;
        this.retryNode.on(Button.EventType.CLICK, this.retryClicked);
        bindFlowerViewport(this.root, viewport => {
            coverFlowerArt(background, viewport, 1080, 2400);
            const scale = fitFlowerPortrait(artwork, viewport);
            artwork.setPosition((viewport.safeLeft + viewport.safeRight) / 2,
                Math.max(0, viewport.safeBottom + 894 * scale), 0);
        });
        this.shownAt = Date.now();
        this.renderProgress();
    }

    /** Reports completed real work. No timer advances the target by itself. */
    setProgress(value: number): void {
        if (this.phase !== 'loading' || !Number.isFinite(value)) return;
        this.target = Math.max(this.target, Math.min(0.99, Math.max(0, value)));
        const duration = Math.max(0.08, Math.min(0.3, (this.target - this.progress.value) * 0.4));
        void this.animateProgress(this.target, duration);
    }

    private renderProgress(): void {
        if (!this.fill?.isValid) return;
        const value = Math.max(0, Math.min(1, this.progress.value));
        this.fill.active = value > 0;
        this.fill.getComponent(UITransform)!.setContentSize(746 * value, 67);
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
            this.showStatus(COMPLETE_TEXT);
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
        this.showStatus('加载失败，点击重试', new Color(80, 24, 20));
        this.retryButton.interactable = true;
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
