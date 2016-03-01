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

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return this.props.id_str !== nextProps.id_str
            || this.props.favorited !== nextProps.favorited;
    }

    render() {
        // console.log('Tweet#render');
        return (
            <div className='tweet'>
                <img className='tweet__profile_image' src={this.props.user.profile_image_url} width='48px' height='48px'/>
                <section className='tweet__author'> @{this.props.user.screen_name} / {this.props.user.name}</section>
                <section className='tweet__text' dangerouslySetInnerHTML={this.generateText() }></section>
                <section className='tweet__created_at'>{this.props.created_at}</section>
                <section className='tweet__id'>{this.props.id_str}</section>
                <section className='tweet__source' dangerouslySetInnerHTML={{ __html: this.props.source }}></section>
            </div>
        );
    }
}
