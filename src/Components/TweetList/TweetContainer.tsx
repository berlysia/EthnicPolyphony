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
}

type State = {
    tweet: Result<TweetModel, TweetStorageErr>;
};

export default class TweetContainer extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {tweet: this.getTweet(props)};
    }
    
    getTweet(props: Props): Result<TweetModel, TweetStorageErr> {
        const getTweet_ : typeof getTweet = require('remote').require('./TweetStorage').getTweet;
        return getTweet_(props.source_id, props.status_id);
    }
    
    componentWillReceiveProps(props: Props) {
        this.setState({tweet: this.getTweet(props)});
    }
    
    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if(this.props.source_id !== nextProps.source_id) return true;
        if(this.props.status_id !== nextProps.status_id) return true;
        if(this.state.tweet.isErr() || nextState.tweet.isErr()) return true;
        
        const currTweet = this.state.tweet.unwrap();
        const nextTweet = nextState.tweet.unwrap(); 
        if(currTweet.deleted !== nextTweet.deleted) return true;
        if(currTweet.favorited !== nextTweet.favorited) return true;
        if(currTweet.retweeted !== nextTweet.retweeted) return true;

        return false;
    }
    
    render() {
        debug('#render');
        if (this.state.tweet.isErr()) {
            return;
        }
        const tweet = this.state.tweet.unwrap();
        if (tweet.retweeted_status) {
            return (
                <Tweet
                    {...tweet.retweeted_status}
                    source_id={this.props.source_id}
                    key={tweet.id_str}
                    appActions={this.props.appActions}
                    retweet_user={tweet.user}
                />);
        } else {
            return (
                <Tweet
                    {...tweet}
                    source_id={this.props.source_id}
                    key={tweet.id_str}
                    appActions={this.props.appActions}
                />);
        }
    }
}