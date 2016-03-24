import * as React from 'react';
import {default as HomeTimelineStoreGroup} from '../ViewContext/StoreGroups/HomeTimeline';
import TweetList from './TweetList';
import BaseTimeline, {Props} from './BaseTimeline';
import Tweets, {TWEETS_SHOW_MAX} from '../ViewContext/ReduceStores/Tweets';
import {Tweet as TweetModel} from '../Models/Tweet';

const debug = require('remote').require('debug')('Components:HomeTimeline');

export default class HomeTimeline extends BaseTimeline<HomeTimelineStoreGroup> {

    _wrappedForceUpdate() {
        if (this.props.freeze && !(this.props.max_status_id || this.props.min_status_id)) return;
        this.forceUpdate();
    }
    bindedForceUpdate = this._wrappedForceUpdate.bind(this);

    componentDidUpdate() {
        this._connect(); // if dups, rejected by client
    }

    __connect(forceReconnect?: boolean) {
        this.props.actions.connectUserStream(this.props.source_id, {}, forceReconnect);
    }
    _connect = this.__connect.bind(this);
    _reconnect = this.__connect.bind(this, true);

    shouldComponentUpdate(nextProps: Props<HomeTimelineStoreGroup>, nextState: {tweets: TweetModel[]}) {
        return (!(this.props.max_status_id || this.props.min_status_id)
                && this.props.freeze && !nextProps.freeze)
            || super.shouldComponentUpdate(nextProps, nextState);
    }

    render() {
        debug('#render');
        
        const realtimeUpdate = !(this.props.max_status_id || this.props.min_status_id);
        const tweets = this.tweets();

        return (
            <section id={this.props.id}>
                {realtimeUpdate ? <button onClick={this._connect} >reconnect</button> : ''}
                {realtimeUpdate ? '' : <button onClick={this._newer} >newer tweets...</button>}
                <TweetList
                    source_id={this.props.source_id}
                    tweets={tweets}
                    appActions={this.props.appActions}
                    />
                {!realtimeUpdate && tweets.length < TWEETS_SHOW_MAX ? <button onClick={this._fetch} >fetch tweets...</button> : ''}
                <button onClick={this._older} >older tweets...</button>
            </section>
        );
    }
}
