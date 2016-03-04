import * as React from 'react';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import AppActionCreator from '../AppContext/ActionCreator';
import ActionCreator from '../ViewContext/ActionCreator';
import {default as HomeTimelineStoreGroup} from '../ViewContext/HomeTimeline';

import Tweet from './TweetList/Tweet';
import TweetList from './TweetList';
import {TWEETS_SHOW_MAX} from '../ViewContext/Tweets';

const debug = require('remote').require('debug')('Components:HomeTimeline');

interface Props {
    source_id: string;
    store: HomeTimelineStoreGroup;
    actions: ActionCreator;
    appActions: AppActionCreator;
    id: string;
    freeze: boolean;
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

    _wrappedForceUpdate() {
        if (this.props.freeze) return;
        this.forceUpdate();
    }
    bindedForceUpdate: Function = this._wrappedForceUpdate.bind(this);

    _listenChange() {
        this.remover = this.props.store.onChange(this.bindedForceUpdate);

        window.addEventListener('beforeunload', this.bindedUnlistenChange as any);
        this.removerOnUnload = window.removeEventListener.bind(window, 'beforeunload', this.bindedUnlistenChange);

        if (!this.props.store.getState().tweets[0]) {
            this._reload();
        }
        this._connect(); // if dups, rejected by client
    }

    _unlistenChange() {
        this.remover();
        this.removerOnUnload();
    }
    bindedUnlistenChange: Function = this._unlistenChange.bind(this);

    componentDidMount() {
        this._listenChange();
    }

    componentWillUnmount() {
        this._unlistenChange();
    }

    _connect() {
        this.props.actions.connectUserStream(this.props.source_id, {});
    }
    bindedConnect: Function = this._connect.bind(this);

    _reload() {
        const recent = this.props.store.getState().tweets[0];
        if (!recent) {
            this.props.appActions.fetchTweet({});
        } else {
            const since_id = recent.id_str;
            this.props.appActions.fetchTweet({ since_id });
        }
    }
    bindedReload: Function = this._reload.bind(this);

    _reloadAppend() {
        const tweets = this.props.store.getState().tweets;
        if (!tweets[0]) {
            return this.props.appActions.fetchTweet({});
        }
        const length = Object.keys(tweets).length;
        const max_id = decrementNumericString(tweets[length - 1].id_str);

        this.props.appActions.fetchTweet({ max_id }, true);
    }
    bindedReloadAppend: Function = this._reloadAppend.bind(this);

    shouldComponentUpdate(nextProps: Props, nextState: States) {
        return (this.props.freeze && !nextProps.freeze)
            || this.props.store !== nextProps.store;
    }

    render() {
        debug('HomeTimeline#render');
        if (this.remover) {
            this._unlistenChange();
            this._listenChange();
        }

        return (
            <section id={this.props.id}>
                <button onClick={this.bindedConnect as any} >connect</button>
                <button onClick={this.bindedReload as any} >reload</button>
                <TweetList tweets={this.props.store.getState().tweets} />
                <button onClick={this.bindedReloadAppend as any} >reloadAppend</button>
            </section>
        );
    }
}
