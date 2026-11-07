import { Color, Label, Node, Sprite, sys, tween, Tween, UIOpacity, UITransform } from 'cc';
import { dismissPopup, fade, label, message, modal, presentPopup, slicedSprite, sprite, tap, uiNode } from './FlowerUI';
import { createPause } from './FlowerPause';
import { FlowerHomeMotion } from './FlowerHomeMotion';

const A = 'original/';
/** Visible homepage art, warmed before the startup screen is dismissed. */
export const HOME_FRAME_PATHS = [
    'ui/bg', 'order/setting', 'extras/topbar_639', 'extras/heart_336', 'ui/start/jmtili',
    'extras/coin_165', 'order/star128', 'ui/start/boxbutton2', 'ui/start/baoxiang blue',
    'ui/start/baoxiang purple', 'ui/start/progress_1', 'ui/start/progress_2',
    'extras/bgbrand_863', 'extras/nameband_597', 'extras/share_340', 'extras/dailychallenge_351',
    'extras/super_801', 'extras/present_628', 'extras/social_764', 'extras/green_button_931',
    'extras/hl0_435', 'extras/hl_632', 'extras/shop_524', 'extras/home_900', 'extras/rank_723',
].map(path => A + path);
const read = (key: string, fallback: number) => {
    const stored = sys.localStorage.getItem(`zdhjy.${key}`);
    const value = stored === null ? fallback : Number(stored);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
};
const write = (key: string, value: number) => sys.localStorage.setItem(`zdhjy.${key}`, String(value));

