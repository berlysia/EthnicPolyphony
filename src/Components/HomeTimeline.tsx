import * as React from 'react';
import {default as HomeTimelineStoreGroup} from '../ViewContext/HomeTimeline';
import TweetList from './TweetList';
import BaseTimeline from './BaseTimeline';

const debug = require('remote').require('debug')('Components:HomeTimeline');

export default class HomeTimeline extends BaseTimeline<HomeTimelineStoreGroup> {

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

    render() {
        debug('HomeTimeline#render');
        if (this.remover) {
            this._unlistenChange();
            this._listenChange();
        }

        return (
            <section id={this.props.id}>
                <button onClick={this.bindedConnect} >connect</button>
                <button onClick={this.bindedReload} >reload</button>
                <TweetList tweets={this.props.store.getState().tweets} />
                <button onClick={this.bindedReloadAppend} >reloadAppend</button>
            </section>
        );
    }
}
