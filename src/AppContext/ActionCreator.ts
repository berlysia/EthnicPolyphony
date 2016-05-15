import _ActionCreator from '../Flux/ActionCreator';
import TwitterClient from '../TwitterClient';
import * as Authentication from '../Authentication';
import JSONLoader from '../JSONLoader';
import {view_storage} from '../Constants';
import {Users} from '../Models/Tweet';

export const ViewType = {
    HomeTimeline: 'HomeTimeline',
    UserTimeline: 'UserTimeline',
    SingleTweet: 'SingleTweet',
    ListTimeline: 'ListTimeline',
    SearchTimeline: 'SearchTimeline',
    UserProfile: 'UserProfile',
    MentionsTimeline: 'MentionsTimeline',
};

export const keys = {
    selectTab: 'selectTab',
    createTab: 'createTab',
    deleteTab: 'deleteTab',
    saveTabs: 'saveTabs',
    popStack: 'popStack',
    pushStack: 'pushStack',
    fetchTweet: 'fetchTweet',
    fetchProfile: 'fetchProfile',
    updateStatus: 'updateStatus',
    replyToStatus: 'replyToStatus',
    destroyStatus: 'destroyStatus',
    retweet: 'retweet',
    unretweet: 'unretweet',
    favorite: 'favorite',
    unfavorite: 'unfavorite',
    focusEditor: 'focusEditor',
};

export interface ViewOption {
    type: string;
    source_id: string;
    target_id?: string;
    query?: string;
    user?: Users;
    max_status_id?: string;
    min_status_id?: string;
}

export function equalsViewOption(a: ViewOption, b: ViewOption) {
    if (a == null || b == null) return false;
    return a.type === b.type
        && a.source_id === b.source_id
        && a.target_id === b.target_id;
}

export function generateKey(o: ViewOption): string {
    return Object.keys(o).sort()
        .filter(key => !key.endsWith('_status_id'))
        .reduce((r, x) => (r + `${x}:${(o as any)[x]}:`), ':');
}

// for user action
export default class ActionCreator extends _ActionCreator {
    initialize() {
        return JSONLoader.read(view_storage)
            .catch(() => Promise.resolve({}))
            .then(data => {
                const tabs = data.tabs;
                if (tabs && tabs.length && tabs.length !== 0) {
                    return tabs;
                } else {
                    return Authentication.getAccounts()
                        .then(accounts => {
                            return accounts.map(account => [
                                {
                                    type: ViewType.HomeTimeline,
                                    source_id: account.id,
                                }, {
                                    type: ViewType.MentionsTimeline,
                                    source_id: account.id,
                                }, {
                                    type: ViewType.UserTimeline,
                                    source_id: account.id,
                                    target_id: account.id,
                                }, {
                                    type: ViewType.UserProfile,
                                    source_id: account.id,
                                    target_id: account.id,
                                }
                            ])
                                .reduce((r, c) => r.concat(c), []); // flatten
                        });
                }
            })
            .then(tabs => {
                tabs.map(this.createTab.bind(this));
                this.selectTab(tabs[0]);
            });
    }

    selectTab(option: ViewOption) {
        this.dispatcher.dispatch({
            type: keys.selectTab,
            value: {
                option
            }
        })
    }

    createTab(option: ViewOption) {
        this.dispatcher.dispatch({
            type: keys.createTab,
            value: {
                option
            }
        });
        this.saveTabs();
    }

    deleteTab(option: ViewOption) {
        this.dispatcher.dispatch({
            type: keys.deleteTab,
            value: {
                option
            }
        });
        this.saveTabs();
    }

    saveTabs() {
        this.dispatcher.dispatch({
            type: keys.saveTabs,
            value: null
        })
    }

    popStack() {
        this.dispatcher.dispatch({
            type: keys.popStack,
            value: {}
        })
    }

    pushStack(option: ViewOption) {
        this.dispatcher.dispatch({
            type: keys.pushStack,
            value: {
                option
            }
        });
    }

    fetchTweet(params: any, append?: boolean) {
        this.dispatcher.dispatch({
            type: keys.fetchTweet,
            value: {
                append,
                params,
            },
        });
    }

    fetchProfile(source_id: string, target_id: string) {
        this.dispatcher.dispatch({
            type: keys.fetchProfile,
            value: {
                source_id,
                target_id,
            }
        });
    }

    updateStatus(id: string, status: string, inReplyTo?: string) {
        return TwitterClient.byID(id).updateStatus(status, inReplyTo);
    }

    replyToStatus(status_id: string, screen_name: string) {
        this.focusEditor();
        this.dispatcher.dispatch({
            type: keys.replyToStatus,
            value: {
                status_id,
                screen_name,
            },
        });
    }

    destroyStatus(id: string, target_id: string) {
        return TwitterClient.byID(id).destroyStatus(target_id)
            .then(() => {
                this.dispatcher.dispatch({
                    type: keys.destroyStatus,
                    value: {
                        status_id: target_id,
                    }
                })
            });
    }

    retweet(id: string, target_id: string) {
        return TwitterClient.byID(id).retweet(target_id);
    }

    unretweet(id: string, target_id: string) {
        return TwitterClient.byID(id).unretweet(target_id);
    }

    favorite(id: string, target_id: string) {
        return TwitterClient.byID(id).favorite(target_id);
    }

    unfavorite(id: string, target_id: string) {
        return TwitterClient.byID(id).unfavorite(target_id);
    }

    addAccount() {
        Authentication.authenticate()
            .then((data: any) => {
                Authentication.addAccount(data)
                    .then(() => this.createTab({
                        type: ViewType.HomeTimeline,
                        source_id: <string>data.id,
                    }));
            })
    }

    focusEditor() {
        this.dispatcher.dispatch({
            type: keys.focusEditor,
            value: null,
        })
    }
}
