export function clamp(min: number, val: number, max: number) {
    return Math.min(Math.max(val, min), max);
}

export function round(n: number, nearest: number) {
    return Math.round(n / nearest) * nearest;
}

export function roundWeight(n: number) {
    const intervals = [
        [1, 10],
        [2, 40],
        [2.5, 200],
        [10, 250],
    ];
    for(let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        if (n < interval[1]) {
            return round(n, interval[0]);
        }
    }
    return Math.round(n);
}
