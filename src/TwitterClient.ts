import TweetStorage from './TweetStorage';
import {Tweet} from './Models/Tweet';
import * as Twitter from 'twit';

import {EventEmitter} from 'events';

const debug = require('debug')('TwitterClient');

const byScreenName = new Map<string, TwitterClient>();
const byID = new Map<string, TwitterClient>();
const IDSNmap = new Map<string, string>();

export function IDSNmap_get(key: string) {
    return IDSNmap.get(key);
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
    private client: Twitter;
    private storage: TweetStorage;
    account: any;

    private _userStream: EventEmitter;
    private userStreamCallbacks: { [key: string]: Function };

    constructor(accountData: any, credentials: any) {
        this.account = accountData;
        this.client = new Twitter({
            consumer_key: credentials['consumerKey'],
            consumer_secret: credentials['consumerSecret'],
            access_token: accountData['accessToken'],
            access_token_secret: accountData['accessTokenSecret'],
        });

        byScreenName.set(accountData['screenName'], this);
        byID.set(accountData['id'], this);
        IDSNmap.set(accountData['screenName'], accountData['id']);
        IDSNmap.set(accountData['id'], accountData['screenName']);

        this.storage = new TweetStorage(accountData['id']);

        this.userStreamCallbacks = {
            tweet: () => { },
            delete: () => { },
        };
    }

    static byScreenName(screenName: string): TwitterClient {
        return byScreenName.get(screenName);
    }

    static byID(id: string): TwitterClient {
        return byID.get(id);
    }

    private get(path: string, params: any): Promise<any> {
        debug(`#get path:${path} params:${JSON.stringify(params)}`);
        return this.client.get(path, params).then(message => message.data);
    }

    private post(path: string, params: any): Promise<any> {
        debug(`#get path:${path} params:${JSON.stringify(params)}`);
        return this.client.post(path, params).then(message => message.data);
    }

    private _tweetsToStorage(tweets: Tweet[]): Tweet[] {
        tweets.forEach((tw: Tweet) => {
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
        return this.get('statuses/user_timeline', Object.assign({ screen_name }, defaultFetchParams, params || {}))
            .then(this.tweetsToStorage);
    }

    userTimelineByID(user_id: string, params?: TwitterParamsForFetch) {
        return this.get('statuses/user_timeline', Object.assign({ user_id }, defaultFetchParams, params || {}))
            .then(this.tweetsToStorage);
    }

    homeTimeline(params?: TwitterParamsForFetch) {
        return this.get('statuses/home_timeline', Object.assign({}, defaultFetchParams, params || {}))
            .then(this.tweetsToStorage);
    }

    mentionsTimeline(params?: TwitterParamsForFetch) {
        return this.get('statuses/mentions_timeline', Object.assign({}, defaultFetchParams, params || {}))
            .then(this.tweetsToStorage);
    }

    updateStatus(status: string, in_reply_to_status_id: string, params?: TwitterParamsForFetch) {
        if (status === '') return;
        return this.post('statuses/update', Object.assign({
            status,
            in_reply_to_status_id_str: in_reply_to_status_id
        }, params || {}));
    }

    destroyStatus(status_id: string, params?: TwitterParamsForFetch) {
        return this.post(`statuses/destroy/:id`, Object.assign({ id: status_id }, params || {}));
    }

    retweet(status_id: string, params?: TwitterParamsForFetch) {
        return this.post(`statuses/retweet/:id`, Object.assign({ id: status_id }, params || {}));
    }

    unretweet(status_id: string, params?: TwitterParamsForFetch) {
        return this.post(`statuses/unretweet/:id`, Object.assign({ id: status_id }, params || {}));
    }

    favorite(status_id: string, params?: TwitterParamsForFetch) {
        return this.post('favorites/create', Object.assign({ id: status_id }, params || {}));
    }

    unfavorite(status_id: string, params?: TwitterParamsForFetch) {
        return this.post('favorites/destroy', Object.assign({ id: status_id }, params || {}));
    }

    listsList(params?: TwitterParamsForFetch) {
        return this.get('lists/list', Object.assign({}, params || {}));
    }

    listsStatuses(list_id: string, params?: TwitterParamsForFetch) {
        return this.get('lists/statuses', Object.assign({ list_id }, defaultFetchParams, params || {}))
            .then(this.tweetsToStorage);
    }

    searchTweets(q: string, params?: TwitterParamsForFetch) {
        return this.get('search/tweets', Object.assign({ q }, defaultFetchParams, params || {}));
    }

    showUser(user_id: string) {
        return this.get('users/show', { user_id, include_entities: true });
    }

    showStatus(status_id: string) {
        return this.get(`statuses/show/:id`, { include_entities: true, id: status_id })
            .then(this.tweetToStorage);
    }

    userStream(callbacks?: StreamCallbacks, params?: TwitterParamsForFetch) {
        this._userStream = this.client.stream('user', params || {});

        debug(`#userStream: id ${this.account.screenName}: stream created`);

        Object.assign(this.userStreamCallbacks, callbacks);

        this._userStream.on('tweet', (tweet: any) => {
            debug(`#userStream: id ${this.account.screenName}: emit "tweet"`);
            this.tweetToStorage(tweet);
            this.userStreamCallbacks['tweet'](tweet);
        });
        this._userStream.on('delete', (deleteMessage: any) => {
            debug(`#userStream: id ${this.account.screenName}: emit "delete"`);
            this.storage.delete(deleteMessage.delete.status.id_str as string);
            this.userStreamCallbacks['delete'](deleteMessage.delete);
        });
        this._userStream.on('limit', (limitMessage: any) => {
            debug(`#userStream: id ${this.account.screenName}: emit "limit"`);
            // this.storage.delete(limitMessage.status.id_str as string);
        });
        this._userStream.on('disconnect', (disconnectMessage: any) => {
            debug(`#userStream: id ${this.account.screenName}: emit "disconnect". message: ${JSON.stringify(disconnectMessage)}`);
        });

        this._userStream.on('error', (err: Error) => {
            debug(`#userStream: id ${this.account.screenName}: emit "error"`);
            console.error('stream error', err);
        });

        this._userStream.on('end', () => {
            debug(`#userStream: id ${this.account.screenName}: emit "end"`);
        });
    }
}
