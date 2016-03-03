import * as React from 'react';
import {sanitize} from 'dompurify';
import {Tweet as TweetModel} from '../Models/Tweet';
import {Entity} from '../Models/Entity';
import {shell} from 'electron';
import {calcmd5} from '../util';

const debug = require('remote').require('debug')('Components:Tweet');

type Props = TweetModel;

interface PropsWithClassName extends Props {
    className?: string;
};

export class TweetText extends React.Component<PropsWithClassName, {}> {

    _onClick(index: number) {
        if (this.mergedEntities[index]
            && this.mergedEntities[index].expanded_url) {
            shell.openExternal(this.mergedEntities[index].expanded_url);
        }
    }

    mergedEntities: { indices: [number, number], expanded_url: string }[];

    get textElements(): JSX.Element[] {
        let text = this.props.text;
        const md5 = calcmd5(this.props.id_str + text);

        const elements = this.mergedEntities.reduceRight((prev: JSX.Element[], curr: any, idx: number) => {
            prev.unshift(<span key={md5 + idx + '_spn'}>{text.substr(curr.indices[1]) + ' '}</span>);
            prev.unshift(<a key={md5 + idx + '_a'} href='#' onClick={() => this._onClick(idx) }>{curr.display_url}</a>);
            text = text.substr(0, curr.indices[0]);
            return prev;
        }, []);
        elements.unshift(<span key={md5 + '_spn'}>{text}</span>);

        return elements;
    }

    shouldComponentUpdate(nextProps: PropsWithClassName, nextState: {}) {
        return this.props.id_str !== this.props.id_str;
    }

    render() {
        this.mergedEntities = [].concat(this.props.entities.urls).concat(this.props.entities.media || [])
            .sort((a: any, b: any) => b.indices[0] - a.indices[0]);

        return (
            <section className={this.props.className || ''} >
                {this.textElements}
            </section>
        );
    }
}

export class TweetImages extends React.Component<PropsWithClassName, {}> {
    _onClick(index: number) {
        if (this.props.entities
            && this.props.entities.media
            && this.props.entities.media[index]
            && this.props.entities.media[index].media_url) {
            if (this.props.entities.media[index].type === 'photo') {
                shell.openExternal(this.props.entities.media[index].media_url + ':orig');
            } else {
                shell.openExternal(this.props.entities.media[index].expanded_url);
            }
        }
    }

    shouldComponentUpdate(nextProps: PropsWithClassName, nextState: {}) {
        return this.props.id_str !== this.props.id_str;
    }

    render() {
        return (
            <section className={this.props.className || ''}>
                {(this.props.entities.media || []).reduce((prev: JSX.Element[], media: any, idx: number) => {
                    prev.push(<img
                        key={calcmd5(idx + media.media_url) }
                        src={`${media.media_url}:thumb`}
                        onClick={() => this._onClick(idx) }
                        />);
                    return prev;
                }, []) }
            </section>
        );
    }
}

export default class Tweet extends React.Component<Props, {}> {

    get created_at(): string {
        return new Date(this.props.created_at).toString();
    }

    shouldComponentUpdate(nextProps: Props, nextState: {}) {
        return this.props.id_str !== nextProps.id_str
            || this.props.favorited !== nextProps.favorited;
    }

    render() {
        debug('Tweet#render');
        return (
            <div className='tweet'>
                <img className='tweet__profile_image' src={this.props.user.profile_image_url} width='48px' height='48px'/>
                <section className='tweet__author'> @{this.props.user.screen_name} / {this.props.user.name}</section>
                <TweetText className='tweet__text' {...this.props} />
                <TweetImages className='tweet__images' {...this.props} />
                <section className='tweet__created_at'>{this.created_at}</section>
                <section className='tweet__id'>{this.props.id_str}</section>
                <section className='tweet__source' dangerouslySetInnerHTML={{ __html: this.props.source }}></section>
            </div>
        );
    }
}
