/**
 * Engine-independent rules for the flower order game.
 * FlowerCatalog supplies extracted original bouquets; the numeric constructor
 * also provides small deterministic local levels for standalone use and tests.
 */
export type FlowerKind = string;
export type FlowerStatus = 'pool' | 'buffer' | 'waiting' | 'hidden' | 'collected';
export type GameStatus = 'playing' | 'won' | 'lost';
export type LevelSource = 'observed' | 'extracted' | 'generated';

export interface FlowerPiece {
    id: string;
    kind: FlowerKind;
    variant: 1 | 2 | 3;
    status: FlowerStatus;
    /** Original pool layer: Up, Middle, Bottom, Down. */
    initialLayer: 0 | 1 | 2 | 3;
    specialId?: number;
    insertAtPercent?: number;
}

export interface FlowerSpecialConfig {
    specialId: number;
    kind: FlowerKind;
    insertAtPercent: number;
}

export interface FlowerOrderConfig {
    vaseId?: number;
    /** First occurrence of a newly unlocked vase in this level's generated orders. */
    isNew?: boolean;
    needs: { kind: FlowerKind; count: number }[];
}

export interface FlowerOrderNeed {
    kind: FlowerKind;
    required: number;
    filled: number;
}

export interface FlowerOrder {
    id: string;
    kind: FlowerKind;
    required: number;
    filled: number;
    slot: number;
    vaseId?: number;
    isNew?: boolean;
    needs: FlowerOrderNeed[];
}

export interface FlowerLevelConfig {
    level: number;
    timeLimit: number;
    initialUnlockedOrderSlots?: 2 | 3 | 4;
    flowers: { kind: FlowerKind; count: number }[];
    /** Special objects are inserted separately and do not contribute to flower progress. */
    specials?: FlowerSpecialConfig[];
    /** Original BuildOrderFlowerSequence gaps, cycled within each need group. */
    flowerIntervalRange?: number[];
    /** Four original [initial count, refill maximum] rows. Down holds the remainder. */
    layerNumber?: number[][];
    /** Original [bouquet percentage, reveal delay in seconds] difficulty rows. */
    diffRange?: number[][];
    orderSequence?: FlowerKind[];
    /** Explicit bouquets take precedence over the legacy three-of-one-kind sequence. */
    orders?: FlowerOrderConfig[];
    source?: LevelSource;
    /** One star per completed order was observed in the original first level. */
    starsPerOrder?: number;
    /** Only level 1 was observed at 10 coins; later defaults are provisional local rewards. */
    coinsOnWin?: number;
}

export type FlowerEvent =
    | { type: 'move'; flowerId: string; from: 'pool' | 'buffer' | 'waiting'; to: 'order' | 'buffer' | 'waiting'; slot: number; orderId?: string }
    | { type: 'order-added' | 'order-completed'; order: FlowerOrder }
    | { type: 'buffer-expanded'; capacity: number; cost: number }
    | { type: 'order-unlocked'; slot: number }
    | { type: 'time-revived'; seconds: number; cost: number }
    | { type: 'flower-revealed'; flowerId: string; layer: 2 }
    | { type: 'special-paired'; specialId: number; flowerIds: string[]; slot: number; delaySeconds: number }
    | { type: 'won'; stars: number; coins: number }
    | { type: 'lost'; reason: 'time' | 'buffer' };

export const FIRST_LEVEL_KINDS: FlowerKind[] = ['cdy_lxq', 'dy_zmj', 'cdcs_jyc'];

interface FlowerDifficulty {
    orderId: string;
    kind: FlowerKind;
    flowerId: string;
    delay: number;
    activated: boolean;
    checking: boolean;
    revealAt: number | null;
    released: boolean;
}

export function makeFlowerLevel(level: number): FlowerLevelConfig {
    if (!Number.isInteger(level) || level < 1) throw new Error('level must be a positive integer');
    const sets = Math.min(6, 1 + Math.floor(level / 2));
    const orderSequence: FlowerKind[] = [];
    for (let i = 0; i < sets; i++) orderSequence.push(...FIRST_LEVEL_KINDS);
    return {
        level,
        timeLimit: 180,
        flowers: FIRST_LEVEL_KINDS.map(kind => ({ kind, count: sets * 3 })),
        orderSequence,
        source: level === 1 ? 'observed' : 'generated',
        starsPerOrder: 1,
        coinsOnWin: 10,
    };
}

