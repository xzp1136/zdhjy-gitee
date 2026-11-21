import { loadFlowerAsset } from './FlowerAssets';
import { JsonAsset, Node, Vec3 } from 'cc';
import { BOARD_UNIT, BOUQUET_BASE_Y } from './FlowerBoardSkin';
import { FlowerOrder } from './FlowerRules';
import { flowerSpritePath, originalFlowerSpritePath } from './FlowerCatalog';
import { loadFrame, sprite, uiNode } from './FlowerUI';

type Layer = {resource:string;x:number;y:number;width:number;height:number;angle:number};
type Slot = {group:number;index:number;variantIndex:number;x:number;y:number;scaleX:number;scaleY:number;angle:number};
type Layout = {baseLayers:Layer[];flowerSlots:Slot[];foregroundLayers:Layer[]};
type Metric = {width:number;height:number;centerOffsetX:number;centerOffsetY:number};
type MotionLayout = {width: number; height: number; pivot: number[]};
type BouquetData = [Record<string,Layout>,Record<string,Metric>,Record<string,MotionLayout>];
let data: Promise<BouquetData> | null = null;
let loadedData: BouquetData | null = null;

function json<T>(name: string): Promise<T> {
    return new Promise((resolve,reject) => loadFlowerAsset('original/data/'+name,JsonAsset,
        (err,asset) => err ? reject(err) : resolve(asset.json as T)));
}
export async function preloadBouquets(vaseIds: (number | undefined)[] = []): Promise<BouquetData> {
    if (!data) data = Promise.all([json<Record<string,Layout>>('bouquet-layouts'),json<Record<string,Metric>>('flower-sprite-metrics'),json<Record<string,MotionLayout>>('order-motion-layouts')])
        .then(result => loadedData = result)
        .catch(error => { data = null; throw error; });
    const result = await data;
    const paths = new Set<string>();
    for (const id of vaseIds) {
        const layout = result[0][String(id)];
        if (layout) for (const part of [...layout.baseLayers, ...layout.foregroundLayers]) paths.add(part.resource);
    }
    await Promise.all(Array.from(paths).map(path => loadFrame(path)));
    return result;
}

/** Preserve the original proportions inside the current board's order row. */
function vesselUnit(motion: MotionLayout): number {
    return Math.min(1, 240 / motion.width, 220 / motion.height) * BOARD_UNIT;
}

export interface BouquetLanding {
    position: Vec3;
    /** Unity attachment pivot before the PNG's transparent margins were trimmed. */
    effectPosition: Vec3;
    width: number;
    height: number;
    angle: number;
}

export type BouquetFlower = { readonly node: Node; readonly path: string };

/** Keep the vase and foreground masks stable while individual flowers arrive. */
export class FlowerBouquetView {
    private placed = new Map<string, BouquetFlower>();
    private flowersRoot: Node;
    readonly artwork: Node;
    private constructor(readonly root: Node, private readonly layout: Layout, private readonly metrics: Record<string, Metric>,
        private readonly unit: number, readonly entranceOffset: number) {
        this.artwork = uiNode(root, 'BouquetArtwork');
        this.flowersRoot = uiNode(this.artwork, 'PlacedFlowers');
    }

    static async create(parent: Node, order: FlowerOrder, x = 0, y = BOUQUET_BASE_Y): Promise<FlowerBouquetView> {
        const [layouts, metrics, motion] = await preloadBouquets([order.vaseId]);
        if (!parent.isValid) throw new Error('Bouquet parent was destroyed');
        const layout = layouts[String(order.vaseId)];
        if (!layout) throw new Error(`花束${order.vaseId}缺少原始布局`);
        const motionLayout = motion[String(order.vaseId)];
        if (!motionLayout) throw new Error(`花束${order.vaseId}缺少原始动画尺寸`);
        const root = uiNode(parent, 'Bouquet', x, y, 240, 360);
        root.active = false;
        const unit = vesselUnit(motionLayout);
        const view = new FlowerBouquetView(root, layout, metrics, unit, (motionLayout.width + 80) * unit);
        const layer = async (part: Layer, index: number) => {
            const n = await sprite(view.artwork, 'VaseLayer' + index, part.resource, part.x * unit, part.y * unit,
                part.width * unit, part.height * unit);
            n.angle = part.angle || 0;
        };
        for (let i = 0; i < layout.baseLayers.length; i++) await layer(layout.baseLayers[i], i);
        view.flowersRoot.setSiblingIndex(view.artwork.children.length - 1);
        for (let i = 0; i < layout.foregroundLayers.length; i++) await layer(layout.foregroundLayers[i], 100 + i);
        await view.sync(order);
        root.active = true;
        return view;
    }

