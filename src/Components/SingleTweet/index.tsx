import * as React from 'react';
import {Tweet as TweetModel} from '../../Models/Tweet';
import ActionCreator, {ViewType} from '../../AppContext/ActionCreator';

import {NotFoundTweet, Tweet, NotFetchedTweet} from './Tweet';
import {getTweet, TweetStorageErr, ErrCode as TweetStorageErrCode} from '../../TweetStorage';
import {Result, Ok} from 'option-t/src/Result';

const debug = require('remote').require('debug')('Components:SingleTweet:Container');
const classBuilder = require('bemmer').createBuilder('singletweet');

interface Props {
    type: string;
    source_id: string;
    target_id: string;
    appActions: ActionCreator;
    id: string;
}

type State = {
    tweet: Result<TweetModel, TweetStorageErr>;
};

export default class SingleTweetContainer extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = { tweet: this.getTweet(props) };
    }

    getTweet(props: Props): Result<TweetModel, TweetStorageErr> {
        const _getTweet: typeof getTweet = require('remote').require('./TweetStorage').getTweet;
        return _getTweet(props.source_id, props.target_id);
    }

    componentWillReceiveProps(props: Props) {
        this.setState({ tweet: this.getTweet(props) });
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return this.props.source_id !== nextProps.source_id
            || this.props.target_id !== nextProps.target_id;
    }

    __fetchTweet() {
        require('remote')
            .require('./TwitterClient')
            .byID(this.props.source_id)
            .showStatus(this.props.target_id)
            .then((status: TweetModel) => {
                this.setState({ tweet: new Ok<TweetModel, TweetStorageErr>(status) });
            }, (err: any) => console.error(err));
    }
    _fetchTweet = this.__fetchTweet.bind(this);

    render() {
        if (this.state.tweet.isErr()) {
            const err = this.state.tweet.unwrapErr();
            if (err.code === TweetStorageErrCode.NOTFETCHED) {
                return <NotFetchedTweet {...this.props} fetchTweet={this._fetchTweet}/>;
            }
            if (err.code === TweetStorageErrCode.NOTFOUND) {
                return <NotFoundTweet {...this.props} fetchTweet={this._fetchTweet}/>;
            }
        }
        return (
            <Tweet {...this.props} fetchTweet={this._fetchTweet} tweet={this.state.tweet.unwrap() } />
        );
    }
}
