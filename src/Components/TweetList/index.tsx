import * as React from 'react';
import TweetContainer from './TweetContainer';
const VirtualList = require('./react-virtual-list').default;
import ActionCreator from '../../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:TweetList');

interface Props {
    source_id: string;
    tweets: string[];
    appActions: ActionCreator;
};

type State = {};

export default class TweetList extends React.Component<Props, State> {

    // shouldComponentUpdate(nextProps: Props, nextState: State) {
    // return nextProps.tweets !== this.props.tweets;
    // const prevLength = this.props.tweets.length;
    // const nextLength = nextProps.tweets.length;
    // return prevLength !== nextLength
    //     || (prevLength === 0 || nextLength === 0)
    //     || this.props.tweets[0].id_str !== nextProps.tweets[0].id_str
    //     || this.props.tweets[prevLength - 1].id_str !== nextProps.tweets[nextLength - 1].id_str;
    // }

    render() {
        debug('#render - count: ' + this.props.tweets.length);

        const itemFactory = (status_id: string, props: any, state: any, reportHeight: (item: string, height: number) => void) => {
            return (
                <TweetContainer
                    key={status_id}
                    status_id={status_id}
                    appActions={this.props.appActions}
                    source_id={this.props.source_id}
                    reportHeight={reportHeight}
                    />
            );
        };

        return (
            <VirtualList items={this.props.tweets} itemFactory={itemFactory} itemHeight={66} bufferSize={5} tagName="section"/>
        );
    }
}
