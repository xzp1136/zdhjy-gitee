import { Color, Graphics, Label, Node, Sprite, tween, Tween, UITransform, Vec3 } from 'cc';
import { boardY } from './FlowerBoardSkin';
import type { FlowerLevelConfig } from './FlowerRules';
import { fade, label, panel, popupInset, sprite, uiNode } from './FlowerUI';
import { bindFlowerViewport } from './FlowerViewport';

export const TUTORIAL_HAND_PATH = 'original/ui/game/guidehand';

export const TUTORIAL_CONFIG: FlowerLevelConfig = {
    level: 1,
    timeLimit: 180,
    flowers: [{kind: 'cdy_lxq', count: 3}, {kind: 'cdcs_jyc', count: 3}],
    orders: [
        {vaseId: 1301, needs: [{kind: 'cdy_lxq', count: 3}]},
        {vaseId: 1201, needs: [{kind: 'cdcs_jyc', count: 3}]},
    ],
    starsPerOrder: 0,
    coinsOnWin: 0,
};

const GUIDE_LINES = [
    ['温室入门 · 第一束', '点击高亮的花，集齐 3 朵。'],
    ['温室入门 · 第二束', '再点 3 朵高亮的花。'],
] as const;

export class FlowerTutorial {
    private readonly flowerSprites: Sprite[] = [];
    private highlightedOrder: {node: Node; parent: Node} | null = null;

    private constructor(private readonly shade: Node, private readonly orderHighlights: Node,
        private readonly flowerHighlights: Node, private readonly guide: Node, private readonly hand: Node,
        private readonly pages: Node[]) {}

    static async create(board: Node, flights: Node, hud: Node): Promise<FlowerTutorial> {
        const shade = uiNode(board, 'TutorialShade', 0, 0, 1, 1);
        // The highlighted art stays above the shade and below the flights.
        shade.setSiblingIndex(flights.getSiblingIndex());
        const dimmer = shade.addComponent(Graphics);
        bindFlowerViewport(shade, viewport => {
            const w = (viewport.width / 2 + Math.abs(board.position.x)) / board.scale.x;
            const h = (viewport.height / 2 + Math.abs(board.position.y)) / board.scale.y;
            dimmer.clear();
            dimmer.fillColor = new Color().fromHEX('#182b31a8');
            dimmer.rect(-w, -h, w * 2, h * 2);
            dimmer.fill();
        });

        const orderHighlights = uiNode(board, 'TutorialOrderHighlight', 0, 0, 1, 1);
        orderHighlights.setSiblingIndex(flights.getSiblingIndex());
        const flowerHighlights = uiNode(board, 'TutorialFlowerHighlights', 0, 0, 1, 1);
        flowerHighlights.setSiblingIndex(flights.getSiblingIndex());
        const guide = uiNode(hud, 'TutorialGuide', 0, 0, 1, 1);
        const card = uiNode(guide, 'TutorialDialogue', 40, boardY(354), 516, 122);
        await popupInset(card, 'GuideCard', 0, 0, 516, 122);
        panel(card, 'FlowerSeal', -206, 0, 66, 66, '#e3edba', 33);
        await sprite(card, 'SealFlower', 'greenhouse/progress-flower', -206, 0, 44);
        const pages = GUIDE_LINES.map(([title, body], index) => {
            const page = uiNode(card, `GuidePage${index + 1}`, 0, 0, 1, 1);
            for (const node of [label(page, 'Heading', title, -157, 22, 30, 395, '#31583d', 'display'),
                label(page, 'Instruction', body, -157, -22, 27, 395, '#634d36')]) {
                node.getComponent(Label)!.horizontalAlign = Label.HorizontalAlign.LEFT;
                node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
            }
            page.active = index === 0;
            return page;
        });
        const hand = await sprite(guide, 'GuideHand', TUTORIAL_HAND_PATH, 0, 0, 112);
        tween(hand).repeatForever(tween().to(1 / 3, {scale: new Vec3(1.1, 1.1, 1)})
            .to(1 / 3, {scale: new Vec3(1, 1, 1)})).start();
        hand.on(Node.EventType.NODE_DESTROYED, () => Tween.stopAllByTarget(hand));
        return new FlowerTutorial(shade, orderHighlights, flowerHighlights, guide, hand, pages);
    }

    private showPage(step: number): void {
        this.pages.forEach((page, index) => { page.active = index === step; });
    }

    private highlightOrder(order?: Node): void {
        const previous = this.highlightedOrder;
        if (previous?.node === order) return;
        if (previous?.node.isValid && previous.parent.isValid) previous.node.setParent(previous.parent, true);
        this.highlightedOrder = null;
        if (order?.isValid && order.parent) {
            // Move the live artwork so the order badge and bouquet animations stay in sync.
            this.highlightedOrder = {node: order, parent: order.parent};
            order.setParent(this.orderHighlights, true);
        }
    }

    draw(step: number, order: Node | undefined, flowers: Node[]): void {
        this.showPage(step);
        this.highlightOrder(order);
        const transform = this.shade.getComponent(UITransform)!;
        let visible = 0;
        for (const flower of flowers) {
            const source = flower.getChildByName('FlowerImage')?.getComponent(Sprite);
            if (!source?.spriteFrame) continue;
            let highlight = this.flowerSprites[visible];
            if (!highlight) {
                highlight = uiNode(this.flowerHighlights, 'HighlightedFlower', 0, 0, 1, 1).addComponent(Sprite);
                highlight.sizeMode = Sprite.SizeMode.CUSTOM;
                this.flowerSprites.push(highlight);
            }
            // The frame's transparency keeps the water and gaps between petals shaded.
            highlight.trim = source.trim;
            highlight.spriteFrame = source.spriteFrame;
            const sourceTransform = source.node.getComponent(UITransform)!;
            const highlightTransform = highlight.node.getComponent(UITransform)!;
            highlightTransform.setContentSize(sourceTransform.contentSize);
            highlightTransform.setAnchorPoint(sourceTransform.anchorPoint);
            highlight.node.setWorldPosition(source.node.worldPosition);
            highlight.node.setWorldRotation(source.node.worldRotation);
            highlight.node.setWorldScale(source.node.worldScale);
            highlight.node.active = true;
            if (visible === 0) {
                const point = transform.convertToNodeSpaceAR(flower.worldPosition);
                this.hand.setPosition(point.x + 40, point.y - 72);
            }
            visible++;
        }
        for (let index = visible; index < this.flowerSprites.length; index++) this.flowerSprites[index].node.active = false;
        this.hand.active = visible > 0;
    }

    complete(): void {
        this.highlightOrder();
        this.flowerHighlights.active = false;
        this.hand.active = false;
    }

    fadeOut(progress: number): void {
        const opacity = Math.round(255 * (1 - progress));
        fade(this.shade, opacity);
        fade(this.guide, opacity);
    }
}
