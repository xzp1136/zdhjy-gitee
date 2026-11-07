import { loadFlowerAsset } from './FlowerAssets';
import { JsonAsset } from 'cc';
import { FlowerLevelConfig, FlowerOrderConfig, FlowerSpecialConfig } from './FlowerRules';

export interface OriginalFlower {
    index: number; type: number; name: string; uiPath: string[];
    flowerPrefabPath: string[]; flowerSize: number; unlockLevel: number;
    sound?: string; playUpSound?: string | number | null;
}
export interface OriginalVase {
    index: number; name: string; uiPrefabPath: string; uiResPath: string;
    uiResPathTwo: string; orderInfo: number[][]; flowerResIndex: number[][]; unlockLevel: number;
}
export interface OriginalLevel {
    level: number; gameTime: number; totalNumber: number;
    levelOrderIndex: number[]; levelOrderNum: number[];
    layerNumber: number[][]; specialObjectNum: number[][] | null;
    flowerIntervalRange: number[];
    diffRange: number[][] | null;
}
interface OrderGroup { index: number; orderList: number[] }
interface Tables { [key: string]: unknown[] }
const flowerVariants = new Map<string, string[]>();

/** Some original species reuse their first image in their second/third slot. */
export function flowerSpritePath(kind: string, variant = 1): string {
    const paths = flowerVariants.get(kind);
    const resource = paths?.[Math.max(0, variant - 1)] ?? paths?.[0];
    return 'original/flower/' + (resource || (/^hd_\d+$/.test(kind) ? kind : `${kind}_0${variant}`));
}

function json<T>(name: string): Promise<T> {
    return new Promise((resolve, reject) => loadFlowerAsset('original/data/' + name, JsonAsset,
        (error, asset) => error ? reject(error) : resolve(asset.json as T)));
}
function random(seed: number) {
    let state = seed >>> 0;
    return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}

/** Original structure and quantities; species selection uses a reproducible local seed. */
export class FlowerCatalog {
    readonly flowers = new Map<number, OriginalFlower>();
    readonly flowersByKind = new Map<string, OriginalFlower>();
    readonly vases = new Map<number, OriginalVase>();
    readonly levels = new Map<number, OriginalLevel>();
    /** Original constructor skips missing groups; keep its warnings observable. */
    readonly levelWarnings = new Map<number, string[]>();
    private groups = new Map<number, OrderGroup>();
    // Only B contains the butterfly entries observed in the running second level.
    readonly variant = 'B';

    static async load(): Promise<FlowerCatalog> {
        const [catalog, levels] = await Promise.all([
            json<{ tables: Tables }>('original-order-flower-vase-tables'),
            json<{ tables: Tables }>('original-level-info-tables'),
        ]);
        const result = new FlowerCatalog();
        for (const flower of catalog.tables.ItemDataConfig as OriginalFlower[]) {
            result.flowers.set(flower.index, flower);
            result.flowersByKind.set(result.kind(flower), flower);
            flowerVariants.set(result.kind(flower), flower.flowerPrefabPath);
        }
        for (const vase of catalog.tables.VaseInfoConfig as OriginalVase[]) result.vases.set(vase.index, vase);
        for (const row of catalog.tables.OrderLevelConfigB as OrderGroup[]) result.groups.set(row.index, row);
        for (const row of levels.tables.LevelInfoConfigB as OriginalLevel[]) result.levels.set(row.level, row);
        return result;
    }

    kind(flower: OriginalFlower) {
        const path = flower.flowerPrefabPath[0];
        return flower.type === 200 ? path : path.replace(/_\d+$/, '');
    }

