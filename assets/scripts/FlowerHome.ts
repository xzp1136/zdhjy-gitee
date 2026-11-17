import { Color, Graphics, Label, Node, Sprite, sys, tween, Tween, UIOpacity, UITransform } from 'cc';
import { dismissPopup, fade, fittedSprite, label, loadFrame, loadGameFont, message, modal, popupButton, popupClose,
    popupFrame, popupIcon, popupInset, preloadPopupFrames, presentPopup, sprite, tap, uiNode } from './FlowerUI';
import { createPause } from './FlowerPause';
import { bindFlowerViewport, coverFlowerArt, fitFlowerPortrait } from './FlowerViewport';

const HOME_ART = 'greenhouse/home/';
const HOME_NUMBER_FONT = 'greenhouse/Baloo-Regular';
const NAVIGATION_HEIGHT = 282;
const NAVIGATION_TAB_WIDTH = 360;
/** Visible homepage art is warmed before the startup screen is dismissed. */
export const HOME_FRAME_PATHS = [
    'shop-room', 'settings', 'counters', 'share', 'daily', 'gift', 'welfare', 'community', 'play', 'navigation',
    'navigation-store', 'navigation-home', 'navigation-rank',
].map(name => HOME_ART + name);

const read = (key: string, fallback: number) => {
    const stored = sys.localStorage.getItem(`zdhjy.${key}`);
    const value = stored == null || stored === '' ? fallback : Number(stored);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
};
const write = (key: string, value: number) => sys.localStorage.setItem(`zdhjy.${key}`, String(value));

