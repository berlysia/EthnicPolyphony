import _ActionCreator from '../Flux/ActionCreator';
import TwitterClient from '../TwitterClient';

export const keys = {
    // fetchUserTimeline: 'fetchUserTimeline',
    // fetchHomeTimeline: 'fetchHomeTimeline',
    // fetchListTimeline: 'fetchListTimeline',
    // fetchSearchTimeline: 'fetchSearchTimeline',
    // fetchSingleTweet: 'fetchSingleTweet',
    prepend: 'prepend',
    append: 'append',
    error: 'error',
};

// for user action
export default class ActionCreator extends _ActionCreator {
    connectUserStream(id: string, params: any) {
        TwitterClient.byID(id).userStream((tweet: any) => {
            this.dispatcher.dispatch({
                type: keys.prepend,
                value: [tweet],
            });
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


Object.defineProperty(ActionCreator.prototype, 'fetchUserTimeline', { enumerable: true });
Object.defineProperty(ActionCreator.prototype, 'fetchHomeTimeline', { enumerable: true });
Object.defineProperty(ActionCreator.prototype, 'fetchListTimeline', { enumerable: true });
Object.defineProperty(ActionCreator.prototype, 'fetchSearchTimeline', { enumerable: true });
Object.defineProperty(ActionCreator.prototype, 'fetchSingleTweet', { enumerable: true });
Object.defineProperty(ActionCreator.prototype, 'connectUserStream', { enumerable: true });
