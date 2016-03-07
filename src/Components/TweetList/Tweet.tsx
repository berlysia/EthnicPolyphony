import * as React from 'react';
import {Tweet as TweetModel, Entities, Users} from '../../Models/Tweet';
import {shell} from 'electron';
import {calcmd5, formatDateString, getProfileImage} from '../../util';
import ActionCreator, {ViewType} from '../../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:Tweet');
const Bemmer = require('bemmer');
const classBuilder = Bemmer.create('tweet')

interface Props extends TweetModel {
    source_id: string;
    key: string,
    first: boolean;
    appActions: ActionCreator;
    retweet_user?: Users;
}

interface PropsWithClassName extends Props {
    className?: string;
};

export function unescape(text: string) {
    return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/, '&');
}

export class TweetText extends React.Component<PropsWithClassName, {}> {

    _onClick(index: number) {
        if (this.mergedEntities[index]
            && this.mergedEntities[index].expanded_url) {
            shell.openExternal(this.mergedEntities[index].expanded_url);
        }
    }

    mergedEntities: { indices: [number, number], expanded_url: string }[];

    get textElements(): JSX.Element[] {
        let text = unescape(this.props.text);
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
        this.mergedEntities = []
            .concat(this.props.entities.urls)
            .concat((this.props.extended_entities && this.props.extended_entities.media) || [])
            .sort((a: any, b: any) => a.indices[0] - b.indices[0])
            .reduce((prev: any[], curr: any, idx: number, arr: any[]) => {
                if (idx === 0 || curr.indices[0] !== arr[idx - 1].indices[0]) prev.push(curr);
                return prev;
            }, []);

        return (
            <section className={this.props.className || ''} >
                {this.textElements}
            </section>
        );
    }
}

export class TweetImages extends React.Component<PropsWithClassName, {}> {
    _onClick(index: number) {
        if (this.mergedEntities[index]
            && this.mergedEntities[index].media_url) {
            switch (this.mergedEntities[index].type) {
                case 'photo':
                case 'multi photos': {
                    shell.openExternal(this.mergedEntities[index].media_url + ':orig');
                } break;
                default: {
                    shell.openExternal(this.mergedEntities[index].expanded_url);
                }
            }
        }
    }

    mergedEntities: {
        indices: [number, number],
        type: string,
        media_url: string,
        expanded_url: string
    }[];

    shouldComponentUpdate(nextProps: PropsWithClassName, nextState: {}) {
        return this.props.id_str !== this.props.id_str;
    }

    render() {
        this.mergedEntities = ((this.props.extended_entities && this.props.extended_entities.media) || []);

        return (
            <section className={this.props.className || ''}>
                {this.mergedEntities.reduce((prev: JSX.Element[], media: any, idx: number) => {
                    prev.push(<img
                        className={this.props.className ? this.props.className + '__thumb' : ''}
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
        return formatDateString(this.props.created_at);
    }

    get source_string(): string {
        try {
            return this.props.source.match(/^<.*?>([\s\S]*)<\/.*?>$/)[1];
        } catch (e) {
            console.error('an error occurred on parsing source string', e);
            return '[PARSE ERROR]';
        }
    }

    shouldComponentUpdate(nextProps: Props, nextState: {}) {
        return this.props.id_str !== nextProps.id_str
            || this.props.favorited !== nextProps.favorited
            || this.props.retweeted !== nextProps.retweeted;
    }

    __openPermaLink() {
        shell.openExternal(`https://twitter.com/statuses/${this.props.id_str}`)
    }
    _openPermaLink = this.__openPermaLink.bind(this);

    __openSourceLink() {
        const matched = decodeURIComponent(this.props.source).match(/href="(https?:\/\/.+?)"/);
        if (matched[1]) {
            shell.openExternal(matched[1]);
        }
    }
    _openSourceLink = this.__openSourceLink.bind(this);

    __openProfileView() {
        const target_id = this.props.user.id_str;
        this.props.appActions.pushStack({
            type: ViewType.UserProfile,
            source_id: this.props.source_id,
            target_id,
            user: this.props.user,
        });
    }
    _openProfileView = this.__openProfileView.bind(this);

    render() {
        debug('Tweet#render');
        // <div className={`tweet__retweet${this.props.retweeted ? ' retweeted' : ''}`}>RT {this.props.retweet_count}</div>
        // <div className={`tweet__favorite${this.props.favorited ? ' favorited' : ''}`}>Fav {this.props.favorite_count}</div>
        return (
            <div className={classBuilder() }>
                <section className={classBuilder('__header') }>
                    <img
                        className={classBuilder('__profile_image') }
                        src={getProfileImage(this.props.user.profile_image_url, '_bigger') }
                        width='48px'
                        height='48px'
                        onClick={this._openProfileView}
                        />
                </section>
                <section className={classBuilder('__content') }>
                    <section className={classBuilder('__author') }> @{this.props.user.screen_name} / {this.props.user.name}</section>
                    <TweetText className={classBuilder('__text') } {...this.props} />
                    <section className={classBuilder('__footer') }>
                        <section className={classBuilder('__created_at') }>
                            <a
                                href='#'
                                onClick={this._openPermaLink}
                                className={classBuilder('__created_at__anchor') }
                                >{this.created_at}</a>
                        </section>
                        <section className={classBuilder('__source') }>
                            <a
                                href='#'
                                onClick={this._openSourceLink}
                                className={classBuilder('__source__anchor') }
                                >{this.source_string}</a>
                        </section>
                    </section>
                    {this.props.extended_entities && this.props.extended_entities.media ? (
                        <TweetImages className={classBuilder('__images') } {...this.props} />
                    ) : ''}
                    {this.props.retweet_user ? (
                        <section className={classBuilder('__retweeter') }>
                            <span className={classBuilder('__retweeter__anchor') }>
                                {`RT by @${this.props.retweet_user.screen_name} / ${this.props.retweet_user.name}`}
                            </span>
                        </section>
                    ) : ''}
                </section>
            </div>
        );
    }
}
