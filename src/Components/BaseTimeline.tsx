import * as React from 'react';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import AppActionCreator, {ViewOption} from '../AppContext/ActionCreator';
import ActionCreator from '../ViewContext/ActionCreator';
import {default as BaseTimelineStoreGroup} from '../ViewContext/StoreGroups/BaseTimeline';
import Tweets, {TWEETS_SHOW_MAX, ignoreTweetsShortage} from '../ViewContext/ReduceStores/Tweets';

import Tweet from './TweetList/Tweet';
import TweetList from './TweetList';
import {Tweet as TweetModel, sliceWithMaxID, sliceWithMinID} from '../Models/Tweet';

import {decrementNumericString} from '../util';

const debug = require('remote').require('debug')('Components:BaseTimeline');

export interface Props<TimelineStoreGroup extends BaseTimelineStoreGroup> extends ViewOption {
    source_id: string;
    store: TimelineStoreGroup;
    actions: ActionCreator;
    appActions: AppActionCreator;
    id: string;
    max_status_id?: string;
    min_status_id?: string;
    freeze?: boolean;
    tweets: TweetModel[];
};

type States = {
    tweets: TweetModel[];
};

export default class BaseTimeline<T extends BaseTimelineStoreGroup> extends React.Component<Props<T>, States> {
    
    constructor(props: Props<T>) {
        super(props);
        this.state = {
            tweets: this.tweets(props),
        };
    }
    
    componentDidMount() {
        if(this.props.store.getState().tweets.length === 0) {
            this._fetch();
        }
    }
    
    componentWillReceiveProps(nextProps: Props<T>) {
        const tweets = this.tweets(nextProps);
        this.setState({
            tweets,
        });
    }
    
    __fetch() {
        debug('#_fetch')
        this.props.appActions.fetchTweet({});
    }
    _fetch = this.__fetch.bind(this);
    
    __fetchNewer(props?: Props<T>, state?: States) {
        props = props || this.props;
        state = state || this.state;
        const tweets = state.tweets;
        const since_id = tweets.length ? tweets[0].id_str : props.max_status_id || props.min_status_id;
        debug(`#_fetchNewer - min:${since_id}`);
        if(!since_id) return this._fetch();
        props.appActions.fetchTweet({ since_id });
    }
    _fetchNewer = this.__fetchNewer.bind(this, null, null);
    
    __fetchOlder(props?: Props<T>, state?: States) {
        props = props || this.props;
        state = state || this.state;
        const tweets = state.tweets;
        const max_id = tweets.length ? tweets[tweets.length - 1].id_str : props.min_status_id || props.max_status_id;
        debug(`#_fetchOlder - max:${max_id}`);
        if(!max_id) return this._fetch();
        props.appActions.fetchTweet({ max_id }, true);
    }
    _fetchOlder = this.__fetchOlder.bind(this, null, null);

    __newer() {
        const type = this.props.store.getState().type;
        const tweets = this.state.tweets;
        const min_status_id = tweets.length ? tweets[0].id_str : this.props.max_status_id || this.props.min_status_id;
        debug(`#_newer - min_id: ${min_status_id}`);
        this.props.appActions.pushStack(Object.assign({}, type, {
            min_status_id
        }));
        window.scrollTo(0,0); // scroll to top
    }
    _newer = this.__newer.bind(this);

    __older() {
        const type = this.props.store.getState().type;
        const tweets = this.state.tweets;
        const max_status_id = tweets.length ? tweets[tweets.length - 1].id_str : this.props.min_status_id || this.props.max_status_id;
        debug(`#_older - max_id: ${max_status_id}`);
        this.props.appActions.pushStack(Object.assign({}, type, {
            max_status_id
        }));
        window.scrollTo(0,0); // scroll to top
    }
    _older = this.__older.bind(this);

    shouldComponentUpdate(nextProps: Props<T>, nextState: States) {
        return this.props.tweets !== nextProps.tweets
            || this.props.type !== nextProps.type
            || this.props.source_id !== nextProps.source_id
            || this.props.target_id !== nextProps.target_id
            || this.props.max_status_id !== nextProps.max_status_id
            || this.props.min_status_id !== nextProps.min_status_id
            || this.props.store !== nextProps.store;
    }
    
    tweets(props?: Props<T>) {
        props = props || this.props;
        const allTweets = props.tweets;
        if(props.max_status_id) {
            return sliceWithMaxID(allTweets, props.max_status_id, TWEETS_SHOW_MAX);
        }
        if(props.min_status_id) {
            return sliceWithMinID(allTweets, props.min_status_id, TWEETS_SHOW_MAX);
        }
        return allTweets.slice(0, TWEETS_SHOW_MAX);
    }
    
    ceiled(props?: Props<T>, state?: States) {
        props = props || this.props;
        state = state || this.state;
        return (
            state.tweets.length
            && props.tweets.length
            && state.tweets[0] === props.tweets[0]
          ) || (props.tweets.length === 0 && state.tweets.length === 0);
    }
    
    floored(props?: Props<T>, state?: States) {
        props = props || this.props;
        state = state || this.state;
        return (
            state.tweets.length
            && props.tweets.length
            && state.tweets[state.tweets.length - 1] === props.tweets[props.tweets.length - 1]
          ) || (props.tweets.length === 0 && state.tweets.length === 0);
    }

    render() {
        debug('#render');
        
        const tweets = this.state.tweets;
        const ceiled = this.ceiled();
        const floored = this.floored();
          
        const shortage = TWEETS_SHOW_MAX - tweets.length;
        const satisfied = ignoreTweetsShortage(shortage);
        
        return (
            <section id={this.props.id}>
                {!ceiled ? <button onClick={this._newer} >newer tweets...</button> : ''}
                {ceiled ? <button onClick={this._fetchNewer} >fetch newer tweets...</button> : ''}
                <TweetList
                    source_id={this.props.source_id}
                    tweets={tweets}
                    appActions={this.props.appActions}
                    />
                {floored && !satisfied ? <button onClick={this._fetchOlder} >fetch older tweets...</button> : ''}
                {!floored || (floored && satisfied) ? <button onClick={this._older} >older tweets...</button> : ''}
            </section>
        );
    }
}
