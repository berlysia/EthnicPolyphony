import _ActionCreator from '../Flux/ActionCreator';
import TwitterClient from '../TwitterClient';
import * as Authentication from '../Authentication';
import JSONLoader from '../JSONLoader';
import {view_storage} from '../Constants';
import {Users} from '../Models/Tweet';

export enum ViewType {
    HomeTimeline,
    UserTimeline,
    SingleTweet,
    ListTimeline,
    SearchTimeline,
    UserProfile,
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
};

export interface ViewOptionSeed {
    type: ViewType;
    source_id: string;
    target_id?: string;
    query?: string;
    user?: Users;
}

export interface ViewOption extends ViewOptionSeed {
    key: string;
}

export function generateKey(o: ViewOptionSeed): string {
    return `:VIEWKEY:${o.type}:${o.source_id}:${o.target_id || -1}:${o.query || ''}:`;
}

export function generateViewOption(key: string): ViewOption {
    const matched = key.match(/^:VIEWKEY:([\:]+):([\:]+):([\:]+):(.*):$/)
    const ret: ViewOption = {
        key,
        type: Number(matched[1]),
        source_id: matched[2]
    };
    if (matched[3] !== '-1') {
        ret.target_id = matched[3];
    }
    if (matched[4] && matched[4] !== '') {
        ret.query = matched[4];
    }
    return ret;
}

export function generateViewOptionFromSeed(option: ViewOptionSeed): ViewOption {
    return Object.assign(option, { key: generateKey(option) });
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

    selectTab(option: ViewOptionSeed): void;
    selectTab(option: ViewOption) {
        if (option.key == undefined) {
            option = generateViewOptionFromSeed(option);
        }
        this.dispatcher.dispatch({
            type: keys.selectTab,
            value: {
                option
            }
        })
    }

    createTab(option: ViewOptionSeed): void;
    createTab(option: ViewOption) {
        if (option.key == undefined) {
            option = generateViewOptionFromSeed(option);
        }
        this.dispatcher.dispatch({
            type: keys.createTab,
            value: {
                option
            }
        });
        this.saveTabs();
    }

    deleteTab(option: ViewOptionSeed): void;
    deleteTab(option: ViewOption) {
        if (option.key == undefined) {
            option = generateViewOptionFromSeed(option);
        }
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
            type: keys.pushStack,
            value: {}
        })
    }

    pushStack(option: ViewOptionSeed): void;
    pushStack(option: ViewOption) {
        if (option.key == undefined) {
            option = generateViewOptionFromSeed(option);
        }
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
}
