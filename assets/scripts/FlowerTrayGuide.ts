import { Color, Graphics, Label, Node } from 'cc';
import { TRAY_Y } from './FlowerBoardSkin';
import { label, panel, uiNode } from './FlowerUI';

/** A compact warning anchored beneath the temporary slots. */
export class FlowerTrayGuide {
    readonly root: Node;
    private readonly marker: Graphics;
    private readonly count: Label;
    private lastCount: number | null = null;

    constructor(hud: Node, private readonly onFirstShow: () => void) {
        this.root = uiNode(hud, 'TemporarySlotWarning', 0, TRAY_Y - 76, 490, 61);
        this.root.active = false;
        panel(this.root, 'Shadow', 0, -4, 490, 61, '#42281852', 24);
        panel(this.root, 'Border', 0, 0, 490, 61, '#d2a268', 24);
        panel(this.root, 'Surface', 0, 0, 484, 55, '#fff4dc', 22);
        this.marker = uiNode(this.root, 'Caution', -205, 0, 35, 35).addComponent(Graphics);
        label(this.root, 'Exclamation', '!', -205, 0, 28, 32, '#fff8e8', 'display');
        this.count = label(this.root, 'SlotsRemaining', '暂存区剩 2 格', -95, 0, 24, 182, '#674b35').getComponent(Label)!;
        panel(this.root, 'Divider', 6, 0, 2, 28, '#e7c79d', 1);
        label(this.root, 'FailureWarning', '放满就会失败', 119, 0, 28, 208, '#8b3e2b', 'display');
    }

    update(remaining: number): boolean {
        const firstShow = this.lastCount === null;
        const visible = (remaining === 1 || remaining === 2) && (firstShow || this.root.active);
        this.root.active = visible;
        if (!visible || remaining === this.lastCount) return visible;
        this.lastCount = remaining;
        this.count.string = `暂存区剩 ${remaining} 格`;
        this.marker.clear();
        this.marker.fillColor = new Color().fromHEX(remaining === 1 ? '#ae4534' : '#a66b24');
        this.marker.circle(0, 0, 17);
        this.marker.fill();
        if (firstShow) this.onFirstShow();
        return visible;
    }
}
