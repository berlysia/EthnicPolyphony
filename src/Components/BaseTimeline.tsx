import * as React from 'react';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import AppActionCreator from '../AppContext/ActionCreator';
import ActionCreator from '../ViewContext/ActionCreator';
import {default as BaseTimelineStoreGroup} from '../ViewContext/StoreGroups/BaseTimeline';

import Tweet from './TweetList/Tweet';
import TweetList from './TweetList';

import {decrementNumericString} from '../util';

const debug = require('remote').require('debug')('Components:BaseTimeline');

export interface Props<TimelineStoreGroup extends BaseTimelineStoreGroup> {
    source_id: string;
    store: TimelineStoreGroup;
    actions: ActionCreator;
    appActions: AppActionCreator;
    id: string;
    freeze?: boolean;
};

type States = {};

export default class BaseTimeline<T extends BaseTimelineStoreGroup> extends React.Component<Props<T>, States> {
    remover: Function;
    removerOnUnload: Function;

    bindedForceUpdate: Function = this.forceUpdate.bind(this);

    _listenChange() {
        this.remover = this.props.store.onChange(this.bindedForceUpdate);

        window.addEventListener('beforeunload', this.bindedUnlistenChange as any);
        this.removerOnUnload = window.removeEventListener.bind(window, 'beforeunload', this.bindedUnlistenChange);

        if (!this.props.store.getState().tweets[0]) {
            this._reload();
        }
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

    _reload() {
        const recent = this.props.store.getState().tweets[0];
        if (!recent) {
            this.props.appActions.fetchTweet({});
        } else {
            const since_id = recent.id_str;
            this.props.appActions.fetchTweet({ since_id });
        }
    }
    bindedReload = this._reload.bind(this);

    _reloadAppend() {
        const tweets = this.props.store.getState().tweets;
        if (!tweets[0]) {
            return this.props.appActions.fetchTweet({});
        }
        const length = Object.keys(tweets).length;
        const max_id = decrementNumericString(tweets[length - 1].id_str);

        this.props.appActions.fetchTweet({ max_id }, true);
    }
    bindedReloadAppend = this._reloadAppend.bind(this);

    shouldComponentUpdate(nextProps: Props<T>, nextState: States) {
        return this.props.store !== nextProps.store;
    }

    render() {
        debug('#render');
        if (this.remover) {
            this._unlistenChange();
            this._listenChange();
        }

        return (
            <section id={this.props.id}>
                <button onClick={this.bindedReload} >reload</button>
                <TweetList
                    source_id={this.props.source_id}
                    tweets={this.props.store.getState().tweets}
                    appActions={this.props.appActions}
                    />
                <button onClick={this.bindedReloadAppend} >reloadAppend</button>
            </section>
        );
    }
}
