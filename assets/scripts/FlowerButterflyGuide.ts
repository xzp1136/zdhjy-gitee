import { Node, UITransform, Vec3 } from 'cc';
import { boardY } from './FlowerBoardSkin';
import { FlowerButterflyStarlight } from './FlowerButterflyStarlight';
import type { FlowerPiece } from './FlowerRules';
import { TUTORIAL_HAND_PATH } from './FlowerTutorial';
import { label, popupInset, sprite, uiNode } from './FlowerUI';
import { bindFlowerViewport } from './FlowerViewport';

type ButterflyWing = FlowerPiece & {specialId: number};
type ButterflyGlow = {root: Node; light: FlowerButterflyStarlight; radius: number};
type Target = {wing: ButterflyWing; node: Node; surfaced: boolean};

const PROMPT_WIDTH = 408;
const PROMPT_HEIGHT = 109;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

class ButterflyTapPrompt {
    private left = -375;
    private right = 375;

    private constructor(readonly root: Node, private readonly card: Node, private readonly first: Node,
        private readonly matching: Node, private readonly hand: Node) {}

    static async create(hud: Node, canvas: Node): Promise<ButterflyTapPrompt> {
        const root = uiNode(hud, 'ButterflyTapPrompt', 0, 0, 1, 1);
        root.active = false;
        const card = uiNode(root, 'ButterflyPromptCard', 0, 0, PROMPT_WIDTH, PROMPT_HEIGHT);
        await popupInset(card, 'PromptFrame', 0, 0, PROMPT_WIDTH, PROMPT_HEIGHT);
        const first = uiNode(card, 'FirstButterfly', 0, 0, 1, 1);
        label(first, 'Title', '试试蝴蝶', 0, 23, 30, 370, '#31583d', 'display');
        label(first, 'Action', '点两只同色蝴蝶，帮你凑花束', 0, -21, 23, 375, '#634d36');
        const matching = uiNode(card, 'MatchingButterfly', 0, 0, 1, 1);
        label(matching, 'Title', '再点一只同色蝴蝶', 0, 23, 29, 370, '#31583d', 'display');
        label(matching, 'Action', '配成一对，就会帮你收花', 0, -21, 23, 375, '#634d36');
        const hand = await sprite(root, 'ButterflyTapHand', TUTORIAL_HAND_PATH, 0, 0, 92);
        const prompt = new ButterflyTapPrompt(root, card, first, matching, hand);
        const coordinates = root.getComponent(UITransform)!;
        const screen = canvas.getComponent(UITransform)!;
        bindFlowerViewport(root, viewport => {
            prompt.left = coordinates.convertToNodeSpaceAR(screen.convertToWorldSpaceAR(new Vec3(viewport.safeLeft, 0))).x;
            prompt.right = coordinates.convertToNodeSpaceAR(screen.convertToWorldSpaceAR(new Vec3(viewport.safeRight, 0))).x;
        });
        return prompt;
    }

    show(target: Node, waiting: boolean, time: number): void {
        const point = this.root.getComponent(UITransform)!.convertToNodeSpaceAR(target.worldPosition);
        const scale = Math.min(1, (this.right - this.left - 28) / PROMPT_WIDTH);
        const halfWidth = PROMPT_WIDTH * scale / 2;
        const middle = (this.left + this.right) / 2;
        const x = clamp(middle + (point.x - middle) * 0.52, this.left + halfWidth + 14, this.right - halfWidth - 14);
        const y = clamp(point.y + (point.y > 38 ? -130 : 132), boardY(1840), boardY(952));
        this.card.setScale(scale, scale, 1);
        this.card.setPosition(x, y);
        const side = point.x > this.right - 89 ? -1 : 1;
        const beat = 0.5 + 0.5 * Math.cos(time * Math.PI * 2 / 1.12);
        const handScale = 1 + 0.07 * beat;
        this.hand.setPosition(point.x + side * (29 + 6 * beat), point.y - 53 - 8 * beat);
        this.hand.setScale(side * handScale, handScale, 1);
        this.first.active = !waiting;
        this.matching.active = waiting;
        this.root.active = true;
    }
}

/** The pool and tray use the same pulse for wings that can pair. */
export class FlowerButterflyGuide {
    private readonly wings: ButterflyWing[];
    private readonly glows = new Map<Node, ButterflyGlow>();
    private readonly active = new Set<Node>();
    private readonly waitingKinds = new Set<number>();
    private focus: Node | undefined;
    private time = 0;

