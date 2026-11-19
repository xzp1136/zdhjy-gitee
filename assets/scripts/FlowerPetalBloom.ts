import { EffectAsset, Material, Node, Sprite, SpriteFrameEvent, Vec3, Vec4 } from 'cc';
import { loadFlowerAsset } from './FlowerAssets';
import type { BouquetFlower } from './FlowerBouquet';

export const BOUQUET_BLOOM_SECONDS = 0.66;
export const BOUQUET_GOLD_DELAY = 0.50;

type Point = readonly [number, number];
const HYDRANGEA: Record<string, readonly Point[]> = {
    cdy_lxq_01: [[.52, .188], [.24, .307], [.78, .351], [.57, .53], [.224, .59], [.785, .682], [.47, .81]],
    cdy_lxq_02: [[.605, .217], [.34, .386], [.806, .392], [.172, .53], [.581, .62], [.865, .601], [.281, .803]],
    cdy_lxq_03: [[.602, .199], [.308, .348], [.845, .416], [.164, .593], [.533, .445], [.356, .812], [.745, .805]],
};

let effect: EffectAsset | undefined;
let loading: Promise<void> | undefined;

/** Load before accepting taps so the material is ready on the last landing. */
export function preloadFlowerPetals(): Promise<void> {
    return loading ??= new Promise<EffectAsset>((resolve, reject) => {
        loadFlowerAsset('original/effects/bouquet-petals', EffectAsset, (error, asset) => {
            if (error) reject(error);
            else resolve(asset);
        });
    }).then(asset => {
        // Link the shader while the loading screen is still visible.
        const warmup = new Material();
        try {
            warmup.initialize({effectAsset: asset});
            effect = asset;
        } finally {
            warmup.destroy();
        }
    }).catch(error => { loading = undefined; throw error; });
}

type BloomSlot = {
    node: Node; origin: Vec3; side: number; delay: number; spread: number; lift: number;
    draw(progress: number): void; restore(): void;
};

/** Run the petal folds on the existing flower texture. Coordinates stay in the
 * sprite's own rectangle even if the renderer packs the frame into an atlas. */
export class FlowerPetalBloom {
    private readonly slots: BloomSlot[] = [];

    constructor(flowers: readonly BouquetFlower[]) {
        if (!effect) return;
        const sorted = flowers.slice().sort((a, b) => a.node.position.x - b.node.position.x);
        const center = sorted.reduce((sum, slot) => sum + slot.node.position.x, 0) / (sorted.length || 1);
        const span = Math.max(20, ...sorted.map(slot => Math.abs(slot.node.position.x - center)));
        try {
            sorted.forEach(({ node, path }, index) => {
                const sprite = node.getComponent(Sprite), frame = sprite?.spriteFrame;
                if (!sprite || !frame?.texture) return;
                const name = path.slice(path.lastIndexOf('/') + 1);
                const centres = HYDRANGEA[name];
                const ratio = frame.rect.width / Math.max(1, frame.rect.height);
                const toy = path.startsWith('greenhouse/toys/');
                const tall = ratio < 0.76 || name.startsWith('cdcs_');
                const pattern = toy ? 3 : centres ? 1 : tall ? 2 : 0;
                const previous = sprite.customMaterial;
                const bloom = new Material();
                const timing = new Vec4(0, (index % 3 - 1) * 0.12, 0, 0);
                const horizontalUV = new Vec4(), verticalUV = new Vec4();
                const syncUV = () => {
                    const uv = frame.uv;
                    horizontalUV.set(uv[4], uv[5], uv[6] - uv[4], uv[7] - uv[5]);
                    verticalUV.set(uv[0] - uv[4], uv[1] - uv[5], 0, 0);
                    bloom.setProperty('atlasX', horizontalUV);
                    bloom.setProperty('atlasY', verticalUV);
                };
                let restored = false;
                const restore = () => {
                    if (restored) return;
                    restored = true;
                    frame.off(SpriteFrameEvent.UV_UPDATED, syncUV);
                    if (sprite.isValid && sprite.customMaterial === bloom) sprite.customMaterial = previous;
                    bloom.destroy();
                };
                const origin = node.position.clone();
                const side = (origin.x - center) / span;
                this.slots.push({
                    node, origin, side,
                    delay: index * 0.12 / Math.max(sorted.length - 1, 1),
                    spread: centres ? 23 : 9,
                    lift: centres ? 3 + 20 * (1 - Math.abs(side)) ** 2 : 6,
                    draw(progress) {
                        if (restored) return;
                        if (progress >= 1) { restore(); return; }
                        timing.x = progress;
                        bloom.setProperty('timing', timing);
                    },
                    restore,
                });
                bloom.initialize({ effectAsset: effect });
                bloom.setProperty('flower', new Vec4(0.5, name.startsWith('dy_zmj_') ? 0.53 : 0.5,
                    Math.max(0.78, Math.min(1.32, ratio)), pattern));
                if (centres) {
                    const [a, b, c, d, e, f, g] = centres;
                    bloom.setProperty('clusterAB', new Vec4(...a, ...b));
                    bloom.setProperty('clusterCD', new Vec4(...c, ...d));
                    bloom.setProperty('clusterEF', new Vec4(...e, ...f));
                    bloom.setProperty('clusterG', new Vec4(...g, 0, 0));
                }
                syncUV();
                bloom.setProperty('timing', timing);
                frame.on(SpriteFrameEvent.UV_UPDATED, syncUV);
                sprite.customMaterial = bloom;
            });
        } catch (error) {
            this.dispose();
            throw error;
        }
    }

    draw(progress: number): void {
        for (const slot of this.slots) {
            if (!slot.node.isValid) continue;
            const pose = Math.max(0, Math.min(1, (progress - slot.delay) / (1 - slot.delay)));
            slot.draw(pose);
            const fan = pose * pose * (3 - 2 * pose);
            const { x, y, z } = slot.origin;
            slot.node.setPosition(x + slot.side * slot.spread * fan, y + slot.lift * fan, z);
        }
    }

    dispose(): void {
        for (const slot of this.slots) slot.restore();
    }
}
