import * as React from 'react';
import {sanitize} from 'dompurify';
import {Tweet as TweetModel} from '../Models/Tweet';

type Props = TweetModel;
type State = {};

export default class Tweet extends React.Component<Props, State> {
    generatedDangerouslyText: { __html: string };

    generateText(): { __html: string } {
        if (this.generatedDangerouslyText) {
            return this.generatedDangerouslyText;
        }
        return this.generatedDangerouslyText = {
            __html: sanitize(this.props.text).replace(/\n/g, '<br />')
        }
    }

    render() {
        // console.log('Tweet#render');
        return (
            <div className='tweet'>
                <section className='tweet__author'> @{this.props.user.screen_name} / {this.props.user.name}</section>
                <section className='tweet__text' dangerouslySetInnerHTML={this.generateText() }></section>
                <section className='tweet__created_at'>{this.props.created_at}</section>
                <section className='tweet__id'>{this.props.id_str}</section>
            </div>
        );
    }
}