    private static geometry(metrics: Record<string, Metric>, unit: number, slot: Slot, kind: string): BouquetLanding {
        const path = originalFlowerSpritePath(kind, slot.variantIndex + 1);
        const metric = metrics[path];
        if (!metric) throw new Error(`花朵${path}缺少原始尺寸`);
        const angle = slot.angle * Math.PI / 180;
        const ox = metric.centerOffsetX * slot.scaleX, oy = metric.centerOffsetY * slot.scaleY;
        return {
            effectPosition: new Vec3(slot.x * unit, slot.y * unit, 0),
            position: new Vec3((slot.x + ox * Math.cos(angle) - oy * Math.sin(angle)) * unit,
                (slot.y + ox * Math.sin(angle) + oy * Math.cos(angle)) * unit, 0),
            width: metric.width * slot.scaleX * unit,
            height: metric.height * slot.scaleY * unit,
            angle: slot.angle,
        };
    }

    landing(order: FlowerOrder): BouquetLanding | null {
        return FlowerBouquetView.findLanding(this.layout, this.metrics, this.unit, order);
    }

    /** Early flights can target the next vase before it enters the row. */
    static landingFor(order: FlowerOrder): BouquetLanding | null {
        if (!loadedData) return null;
        const [layouts, metrics, motion] = loadedData;
        const key = String(order.vaseId);
        if (!layouts[key] || !motion[key]) return null;
        return this.findLanding(layouts[key], metrics, vesselUnit(motion[key]), order);
    }

    private static findLanding(layout: Layout, metrics: Record<string, Metric>, unit: number, order: FlowerOrder): BouquetLanding | null {
        const group = order.needs.findIndex(need => need.filled < need.required);
        if (group < 0) return null;
        const need = order.needs[group];
        const slot = layout.flowerSlots.find(item => item.group === group && item.index === need.filled);
        return slot ? this.geometry(metrics, unit, slot, need.kind) : null;
    }

    groupFlowers(group: number): Node[] {
        return this.layout.flowerSlots.filter(slot => slot.group === group).sort((a, b) => a.index - b.index)
            .map(slot => this.flowersRoot.getChildByName(`PlacedFlower${group}-${slot.index}`))
            .filter((node): node is Node => !!node);
    }

    get placedFlowers(): BouquetFlower[] {
        return Array.from(this.placed.values());
    }

    async sync(order: FlowerOrder): Promise<void> {
        for (const slot of this.layout.flowerSlots) {
            const need = order.needs[slot.group], key = slot.group + '-' + slot.index;
            if (!need || slot.index >= need.filled || this.placed.has(key)) continue;
            const path = flowerSpritePath(need.kind, slot.variantIndex + 1);
            const target = FlowerBouquetView.geometry(this.metrics, this.unit, slot, need.kind);
            const n = await sprite(this.flowersRoot, 'PlacedFlower' + key, path,
                target.position.x, target.position.y, target.width, target.height);
            n.angle = target.angle;
            this.placed.set(key, {node: n, path});
        }
        // Arrival order differs from Unity's draw order (the first blue flower
        // is drawn in front of the later two), so retain the original stacking.
        let sibling = 0;
        for (const slot of this.layout.flowerSlots) {
            const node = this.flowersRoot.getChildByName('PlacedFlower' + slot.group + '-' + slot.index);
            if (node) node.setSiblingIndex(sibling++);
        }
    }
}

/** Compatibility entry for static bouquet previews. */
export async function drawOrderBouquet(parent: Node, order: FlowerOrder, x = 0, y = BOUQUET_BASE_Y): Promise<Node> {
    return (await FlowerBouquetView.create(parent, order, x, y)).root;
}
