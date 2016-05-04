import * as React from 'react';
import {default as HomeTimelineStoreGroup} from '../ViewContext/StoreGroups/HomeTimeline';
import TweetList from './TweetList';
import BaseTimeline from './BaseTimeline';

const debug = require('remote').require('debug')('Components:HomeTimeline');

export default class HomeTimeline extends BaseTimeline<HomeTimelineStoreGroup> {

    componentDidUpdate() {
        this._connect(); // if dups, rejected by client
    }

    __connect() {
        this.props.actions.connectUserStream(this.props.source_id, {});
    }
    _connect = this.__connect.bind(this);

    __reconnect() {
        this.props.actions.connectUserStream(this.props.source_id, {}, true);
    }
    _reconnect = this.__reconnect.bind(this);

    render() {
        debug('#render');

        const tweets = this.state.tweets;

        return (
            <section id={this.props.id}>
                {tweets.length ? <button onClick={this._reconnect} >reconnect</button> : ''}
                {tweets.length ? <button onClick={this._fetchOlder} >fetch older tweets...</button> : ''}
                <TweetList
                    source_id={this.props.source_id}
                    tweets={tweets}
                    appActions={this.props.appActions}
                    />
            </section>
        );
    }
}