export class FlowerRules {
    readonly level: number;
    readonly source: LevelSource;
    flowers: FlowerPiece[] = [];
    orders: (FlowerOrder | null)[] = [null, null, null, null];
    buffer: string[] = [];
    /** Flowers moved out by the clear prop, waiting for a matching order. */
    waiting: string[] = [];
    bufferCapacity = 5;
    remainingSeconds = 180;
    status: GameStatus = 'playing';
    failureReason: 'time' | 'buffer' | null = null;
    completedOrders = 0;
    stars = 0;
    /** Coins actually granted by the current attempt, zero before winning. */
    coinReward = 0;
    coins: number;

    private readonly config: FlowerLevelConfig;
    private readonly sequence: FlowerOrderConfig[];
    private unlocked: boolean[] = [true, true, false, false];
    private nextOrder = 0;
    private collected = 0;
    private normalTotal = 0;
    // Kept across restart, just like the wallet, to avoid granting this board twice.
    private winRewardGranted = false;
    private pieces = new Map<string, FlowerPiece>();
    private difficulties: FlowerDifficulty[] = [];
    private elapsedGameTime = 0;
    private nextDifficultyCheck = 1;

    constructor(levelOrConfig: number | FlowerLevelConfig = 1, coins = 0) {
        const input = typeof levelOrConfig === 'number' ? makeFlowerLevel(levelOrConfig) : levelOrConfig;
        this.config = {
            ...input,
            flowers: input.flowers.map(group => ({ ...group })),
            specials: input.specials ? input.specials.map(item => ({ ...item })) : undefined,
            flowerIntervalRange: input.flowerIntervalRange ? [...input.flowerIntervalRange] : undefined,
            layerNumber: input.layerNumber ? input.layerNumber.map(row => [...row]) : undefined,
            diffRange: input.diffRange ? input.diffRange.map(row => [...row]) : undefined,
            orderSequence: input.orderSequence ? [...input.orderSequence] : undefined,
            orders: input.orders ? input.orders.map(order => ({ ...order, needs: order.needs.map(need => ({ ...need })) })) : undefined,
        };
        this.sequence = this.validateConfig();
        this.level = this.config.level;
        this.source = this.config.source || 'generated';
        this.coins = Number.isFinite(coins) ? Math.max(0, Math.floor(coins)) : 0;
        this.restart();
    }

    get normalFlowerCount(): number { return this.normalTotal; }

    get layerCounts(): number[] {
        return [0, 1, 2, 3].map(layer => this.flowers.filter(piece => piece.status !== 'hidden' && piece.initialLayer === layer).length);
    }

    /** Original max(initial, limit), never enlarged by butterfly insertions. Down is unlimited. */
    get layerMaxCounts(): number[] {
        return this.config.layerNumber
            ? this.config.layerNumber.map(row => Math.max(0, row[0], row[1]))
            : [this.flowers.length, 0, 0, 0];
    }

    get progress(): number {
        return this.normalTotal ? this.collected / this.normalTotal : 0;
    }

    /** Original GameMgr.ReduceFlowerNum display curve (WASM function 41051). */
    get displayProgressPercent(): number {
        if (!this.normalTotal) return 0;
        // Match each original f32 operation, including collected * 1.7 before
        // dividing by total; algebraic reassociation can change a floor boundary.
        const f32 = Math.fround;
        const collected = f32(this.collected);
        const total = f32(this.normalTotal);
        const p = f32(collected / total);
        const distance = f32(f32(0.95) - p);
        const weighted = f32(f32(collected * f32(1.7)) / total);
        const remaining = f32(1 - p);
        const adjustment = f32(distance * f32(weighted * remaining));
        return Math.floor(f32(f32(p + adjustment) * 100));
    }

    get unlockedOrderSlots(): number {
        return this.unlocked.filter(Boolean).length;
    }

    isOrderSlotUnlocked(slot: number): boolean {
        return this.unlocked[slot] === true;
    }

