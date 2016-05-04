import * as React from 'react';
import AppActionCreator, {ViewOption} from '../AppContext/ActionCreator';
import ActionCreator from '../ViewContext/ActionCreator';
import {default as BaseTimelineStoreGroup} from '../ViewContext/StoreGroups/BaseTimeline';
const shallowCompare = require('react-addons-shallow-compare');

import TweetList from './TweetList';

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
    tweets: string[];
};

type State = {
    tweets: string[];
};

export default class BaseTimeline<T extends BaseTimelineStoreGroup> extends React.Component<Props<T>, State> {

    constructor(props: Props<T>) {
        super(props);
        this.state = {
            tweets: this.tweets(props),
        };
    }

    componentDidMount() {
        if (this.props.store.getState().tweets.length === 0) {
            this._fetch();
        }
    }

    componentWillReceiveProps(nextProps: Props<T>) {
        if (this.props.store !== nextProps.store
            && nextProps.store.getState().tweets.length === 0) {
            this._fetch(nextProps);
        }
        const tweets = this.tweets(nextProps);
        this.setState({
            tweets,
        });
    }

    __fetch(props?: Props<T>) {
        debug('#_fetch');
        (props || this.props).appActions.fetchTweet({});
    }
    _fetch = this.__fetch.bind(this);

    __fetchNewer(props?: Props<T>, state?: State) {
        props = props || this.props;
        state = state || this.state;
        const tweets = state.tweets;
        const since_id = tweets[0];
        debug(`#_fetchNewer - min:${since_id}`);
        if (!since_id) return this._fetch();
        props.appActions.fetchTweet({ since_id });
    }
    _fetchNewer = this.__fetchNewer.bind(this, null, null);

    __fetchOlder(props?: Props<T>, state?: State) {
        props = props || this.props;
        state = state || this.state;
        const tweets = state.tweets;
        const max_id = tweets[tweets.length - 1];
        debug(`#_fetchOlder - max:${max_id}`);
        if (!max_id) return this._fetch();
        props.appActions.fetchTweet({ max_id }, true);
    }
    _fetchOlder = this.__fetchOlder.bind(this, null, null);

    shouldComponentUpdate(nextProps: Props<T>, nextState: State) {
        return shallowCompare(this, nextProps, nextState);
    }

    tweets(props?: Props<T>) {
        return (props || this.props).tweets;
    }

    render() {
        debug('#render');

        const tweets = this.state.tweets;

        return (
            <section id={this.props.id}>
                {tweets.length ? <button onClick={this._fetchNewer} >fetch newer tweets...</button> : ''}
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
