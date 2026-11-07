export type StartupTask = () => Promise<unknown>;

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