    /** Restart resets this board; purchases already deducted from the wallet stay spent. */
    restart(): void {
        this.flowers = [];
        this.pieces.clear();
        for (const group of this.config.flowers) {
            for (let i = 0; i < group.count; i++) {
                const flower: FlowerPiece = {
                    id: 'flower-' + this.flowers.length,
                    kind: group.kind,
                    variant: (i % 3 + 1) as 1 | 2 | 3,
                    status: 'pool',
                    initialLayer: 0,
                };
                this.flowers.push(flower);
                this.pieces.set(flower.id, flower);
            }
        }
        this.arrangeNormalFlowers();
        this.normalTotal = this.flowers.length;
        this.prepareDifficulty();
        const hidden = this.flowers.filter(piece => piece.status === 'hidden');
        this.flowers = this.flowers.filter(piece => piece.status === 'pool');
        // BuildFlowerLayerLists (41034) partitions the ordered normal sequence
        // before specials are inserted. An insertion never pushes an old piece
        // into the following layer, even when it exceeds the refill maximum.
        let boundary = 0;
        if (this.config.layerNumber) {
            for (let layer = 0; layer < 4; layer++) {
                const end = layer === 3 ? this.flowers.length
                    : Math.min(this.flowers.length, boundary + this.config.layerNumber[layer][0]);
                for (let index = boundary; index < end; index++) {
                    this.flowers[index].initialLayer = layer as 0 | 1 | 2 | 3;
                }
                boundary = end;
            }
        }
        for (let index = 0; index < (this.config.specials || []).length; index++) {
            const special = this.config.specials![index];
            // Original 41038 uses the current list length, including earlier insertions.
            const percent = Math.max(0, Math.min(100, special.insertAtPercent));
            const at = Math.max(0, Math.min(this.flowers.length - 1, Math.floor(this.flowers.length * percent / 100)));
            const piece: FlowerPiece = {
                id: 'special-' + index, kind: special.kind, variant: 1, status: 'pool',
                initialLayer: this.flowers[at]?.initialLayer ?? 0,
                specialId: special.specialId, insertAtPercent: special.insertAtPercent,
            };
            this.flowers.splice(at, 0, piece);
            this.pieces.set(piece.id, piece);
        }
        // Hidden pieces remain part of the board and its normal goal, but do not
        // occupy initial layers or influence special insertion percentages.
        this.flowers.push(...hidden);
        this.orders = [null, null, null, null];
        this.buffer = [];
        this.waiting = [];
        const initialSlots = this.config.initialUnlockedOrderSlots || 2;
        this.unlocked = [0, 1, 2, 3].map(slot => slot < initialSlots);
        this.bufferCapacity = 5;
        this.remainingSeconds = this.config.timeLimit;
        this.status = 'playing';
        this.failureReason = null;
        this.completedOrders = 0;
        this.stars = 0;
        this.coinReward = 0;
        this.nextOrder = 0;
        this.collected = 0;
        this.elapsedGameTime = 0;
        this.nextDifficultyCheck = 1;
        this.fillEmptyOrders([]);
    }

    private prepareDifficulty(): void {
        this.difficulties = [];
        const usedOrders = new Set<number>();
        for (const [percent, delay] of this.config.diffRange || []) {
            const index = Math.max(0, Math.min(this.sequence.length - 1, Math.floor(this.sequence.length * percent / 100) - 1));
            if (usedOrders.has(index)) continue;
            usedOrders.add(index);
            const needs = this.sequence[index].needs;
            const kind = needs[needs.length - 1].kind;
            // 41040 takes the earliest spawn of this species, even if it was
            // originally generated for a different bouquet of the same species.
            const flower = this.flowers.find(piece => piece.kind === kind && piece.status === 'pool')!;
            flower.status = 'hidden';
            flower.initialLayer = 2;
            this.difficulties.push({
                orderId: 'order-' + index, kind, flowerId: flower.id, delay,
                activated: false, checking: false, revealAt: null, released: false,
            });
        }
    }

    private poolCount(kind: FlowerKind): number {
        return this.flowers.filter(piece => piece.kind === kind && piece.specialId === undefined && piece.status === 'pool').length;
    }

