export interface RewardedVideoOptions {
    /** False is the current release mode: award directly without an ad SDK. */
    adsEnabled: boolean;
    /** Future host integration must return true only for a completed reward. */
    provider?: (placement: string) => Promise<boolean>;
}

/** Local reward delivery with the same completion boundary as a future video adapter. */
export class FlowerRewardedVideo {
    private readonly pending = new Set<string>();

    constructor(private readonly options: RewardedVideoOptions = {adsEnabled: false}) {}

    async claim(placement: string, grant: () => boolean | void | Promise<boolean | void>,
        isCurrent: () => boolean = () => true): Promise<boolean> {
        if (this.pending.has(placement) || !isCurrent()) return false;
        this.pending.add(placement);
        try {
            // Keep this boundary asynchronous even in direct mode, so repeated
            // taps in one event/frame cannot enter the same grant twice.
            const earned = this.options.adsEnabled
                ? await (this.options.provider?.(placement) ?? Promise.resolve(false))
                : await Promise.resolve(true);
            if (!earned || !isCurrent()) return false;
            return (await grant()) !== false;
        } finally {
            this.pending.delete(placement);
        }
    }
}

// Explicit product setting for this build. No wx/global SDK access occurs here.
export const rewardedVideo = new FlowerRewardedVideo({adsEnabled: false});
