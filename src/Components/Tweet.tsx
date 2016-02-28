import * as React from 'react';
import {Tweet as TweetModel} from '../Models/Tweet';

type Props = TweetModel;
type State = {};

export default class Tweet extends React.Component<Props, State> {
    render() {
        console.log('Tweet#render');
        return (
            <div className='tweet'>
                <section className='tweet__author'> @{this.props.user.screen_name} / {this.props.user.name}</section>
                <section className='tweet__text'>{this.props.text}</section>
                <section className='tweet__created_at'>{this.props.created_at}</section>
                <section className='tweet__id'>{this.props.id_str}</section>
            </div>
        );
    }
}
