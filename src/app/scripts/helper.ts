/**
 * Generates a signed 16 bit number.
 */
export function randomID() {
    return crypto.getRandomValues(new Int16Array(1))[0];
}

/**
 * Groups an array of objects according to the given function.
 * @param array Array of objects.
 * @param func Key function.
 */
export function groupBy<T>(array: T[], func: (value: T) => string) {
    let obj: { [key: string]: T[] } = {};
    array.forEach((item) => {
        let key = func(item);
        if (!(key in obj)) {
            obj[key] = [];
        }
        obj[key].push(item);
    });
    return obj;
}

export function clamp(min: number, val: number, max: number) {
    return Math.min(Math.max(val, min), max);
}

export function round(n: number, nearest: number, method = Math.round) {
    return method.apply(null, [n / nearest]) * nearest;
}

export function roundDecimal(n: number, decimals: number = 1) {
    return Math.round(n * 10 * decimals) / (10 * decimals);
}

/**
 * Rounds according to weight plates.
 * @param n Weight.
 * @param method Rounding method.
 */
export function roundWeight(n: number, method = Math.round) {
    const intervals = [
        [1, 10],
        [2, 40],
        [2.5, 200],
        [10, 250],
    ];
    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        if (n < interval[1]) {
            return round(n, interval[0], method);
        }
    }
    return method.apply(null, [n]);
}

export function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t;
}

/**
 * Maps a value from one range to another.
 * @param x Value.
 * @param in_min Current range minimum value.
 * @param in_max Current range maximum value.
 * @param out_min New range minimum value.
 * @param out_max New range maximum value.
 */
export function map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

/**
 * Returns a bit representation of a day date. Size is unbounded but for the near future this is 14
 * bits.
 * @param input Input for Date function.
 */
export function compressDate(input: string | number | Date) {
    let date = new Date(input);
    return ((date.getFullYear() - 2000) << 9) | (date.getMonth() << 5) | date.getDate();
}

/**
 * Returns the Date representation of a previously compressed date.
 * @param date Day date bit representation.
 */
export function decompressDate(date: number) {
    let day = date & 0b11111;
    let month = (date >> 5) & 0b1111;
    let year = (date >> 9) + 2000;
    return new Date(year, month, day);
}

/**
 * Returns the YYYY-MM-DD date representation.
 * @param input Input for Date function.
 */
export function dateString(input: string | number | Date) {
    let date = new Date(input);
    let year = date.getFullYear();
    let month = `0${date.getMonth() + 1}`.slice(-2);
    let day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
}
