import ReduceStore from '../Flux/ReduceStore';
import {Action} from '../Flux/Action';
import {Tweet} from '../Models/Tweet';

export default class Tweets extends ReduceStore {
    constructor() {
        super();
        this.state = [];
    }

    reduce(prevState: Tweet[], action: Action): Tweet[] {
        switch (action.type) {
            case 'prepend': {
                return [].concat(action.value).concat(prevState);
            }

            case 'append': {
                return [].concat(prevState).concat(action.value);
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
