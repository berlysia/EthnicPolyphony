import * as React from 'react';
import {Tweet as TweetModel, Entities, Users} from '../../Models/Tweet';
import Tweet from './Tweet';
import ActionCreator, {ViewType} from '../../AppContext/ActionCreator';

import {getTweet, TweetStorageErr} from '../../TweetStorage';
import {Result} from 'option-t/src/Result';

const debug = require('remote').require('debug')('Components:TweetContainer');

interface Props {
    source_id: string;
    status_id: string;
    key: string;
    appActions: ActionCreator;
    reportHeight?: Function;
}

type State = {};

export default class TweetContainer extends React.Component<Props, State> {

    getTweet(props: Props): Result<TweetModel, TweetStorageErr> {
        const getTweet_: typeof getTweet = require('remote').require('./TweetStorage').getTweet;
        return getTweet_(props.source_id, props.status_id);
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (this.props.source_id !== nextProps.source_id) return true;
        if (this.props.status_id !== nextProps.status_id) return true;

        return false;
    }

    render() {
        debug('#render');
        const tweetWrapper = this.getTweet(this.props);
        if (tweetWrapper.isErr()) {
            return;
        }
        const tweet = tweetWrapper.unwrap();
        if (tweet.retweeted_status) {
            return (
                <Tweet
                    {...tweet.retweeted_status}
                    source_id={this.props.source_id}
                    key={tweet.id_str}
                    appActions={this.props.appActions}
                    retweet_user={tweet.user}
                    retweet_id={tweet.id_str}
                    reportHeight={this.props.reportHeight}
                    />);
        } else {
            return (
                <Tweet
                    {...tweet}
                    source_id={this.props.source_id}
                    key={tweet.id_str}
                    appActions={this.props.appActions}
                    reportHeight={this.props.reportHeight}
                    />);
        }
    }
}