    private constructor(flowers: readonly FlowerPiece[], private readonly pool: ReadonlyMap<string, Node>,
        private readonly tray: Node, private prompt: ButterflyTapPrompt | null) {
        this.wings = flowers.filter((flower): flower is ButterflyWing => flower.specialId !== undefined);
    }

    static async create(flowers: readonly FlowerPiece[], pool: ReadonlyMap<string, Node>, tray: Node,
        hud: Node, canvas: Node, showPrompt: boolean): Promise<FlowerButterflyGuide> {
        const prompt = showPrompt ? await ButterflyTapPrompt.create(hud, canvas) : null;
        return new FlowerButterflyGuide(flowers, pool, tray, prompt);
    }

    update(dt: number, canPrompt: boolean): void {
        this.time += dt;
        this.active.clear();
        this.waitingKinds.clear();
        for (const wing of this.wings) {
            if (wing.status !== 'buffer') continue;
            this.waitingKinds.add(wing.specialId);
            const node = this.tray.getChildByName('Buffered-' + wing.id);
            if (!node?.isValid || !node.activeInHierarchy) continue;
            this.draw(node, wing.specialId, 0.9);
        }
        const visible: Target[] = [];
        for (const wing of this.wings) {
            if (wing.status !== 'pool') continue;
            const node = this.pool.get(wing.id);
            if (!node?.isValid || !node.activeInHierarchy) continue;
            visible.push({wing, node, surfaced: !!node.getChildByName('FlowerImage')?.activeInHierarchy});
        }
        const target = canPrompt && this.prompt ? this.chooseTarget(visible) : undefined;
        this.focus = target?.node;
        if (this.prompt) {
            if (target) this.prompt.show(target.node, this.waitingKinds.has(target.wing.specialId), this.time);
            else this.prompt.root.active = false;
        }
        for (const {wing, node, surfaced} of visible) {
            const isPartner = this.waitingKinds.has(wing.specialId);
            if (node === this.focus) this.draw(node, wing.specialId, 1);
            else if (surfaced || isPartner) this.draw(node, wing.specialId, isPartner ? (surfaced ? 0.9 : 0.74) : 0.64);
        }
        for (const [node, glow] of this.glows) {
            if (!this.active.has(node)) {
                this.remove(glow);
                this.glows.delete(node);
            }
        }
    }

    private chooseTarget(visible: Target[]): Target | undefined {
        const matching = visible.filter(target => this.waitingKinds.has(target.wing.specialId));
        const candidates = matching.length ? matching : visible.filter(target => target.surfaced
            && visible.some(other => other.node !== target.node && other.surfaced && other.wing.specialId === target.wing.specialId));
        return candidates.find(target => target.node === this.focus) ?? candidates.find(target => target.surfaced) ?? candidates[0];
    }

    completePrompt(): boolean {
        if (!this.prompt) return false;
        this.prompt.root.active = false;
        this.prompt.root.destroy();
        this.prompt = null;
        return true;
    }

    private draw(node: Node, kind: number, strength: number): void {
        this.active.add(node);
        let glow = this.glows.get(node);
        if (!glow) {
            const size = node.getComponent(UITransform)!.contentSize;
            const root = uiNode(node, 'ButterflyGuideGlow', 0, 0, 1, 1);
            glow = {root, light: new FlowerButterflyStarlight(root, kind === 2001), radius: Math.max(size.width, size.height) / 2};
            this.glows.set(node, glow);
        }
        const {light, radius} = glow;
        const phase = this.time * Math.PI * 2 / 1.8 + (kind === 2001 ? Math.PI / 2 : 0);
        const pulse = 0.5 + 0.5 * Math.sin(phase);
        light.beginFrame();
        light.draw('halo', 0, 0, radius * (0.54 + 0.025 * pulse), strength * (0.65 + 0.35 * pulse), 0, true);
        light.draw('star', -radius * 0.58, radius * 0.60, radius * (0.12 + 0.05 * pulse), strength * (0.38 + 0.60 * pulse), 0.10, false);
        light.draw('star', radius * 0.60, -radius * 0.31, radius * 0.09, strength * (0.24 + 0.42 * (1 - pulse)), -0.24, true);
        light.endFrame();
    }

    private remove(glow: ButterflyGlow): void {
        if (glow.root.isValid) {
            glow.root.active = false;
            glow.root.destroy();
        }
    }

    dispose(): void {
        this.completePrompt();
        for (const glow of this.glows.values()) this.remove(glow);
        this.glows.clear();
        this.active.clear();
    }
}