/** Homepage controls use the supplied Photoshop document's 1080×2400 coordinates. */
export async function createHome(parent: Node, onPlay: () => void, level = 1): Promise<Node> {
    const home = uiNode(parent, 'Home');
    home.active = false;
    const [background, font] = await Promise.all([
        sprite(home, 'FlowerShopBackground', HOME_ART + 'shop-room', 0, 0, 1080, 2400),
        loadGameFont(HOME_NUMBER_FONT),
    ]);
    const artwork = uiNode(home, 'Artwork', 0, 0, 1080, 2400);
    const top = uiNode(artwork, 'Top', 0, 0);
    let modalOpen = false, leaving = false;
    const today = () => new Date().toLocaleDateString('en-CA');
    async function notice(title: string, body: string, icon?: string): Promise<void> {
        if (modalOpen) return;
        modalOpen = true;
        await message(home, title, body, '知道了', () => { modalOpen = false; }, icon);
    }

    async function part(owner: Node, name: string, key: string,
        left: number, upper: number, width: number, height: number): Promise<Node> {
        const node = await sprite(owner, name, HOME_ART + key, left + width / 2 - 540, 1200 - upper - height / 2, width, height);
        node.getComponent(Sprite)!.trim = false;
        return node;
    }
    function counter(name: string, value: number, left: number, y: number, width: number): Label {
        const node = label(top, name, String(value), left - 540, 1200 - y, 48, width);
        const transform = node.getComponent(UITransform)!;
        transform.setAnchorPoint(0, 0.5);
        // Fit the rendered line, including its outline, into the counter's slot.
        node.on(Node.EventType.SIZE_CHANGED, () => {
            const scale = width / Math.max(width, transform.width);
            node.setScale(scale, scale, 1);
        });
        const text = node.getComponent(Label)!;
        text.font = font;
        text.useSystemFont = false;
        text.horizontalAlign = Label.HorizontalAlign.LEFT;
        text.enableWrapText = false;
        text.enableOutline = true;
        text.outlineColor = new Color(0, 0, 0, 255);
        text.outlineWidth = 3.5;
        return text;
    }

    await part(top, 'CountersArt', 'counters', 153, 201, 695, 89);
    const settingsButton = await part(top, 'Settings', 'settings', 18, 178, 129, 129);
    tap(settingsButton, () => void settings());
    counter('EnergyValue', read('energy', 5), 271, 241, 91);
    const coinsLabel = counter('CoinsValue', read('coins', 0), 499, 241, 91);
    counter('StarsValue', read('stars', 0), 730, 244, 91);
    tap(uiNode(top, 'EnergyInfo', 274 - 540, 1200 - 245, 214, 79), () => void notice('体力', '当前版本可自由挑战关卡', 'heart'));
    tap(uiNode(top, 'CoinsInfo', 514 - 540, 1200 - 245, 207, 79), () => void store());

    async function badge(name: string, key: string, left: number, upper: number,
        width: number, height: number, callback: () => void): Promise<void> {
        tap(await part(artwork, name, key, left, upper, width, height), callback);
    }
    await badge('ShareReward', 'share', 23, 417, 224, 253,
        () => void notice('分享有礼', '请在微信小游戏中分享给好友\n当前预览未连接微信分享服务', 'share'));
    await badge('DailyReward', 'daily', 828, 417, 226, 253, () => void dailyReward());
    await badge('WelcomeGift', 'gift', 23, 724, 224, 254, () => void welcomeGift());
    await badge('Welfare', 'welfare', 828, 724, 226, 254,
        () => void notice('福利任务', '每日登录领取金币\n完成订单获得星星', 'welfare'));
    await badge('GameCommunity', 'community', 23, 1031, 224, 256,
        () => void notice('游戏圈', '请在微信小游戏中查看游戏圈\n当前预览未连接微信服务', 'community'));

    const play = await part(artwork, 'Play', 'play', 259, 1746, 567, 234);
    label(play, 'Level', `第${level}关`, 0, 1863 - 1908, 53, 460, '#3a8d0e');
    tap(play, () => {
        if (modalOpen || leaving || !home.isValid) return;
        leaving = true;
        onPlay();
    }, {pressScale: 0.94});

    const navigationExtension = uiNode(home, 'NavigationSafeArea');
    const navigationFill = navigationExtension.addComponent(Graphics);
    const bottom = uiNode(home, 'Bottom');
    const bar = await part(bottom, 'NavigationBackground', 'navigation', 0, 2118, 1080, NAVIGATION_HEIGHT);
    const tabs: {hit: Node; artwork: Node}[] = [];
    for (const [name, key, action] of [
        ['StoreTab', 'navigation-store', () => void store()],
        ['HomeTab', 'navigation-home', () => {}],
        ['RankTab', 'navigation-rank', () => void rankings()],
    ] as const) {
        const tab = uiNode(bottom, name, 0, 0, NAVIGATION_TAB_WIDTH, NAVIGATION_HEIGHT);
        const icon = await part(tab, 'Artwork', key, 0, 2118, NAVIGATION_TAB_WIDTH, NAVIGATION_HEIGHT);
        icon.setPosition(0, 0, 0);
        tabs.push({hit: tap(tab, action).node, artwork: icon});
    }

    bindFlowerViewport(home, viewport => {
        home.getComponent(UITransform)!.setContentSize(viewport.width, viewport.height);
        coverFlowerArt(background, viewport, 1080, 2400);
        const scale = fitFlowerPortrait(artwork, viewport);
        top.setPosition(0, Math.min(0, viewport.safeTop / scale - 1022), 0);
        const tabWidth = viewport.width / tabs.length;
        const barHeight = NAVIGATION_HEIGHT * scale;
        bottom.setPosition(0, viewport.safeBottom, 0);
        bar.setPosition(0, barHeight / 2, 0);
        bar.getComponent(UITransform)!.setContentSize(viewport.width, barHeight);
        for (const [i, {hit, artwork: icon}] of tabs.entries()) {
            const left = -viewport.width / 2 + i * tabWidth;
            const safeLeft = Math.max(left, viewport.safeLeft);
            const safeRight = Math.min(left + tabWidth, viewport.safeRight);
            hit.active = safeRight > safeLeft;
            hit.setPosition((safeLeft + safeRight) / 2, barHeight / 2, 0);
            hit.getComponent(UITransform)!.setContentSize(Math.max(0, safeRight - safeLeft), barHeight);
            icon.setScale(scale, scale, 1);
        }

        const extensionHeight = Math.max(0, viewport.safeBottom + viewport.height / 2);
        navigationExtension.setPosition(0, -viewport.height / 2, 0);
        navigationFill.clear();
        if (extensionHeight > 0) {
            // Continue the final row of the PSD below the gesture area while keeping taps above it.
            navigationFill.fillColor = new Color(35, 99, 208, 255);
            navigationFill.rect(-viewport.width / 2, 0, viewport.width, extensionHeight + 1);
            navigationFill.fill();
            navigationFill.fillColor = new Color(75, 143, 244, 255);
            navigationFill.rect(-tabWidth / 2, 0, tabWidth, extensionHeight + 1);
            navigationFill.fill();
        }
    });

    async function settings(): Promise<void> {
        if (modalOpen) return; modalOpen = true;
        const close = () => { modalOpen = false; };
        await createPause(home, {onResume: close, onRestart: close, onHome: close}, true);
    }
    async function dailyReward(): Promise<void> {
        const date = today();
        if (sys.localStorage.getItem('zdhjy.daily') === date) return notice('每日奖励', '今日奖励已经领取\n明天再来吧', 'calendar');
        if (modalOpen) return; modalOpen = true;
        await message(home, '每日奖励', '今日登录奖励\n金币 × 50', '领取', () => {
            sys.localStorage.setItem('zdhjy.daily', date); write('coins', read('coins', 0) + 50);
            coinsLabel.string = String(read('coins', 0)); modalOpen = false;
        }, 'calendar');
    }
    async function welcomeGift(): Promise<void> {
        if (sys.localStorage.getItem('zdhjy.welcome')) return notice('新手礼物', '欢迎礼物已经领取\n通关可获得更多奖励', 'gift');
        if (modalOpen) return; modalOpen = true;
        await message(home, '新手礼物', '欢迎来到花店\n金币 × 100', '领取', () => {
            sys.localStorage.setItem('zdhjy.welcome', '1'); write('coins', read('coins', 0) + 100);
            coinsLabel.string = String(read('coins', 0)); modalOpen = false;
        }, 'gift');
    }
    async function store(): Promise<void> {
        if (modalOpen) return; modalOpen = true;
        const items = [{type: 'compose', unlock: 2}, {type: 'shuffle', unlock: 3}, {type: 'clear', unlock: 4}];
        await Promise.all([preloadPopupFrames(['shop', 'coin']), ...items.map(item => loadFrame(`greenhouse/tool-${item.type}`))]);
        if (!home.isValid) return;
        const overlay = modal(home, 'StoreOverlay');
        await popupFrame(overlay, '商城', 670, 834);
        await popupIcon(overlay, 'Shop', 'shop', 0, 258, 147);
        const balance = await popupInset(overlay, 'Balance', 0, 131, 245, 62);
        await popupIcon(balance, 'Coin', 'coin', -78, 0, 49);
        label(balance, 'Value', String(read('coins', 0)), 24, 0, 32, 142, '#754524');
        for (let i = 0; i < items.length; i++) {
            const item = items[i], x = (i - 1) * 193;
            const card = await popupInset(overlay, item.type, x, -37, 176, 224);
            await fittedSprite(card, 'Icon', `greenhouse/tool-${item.type}`, 0, 23, 134, 132);
            label(card, 'Unlock', `第 ${item.unlock} 关解锁`, 0, -67, 22, 150, '#915f32');
        }
        label(overlay, 'StoreDescription', '通关解锁道具，在花池中使用', 0, -204, 27, 570, '#694727');
        const close = () => dismissPopup(overlay, () => { modalOpen = false; });
        await popupClose(overlay, 'CloseStore', 284, 386, close);
        tap(await popupButton(overlay, 'BackHome', '返回主页', 0, -310, 290, 96), close);
        presentPopup(overlay);
    }
    async function rankings(): Promise<void> {
        if (modalOpen) return; modalOpen = true;
        await preloadPopupFrames(['rank', 'star']);
        if (!home.isValid) return;
        const overlay = modal(home, 'RankOverlay');
        await popupFrame(overlay, '排行榜', 650, 736);
        await popupIcon(overlay, 'Rank', 'rank', 0, 204, 150);
        await popupInset(overlay, 'ProgressRow', 0, 60, 525, 87);
        label(overlay, 'YourProgress', '我的进度', -128, 60, 31, 190, '#694727');
        label(overlay, 'LevelValue', `第 ${level} 关`, 116, 60, 32, 190, '#2b67a9', 'display');
        await popupInset(overlay, 'StarsRow', 0, -45, 525, 87);
        label(overlay, 'YourStars', '累计星星', -128, -45, 31, 190, '#694727');
        await popupIcon(overlay, 'Star', 'star', 63, -45, 56);
        label(overlay, 'StarValue', String(read('stars', 0)), 149, -45, 32, 108, '#a06128', 'display');
        label(overlay, 'ServiceState', '好友排名需在微信小游戏中查看', 0, -143, 26, 550, '#694727');
        const close = () => dismissPopup(overlay, () => { modalOpen = false; });
        await popupClose(overlay, 'CloseRank', 274, 337, close);
        tap(await popupButton(overlay, 'BackHome', '返回主页', 0, -251, 290, 96), close);
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
