import _ActionCreator from '../Flux/ActionCreator';
import ActionEmitter from '../Flux/ActionEmitter';
import TwitterClient from '../TwitterClient';

export const keys = {
    // fetchUserTimeline: 'fetchUserTimeline',
    // fetchHomeTimeline: 'fetchHomeTimeline',
    // fetchListTimeline: 'fetchListTimeline',
    // fetchSearchTimeline: 'fetchSearchTimeline',
    // fetchSingleTweet: 'fetchSingleTweet',
    prepend: 'prepend',
    prependSingle: 'prependSingle',
    append: 'append',
    error: 'error',
};

export class StreamQueue {
    queue: any[];
    dispatcher: ActionEmitter;
    timer: NodeJS.Timer;

    constructor(dispatcher: ActionEmitter) {
        this.queue = [];
        this.dispatcher = dispatcher;
        this.timer = setInterval(() => this.flush(), 5 * 1000);
    }

    receiver(tweet: any) {
        this.queue.unshift(tweet);
    }

    flush() {
        if (this.queue.length === 0) return;
        this.dispatcher.dispatch({
            type: keys.prepend,
            value: this.queue.splice(0),
        });
    }
}

// for user action
export default class ActionCreator extends _ActionCreator {
    connectUserStream(id: string, params: any) {
        const queue = new StreamQueue(this.dispatcher);
        TwitterClient.byID(id).userStream((tw: any) => {
            queue.receiver(tw);
        });
    }

    fetchUserTimeline(id: string, screen_name: string, params: any, append?: boolean) {
        TwitterClient.byID(id).userTimeline(screen_name, params)
            .then(tweets => {
                this.dispatcher.dispatch({
                    type: append ? keys.append : keys.prepend,
                    value: tweets,
                });
            }, error => {
                this.dispatcher.dispatch({
                    type: keys.error,
                    value: error,
                })
            });
    }

    fetchUserTimelineByID(id: string, user_id: string, params: any, append?: boolean) {
        TwitterClient.byID(id).userTimelineByID(user_id, params)
            .then(tweets => {
                this.dispatcher.dispatch({
                    type: append ? keys.append : keys.prepend,
                    value: tweets,
                });
            }, error => {
                this.dispatcher.dispatch({
                    type: keys.error,
                    value: error,
                })
            });
    }

    fetchHomeTimeline(id: string, params: any, append?: boolean) {
        // console.log(`fetchHomeTimeline: id:${id}, params:${JSON.stringify(params)}, append: ${append}`)
        TwitterClient.byID(id).homeTimeline(params)
            .then(tweets => {
                this.dispatcher.dispatch({
                    type: append ? keys.append : keys.prepend,
                    value: tweets,
                });
            }, error => {
                console.error(error, error.stack);
                this.dispatcher.dispatch({
                    type: keys.error,
                    value: error,
                })
            });
    }

    fetchListTimeline(id: string, list_id: string, params: any, append?: boolean) {
        TwitterClient.byID(id).listsStatuses(list_id, params)
            .then(tweets => {
                this.dispatcher.dispatch({
                    type: append ? keys.append : keys.prepend,
                    value: tweets,
                });
            }, error => {
                this.dispatcher.dispatch({
                    type: keys.error,
                    value: error,
                })
            });
    }

    fetchSearchTimeline(id: string, q: string, params: any, append?: boolean) {
        TwitterClient.byID(id).searchTweets(q, params)
            .then(tweets => {
                this.dispatcher.dispatch({
                    type: append ? keys.append : keys.prepend,
                    value: tweets,
                });
            }, error => {
                this.dispatcher.dispatch({
                    type: keys.error,
                    value: error,
                })
            });
    }
}
