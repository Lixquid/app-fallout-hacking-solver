/** Returns the likeness of two strings, in number of characters that are the same in the same position. */
export function likeness(a: string, b: string): number {
    let result = 0;
    for (let i = 0; i < a.length && i < b.length; i++) {
        if (a[i] === b[i]) {
            result++;
        }
    }
    return result;
}
