import * as React from 'react';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import AppActionCreator from '../AppContext/ActionCreator';
import ActionCreator from '../ViewContext/ActionCreator';
import {default as HomeTimelineStoreGroup} from '../ViewContext/HomeTimeline';

import Tweet from './Tweet';
import {TWEETS_SHOW_MAX} from '../ViewContext/Tweets';

interface Props {
    source_id: string;
    store: HomeTimelineStoreGroup;
    actions: ActionCreator;
    appActions: AppActionCreator;
};

type States = {};

function decrementNumericString(num: string): string {
    const target = Number(num[num.length - 1]);
    if (target) {
        return num.substr(0, num.length - 1) + (target - 1).toString();
    }

    return decrementNumericString(num.substr(0, num.length - 1)) + '9';
}

export default class HomeTimeline extends React.Component<Props, States> {
    remover: Function;
    removerOnUnload: Function;

    _listenChange() {
        this.remover = this.props.store.onChange(() => {
            this.forceUpdate();
        });

        const removerOnUnload = () => {
            this._unlistenChange();
        };
        window.addEventListener('beforeunload', removerOnUnload);
        this.removerOnUnload = window.removeEventListener.bind(window, 'beforeunload', removerOnUnload);

        if (!this.props.store.getState().tweets[0]) {
            this._reload();
        }
        this._connect(); // if dups, rejected by client
    }

    _unlistenChange() {
        this.remover();
        this.removerOnUnload();
    }

    componentDidMount() {
        this._listenChange();
    }
    componentWillUnmount() {
        this._unlistenChange();
    }

    _connect() {
        this.props.actions.connectUserStream(this.props.source_id, {});
    }

    _reload() {
        const recent = this.props.store.getState().tweets[0];
        if (!recent) {
            this.props.appActions.fetchTweet({});
        } else {
            const since_id = recent.id_str;
            this.props.appActions.fetchTweet({ since_id });
        }
    }

    _reloadAppend() {
        const tweets = this.props.store.getState().tweets;
        if (!tweets[0]) {
            return this.props.appActions.fetchTweet({});
        }
        const length = Object.keys(tweets).length;
        const max_id = decrementNumericString(tweets[length - 1].id_str);

        this.props.appActions.fetchTweet({ max_id }, true);
    }

    render() {
        if (this.remover) {
            this._unlistenChange();
            this._listenChange();
        }

        // console.log('HomeTimeline#render');
        const state = this.props.store.getState();
        const tweets: any[] = [];
        // console.log('tweets keys:', Object.keys(state.tweets));
        for (let i = 0, l = Math.min(Object.keys(state.tweets).length, TWEETS_SHOW_MAX); i < l; ++i) {
            tweets[i] = state.tweets[i];
        }
        return (
            <section>
                <button onClick={this._connect.bind(this) } >connect</button>
                <button onClick={this._reload.bind(this) } >reload</button>
                {tweets.map((tw: any) => React.createElement(Tweet, Object.assign({ key: tw.id_str }, tw))) }
                <button onClick={this._reloadAppend.bind(this) } >reloadAppend</button>
            </section>
        );
    }
}