/** Rebuilt from the Unity artwork and the live 750 × 1334 home layout. */
export async function createHome(parent: Node, onPlay: () => void, level = 1): Promise<Node> {
    const home = uiNode(parent, 'Home');
    home.active = false;
    await sprite(home, 'FlowerShopBackground', `${A}ui/bg`, 0, 0, 750, 1334);
    let modalOpen = false, leaving = false;
    const today = () => new Date().toLocaleDateString('en-CA');
    async function notice(title: string, body: string): Promise<void> {
        if (modalOpen) return;
        modalOpen = true;
        await message(home, title, body, '知道了', () => { modalOpen = false; });
    }
    const outlines = (node: Node, width = 1, color = '#694a37') => {
        const text = node.getComponent(Label)!;
        text.enableOutline = true; text.outlineColor = new Color().fromHEX(color); text.outlineWidth = width;
    };
    const pause = await sprite(home, 'Settings', `${A}order/setting`, -328, 542, 64, 64);
    tap(pause, () => void settings());

    for (const [name, x] of [['EnergyBar', -188], ['CoinsBar', -8], ['StarsBar', 164]] as [string, number][]) {
        await sprite(home, name, `${A}extras/topbar_639`, x, 542, 158, 47);
    }
    await sprite(home, 'Heart', `${A}extras/heart_336`, -248, 542, 66, 66);
    label(home, 'EnergyValue', String(read('energy', 5)), -248, 541, 27, 50);
    label(home, 'EnergyTimer', read('energy', 5) >= 5 ? '已满' : `${read('energy', 5)}/5`, -167, 542, 28, 115);
    const energyAdd = await sprite(home, 'AddEnergy', `${A}ui/start/jmtili`, -233, 529, 24, 24);
    tap(energyAdd, () => void notice('体力', '当前版本可自由挑战关卡'));
    await sprite(home, 'Coin', `${A}extras/coin_165`, -69, 542, 66, 66);
    const coinsLabel = label(home, 'CoinsValue', String(read('coins', 0)), 12, 542, 28, 112).getComponent(Label)!;
    const coinsAdd = await sprite(home, 'AddCoins', `${A}ui/start/jmtili`, -48, 529, 24, 24);
    tap(coinsAdd, () => void store());
    // The original star is trimmed inside a 128 px square; retain its optical center.
    await sprite(home, 'Star', `${A}order/star128`, 104, 543.04, 60.79, 56.64);
    label(home, 'StarsValue', String(read('stars', 0)), 176, 542, 28, 110);

    const levelBox = await sprite(home, 'LevelChest', `${A}ui/start/boxbutton2`, -276, 398, 198, 123);
    const levelChest = await sprite(levelBox, 'Chest', `${A}ui/start/baoxiang blue`, -39, 20, 120, 102);
    // The local preview has no level-chest claim state yet. Never signal a claim
    // that its action cannot grant; original HomeControl also gates boxAni on readiness.
    levelChest.addComponent(FlowerHomeMotion).configure('boxAni', () => false);
    const chestText = label(levelBox, 'Title', '关卡\n宝箱', 50, 7, 30, 92, '#383631').getComponent(Label)!;
    chestText.node.getComponent(UITransform)!.setContentSize(92, 95);
    chestText.lineHeight = 43;
    await sprite(levelBox, 'ProgressTrack', `${A}ui/start/progress_1`, -12, -43, 171, 21);
    const levelProgress = Math.min(1, Math.max(0, level % 5) / 5);
    const progress = await sprite(levelBox, 'Progress', `${A}ui/start/progress_2`, -12, -43, 171, 21);
    progress.getComponent(Sprite)!.type = Sprite.Type.FILLED;
    progress.getComponent(Sprite)!.fillType = Sprite.FillType.HORIZONTAL;
    progress.getComponent(Sprite)!.fillRange = levelProgress;
    outlines(label(levelBox, 'ProgressText', `${level % 5}/5`, -12, -43, 18, 170), 1);
    tap(levelBox, () => void notice('关卡宝箱', '当前版本暂不可领取宝箱奖励'));

    const starBox = uiNode(home, 'StarChest', 276, 398, 198, 123);
    const starPaper = await sprite(starBox, 'Paper', `${A}ui/start/boxbutton2`, 0, 0, 198, 123);
    starPaper.setScale(-1, 1, 1);
    const starChest = await sprite(starBox, 'Chest', `${A}ui/start/baoxiang purple`, 39, 20, 120, 102);
    starChest.addComponent(FlowerHomeMotion).configure('boxAni', () => read('stars', 0) >= 1500);
    const starText = label(starBox, 'Title', '星星\n宝箱', -49, 7, 30, 92, '#383631').getComponent(Label)!;
    starText.node.getComponent(UITransform)!.setContentSize(92, 95); starText.lineHeight = 43;
    await sprite(starBox, 'ProgressTrack', `${A}ui/start/progress_1`, 0, -43, 171, 21);
    const starProgress = await sprite(starBox, 'Progress', `${A}ui/start/progress_2`, 0, -43, 171, 21);
    const starFill = starProgress.getComponent(Sprite)!;
    starFill.type = Sprite.Type.FILLED; starFill.fillType = Sprite.FillType.HORIZONTAL;
    starFill.fillRange = Math.min(1, read('stars', 0) / 1500);
    outlines(label(starBox, 'ProgressText', `${read('stars', 0)}/1500`, 0, -43, 18, 171, '#fff1bd'), 1);
    tap(starBox, () => void notice('星星宝箱', `当前 ${read('stars', 0)} / 1500\n当前版本暂不可领取宝箱奖励`));

    async function badge(name: string, path: string, text: string, x: number, y: number, artWidth: number, callback: () => void, ready?: () => boolean): Promise<Node> {
        const node = await sprite(home, name, `${A}extras/bgbrand_863`, x, y, 131, 131);
        const illustration = await sprite(node, 'Illustration', `${A}${path}`, 0, 13, artWidth);
        if (ready) illustration.addComponent(FlowerHomeMotion).configure('StartIconAni', ready);
        await sprite(node, 'Ribbon', `${A}extras/nameband_597`, 0, -39, 114, 53);
        label(node, 'Text', text, 0, -39, 25, 114);
        tap(node, callback);
        return node;
    }
    await badge('ShareReward', 'extras/share_340', '分享奖励', -299, 229, 123, () => void notice('分享奖励', '请在微信小游戏中分享给好友\n当前预览未连接微信分享服务'), () => false);
    // Original online/super-gift readiness comes from timers. The preview retains
    // its existing local daily/one-time rewards, using those states for motion.
    const dailyBadge = await badge('DailyReward', 'extras/dailychallenge_351', sys.localStorage.getItem('zdhjy.daily') === today() ? '已领取' : '可领取', 299, 229, 135, () => void dailyReward(), () => sys.localStorage.getItem('zdhjy.daily') !== today());
    const welcomeBadge = await badge('WelcomeGift', 'extras/super_801', sys.localStorage.getItem('zdhjy.welcome') ? '已领取' : '可领取', -299, 20, 134, () => void welcomeGift(), () => !sys.localStorage.getItem('zdhjy.welcome'));
    await badge('Welfare', 'extras/present_628', '福利礼袋', 299, 20, 136, () => void notice('福利礼袋', '每日登录领取金币\n完成订单获得星星'));
    await badge('GameCommunity', 'extras/social_764', '游戏圈', -299, -189, 88, () => void notice('游戏圈', '请在微信小游戏中查看游戏圈\n当前预览未连接微信服务'));

    const play = await sprite(home, 'Play', `${A}extras/green_button_931`, 0, -250, 310, 131);
    label(play, 'Level', `关卡 ${level}`, 0, 3, 46, 285, '#518823');
    tap(play, () => {
        if (modalOpen || leaving || !home.isValid) return;
        leaving = true;
        onPlay();
    }, {pressScale: 0.94, idlePulse: true});

    await slicedSprite(home, 'NavigationBackground', `${A}extras/hl0_435`, 0, -599, 750, 136);
    await sprite(home, 'SelectedHomeTab', `${A}extras/hl_632`, 0, -588, 248, 158);
    for (const item of [
        {name: 'StoreTab', text: '商城', art: 'shop_524', x: -250, width: 111, action: () => void store()},
        {name: 'HomeTab', text: '主页', art: 'home_900', x: 0, width: 139, action: () => {}},
        {name: 'RankTab', text: '排行榜', art: 'rank_723', x: 250, width: 112, action: () => void rankings()},
    ]) {
        const tab = uiNode(home, item.name, item.x, -595, 245, 143);
        await sprite(tab, 'Icon', `${A}extras/${item.art}`, 0, 16, item.width);
        outlines(label(tab, 'Title', item.text, 0, -52, 32, 230), 1);
        tap(tab, item.action);
    }

    async function settings(): Promise<void> {
        if (modalOpen) return; modalOpen = true;
        const close = () => { modalOpen = false; };
        await createPause(home, {onResume: close, onRestart: close, onHome: close}, true);
    }
    async function dailyReward(): Promise<void> {
        const date = today();
        if (sys.localStorage.getItem('zdhjy.daily') === date) return notice('每日奖励', '今日奖励已经领取\n明天再来吧');
        if (modalOpen) return; modalOpen = true;
        await message(home, '每日奖励', '今日登录奖励\n金币 × 50', '领取', () => {
            sys.localStorage.setItem('zdhjy.daily', date); write('coins', read('coins', 0) + 50);
            coinsLabel.string = String(read('coins', 0)); modalOpen = false;
            dailyBadge.getChildByName('Text')!.getComponent(Label)!.string = '已领取';
        });
    }
    async function welcomeGift(): Promise<void> {
        if (sys.localStorage.getItem('zdhjy.welcome')) return notice('花店礼物', '欢迎礼物已经领取\n通关可获得更多奖励');
        if (modalOpen) return; modalOpen = true;
        await message(home, '花店礼物', '欢迎来到花店\n金币 × 100', '领取', () => {
            sys.localStorage.setItem('zdhjy.welcome', '1'); write('coins', read('coins', 0) + 100);
            coinsLabel.string = String(read('coins', 0)); modalOpen = false;
            welcomeBadge.getChildByName('Text')!.getComponent(Label)!.string = '已领取';
        });
    }
    async function store(): Promise<void> {
        if (modalOpen) return; modalOpen = true;
        const overlay = modal(home, 'StoreOverlay');
        await slicedSprite(overlay, 'Paper', `${A}extras/bg1_816`, 0, 10, 680, 850);
        await sprite(overlay, 'ShopAwning', `${A}ui/store/frame`, 0, 240, 650, 300);
        label(overlay, 'Balance', `金币 ${read('coins', 0)}`, 0, 190, 30, 550, '#fff4db');
        const items = [{type: 'compose', title: '合成', unlock: 2}, {type: 'shuffle', title: '打乱', unlock: 3}, {type: 'clear', title: '清除', unlock: 4}];
        for (let i = 0; i < items.length; i++) {
            const item = items[i], x = (i - 1) * 195;
            await sprite(overlay, item.type, `${A}ui/itemicon/${item.type}`, x, 15, 105, 105);
            label(overlay, `${item.type}Title`, item.title, x, -65, 28, 180, '#754f27');
            label(overlay, `${item.type}Unlock`, `${item.unlock} 关解锁`, x, -115, 23, 185, '#98744b');
        }
        label(overlay, 'StoreDescription', '通关解锁道具，在花池中使用', 0, -210, 26, 570, '#754f27');
        const close = await slicedSprite(overlay, 'BackHome', `${A}extras/green_button_931`, 0, -325, 290, 95);
        label(close, 'Text', '返回主页', 0, 0, 31, 265, '#56881d');
        tap(close, () => dismissPopup(overlay, () => { modalOpen = false; }));
        presentPopup(overlay);
    }
    async function rankings(): Promise<void> {
        if (modalOpen) return; modalOpen = true;
        const overlay = modal(home, 'RankOverlay');
        await slicedSprite(overlay, 'Paper', `${A}extras/bg1_816`, 0, 0, 650, 740);
        await sprite(overlay, 'Trophy', `${A}extras/rank_723`, 0, 220, 140);
        label(overlay, 'Title', '排行榜', 0, 100, 39, 540, '#754f27');
        label(overlay, 'YourProgress', `我的进度    第 ${level} 关`, 0, 5, 30, 540, '#754f27');
        label(overlay, 'YourStars', `累计星星    ${read('stars', 0)}`, 0, -60, 30, 540, '#754f27');
        label(overlay, 'ServiceState', '好友排名需在微信小游戏中查看', 0, -150, 24, 550, '#98744b');
        const close = await slicedSprite(overlay, 'BackHome', `${A}extras/green_button_931`, 0, -265, 290, 95);
        label(close, 'Text', '返回主页', 0, 0, 31, 265, '#56881d');
        tap(close, () => dismissPopup(overlay, () => { modalOpen = false; }));
        presentPopup(overlay);
    }
    if (!home.isValid || !parent.isValid) return home;
    home.active = true;
    fade(home, 0);
    const opacity = home.getComponent(UIOpacity)!;
    tween(opacity).to(0.22, {opacity: 255}, {easing: 'sineOut'}).start();
    home.on(Node.EventType.NODE_DESTROYED, () => Tween.stopAllByTarget(opacity));
    return home;
}
