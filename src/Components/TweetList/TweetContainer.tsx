import * as React from 'react';
import {Tweet as TweetModel, Entities, Users} from '../../Models/Tweet';
import Tweet from './Tweet';
import ActionCreator, {ViewType} from '../../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:TweetContainer');

interface Props {
  source_id: string;
  status_id: string;
  key: string;
  appActions: ActionCreator;
}

type State = TweetModel;

export default class TweetContainer extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = this.getTweet(props);
    }
    
    getTweet(props: Props): TweetModel {
        return require('remote').require('./TweetStorage').getTweet(props.source_id, props.status_id);
    }
    
    componentWillReceiveProps(props: Props) {
        this.setState(this.getTweet(props));
    }
    
    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return this.props.source_id !== nextProps.source_id
            || this.props.status_id !== nextProps.status_id
            || this.state.deleted !== nextState.deleted
            || this.state.favorited !== nextState.favorited
            || this.state.retweeted !== nextState.retweeted;
    }
    
    render() {
        debug('#render');
        if (this.state == null) {
            return;
        } else if (this.state.retweeted_status) {
            return (
                <Tweet
                    {...this.state.retweeted_status}
                    source_id={this.props.source_id}
                    key={this.state.id_str}
                    appActions={this.props.appActions}
                    retweet_user={this.state.user}
                />);
        } else {
            return (
                <Tweet
                    {...this.state}
                    source_id={this.props.source_id}
                    key={this.state.id_str}
                    appActions={this.props.appActions}
                />);
        }
    }
}