    private activateDifficulty(order: FlowerOrder): void {
        const difficulty = this.difficulties.find(item => item.orderId === order.id && !item.released && !item.activated);
        if (!difficulty) return;
        const current = order.needs.findIndex(need => need.filled < need.required);
        if (current !== order.needs.length - 1) return;
        difficulty.activated = true;
        const need = order.needs[current];
        if (need.required - need.filled > this.poolCount(difficulty.kind)) {
            difficulty.revealAt = this.elapsedGameTime + difficulty.delay;
        } else difficulty.checking = true;
    }

    private revealDifficulty(difficulty: FlowerDifficulty, events: FlowerEvent[]): void {
        if (difficulty.released) return;
        difficulty.released = true;
        difficulty.checking = false;
        difficulty.revealAt = null;
        const flower = this.pieces.get(difficulty.flowerId)!;
        flower.status = 'pool';
        flower.initialLayer = 2;
        events.push({ type: 'flower-revealed', flowerId: flower.id, layer: 2 });
    }

    private advanceDifficulty(seconds: number, events: FlowerEvent[]): void {
        const end = this.elapsedGameTime + seconds;
        while (true) {
            let next = this.nextDifficultyCheck;
            for (const item of this.difficulties) {
                if (!item.released && item.revealAt !== null) next = Math.min(next, item.revealAt);
            }
            if (next > end) break;
            this.elapsedGameTime = next;
            for (const item of this.difficulties) {
                if (!item.released && item.revealAt !== null && item.revealAt <= next) this.revealDifficulty(item, events);
            }
            if (this.nextDifficultyCheck <= next) {
                this.nextDifficultyCheck++;
                for (const item of this.difficulties) {
                    if (!item.released && item.checking && item.revealAt === null && this.poolCount(item.kind) === 0) {
                        item.revealAt = next + item.delay;
                        item.checking = false;
                    }
                }
            }
        }
        this.elapsedGameTime = end;
    }

    private arrangeNormalFlowers(): void {
        const byKind = new Map<FlowerKind, FlowerPiece[]>();
        for (const piece of this.flowers) {
            const bucket = byKind.get(piece.kind) || [];
            bucket.push(piece);
            byKind.set(piece.kind, bucket);
        }
        const intervals = this.config.flowerIntervalRange || [];
        const slots: FlowerPiece[] = [];
        let firstFree = 0;
        // Original BuildOrderFlowerSequence (41033): each group's first flower
        // starts in the earliest hole; later flowers skip a configured interval
        // and then advance at least once to find the next free position.
        for (const order of this.sequence) {
            for (const need of order.needs) {
                let position = -1;
                for (let index = 0; index < need.count; index++) {
                    if (index === 0 || !intervals.length) position = firstFree;
                    else {
                        position += Math.max(0, intervals[(index - 1) % intervals.length]);
                        do { position++; } while (slots[position]);
                    }
                    slots[position] = byKind.get(need.kind)!.shift()!;
                    if (position === firstFree) while (slots[firstFree]) firstFree++;
                }
            }
        }
        this.flowers = slots.filter(Boolean);
    }

    select(flowerId: string): FlowerEvent[] {
        const flower = this.pieces.get(flowerId);
        if (this.status !== 'playing' || !flower || flower.status !== 'pool') return [];
        if (flower.specialId !== undefined) return this.selectSpecial(flower);
        const events: FlowerEvent[] = [];
        const order = this.matchingOrder(flower.kind);
        if (order) {
            this.collect(flower, order, 'pool', events);
            this.settleBuffer(events);
        } else {
            // A full buffer is terminal; no further flower is dropped or overwritten.
            flower.status = 'buffer';
            this.buffer.push(flower.id);
            events.push({ type: 'move', flowerId, from: 'pool', to: 'buffer', slot: this.buffer.length - 1 });
        }
        this.checkEnd(events);
        return events;
    }

