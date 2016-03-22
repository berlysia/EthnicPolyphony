import ReduceStore from '../../Flux/ReduceStore';
import {Action} from '../../Flux/Action';
import {Tweet, greaterByID} from '../../Models/Tweet';
import {upper_bound, lower_bound} from '../../util';
import {keys} from '../ActionCreator';

const debug = require('debug')('ViewContext:Tweets');

function sortTweet(curr: Tweet, next: Tweet) {
    if (curr.id_str < next.id_str) {
        return 1;
    } else if (curr.id_str > next.id_str) {
        return -1
    } else {
        return 0;
    }
}

function uniquify(prev: Tweet[], curr: Tweet, idx: number) {
    if (idx === 0 || prev[prev.length - 1].id_str !== curr.id_str) {
        prev.push(curr);
    }

    return prev;
}

function calcPosition(tw: Tweet, tweets: Tweet[]): number {
    // tweets should be sorted.
    const ub = upper_bound(tw, tweets, greaterByID);
    const lb = lower_bound(tw, tweets, greaterByID);
    return (ub === lb) ? lb : -1;
}

function findIndex(id: string, tweets: Tweet[]): number {
    const ub = upper_bound({ id_str: id }, tweets, greaterByID);
    const lb = lower_bound({ id_str: id }, tweets, greaterByID);
    return (ub - lb === 1) ? lb : -1;
}

export const TWEETS_SHOW_MAX = 40;
export const TWEETS_CACHE_MAX = 200;

export default class Tweets extends ReduceStore {
    constructor() {
        super();
        this.state = [];
    }

    reduce(prevState: Tweet[], action: Action): Tweet[] {
        debug(`#reduce type: ${action.type}`);

        switch (action.type) {
            case keys.prependSingle: {
                const nextState = [].concat(prevState);
                action.value.deleted = false;
                nextState.splice(calcPosition(action.value, nextState), 0, action.value);
                if (nextState.length >= TWEETS_CACHE_MAX) {
                    nextState.splice(TWEETS_CACHE_MAX);
                }
                return nextState;
            }

            case keys.prepend: {
                const received = action.value.map((x: Tweet) => (x.deleted = false, x));
                const nextState = [].concat(received).concat(prevState);
                if (nextState.length >= TWEETS_CACHE_MAX) {
                    nextState.splice(TWEETS_CACHE_MAX);
                }
                return nextState.sort(sortTweet).reduce(uniquify, []);
            }

            case keys.append: {
                const received = action.value.map((x: Tweet) => (x.deleted = false, x));
                const nextState = [].concat(prevState).concat(received);
                if (nextState.length >= TWEETS_CACHE_MAX) {
                    nextState.splice(TWEETS_CACHE_MAX);
                }
                return nextState.sort(sortTweet).reduce(uniquify, []);
            }

            case keys.destroyStatus: {
                const status_id = action.value.status_id;
                const target = findIndex(status_id, prevState);
                if (~target) {
                    prevState[target].deleted = true;
                    const nextState = [].concat(prevState);
                    return nextState;
                }
                return prevState;
            }

            default: {
                return prevState;
            }
        }
    }

    changed(prevState: Tweet[], nextState: Tweet[]) {
        return prevState !== nextState;
        // return !(
        //     prevState.length === nextState.length
        //     && prevState.length > 0
        //     && prevState[0] === nextState[0]
        // );
    }

    getTweets(filter?: (item: Tweet, index?: number, tweets?: Tweet[]) => boolean): Tweet[] {
        if (filter) {
            return this.state.filter(filter);
        } else {
            return this.state;
        }
    }

    getTweet(filter: (item: Tweet, index?: number, tweets?: Tweet[]) => boolean): Tweet {
        return this.state.find(filter);
    }

    getTweetsByAccountID(accountID: string) {
        return this.getTweets((tweet: Tweet) => tweet.user.id_str === accountID);
    }

    getTweetsByScreenName(screenName: string) {
        return this.getTweets((tweet: Tweet) => tweet.user.screen_name === screenName);
    }

    getTweetByTweetID(tweetID: string) {
        return this.getTweet((tweet: Tweet) => tweet.id_str === tweetID);
    }


}
