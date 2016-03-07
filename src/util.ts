import * as crypto from 'crypto';
const moment = require('moment');

type SizeStr = '_normal' | '_bigger' | '_mini' | '';

export function getProfileImage(url: string, sizeStr?: SizeStr) {
    if (sizeStr == null) return url;
    return url.replace('_normal', sizeStr);
}

export function decrementNumericString(num: string): string {
    const target = Number(num[num.length - 1]);
    if (target) {
        return num.substr(0, num.length - 1) + (target - 1).toString();
    }

    return decrementNumericString(num.substr(0, num.length - 1)) + '9';
}

export function formatDateString(datestr: string): string {
    return moment(datestr, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('ddd MMM DD YYYY, HH:mm:ss');
}

export function calcmd5(str: string): string {
    const md5 = crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex');
}

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
