import { Button, game, Node, Sprite, sys, Tween, tween, UITransform, Vec3 } from 'cc';
import { dismissPopup, label, loadFrame, message, modal, presentPopup, sprite, tap, uiNode } from './FlowerUI';

const A = 'original/';
const S = 750 / 1052;
const x = (value: number) => (value - 526) * S;
const y = (value: number) => 667 - (value - 88) * S;
const U = 750 / 1080;

export interface FlowerPauseActions {
    onResume: () => void;
    onRestart: () => void;
    onHome: () => void;
}

const artPaths = [
    'extras/wood_bg_860', 'extras/wood_top_966', 'extras/wood_close_110', 'extras/f1_60',
    'extras/line_506', 'extras/pink_deep_167', 'extras/pink_484', 'extras/green_button_931',
    'extras/switch1_579', 'ui/set/onbar', 'ui/set/offbar', 'ui/set/meon', 'ui/set/meoff',
    'ui/set/musicon', 'ui/set/musicoff', 'ui/set/shon', 'ui/set/shoff',
];

export async function preloadPause(): Promise<void> {
    await Promise.all(artPaths.map(path => loadFrame(A + path)));
}

function sliced(node: Node, left: number, right: number, top: number, bottom: number): void {
    const source = node.getComponent(Sprite)!;
    const frame = source.spriteFrame!.clone();
    frame.insetLeft = left; frame.insetRight = right;
    frame.insetTop = top; frame.insetBottom = bottom;
    // Cocos counts slice borders in UI units. Draw at Unity's 1080 baseline,
    // then scale the visual only; labels and button hit bounds remain at 750.
    const size = node.getComponent(UITransform)!.contentSize;
    const visual = uiNode(node, 'SlicedVisual', 0, 0, size.width / U, size.height / U);
    visual.setScale(U, U, 1);
    const renderer = visual.addComponent(Sprite);
    renderer.sizeMode = Sprite.SizeMode.CUSTOM;
    renderer.spriteFrame = frame; renderer.type = Sprite.Type.SLICED;
    source.enabled = false;
    visual.on(Node.EventType.NODE_DESTROYED, () => frame.destroy());
}

