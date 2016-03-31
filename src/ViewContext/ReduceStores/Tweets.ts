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

    reduce(prevState: string[], action: Action): string[] {
        debug(`#reduce type: ${action.type}`);

        switch (action.type) {
            case keys.prependSingle: {
                // {prev,next}State is decreasing in the meaning of id.
                // 1. calc the position which given tweet goes to.
                // 2. if there is the tweet has same id of given one, returns prevState
                // 3. insert given tweet and returns nextState
                const nextState = [].concat(prevState);
                const tweet = action.value.id_str;
                let insertPos = prevState.findIndex(x => greaterEqualByID(tweet, x));
                if(insertPos === -1) {
                    if(prevState.length
                      && greaterByID(tweet, prevState[prevState.length - 1])) {
                        insertPos = prevState.length;
                    } else {
                        insertPos = 0;
                    }
                }
                if(prevState[insertPos] === tweet) {
                    return prevState;
                }
                nextState.splice(insertPos, 0, tweet);
                return nextState;
            }

            case keys.prepend: {
                if(action.value.length === 0) return prevState;
                const received = action.value.map((tw: Tweet) => tw.id_str);
                const nextState = [].concat(received).concat(prevState);
                return nextState.sort(sortTweet).reduce(uniquify(), []);
            }

            case keys.append: {
                if(action.value.length === 0) return prevState;
                const received = action.value.map((tw: Tweet) => tw.id_str);
                const nextState = [].concat(prevState).concat(received);
                return nextState.sort(sortTweet).reduce(uniquify(), []);
            }

            case keys.destroyStatus: {
                const status_id: string = action.value.status_id;
                const target = findIndex(status_id, prevState, greaterByID);
                debug(`#reduce - destroyStatus, ${status_id} found in ${target}`);
                if (~target) {
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
}
