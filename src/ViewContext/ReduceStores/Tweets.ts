import ReduceStore from '../../Flux/ReduceStore';
import {Action} from '../../Flux/Action';
import {
    Tweet,
    greaterByID,
    equalByID,
    sortTweet,
} from '../../Models/Tweet';
import {
    upper_bound,
    lower_bound,
    uniquify,
} from '../../util';
import {keys} from '../ActionCreator';

const debug = require('debug')('ViewContext:Tweets');

export const TWEETS_SHOW_MAX = 50;
// export const TWEETS_CACHE_MAX = 200;

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
                const tweet = action.value;
                tweet.deleted = false;
                nextState.splice(nextState.findIndex(x => greaterByID(tweet, x)), 0, tweet);
                return nextState;
            }

            case keys.prepend: {
                const received = action.value.map((x: Tweet) => (x.deleted = false, x));
                const nextState = [].concat(received).concat(prevState);
                return nextState.sort(sortTweet).reduce(uniquify(equalByID), []);
            }

            case keys.append: {
                const received = action.value.map((x: Tweet) => (x.deleted = false, x));
                const nextState = [].concat(prevState).concat(received);
                return nextState.sort(sortTweet).reduce(uniquify(equalByID), []);
            }

            case keys.destroyStatus: {
                const status_id: string = action.value.status_id;
                const target = prevState.findIndex(x => greaterByID({ id_str: status_id }, x));
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