    /** Complete only the current flower group of the first active bouquet. */
    collectMatchingOrder(): FlowerEvent[] {
        if (this.status !== 'playing') return [];
        const events: FlowerEvent[] = [];
        let target: FlowerOrder | null = null;
        let need: FlowerOrderNeed | undefined;
        let candidates: FlowerPiece[] = [];
        for (const order of this.orders) {
            if (!order) continue;
            const current = order.needs.find(item => item.filled < item.required)!;
            const available = () => this.flowers.filter(piece => piece.specialId === undefined && piece.kind === current.kind
                && piece.status !== 'hidden' && piece.status !== 'collected');
            candidates = available();
            if (candidates.length < current.required - current.filled) {
                // 41050 releases only this bouquet's matching difficulty record,
                // then 44445 retries; it never consumes an incomplete selection.
                const difficulty = this.difficulties.find(item => item.orderId === order.id && item.kind === current.kind && !item.released);
                if (difficulty) this.revealDifficulty(difficulty, events);
                candidates = available();
            }
            if (candidates.length >= current.required - current.filled) { target = order; need = current; break; }
        }
        if (!target || !need) return events;
        // Original 43428/44445 passes one current flower id and its remaining
        // quantity. Do not continue into the next group of a mixed bouquet.
        while (need.filled < need.required) {
            const flower = candidates.shift();
            if (!flower) break;
            const from = flower.status === 'buffer' ? 'buffer' : flower.status === 'waiting' ? 'waiting' : 'pool';
            const stored = from === 'buffer' ? this.buffer : from === 'waiting' ? this.waiting : null;
            if (stored) {
                const index = stored.indexOf(flower.id);
                if (index >= 0) stored.splice(index, 1);
            }
            this.collect(flower, target, from, events);
        }
        this.settleBuffer(events);
        this.checkEnd(events);
        return events;
    }

    /** Original clear prop frees ordinary tray slots without deleting their flowers. */
    clearBuffer(): FlowerEvent[] {
        if (this.status !== 'playing') return [];
        const events: FlowerEvent[] = [];
        const retained: string[] = [];
        for (const id of this.buffer) {
            const piece = this.pieces.get(id)!;
            if (piece.specialId !== undefined) { retained.push(id); continue; }
            piece.status = 'waiting';
            this.waiting.push(id);
            events.push({ type: 'move', flowerId: id, from: 'buffer', to: 'waiting', slot: this.waiting.length - 1 });
        }
        this.buffer = retained;
        this.settleBuffer(events);
        this.checkEnd(events);
        return events;
    }

