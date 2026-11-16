import { game, Node, Sprite, sys, Tween, tween, Vec3 } from 'cc';
import { dismissPopup, fade, label, loadFrame, message, modal, popupButton, popupClose, popupFrame, popupIcon,
    popupInset, preloadPopupFrames, presentPopup, sprite, tap, uiNode } from './FlowerUI';

export interface FlowerPauseActions {
    onResume: () => void;
    onRestart: () => void;
    onHome: () => void;
}

const switchOn = 'greenhouse/popup/switch-on';
const switchOff = 'greenhouse/popup/switch-off';
const pauseArt = ['sound', 'music', 'vibrate', 'switch-on', 'switch-off', 'switch-knob', 'feedback', 'support'];

export async function preloadPause(): Promise<void> {
    await preloadPopupFrames(pauseArt);
}

/** The caller pauses its clock before opening, and resumes or restarts via callbacks. */
export async function createPause(parent: Node, actions: FlowerPauseActions, homeSettings = false): Promise<Node> {
    await preloadPause();
    if (!parent.isValid) return parent;
    const overlay = modal(parent, 'PauseOverlay');
    await popupFrame(overlay, homeSettings ? '设置' : '暂停', 650, 676);

    const [onFrame, offFrame] = await Promise.all([loadFrame(switchOn), loadFrame(switchOff)]);
    const rows = [
        {key: 'sound', text: '音效', y: 185},
        {key: 'music', text: '音乐', y: 78},
        {key: 'vibrate', text: '震动', y: -29},
    ];
    for (const row of rows) {
        let enabled = sys.localStorage.getItem(`zdhjy.${row.key}`) !== 'off';
        await popupInset(overlay, `${row.key}Row`, 0, row.y, 544, 94);
        const icon = await popupIcon(overlay, `${row.key}Icon`, row.key, -211, row.y, 70);
        fade(icon, enabled ? 255 : 150);
        label(overlay, `${row.key}Label`, row.text, -116, row.y, 35, 160, '#694727');
        const toggle = await sprite(overlay, `${row.key}Switch`, enabled ? switchOn : switchOff, 173, row.y, 122, 57);
        const knob = await popupIcon(toggle, 'Knob', 'switch-knob', enabled ? 31 : -31, 0, 51);
        tap(toggle, () => {
            enabled = !enabled;
            sys.localStorage.setItem(`zdhjy.${row.key}`, enabled ? 'on' : 'off');
            toggle.getComponent(Sprite)!.spriteFrame = enabled ? onFrame : offFrame;
            fade(icon, enabled ? 255 : 150);
            Tween.stopAllByTarget(knob);
            tween(knob).to(0.12, {position: new Vec3(enabled ? 31 : -31, 0, 0)}).start();
            game.emit('flower-settings-changed');
        });
        knob.on(Node.EventType.NODE_DESTROYED, () => Tween.stopAllByTarget(knob));
    }

    let closed = false;
    const leave = (callback: () => void) => {
        if (closed) return;
        closed = true;
        dismissPopup(overlay, callback);
    };
    await popupClose(overlay, 'ClosePause', 274, 305, () => leave(actions.onResume));
    if (homeSettings) {
        let informationOpen = false;
        for (const item of [
            {name: 'Feedback', title: '反馈与建议', icon: 'feedback', x: -142},
            {name: 'Support', title: '联系客服', icon: 'support', x: 142},
        ]) {
            const button = uiNode(overlay, item.name, item.x, -197, 228, 134);
            await popupInset(button, 'Surface', 0, 0, 228, 134);
            await popupIcon(button, 'Icon', item.icon, 0, 23, 63);
            label(button, 'Text', item.title, 0, -35, 26, 204, '#694727');
            tap(button, () => {
                if (informationOpen) return;
                informationOpen = true;
                void message(overlay, item.title, '请在微信小游戏中使用此功能。', '知道了', () => { informationOpen = false; }, item.icon);
            });
        }
    } else {
        const home = await popupButton(overlay, 'PauseHome', '主页', -213, -208, 132, 89, 'blue');
        tap(home, () => leave(actions.onHome));
        const resume = await popupButton(overlay, 'PauseResume', '继续游戏', 0, -208, 258, 94);
        tap(resume, () => leave(actions.onResume));
        const restart = await popupButton(overlay, 'PauseRestart', '重玩', 213, -208, 132, 89, 'coral');
        tap(restart, () => leave(actions.onRestart));
    }
    presentPopup(overlay, {openSound: true, closeSound: true});
    return overlay;
}
