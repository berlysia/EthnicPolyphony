import * as React from 'react';
import {Tweet as TweetModel, Entities, Users} from '../../Models/Tweet';
import {shell} from 'electron';
import {
    calcmd5,
    formatDateString,
    getProfileImage,
    validateAsNumericString
} from '../../util';
import ActionCreator, {ViewType, ViewOption} from '../../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:SingleTweet:Tweet');
const classBuilder = require('bemmer').createBuilder('singletweet');

interface Props {
    source_id: string;
    target_id: string;
    appActions: ActionCreator;
    id: string;
    tweet?: TweetModel;
    fetchTweet: Function;
}

export function Tweet(props: Props): JSX.Element {
    return (
        <section id={props.id}>
            <p>{props.tweet}</p>
        </section>
    );
}

export function NotFoundTweet(props: Props): JSX.Element {
    return (
        <section id={props.id}>
            <p>status not found</p>
        </section>
    );
}

export function NotFetchedTweet(props: Props): JSX.Element {
    props.fetchTweet();
    return (
        <section id={props.id}>
            <p>fetching...</p>
        </section>
    );
}