    /** The caller pauses by not ticking while a pause or modal screen is open. */
    tick(dt: number): FlowerEvent[] {
        if (this.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return [];
        const events: FlowerEvent[] = [];
        this.advanceDifficulty(Math.min(dt, this.remainingSeconds), events);
        this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
        if (this.remainingSeconds > 0) return events;
        this.status = 'lost';
        this.failureReason = 'time';
        events.push({ type: 'lost', reason: 'time' });
        return events;
    }

    /** Spend local game coins to resume a timed-out attempt without resetting its board. */
    reviveTime(): FlowerEvent[] {
        if (this.status !== 'lost' || this.failureReason !== 'time' || this.coins < 100) return [];
        this.coins -= 100;
        this.remainingSeconds = 120;
        this.failureReason = null;
        this.status = 'playing';
        return [{ type: 'time-revived', seconds: 120, cost: 100 }];
    }

    buyExtraBufferSlot(): FlowerEvent[] {
        if (this.status !== 'playing' || this.bufferCapacity !== 5 || this.coins < 60) return [];
        this.coins -= 60;
        this.bufferCapacity = 6;
        return [{ type: 'buffer-expanded', capacity: this.bufferCapacity, cost: 60 }];
    }

    /** Invoke only after the host has successfully obtained the unlock reward. */
    unlockOrderSlot(slot: number): FlowerEvent[] {
        if (this.status !== 'playing' || !Number.isInteger(slot) || slot < 2 || slot > 3 || this.unlocked[slot]) return [];
        this.unlocked[slot] = true;
        const events: FlowerEvent[] = [{ type: 'order-unlocked', slot }];
        this.fillEmptyOrders(events);
        this.settleBuffer(events);
        this.checkEnd(events);
        return events;
    }

    private selectSpecial(piece: FlowerPiece): FlowerEvent[] {
        const slot = this.buffer.findIndex(id => this.pieces.get(id)?.specialId === piece.specialId);
        const events: FlowerEvent[] = [];
        if (slot < 0) {
            piece.status = 'buffer';
            this.buffer.push(piece.id);
            events.push({ type: 'move', flowerId: piece.id, from: 'pool', to: 'buffer', slot: this.buffer.length - 1 });
            // A single butterfly occupies a full ordinary placement slot.
            this.checkEnd(events);
            return events;
        }
        const first = this.pieces.get(this.buffer[slot])!;
        events.push({ type: 'move', flowerId: piece.id, from: 'pool', to: 'buffer', slot });
        events.push({ type: 'special-paired', specialId: piece.specialId!, flowerIds: [first.id, piece.id], slot, delaySeconds: 0.12 });
        first.status = 'collected';
        piece.status = 'collected';
        this.buffer.splice(slot, 1);
        // The UI plays the placement/pairing delay before the subsequent move events.
        // Green and pink butterflies invoke the same current-group compose operation.
        events.push(...this.collectMatchingOrder());
        this.checkEnd(events);
        return events;
    }

    private matchingOrder(kind: FlowerKind): FlowerOrder | undefined {
        // Original TryReserveFlowerNode (43417) matches only NeedOrderType,
        // which RefreshCurrentOrderUI (43404) sets from the current group.
        return this.orders.find(order => !!order && order.needs.find(need => need.filled < need.required)?.kind === kind) || undefined;
    }

    private fillEmptyOrders(events: FlowerEvent[]): void {
        for (let slot = 0; slot < this.orders.length && this.nextOrder < this.sequence.length; slot++) {
            if (!this.unlocked[slot] || this.orders[slot]) continue;
            const index = this.nextOrder++;
            const template = this.sequence[index];
            const order: FlowerOrder = {
                id: 'order-' + index,
                kind: template.needs[0].kind,
                required: template.needs.reduce((sum, need) => sum + need.count, 0),
                filled: 0,
                slot,
                vaseId: template.vaseId,
                isNew: template.isNew ?? false,
                needs: template.needs.map(need => ({ kind: need.kind, required: need.count, filled: 0 })),
            };
            this.orders[slot] = order;
            events.push({ type: 'order-added', order: this.cloneOrder(order) });
            this.activateDifficulty(order);
        }
    }

    private collect(flower: FlowerPiece, order: FlowerOrder, from: 'pool' | 'buffer' | 'waiting', events: FlowerEvent[]): void {
        const need = order.needs.find(item => item.filled < item.required);
        if (!need || need.kind !== flower.kind) throw new Error('flower does not match the current order need');
        flower.status = 'collected';
        this.collected++;
        need.filled++;
        order.filled++;
        events.push({ type: 'move', flowerId: flower.id, from, to: 'order', slot: order.slot, orderId: order.id });
        if (order.filled === order.required) {
            this.completedOrders++;
            this.stars += this.config.starsPerOrder === undefined ? 1 : this.config.starsPerOrder;
            events.push({ type: 'order-completed', order: this.cloneOrder(order) });
            this.orders[order.slot] = null;
            this.fillEmptyOrders(events);
        } else this.activateDifficulty(order);
    }

    private settleBuffer(events: FlowerEvent[]): void {
        // Original TryFindPlacementFlower (43419) examines cleared waiting flowers
        // before ordinary placement slots. Each iteration removes one piece.
        let matched = true;
        while (matched) {
            matched = false;
            const stores = [
                { ids: this.waiting, from: 'waiting' as const },
                { ids: this.buffer, from: 'buffer' as const },
            ];
            for (const store of stores) {
                for (let i = 0; i < store.ids.length; i++) {
                    const flower = this.pieces.get(store.ids[i]);
                    const order = flower && flower.specialId === undefined && this.matchingOrder(flower.kind);
                    if (!flower || !order) continue;
                    store.ids.splice(i, 1);
                    this.collect(flower, order, store.from, events);
                    matched = true;
                    break;
                }
                if (matched) break;
            }
        }
    }

    private checkEnd(events: FlowerEvent[]): void {
        if (this.status !== 'playing') return;
        if (this.collected === this.normalTotal) {
            this.status = 'won';
            if (!this.winRewardGranted) {
                this.coinReward = this.config.coinsOnWin === undefined ? 10 : this.config.coinsOnWin;
                this.coins += this.coinReward;
                this.winRewardGranted = true;
            }
            events.push({ type: 'won', stars: this.stars, coins: this.coinReward });
        } else if (this.buffer.length >= this.bufferCapacity) {
            this.status = 'lost';
            this.failureReason = 'buffer';
            events.push({ type: 'lost', reason: 'buffer' });
        }
    }

    private cloneOrder(order: FlowerOrder): FlowerOrder {
        return { ...order, needs: order.needs.map(need => ({ ...need })) };
    }

    private validateConfig(): FlowerOrderConfig[] {
        const config = this.config;
        if (!Number.isInteger(config.level) || config.level < 1) throw new Error('level must be a positive integer');
        if (!Number.isFinite(config.timeLimit) || config.timeLimit <= 0) throw new Error('timeLimit must be positive');
        if (!config.flowers.length) throw new Error('a level must contain flowers');
        if (config.initialUnlockedOrderSlots !== undefined && ![2, 3, 4].includes(config.initialUnlockedOrderSlots)) {
            throw new Error('initialUnlockedOrderSlots must be 2, 3 or 4');
        }
        if (config.starsPerOrder !== undefined && (!Number.isFinite(config.starsPerOrder) || config.starsPerOrder < 0)) {
            throw new Error('starsPerOrder must be nonnegative');
        }
        if (config.coinsOnWin !== undefined && (!Number.isInteger(config.coinsOnWin) || config.coinsOnWin < 0)) {
            throw new Error('coinsOnWin must be a nonnegative integer');
        }
        if (config.flowerIntervalRange?.some(value => !Number.isInteger(value))) {
            throw new Error('flowerIntervalRange must contain integer gaps');
        }
        if (config.layerNumber && (config.layerNumber.length !== 4 || config.layerNumber.some(row =>
            row.length !== 2 || row.some(value => !Number.isInteger(value) || value < 0)))) {
            throw new Error('layerNumber must contain four nonnegative integer pairs');
        }
        if (config.diffRange?.some(row => row.length !== 2 || !Number.isFinite(row[0]) || !Number.isFinite(row[1]) || row[1] < 0)) {
            throw new Error('diffRange must contain finite percentage and nonnegative delay pairs');
        }
        const specialCounts = new Map<number, number>();
        for (const special of config.specials || []) {
            if (!Number.isInteger(special.specialId) || special.specialId <= 0 || !special.kind || !Number.isFinite(special.insertAtPercent)) {
                throw new Error('specials must have an integer id, nonempty kind and finite insertion percent');
            }
            specialCounts.set(special.specialId, (specialCounts.get(special.specialId) || 0) + 1);
        }
        if (Array.from(specialCounts.values()).some(count => count < 2 || count % 2 !== 0)) {
            throw new Error('specials must contain an even number of each id');
        }
        const totals = new Map<FlowerKind, number>();
        const defaultSequence: FlowerKind[] = [];
        for (const group of config.flowers) {
            if (!group.kind || !Number.isInteger(group.count) || group.count <= 0) {
                throw new Error('flower count must be a positive integer and kind must be nonempty');
            }
            if (!config.orders && group.count % 3 !== 0) {
                throw new Error('legacy flower count must be a positive multiple of 3');
            }
            totals.set(group.kind, (totals.get(group.kind) || 0) + group.count);
            if (!config.orders) {
                for (let i = 0; i < group.count / 3; i++) defaultSequence.push(group.kind);
            }
        }
        const sequence: FlowerOrderConfig[] = config.orders || (config.orderSequence || defaultSequence)
            .map(kind => ({ needs: [{ kind, count: 3 }] }));
        if (!sequence.length) throw new Error('orders must contain at least one bouquet');
        for (const order of sequence) {
            if (!order.needs.length) throw new Error('order needs must contain at least one flower kind');
            for (const need of order.needs) {
                if (!need.kind || !Number.isInteger(need.count) || need.count <= 0) {
                    throw new Error('order needs must have a nonempty kind and positive integer count');
                }
                totals.set(need.kind, (totals.get(need.kind) || 0) - need.count);
            }
        }
        if (Array.from(totals.values()).some(total => total !== 0)) throw new Error('orders must match the available flower counts');
        return sequence;
    }
}
