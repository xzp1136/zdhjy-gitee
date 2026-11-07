export type ClipName = 'StartIconAni' | 'boxAni';
type Polynomial = [number, number, number, number];
type Key = { time: number; channels: Partial<Record<number, Polynomial>> };

// Exact streamed-curve coefficients from docs/reference/ui-animation-keyframes.json.
// Times use the original clip frame fractions, avoiding rounded six-digit time drift.
const originalCurves: Record<ClipName, Key[]> = {
    StartIconAni: [
        {time: 0, channels: {0: [-34.560020446777344, 8.640005111694336, 0, 1], 1: [8.639991760253906, -2.1599979400634766, 0, 1]}},
        {time: 1 / 6, channels: {0: [16.640012741088867, -6.240004062652588, 0, 1.0800000429153442], 1: [-15.360006332397461, 5.7600016593933105, 0, 0.9800000190734863]}},
        {time: 5 / 12, channels: {0: [-12.7999906539917, 4.799997329711914, 0, 0.949999988079071], 1: [12.79999828338623, -4.800000190734863, 0, 1.100000023841858]}},
        {time: 2 / 3, channels: {0: [30.2399959564209, -7.559996604919434, 0, 1.0499999523162842], 1: [-17.279996871948242, 4.319998264312744, 0, 1]}},
        {time: 5 / 6, channels: {0: [-8.63999080657959, 2.1599977016448975, 0, 0.9800000190734863], 1: [17.27998161315918, -4.319995403289795, 0, 1.0399999618530273]}},
        {time: 1, channels: {0: [0, 0, 0, 1], 1: [0, 0, 0, 1]}},
    ],
    boxAni: [
        {time: 0, channels: {2: [-2069.280029296875, 517.3200073242188, 0, 0]}},
        {time: 1 / 6, channels: {2: [1065.9598388671875, -350.0999755859375, 0, 4.789999961853027]}},
        {time: 1 / 3, channels: {2: [940.6802368164062, -151.5600128173828, -27.8700008392334, 0]}},
        {time: 1 / 2, channels: {2: [-1943.9996337890625, 485.99993896484375, 0, -4.5]}},
        {time: 2 / 3, channels: {2: [0, 0, 0, 0]}},
    ],
};

export function sampleOriginalMotion(name: ClipName, time: number, channel: number): number {
    const keys = originalCurves[name];
    time = Math.max(0, Math.min(keys[keys.length - 1].time, time));
    let key = keys[0];
    for (let i = 1; i < keys.length && keys[i].time <= time; i++) key = keys[i];
    const coefficients = key.channels[channel];
    if (!coefficients) return name === 'StartIconAni' ? 1 : 0;
    const [a, b, c, d] = coefficients, dt = time - key.time;
    return ((a * dt + b) * dt + c) * dt + d;
}
