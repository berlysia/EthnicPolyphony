import * as React from 'react';
import {default as HomeTimelineStoreGroup} from '../ViewContext/StoreGroups/HomeTimeline';
import TweetList from './TweetList';
import BaseTimeline from './BaseTimeline';

const debug = require('remote').require('debug')('Components:HomeTimeline');

export default class HomeTimeline extends BaseTimeline<HomeTimelineStoreGroup> {

    render() {
        debug('#render');

        const tweets = this.state.tweets;

        return (
            <section id={this.props.id}>
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
