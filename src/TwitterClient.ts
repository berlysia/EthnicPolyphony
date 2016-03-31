import JSONLoader from './JSONLoader';
import TweetStorage from './TweetStorage';
import {Tweet} from './Models/Tweet';
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

export interface StreamCallbacks {
    tweet?: Function;
    delete?: Function;
    limit?: Function;
}

export const defaultFetchParams: TwitterParamsForFetch = {
    count: 200,
}


export default class TwitterClient {
    private client: Twitter.Twitter;
    private storage: TweetStorage;
    account: any;
    userStreamConnected: boolean;
    purgeUserStream = () => { };

    constructor(accountData: any, credentials: any) {
        this.account = accountData;
        this.client = new Twitter({
            consumer_key: credentials['consumerKey'],
            consumer_secret: credentials['consumerSecret'],
            access_token_key: accountData['accessToken'],
            access_token_secret: accountData['accessTokenSecret'],
        });

        this.userStreamConnected = false;

        byScreenName.set(accountData['screenName'], this);
        byID.set(accountData['id'], this);
        IDSNmap.set(accountData['screenName'], accountData['id']);
        IDSNmap.set(accountData['id'], accountData['screenName']);
        
        this.storage = new TweetStorage(accountData['id']);
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
    
    private _tweetsToStorage(tweets: Tweet[]): Tweet[] {
      tweets.forEach((tw: Tweet)=>{
        tw.deleted = false; // mutate tweet object
        this.storage.set(tw.id_str, tw);
      });
      return tweets;
    }
    private tweetsToStorage = this._tweetsToStorage.bind(this);
    
    private _tweetToStorage(tweet: Tweet): Tweet {
      tweet.deleted = false; // mutate tweet object
      this.storage.set(tweet.id_str, tweet);
      return tweet;
    }
    private tweetToStorage = this._tweetToStorage.bind(this);
    
    userTimeline(screen_name: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ screen_name }, defaultFetchParams, params || {}), METHOD.GET, 'statuses/user_timeline')
            .then(this.tweetsToStorage);
    }

    userTimelineByID(user_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ user_id }, defaultFetchParams, params || {}), METHOD.GET, 'statuses/user_timeline')
            .then(this.tweetsToStorage);
    }

    homeTimeline(params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, defaultFetchParams, params || {}), METHOD.GET, 'statuses/home_timeline')
            .then(this.tweetsToStorage);
    }

    mentionsTimeline(params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, defaultFetchParams, params || {}), METHOD.GET, 'statuses/mentions_timeline')
            .then(this.tweetsToStorage);
    }

    updateStatus(status: string, in_reply_to_status_id: string, params?: TwitterParamsForFetch) {
        if (status === '') return;
        return this.baseFunc(Object.assign({
            status,
            in_reply_to_status_id_str: in_reply_to_status_id
        }, params || {}), METHOD.POST, 'statuses/update');
    }

    destroyStatus(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, params || {}), METHOD.POST, `statuses/destroy/${status_id}`);
    }

    retweet(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, params || {}), METHOD.POST, `statuses/retweet/${status_id}`);
    }

    unretweet(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, params || {}), METHOD.POST, `statuses/unretweet/${status_id}`);
    }

    favorite(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ id: status_id }, params || {}), METHOD.POST, 'favorites/create');
    }

    unfavorite(status_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ id: status_id }, params || {}), METHOD.POST, 'favorites/destroy');
    }

    listsList(params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({}, params || {}), METHOD.GET, 'lists/list');
    }

    listsStatuses(list_id: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ list_id }, defaultFetchParams, params || {}), METHOD.GET, 'lists/statuses')
            .then(this.tweetsToStorage);
    }

    searchTweets(q: string, params?: TwitterParamsForFetch) {
        return this.baseFunc(Object.assign({ q }, defaultFetchParams, params || {}), METHOD.GET, 'search/tweets');
    }

    showUser(user_id: string) {
        return this.baseFunc({ user_id, include_entities: true }, METHOD.GET, 'users/show');
    }

    userStream(callbacks: StreamCallbacks, params?: TwitterParamsForFetch) {
        if (this.userStreamConnected) return;
        this.client.stream('user', params || {}, stream => {
            this.userStreamConnected = true;
            debug(`#userStream: id ${this.account.screenName} :stream created`);

            const tweetCallback = callbacks.tweet || (() => { });
            const deleteCallback = callbacks['delete'] || (() => { });
            const limitCallback = callbacks.limit || (() => { });

            stream.on('data', (data: any) => {
                debug(`#userStream: id ${this.account.screenName} :stream emit "data"`);
                if (data['text']) {
                    this.tweetToStorage(data);
                    tweetCallback(data);
                } else if (data['delete']) {
                    this.storage.delete(data['delete']['status']['id_str'] as string);
                    deleteCallback(data['delete']);
                } else if (data['limit']) {
                    limitCallback(data['limit']);
                } else if (data['disconnect']) {
                    this.userStreamConnected = false;
                    debug(`#userStream: id ${this.account.screenName} disconnected with code: ${data.disconnect.code}`);
                }
            });

            stream.on('error', (err: Error) => {
                debug(`#userStream: id ${this.account.screenName} :stream emit "error"`);
                console.error('stream error', err);
            });

            stream.on('end', () => {
                this.userStreamConnected = false;
                debug(`#userStream: id ${this.account.screenName} :stream emit "end"`);
            });

            stream.on('close', () => {
                this.userStreamConnected = false;
                debug(`#userStream: id ${this.account.screenName} :stream emit "close"`);
            });

            this.purgeUserStream = () => {
                debug(`#purgeUserStream`);
                this.userStreamConnected = false;
                stream.destroy();
                stream.removeAllListeners();
            };
        });
    }
}
