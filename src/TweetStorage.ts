import {Tweet} from './Models/Tweet';
import {Result, Ok, Err, ResultBase} from 'option-t/src/Result';
const debug = require('debug')('TweetStorage');

export type ErrCode = number;
export const ErrCode = {
    NOTFETCHED: 0,
    NOTFOUND: 1,
    IRREGALSOURCE: 2,
    UNKNOWN: 99,
}
const ErrMessage: {
    [key: number]: string;
} = {
        [ErrCode.NOTFETCHED]: 'status is not fetched',
        [ErrCode.NOTFOUND]: 'status is not found',
        [ErrCode.IRREGALSOURCE]: 'source_id is irregal',
        [ErrCode.UNKNOWN]: 'unknown error',
    };
export interface TweetStorageErr {
    code: ErrCode;
    message: string;
}

function errByCode(code: ErrCode): TweetStorageErr {
    return {
        code,
        message: ErrMessage[code]
    };
}

export function getTweet(source_id: string, status_id: string): Result<Tweet, TweetStorageErr> {
    const storage = TweetStorage.byID(source_id);
    if (!storage) {
        return new Err<Tweet, TweetStorageErr>(errByCode(ErrCode.IRREGALSOURCE));
    }
    if (!storage.has(status_id)) {
        return new Err<Tweet, TweetStorageErr>(errByCode(ErrCode.NOTFETCHED));
    }
    
    const tweet = storage.get(status_id);
    if (tweet.created_at) {
        return new Ok<Tweet, TweetStorageErr>(tweet);
    }
    if (tweet.deleted) {
        return new Err<Tweet, TweetStorageErr>(errByCode(ErrCode.NOTFOUND));
    }
    return new Err<Tweet, TweetStorageErr>(errByCode(ErrCode.UNKNOWN));
}

export default class TweetStorage {
    static _account_map = new Map<string, TweetStorage>();
    private _map = new Map<string, Tweet>();
    private source_id: string;

    static byID(source_id: string) {
        return TweetStorage._account_map.get(source_id);
    }

    constructor(source_id: string) {
        this.source_id = source_id;
        TweetStorage._account_map.set(this.source_id, this);
    }

    has(status_id: string): boolean {
        return this._map.has(status_id);
    }

    get(status_id: string): Tweet {
        if (this._map.has(status_id)) {
            return this._map.get(status_id);
        } else {
            return null;
        }
    }

    set(status_id: string, tweet: Tweet): void {
        this._map.set(status_id, tweet);
    }

    delete(status_id: string): boolean {
        debug('#delete', status_id, this._map.has(status_id));
        if (this._map.has(status_id)) {
            const tw = this._map.get(status_id);
            tw.deleted = true;
            this._map.set(status_id, tw);
            return true;
        }
        return false;
    }
}