    level(level: number): FlowerLevelConfig {
        const source = this.levels.get(level);
        if (!source) throw new Error(`原始关卡表未包含第${level}关`);
        const warnings: string[] = [];
        this.levelWarnings.set(level, warnings);
        if (level === 1) return {
            level: 1, timeLimit: 180, initialUnlockedOrderSlots: 2, source: 'observed', starsPerOrder: 1, coinsOnWin: 10,
            flowers: [{ kind: 'cdy_lxq', count: 3 }, { kind: 'dy_zmj', count: 3 }, { kind: 'cdcs_jyc', count: 3 }],
            orders: [
                { vaseId: 1301, isNew: false, needs: [{ kind: 'cdy_lxq', count: 3 }] },
                { vaseId: 1601, isNew: false, needs: [{ kind: 'dy_zmj', count: 3 }] },
                { vaseId: 1201, isNew: false, needs: [{ kind: 'cdcs_jyc', count: 3 }] },
            ],
        };
        const rand = random(20261106 + level * 997);
        const orders: FlowerOrderConfig[] = [];
        const counts = new Map<string, number>();
        // InitGameConfig (41027) creates this set for each generation, not in
        // persistent collection state: unlock-level repeats/restarts get one marker again.
        const newVases = new Set<number>();
        for (let groupIndex = 0; groupIndex < source.levelOrderIndex.length; groupIndex++) {
            const id = source.levelOrderIndex[groupIndex];
            const group = this.groups.get(id);
            if (!group) {
                // GameMgr.InitGameConfig (WASM 41027): report the missing key
                // and continue this group, without borrowing another variant.
                const warning = `第${level}关配置OrderLevelConfig表不存在${id}，按原版逻辑跳过该订单组`;
                warnings.push(warning);
                console.warn(warning);
                continue;
            }
            const defined = group.orderList.map(vaseId => {
                const vase = this.vases.get(vaseId);
                if (!vase) throw new Error(`第${level}关订单组${id}引用未解析花束${vaseId}`);
                return vase;
            });
            // ProcessingData (44142) includes only unlockLevel <= current level;
            // InitGameConfig (41027) warns and skips an empty available group.
            const choices = defined.filter(vase => vase.unlockLevel <= level);
            if (!choices.length) {
                const warning = `第${level}关订单组${id}没有已解锁的花篮订单，按原版逻辑跳过该订单组`;
                warnings.push(warning);
                console.warn(warning);
                continue;
            }
            for (let n = 0; n < source.levelOrderNum[groupIndex]; n++) {
                const vase = choices[Math.floor(rand() * choices.length)];
                const needs = vase.orderInfo.map(requirement => {
                    const types = requirement.slice(0, -1), count = requirement[requirement.length - 1];
                    const candidates = [...this.flowers.values()].filter(f => types.includes(f.type) && f.unlockLevel <= level && f.type !== 200);
                    if (!candidates.length) throw new Error(`花束${vase.index}没有已解锁花种`);
                    const flower = candidates[Math.floor(rand() * candidates.length)];
                    const kind = this.kind(flower);
                    counts.set(kind, (counts.get(kind) || 0) + count);
                    return { kind, count };
                });
                const isNew = vase.unlockLevel === level && !newVases.has(vase.index);
                if (isNew) newVases.add(vase.index);
                orders.push({ vaseId: vase.index, isNew, needs });
            }
        }
        const specialRows = source.specialObjectNum || [];
        const specialCounts = new Map<number, number>();
        for (const row of specialRows) specialCounts.set(row[0], (specialCounts.get(row[0]) || 0) + 1);
        const specials: FlowerSpecialConfig[] = [];
        for (const [specialId, insertAtPercent] of specialRows) {
            const count = specialCounts.get(specialId)!;
            if (count < 2 || count % 2 !== 0) {
                const warning = `第${level}关特殊物体${specialId}数量${count}不是有效配对，按原版逻辑跳过`;
                if (!warnings.includes(warning)) { warnings.push(warning); console.warn(warning); }
                continue;
            }
            const item = this.flowers.get(specialId);
            if (!item || item.type !== 200) throw new Error(`第${level}关引用未解析特殊物体${specialId}`);
            specials.push({ specialId, kind: this.kind(item), insertAtPercent });
        }
        if (!orders.length) throw new Error(`第${level}关跳过缺失配置后无有效订单`);
        return {
            level, timeLimit: source.gameTime, initialUnlockedOrderSlots: level === 2 ? 4 : 2, source: 'extracted',
            layerNumber: source.layerNumber, flowerIntervalRange: source.flowerIntervalRange,
            diffRange: source.diffRange || undefined,
            flowers: [...counts].map(([kind, count]) => ({ kind, count })), orders, specials,
            // Later-level coin rewards have not been verified; 10 is a local default.
            starsPerOrder: 1, coinsOnWin: 10,
        };
    }
}