/** The caller pauses its clock before opening, and resumes/restarts via callbacks. */
export async function createPause(parent: Node, actions: FlowerPauseActions, homeSettings = false): Promise<Node> {
    await preloadPause();
    const overlay = modal(parent, 'PauseOverlay', '#0d0d0dd9');
    const offset = homeSettings ? 15 : 0;
    const background = await sprite(overlay, 'WoodenFrame', `${A}extras/wood_bg_860`, 0, y(homeSettings ? 948 : 940), 920 * S, 880 * S);
    sliced(background, 100, 100, 100, 100);
    const toggleFrame = await sprite(overlay, 'SwitchesFrame', `${A}extras/f1_60`, 0, 163 * U - offset * S, 790 * U, 460 * U);
    sliced(toggleFrame, 65, 65, 65, 65);
    await sprite(overlay, 'WoodenTitle', `${A}extras/wood_top_966`, x(535), y(478 + offset), 790 * U, 232 * U);
    label(overlay, 'Title', homeSettings ? '设置' : '暂停', x(547), y(520 + offset), 110 * U, 280, '#fef8eb', 'display');

    const rows = [
        {key: 'sound', text: '音效', icon: 'me', yy: 715, color: '#563a1e', width: 80, height: 62},
        {key: 'music', text: homeSettings ? '音乐' : '声音', icon: 'music', yy: 860, color: '#4d3216', width: 69, height: 71},
        {key: 'vibrate', text: '震动', icon: 'sh', yy: 1005, color: '#553a1f', width: 78, height: 70},
    ];
    const onFrame = await loadFrame(`${A}ui/set/onbar`);
    const offFrame = await loadFrame(`${A}ui/set/offbar`);
    for (const row of rows) {
        let enabled = sys.localStorage.getItem(`zdhjy.${row.key}`) !== 'off';
        const onIcon = await loadFrame(`${A}ui/set/${row.icon}on`);
        const offIcon = await loadFrame(`${A}ui/set/${row.icon}off`);
        const icon = await sprite(overlay, `${row.key}Icon`, `${A}ui/set/${row.icon}${enabled ? 'on' : 'off'}`,
            -303 * U, y(row.yy + offset), row.width * U, row.height * U);
        label(overlay, `${row.key}Label`, row.text, (homeSettings ? -187 : -169) * U, y(row.yy + offset), 50 * U, 190 * U, row.color);
        const toggle = await sprite(overlay, `${row.key}Switch`, `${A}ui/set/${enabled ? 'onbar' : 'offbar'}`,
            x(780), y(row.yy + offset), 153 * U, 72 * U);
        const knob = await sprite(toggle, 'Knob', `${A}extras/switch1_579`, (enabled ? 39.4 : -39.4) * U, 0, 63 * U, 63 * U);
        const button = tap(toggle, () => {
            enabled = !enabled;
            sys.localStorage.setItem(`zdhjy.${row.key}`, enabled ? 'on' : 'off');
            toggle.getComponent(Sprite)!.spriteFrame = enabled ? onFrame : offFrame;
            icon.getComponent(Sprite)!.spriteFrame = enabled ? onIcon : offIcon;
            Tween.stopAllByTarget(knob);
            tween(knob).to(0.12, {position: new Vec3((enabled ? 39.4 : -39.4) * U, 0, 0)}).start();
            game.emit('flower-settings-changed');
        });
        button.transition = Button.Transition.NONE;
    }
    for (const yy of [259, 109]) await sprite(overlay, `Divider${yy}`, `${A}extras/line_506`, 0, yy * U - offset * S, 690 * U, 3 * U);

    let closed = false;
    const leave = (callback: () => void) => {
        if (closed) return;
        closed = true;
        dismissPopup(overlay, callback);
    };
    const close = await sprite(overlay, 'ClosePause', `${A}extras/wood_close_110`, x(945), y(520 + offset), 141 * U, 140 * U);
    tap(close, () => leave(actions.onResume));
    if (homeSettings) {
        let informationOpen = false;
        for (const item of [
            {name:'Feedback', title:'反馈与建议', path:'suggestion_234', xx:346, color:'#765e39'},
            {name:'Support', title:'联系客服', path:'cs_icon_419', xx:704, color:'#be4c53'},
        ]) {
            const button = await sprite(overlay, item.name, `${A}extras/iconbg_795`, x(item.xx), y(1216), 125 * U, 125 * U);
            await sprite(button, 'Icon', `${A}extras/${item.path}`, 0, 0, 96 * U, 96 * U);
            label(overlay, item.name+'Label', item.title, x(item.xx), y(1298), 26 * U, 200 * U, item.color);
            tap(button, () => {
                if (informationOpen) return;
                informationOpen = true;
                void message(overlay, item.title, '请在微信小游戏中使用此功能。', '知道了', () => { informationOpen = false; });
            });
        }
        presentPopup(overlay, { openSound: true, closeSound: true });
        return overlay;
    }
    const home = await sprite(overlay, 'PauseHome', `${A}extras/pink_deep_167`, x(225), y(1205), 210 * U, 166 * U);
    sliced(home, 112, 110, 0, 0);
    label(home, 'Text', '主页', 0, 8.9 * U, 50 * U, 190 * U, '#c43b43');
    tap(home, () => leave(actions.onHome));
    const resume = await sprite(overlay, 'PauseResume', `${A}extras/green_button_931`, x(527), y(1205), 377 * U, 166 * U);
    label(resume, 'Text', '继续游戏', 0, 8 * U, 50 * U, 355 * U, '#6ca62d');
    tap(resume, () => leave(actions.onResume));
    const restart = await sprite(overlay, 'PauseRestart', `${A}extras/pink_484`, x(825), y(1205), 210 * U, 166 * U);
    sliced(restart, 115, 123, 0, 0);
    label(restart, 'Text', '重玩', 0, 7 * U, 50 * U, 190 * U, '#c43b43');
    tap(restart, () => leave(actions.onRestart));
    presentPopup(overlay, { openSound: true, closeSound: true });
    return overlay;
}
