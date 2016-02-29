export function countBreaks(str: string): number {
    let ret = 0;
    for (let i = 0, l = str.length; i < l; ++i) {
        if (str.charAt(i) === '\n') {
            ++ret;
        }
    }
    return ret;
}
