import JSONLoader from './JSONLoader';
import * as Twitter from 'twitter';

const debug = require('debug')('TwitterClient');

const byScreenName = new Map<string, TwitterClient>();
const byID = new Map<string, TwitterClient>();
const IDSNmap = new Map<string, string>();

export function IDSNmap_get(key: string) {
    return IDSNmap.get(key);
}

enum METHOD {
    GET,
    POST
}

export interface TwitterParamsForFetch {
    max_id?: string;
    count?: number;
    include_rts?: boolean;
}

export const defaultFetchParams: TwitterParamsForFetch = {
    count: 50,
}


export default class TwitterClient {
    private client: Twitter.Twitter;
    account: any;
    connected: boolean;

    constructor(accountData: any, credentials: any) {
        this.account = accountData;
        this.client = new Twitter({
            consumer_key: credentials['consumerKey'],
            consumer_secret: credentials['consumerSecret'],
            access_token_key: accountData['accessToken'],
            access_token_secret: accountData['accessTokenSecret'],
        });

        this.connected = false;

        byScreenName.set(accountData['screenName'], this);
        byID.set(accountData['id'], this);
        IDSNmap.set(accountData['screenName'], accountData['id']);
        IDSNmap.set(accountData['id'], accountData['screenName']);
    }

    static byScreenName(screenName: string): TwitterClient {
        return byScreenName.get(screenName);
    }

    static byID(id: string): TwitterClient {
        return byID.get(id);
    }

    private baseFunc(params: any, method: METHOD, target: string) {
        debug(`#baseFunc target:${target} params:${JSON.stringify(params)}`);
        const func = (method === METHOD.GET ? this.client.get : this.client.post);
        return new Promise((resolve, reject) => {
            func.call(this.client, target, params, (err: Error, data: any, res: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    userTimeline(screen_name: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ screen_name }, defaultFetchParams, params || {}), METHOD.GET, 'statuses/user_timeline');
    }

    userTimelineByID(user_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ user_id }, defaultFetchParams, params || {}), METHOD.GET, 'statuses/user_timeline');
    }

    homeTimeline(params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, defaultFetchParams, params || {}), METHOD.GET, 'statuses/home_timeline');
    }

    updateStatus(status: string, in_reply_to_status_id: string, params?: TwitterParamsForFetch) {
        if (status === '') return;
        return this.baseFunc(Object.assign({
            status,
            in_reply_to_status_id_str: in_reply_to_status_id
        }, defaultFetchParams, params || {}), METHOD.POST, 'statuses/update');
    }

    destroyStatus(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, defaultFetchParams, params || {}), METHOD.POST, `statuses/destroy/${status_id}`);
    }

    retweet(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, defaultFetchParams, params || {}), METHOD.POST, `statuses/retweet/${status_id}`);
    }

    unretweet(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, defaultFetchParams, params || {}), METHOD.POST, `statuses/unretweet/${status_id}`);
    }

    favorite(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ id: status_id }, defaultFetchParams, params || {}), METHOD.POST, 'favorites/create');
    }

    unfavorite(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ id: status_id }, defaultFetchParams, params || {}), METHOD.POST, 'favorites/destroy');
    }

    listsList(params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, params || {}), METHOD.GET, 'lists/list');
    }

    listsStatuses(list_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ list_id }, defaultFetchParams, params || {}), METHOD.GET, 'lists/statuses');
    }

    searchTweets(q: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ q }, defaultFetchParams, params || {}), METHOD.GET, 'search/tweets');
    }

    showUser(user_id: string) {
        return this.baseFunc({ user_id, include_entities: true }, METHOD.GET, 'users/show');
    }

    userStream(callback: Function, params?: TwitterParamsForFetch) {
        if (this.connected) return;
        this.client.stream('user', params || {}, stream => {
            this.connected = true;
            debug(`#userStream: id ${this.account.screenName} :stream created`);

            stream.on('data', (data: any) => {
                debug(`#userStream: id ${this.account.screenName} :stream emit "data"`);
                if (data['text']) {
                    callback(data);
                }
            });

            stream.on('error', (err: Error) => {
                debug(`#userStream: id ${this.account.screenName} :stream emit "error"`);
                console.error('stream error', err);
            });

            stream.on('end', () => {
                this.connected = false;
                debug(`#userStream: id ${this.account.screenName} :stream emit "end"`);
            });

            stream.on('close', () => {
                this.connected = false;
                debug(`#userStream: id ${this.account.screenName} :stream emit "close"`);
            });
        });
    }
}
