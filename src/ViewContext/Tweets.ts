import ReduceStore from '../Flux/ReduceStore';
import {Action} from '../Flux/Action';
import {Tweet, greaterByID} from '../Models/Tweet';
import {upper_bound, lower_bound} from '../util';

function sortTweet(curr: Tweet, next: Tweet) {
    if (curr.id_str < next.id_str) {
        return 1;
    } else if (curr.id_str > next.id_str) {
        return -1
    } else {
        return 0;
    }
}

function calcPosition(tw: Tweet, tweets: Tweet[]): number {
    // tweets should be sorted.
    const ub = upper_bound(tw, tweets, greaterByID);
    const lb = lower_bound(tw, tweets, greaterByID);
    return (ub === lb) ? lb : -1;
}

export const TWEETS_SHOW_MAX = 200;
export const TWEETS_CACHE_MAX = 200;

export default class Tweets extends ReduceStore {
    constructor() {
        super();
        this.state = [];
    }

    reduce(prevState: Tweet[], action: Action): Tweet[] {
        switch (action.type) {
            case 'prependSingle': {
                const nextState = [].concat(prevState);
                nextState.splice(calcPosition(action.value, nextState), 0, action.value);
                if (nextState.length >= TWEETS_CACHE_MAX) {
                    nextState.splice(TWEETS_CACHE_MAX);
                }
                return nextState;
            }

            case 'prepend': {
                const nextState = [].concat(action.value).concat(prevState);
                if (nextState.length >= TWEETS_CACHE_MAX) {
                    nextState.splice(TWEETS_CACHE_MAX);
                }
                return nextState.sort(sortTweet);
            }

            case 'append': {
                const nextState = [].concat(prevState).concat(action.value);
                if (nextState.length >= TWEETS_CACHE_MAX) {
                    nextState.splice(TWEETS_CACHE_MAX);
                }
                return nextState.sort(sortTweet);
            }

            default: {
                return prevState;
            }
        }
    }

    changed(prevState: Tweet[], nextState: Tweet[]) {
        return !(
            prevState.length === nextState.length
            && prevState.length > 0
            && prevState[0] === nextState[0]
        );
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
