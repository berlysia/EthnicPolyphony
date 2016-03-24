import ReduceStore from '../../Flux/ReduceStore';
import {Action} from '../../Flux/Action';
import {
    Tweet,
    greaterByID,
    greaterEqualByID,
    equalByID,
    sortTweet,
    sliceWithMaxID,
    sliceWithMinID,
} from '../../Models/Tweet';
import {
    upper_bound,
    lower_bound,
    uniquify,
    findIndex,
} from '../../util';
import {keys} from '../ActionCreator';

const debug = require('debug')('ViewContext:Tweets');

export const TWEETS_SHOW_MAX = 50;
export const TWEETS_SHORTAGE_RATIO = 0.2;
export const EPS = 1e-3;
export function ignoreTweetsShortage(shortage: number) {
    return -EPS <= shortage && shortage <= TWEETS_SHOW_MAX * TWEETS_SHORTAGE_RATIO;
}

export default class Tweets extends ReduceStore {
    constructor() {
        super();
        this.state = [];
    }

    reduce(prevState: Tweet[], action: Action): Tweet[] {
        debug(`#reduce type: ${action.type}`);

        switch (action.type) {
            case keys.prependSingle: {
                // {prev,next}State is decreasing in the meaning of id.
                // 1. calc the position which given tweet goes to.
                // 2. if there is the tweet has same id of given one, returns prevState
                // 3. insert given tweet and returns nextState
                const nextState = [].concat(prevState);
                const tweet = action.value;
                tweet.deleted = false;
                let insertPos = prevState.findIndex(x => greaterEqualByID(tweet, x));
                if(insertPos === -1) {
                    if(prevState.length
                      && greaterByID(tweet, prevState[prevState.length - 1])) {
                        insertPos = prevState.length;
                    } else {
                        insertPos = 0;
                    }
                }
                if(prevState[insertPos].id_str === tweet.id_str) {
                    return prevState;
                }
                nextState.splice(insertPos, 0, tweet);
                return nextState;
            }

            case keys.prepend: {
                if(action.value.length === 0) return prevState;
                const received = action.value.map((x: Tweet) => (x.deleted = false, x));
                const nextState = [].concat(received).concat(prevState);
                return nextState.sort(sortTweet).reduce(uniquify(equalByID), []);
            }

            case keys.append: {
                if(action.value.length === 0) return prevState;
                const received = action.value.map((x: Tweet) => (x.deleted = false, x));
                const nextState = [].concat(prevState).concat(received);
                return nextState.sort(sortTweet).reduce(uniquify(equalByID), []);
            }

            case keys.destroyStatus: {
                const status_id: string = action.value.status_id;
                const target = findIndex({ id_str: status_id }, prevState, greaterByID);
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
