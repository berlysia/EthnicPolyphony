import * as React from 'react';
import Tweet from './Tweet';
import {Tweet as TweetModel} from '../../Models/Tweet';
import ActionCreator from '../../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:TweetList');

interface Props {
    source_id: string;
    tweets: TweetModel[];
    appActions: ActionCreator;
};

type States = {};

export default class TweetList extends React.Component<Props, States> {
  
    shouldComponentUpdate(nextProps: Props, nextState: States) {
        return nextProps.tweets !== this.props.tweets;
        // const prevLength = this.props.tweets.length;
        // const nextLength = nextProps.tweets.length;
        // return prevLength !== nextLength
        //     || (prevLength === 0 || nextLength === 0)
        //     || this.props.tweets[0].id_str !== nextProps.tweets[0].id_str
        //     || this.props.tweets[prevLength - 1].id_str !== nextProps.tweets[nextLength - 1].id_str;
    }

    render() {
        debug('#render');

        return (
            <section>
                {this.props.tweets.map((tw: TweetModel, idx: number) => {
                    if (tw.retweeted_status) {
                        return (
                            <Tweet
                                {...tw.retweeted_status}
                                source_id={this.props.source_id}
                                key={tw.id_str}
                                first={idx === 0}
                                appActions={this.props.appActions}
                                retweet_user={tw.user}
                                />);
                    } else {
                        return (
                            <Tweet
                                {...tw}
                                source_id={this.props.source_id}
                                key={tw.id_str}
                                first={idx === 0}
                                appActions={this.props.appActions}
                                />);
                    }
                }) }
            </section>
        );
    }
}
