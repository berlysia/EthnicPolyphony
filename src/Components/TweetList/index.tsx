import * as React from 'react';
import Tweet from './Tweet';
import {Tweet as TweetModel} from '../../Models/Tweet';

const debug = require('remote').require('debug')('Components:TweetList');

interface Props {
    tweets: TweetModel[];
};

type States = {};

export default class TweetList extends React.Component<Props, States> {

    shouldComponentUpdate(nextProps: Props, nextState: States) {
        const prevLength = this.props.tweets.length;
        const nextLength = nextProps.tweets.length;
        return prevLength !== nextLength
            || (prevLength === 0 || nextLength === 0)
            || this.props.tweets[0].id_str !== nextProps.tweets[0].id_str
            || this.props.tweets[prevLength - 1].id_str !== nextProps.tweets[nextLength - 1].id_str;
    }

    render() {
        debug('TweetList#render');

        return (
            <section>
                {this.props.tweets.map((tw: any, idx: number) => {
                    return React.createElement(Tweet, Object.assign({ key: tw.id_str, first: idx === 0 }, tw));
                }) }
            </section>
        );
    }
}
