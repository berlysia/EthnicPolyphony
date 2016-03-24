import * as React from 'react';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import AppActionCreator, {ViewOption} from '../AppContext/ActionCreator';
import ActionCreator from '../ViewContext/ActionCreator';
import {default as BaseTimelineStoreGroup} from '../ViewContext/StoreGroups/BaseTimeline';
import Tweets, {TWEETS_SHOW_MAX} from '../ViewContext/ReduceStores/Tweets';

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
        
        if (this.props.store.getState().tweets.length === 0) {
            this._fetch();
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
    
    componentWillUpdate(nextProps: Props<T>, nextState: States) {
        if(this.props.store !== nextProps.store){
            this._unlistenChange();
        }
    }
    
    componentDidUpdate(nextProps: Props<T>, nextState: States) {
        if(this.props.store !== nextProps.store){
            this._listenChange();
        }
    }
    
    __fetch() {
        debug(`#fetch - max:${this.props.max_status_id}, min:${this.props.min_status_id}`);
        if(this.props.max_status_id) {
            const max_id = this.props.max_status_id;
            this.props.appActions.fetchTweet({ max_id });
            return;    
        }
        if(this.props.min_status_id) {
            const since_id = this.props.min_status_id;
            this.props.appActions.fetchTweet({ since_id }, true);
            return;
        }
        this.props.appActions.fetchTweet({});
    }
    _fetch = this.__fetch.bind(this);

    __newer() {
        const type = this.props.store.getState().type;
        const tweets = this.tweets();
        debug(`#_newer - min_id: ${tweets[0].id_str}`);
        this.props.appActions.pushStack(Object.assign({}, type, {
            min_status_id: tweets[0].id_str
        }));
        window.scrollTo(0,0); // scroll to top
    }
    _newer = this.__newer.bind(this);

    __older() {
        const type = this.props.store.getState().type;
        const tweets = this.tweets();
        debug(`#_older - max_id: ${tweets[tweets.length - 1].id_str}`);
        this.props.appActions.pushStack(Object.assign({}, type, {
            max_status_id: tweets[tweets.length - 1].id_str
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
        const allTweets = props.store.getState().tweets;
        if(props.max_status_id) {
            return sliceWithMaxID(allTweets, props.max_status_id, TWEETS_SHOW_MAX);
        }
        if(props.min_status_id) {
            return sliceWithMinID(allTweets, props.min_status_id, TWEETS_SHOW_MAX);
        }
        return allTweets.slice(0, TWEETS_SHOW_MAX);
    }

    render() {
        debug('#render');
        
        return (
            <section id={this.props.id}>
                <button onClick={this._newer} >newer tweets...</button>
                <TweetList
                    source_id={this.props.source_id}
                    tweets={this.tweets()}
                    appActions={this.props.appActions}
                    />
                <button onClick={this._older} >older tweets...</button>
            </section>
        );
    }
}
