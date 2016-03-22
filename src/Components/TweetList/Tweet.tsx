import * as React from 'react';
import {Tweet as TweetModel, Entities, Users} from '../../Models/Tweet';
import {shell} from 'electron';
import {
    calcmd5,
    formatDateString,
    getProfileImage,
    validateAsNumericString
} from '../../util';
import ActionCreator, {ViewType} from '../../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:Tweet');
const classBuilder = require('bemmer').createBuilder('tweet')

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

function taintText(text: string) {
    return { __html: text };
}

export function newlineToBrElement(text: string) {
    return taintText(text.replace(/\n/g, '<br />'));
}

export class TweetText extends React.Component<PropsWithClassName, {}> {

    _openLink(index: number) {
        if (this.mergedEntities[index]
            && this.mergedEntities[index].expanded_url) {
            shell.openExternal(this.mergedEntities[index].expanded_url);
        }
    }

    mergedEntities: { indices: [number, number], expanded_url: string }[];

    _textElements: JSX.Element[] = null;
    get textElements(): JSX.Element[] {
        if (this._textElements) return this._textElements;
        let text = this.props.text;
        const md5 = calcmd5(this.props.id_str + text);

        const elements = this.mergedEntities.reduceRight((prev: JSX.Element[], curr: any, idx: number) => {
            const plainText = newlineToBrElement(text.substr(curr.indices[1]) + ' ');
            prev.unshift(<span
                key={md5 + idx + '_spn'}
                dangerouslySetInnerHTML={plainText}></span>);
            prev.unshift(<a
                key={md5 + idx + '_a'}
                href='#'
                onClick={() => this._openLink(idx) }
                dangerouslySetInnerHTML={{ __html: curr.display_url }}></a>);
            text = text.substr(0, curr.indices[0]);
            return prev;
        }, []);
        elements.unshift(<span key={md5 + '_spn'} dangerouslySetInnerHTML={newlineToBrElement(text) }></span>);

        return this._textElements = elements;
    }

    shouldComponentUpdate(nextProps: PropsWithClassName, nextState: {}) {
        return this.props.id_str !== this.props.id_str;
    }

    render() {
        // merge, sort by indices, uniquify
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

interface State {
    retweeted: boolean;
    favorited: boolean;
}

export default class Tweet extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            retweeted: props.retweeted,
            favorited: props.favorited,
        };
    }

    setFavorite(value: boolean) {
        this.setState(Object.assign({}, this.state, { favorited: value }));
    }

    setRetweet(value: boolean) {
        this.setState(Object.assign({}, this.state, { retweeted: value }));
    }

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

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return this.props.id_str !== nextProps.id_str
            || this.state.favorited !== nextState.favorited
            || this.state.retweeted !== nextState.retweeted;
    }

    __openPermaLink() {
        if (!validateAsNumericString(this.props.id_str)) return;
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

    __openRetweeterProfileView() {
        const target_id = this.props.retweet_user.id_str;
        this.props.appActions.pushStack({
            type: ViewType.UserProfile,
            source_id: this.props.source_id,
            target_id,
            user: this.props.retweet_user,
        });
    }
    _openRetweeterProfileView = this.__openRetweeterProfileView.bind(this);

    __favorite() {
        if (this.state.favorited) {
            if (!window.confirm(`unfavorite?\n@${this.props.user.screen_name} / ${this.props.user.name}\n${this.props.text}`)) return;
            this.props.appActions
                .unfavorite(this.props.source_id, this.props.id_str)
                .then(() => this.setFavorite(false))
                .catch(e => console.error(e, JSON.stringify(e)));
        } else {
            this.props.appActions
                .favorite(this.props.source_id, this.props.id_str)
                .then(() => this.setFavorite(true))
                .catch(errors => {
                    console.error(errors, JSON.stringify(errors));
                    errors.forEach((e: { code: number, message: string }) => {
                        if (e.code === 139) { // already favorited
                            this.setFavorite(true);
                        }
                    });
                });
        }
    }
    _favorite = this.__favorite.bind(this);

    __retweet() {
        if (this.state.retweeted) {
            if (!window.confirm(`unretweet?\n@${this.props.user.screen_name} / ${this.props.user.name}\n${this.props.text}`)) return;
            this.props.appActions
                .unretweet(this.props.source_id, this.props.id_str)
                .then(() => this.setRetweet(false))
                .catch(e => console.error(e, JSON.stringify(e)));
        } else {
            if (!window.confirm(`retweet?\n@${this.props.user.screen_name} / ${this.props.user.name}\n${this.props.text}`)) return;
            this.props.appActions
                .retweet(this.props.source_id, this.props.id_str)
                .then(() => this.setRetweet(true))
                .catch(e => console.error(e, JSON.stringify(e)));
        }
    }
    _retweet = this.__retweet.bind(this);

    render() {
        debug('#render');
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
                        <section className={classBuilder('__favorite', { favorited: this.state.favorited }) } onClick={this._favorite}>★</section>
                        <section className={classBuilder('__retweet', { retweeted: this.state.retweeted }) } onClick={this._retweet}>RT</section>
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
                            <a href='#' className={classBuilder('__retweeter__anchor') } onClick={this._openRetweeterProfileView}>
                                {`RT by @${this.props.retweet_user.screen_name} / ${this.props.retweet_user.name}`}
                            </a>
                        </section>
                    ) : ''}
                </section>
            </div>
        );
    }
}
