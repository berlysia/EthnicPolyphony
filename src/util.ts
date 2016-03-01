export function countBreaks(str: string): number {
    let ret = 0;
    for (let i = 0, l = str.length; i < l; ++i) {
        if (str.charAt(i) === '\n') {
            ++ret;
        }
    }
    return ret;
}

function _cmp(a: any, b: any): boolean {
    return a < b;
}

export function lower_bound(x: any, xs: any[], cmp?: Function) {
    cmp = cmp || _cmp;
    let fst = 0;
    let lst = xs.length;
    let mid: number;
    while (lst - fst > 1) {
        mid = (fst + lst) / 2 | 0;
        if (cmp(xs[mid], x)) {
            fst = mid;
        } else {
            lst = mid;
        }
    }
    if (cmp(xs[fst], x)) return lst;
    else return fst;
}

export function upper_bound(x: any, xs: any[], cmp?: Function) {
    cmp = cmp || _cmp;
    let fst = 0;
    let lst = xs.length;
    let mid: number;
    while (lst - fst > 1) {
        mid = (fst + lst) / 2 | 0;
        if (!cmp(x, xs[mid])) {
            fst = mid;
        } else {
            lst = mid;
        }
    }
    if (!cmp(x, xs[fst])) return lst;
    else return fst;
}
