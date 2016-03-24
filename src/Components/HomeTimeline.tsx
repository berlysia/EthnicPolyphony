import * as React from 'react';
import {default as HomeTimelineStoreGroup} from '../ViewContext/StoreGroups/HomeTimeline';
import TweetList from './TweetList';
import BaseTimeline, {Props} from './BaseTimeline';
import Tweets, {TWEETS_SHOW_MAX, ignoreTweetsShortage} from '../ViewContext/ReduceStores/Tweets';
import {Tweet as TweetModel} from '../Models/Tweet';

const debug = require('remote').require('debug')('Components:HomeTimeline');

export default class HomeTimeline extends BaseTimeline<HomeTimelineStoreGroup> {

    componentDidUpdate() {
        this._connect(); // if dups, rejected by client
    }

    __connect(forceReconnect?: boolean) {
        this.props.actions.connectUserStream(this.props.source_id, {}, forceReconnect);
    }
    _connect = this.__connect.bind(this);
    _reconnect = this.__connect.bind(this, true);

    shouldComponentUpdate(nextProps: Props<HomeTimelineStoreGroup>, nextState: {tweets: TweetModel[]}) {
        if(!(this.props.max_status_id || this.props.min_status_id) && nextProps.freeze) {
            return false;
        }
        return super.shouldComponentUpdate(nextProps, nextState);
    }
    
    __topOfTimeline() {
        const type = this.props.store.getState().type;
        this.props.appActions.pushStack(Object.assign({}, type));
        window.scrollTo(0,0); // scroll to top
    }
    _topOfTimeline = this.__topOfTimeline.bind(this);

    render() {
        debug('#render');
        
        const tweets = this.state.tweets;
        const fragmented = this.props.max_status_id || this.props.min_status_id;
        const ceiled = this.ceiled();
        const floored = this.floored();
          
        const shortage = TWEETS_SHOW_MAX - tweets.length;
        const satisfied = ignoreTweetsShortage(shortage);

        return (
            <section id={this.props.id}>
                {fragmented ? <button onClick={this._topOfTimeline}>top of timelime</button> : ''}
                {ceiled ? <button onClick={this._connect} >reconnect</button> : ''}
                {fragmented && !ceiled ? <button onClick={this._newer} >newer tweets...</button> : ''}
                <TweetList
                    source_id={this.props.source_id}
                    tweets={tweets}
                    appActions={this.props.appActions}
                    />
                {fragmented && (floored && !satisfied) ? <button onClick={this._fetchOlder} >fetch older tweets...</button> : ''}
                {!floored || (floored && satisfied) ? <button onClick={this._older} >older tweets...</button> : ''}
            </section>
        );
    }
}
