import _ActionCreator from '../Flux/ActionCreator';
import ActionEmitter from '../Flux/ActionEmitter';
import TwitterClient from '../TwitterClient';

const debug = require('debug')('ViewContext:ActionCreator');

export const keys = {
    // fetchUserTimeline: 'fetchUserTimeline',
    // fetchHomeTimeline: 'fetchHomeTimeline',
    // fetchListTimeline: 'fetchListTimeline',
    // fetchSearchTimeline: 'fetchSearchTimeline',
    // fetchSingleTweet: 'fetchSingleTweet',
    prepend: 'prepend',
    prependSingle: 'prependSingle',
    append: 'append',
    receiveProfile: 'receiveProfile',
    destroyStatus: 'destroyStatus',
    error: 'error',
};

export class StreamQueue {
    queue: any[];
    dispatcher: ActionEmitter;
    timer: NodeJS.Timer = null;

    constructor(dispatcher: ActionEmitter) {
        this.queue = [];
        this.dispatcher = dispatcher;
    }

    receiver(tweet: any) {
        this.queue.unshift(tweet);
        if (!this.timer) {
            this.timer = setTimeout(() => {
                this.timer = null;
                this.flush();
            }, 5 * 1000);
        }
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
    connectUserStream(id: string, params: any, forceReconnect?: boolean) {
        debug('#connectUserStream', id);
        // const queue = new StreamQueue(this.dispatcher);
        const client = TwitterClient.byID(id);
        if (forceReconnect) {
            debug('#connectUserStream: force reconnect');
            client.purgeUserStream();
        }
        client.userStream({
            tweet: (tw: any) => {
                // queue.receiver(tw);
                this.dispatcher.dispatch({
                    type: keys.prependSingle,
                    value: tw,
                });
            },
            delete: (data: any) => {
                this.dispatcher.dispatch({
                    type: keys.destroyStatus,
                    value: {
                        status_id: data.status.id_str
                    }
                })
            }
        });
    }

    fetchUserProfile(id: string, user_id: string) {
        debug('#fetchUserProfile', id, user_id);
        TwitterClient.byID(id).showUser(user_id)
            .then(profile => {
                this.dispatcher.dispatch({
                    type: keys.receiveProfile,
                    value: profile,
                });
            });
    }

    fetchUserTimeline(id: string, screen_name: string, params: any, append?: boolean) {
        debug('#fetchUserTimeline', id, screen_name);
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
        debug('#fetchUserTimelineByID', id, user_id);
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
        debug('#fetchHomeTimeline', id);
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

    fetchMentionsTimeline(id: string, params: any, append?: boolean) {
        debug('#fetchMentionsTimeline', id);
        TwitterClient.byID(id).mentionsTimeline(params)
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
        debug('#fetchListTimeline', id, list_id);
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
        debug('#fetchSearchTimeline', id, q);
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

    destroyStatus(status_id: string) {
        this.dispatcher.dispatch({
            type: keys.destroyStatus,
            value: {
                status_id,
            },
        })
    }
}
