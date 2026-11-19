export type StartupTask = () => Promise<unknown>;

export interface FrameWorkOptions {
    nextFrame: () => Promise<void>;
    isCurrent?: () => boolean;
    now?: () => number;
    maxItems?: number;
    budgetMs?: number;
}

/** Cached promises are microtasks, not frame breaks. Bound both item count and
 * elapsed work, and let the caller yield to the renderer between slices. */
export async function runFrameWork<T>(items: readonly T[], work: (item: T, index: number) => void | Promise<unknown>,
    options: FrameWorkOptions): Promise<boolean> {
    const current = options.isCurrent ?? (() => true);
    const now = options.now ?? (() => typeof performance !== 'undefined' ? performance.now() : Date.now());
    const maxItems = Math.max(1, Math.floor(options.maxItems ?? 3));
    const budget = Math.max(0, options.budgetMs ?? 4);
    let started = now(), count = 0;
    for (let i = 0; i < items.length; i++) {
        if (!current()) return false;
        await work(items[i], i);
        if (!current()) return false;
        count++;
        if (i + 1 < items.length && (count >= maxItems || now() - started >= budget)) {
            await options.nextFrame();
            if (!current()) return false;
            started = now(); count = 0;
        }
    }
    return current();
}

type FrameJob = {run: () => void; cancel: () => void; fail: (error: unknown) => void};

/** One queue per pool: concurrent reveals/effects share a budget instead of
 * each starting a separate three-items-per-frame loop. */
export class FrameTaskQueue {
    private jobs: FrameJob[] = [];
    private active: FrameJob[] = [];
    private running = false;
    private disposed = false;
    constructor(private readonly options: FrameWorkOptions) {}

    enqueue<T>(work: () => T): Promise<T | null> {
        if (this.disposed) return Promise.resolve(null);
        const promise = new Promise<T | null>((resolve, reject) => {
            this.jobs.push({run: () => { try { resolve(work()); } catch (error) { reject(error); } },
                cancel: () => resolve(null), fail: reject});
        });
        if (!this.running) { this.running = true; void this.drain(); }
        return promise;
    }

    private async drain(): Promise<void> {
        const current = () => !this.disposed && (this.options.isCurrent?.() ?? true);
        try {
            while (this.jobs.length && current()) {
                await this.options.nextFrame();
                if (!current()) break;
                this.active = this.jobs; this.jobs = [];
                await runFrameWork(this.active, job => job.run(), {...this.options, isCurrent: current});
                this.active.forEach(job => job.cancel()); this.active = [];
            }
        } catch (error) {
            this.active.forEach(job => job.fail(error)); this.jobs.forEach(job => job.fail(error));
            this.active = []; this.jobs = []; this.disposed = true;
        } finally {
            this.running = false;
            if (!current()) this.dispose();
        }
    }

    dispose(): void {
        this.disposed = true;
        this.active.forEach(job => job.cancel()); this.jobs.forEach(job => job.cancel());
        // Keep the active array intact until runFrameWork observes cancellation.
        this.jobs = [];
    }
}

/**
 * Run a fixed asset task table concurrently, then optionally construct the UI.
 * Progress counts completed jobs, never elapsed time. A failed invocation is
 * isolated from retries; abandoned invocations cannot update the new scene.
 * Cancellation is observed at task boundaries, without timers or polling.
 */
export async function runStartupTasks(
    tasks: StartupTask[],
    onProgress: (completed: number, total: number) => void,
    isCurrent: () => boolean = () => true,
    finalize?: StartupTask,
): Promise<boolean> {
    const jobs = [...tasks];
    const total = jobs.length + (finalize ? 1 : 0);
    let completed = 0, failed = false, cancelled = false;
    const current = (): boolean => {
        if (failed || cancelled) return false;
        if (!isCurrent()) cancelled = true;
        return !cancelled;
    };
    if (!current()) return false;
    onProgress(0, total);

    const run = async (task: StartupTask): Promise<void> => {
        try {
            if (!current()) return;
            await task();
            if (current()) onProgress(++completed, total);
        } catch (error) {
            // Promise.all rejects immediately; other in-flight jobs remain
            // observed but cannot publish any later progress for this run.
            failed = true;
            throw error;
        }
    };
    await Promise.all(jobs.map(run));
    if (!current()) return false;
    if (finalize) await run(finalize);
    return current();
}
