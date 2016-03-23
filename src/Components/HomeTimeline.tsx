import * as React from 'react';
import {default as HomeTimelineStoreGroup} from '../ViewContext/StoreGroups/HomeTimeline';
import TweetList from './TweetList';
import BaseTimeline, {Props} from './BaseTimeline';
import {TWEETS_SHOW_MAX} from '../ViewContext/ReduceStores/Tweets';

const debug = require('remote').require('debug')('Components:HomeTimeline');

export default class HomeTimeline extends BaseTimeline<HomeTimelineStoreGroup> {

    _wrappedForceUpdate() {
        if (this.props.freeze) return;
        this.forceUpdate();
    }
    bindedForceUpdate = this._wrappedForceUpdate.bind(this);

    _listenChange() {
        this.remover = this.props.store.onChange(this.bindedForceUpdate);

        window.addEventListener('beforeunload', this.bindedUnlistenChange as any);
        this.removerOnUnload = window.removeEventListener.bind(window, 'beforeunload', this.bindedUnlistenChange);

        if (!this.props.store.getState().tweets[0]) {
            this._reload();
        }
        this._connect(); // if dups, rejected by client
    }

    _connect() {
        this.props.actions.connectUserStream(this.props.source_id, {});
    }
    bindedConnect = this._connect.bind(this);

    shouldComponentUpdate(nextProps: Props<HomeTimelineStoreGroup>, nextState: {}) {
        return (this.props.freeze && !nextProps.freeze)
            || this.props.store !== nextProps.store;
    }

    render() {
        debug('#render');
        if (this.remover) {
            this._unlistenChange();
            this._listenChange();
        }

        return (
            <section id={this.props.id}>
                <button onClick={this.bindedConnect} >connect</button>
                <button onClick={this.bindedReload} >reload</button>
                <TweetList
                    source_id={this.props.source_id}
                    tweets={this.props.store.getState().tweets.slice(0, TWEETS_SHOW_MAX) }
                    appActions={this.props.appActions}
                    />
                <button onClick={this.bindedReloadAppend} >reloadAppend</button>
            </section>
        );
    }
}
