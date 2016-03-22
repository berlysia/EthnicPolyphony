import * as React from 'react';
import {findDOMNode} from 'react-dom';
import AppContext from '../AppContext/AppContext';
import ActionCreator from '../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:Editor');

interface Props {
    actions: ActionCreator;
    store: AppContext;
};

type States = {};

export default class Editor extends React.Component<Props, States> {
    source_id: string;

    _updateStatus(form: any /*HTMLFormElement*/) {
        const status = form.tweet.value.substr(0, 140);
        // TODO url minify considered truncate   
        let inReplyTo = form.inReplyTo.value;

        if (!inReplyTo.match(/^\d+$/)) {
            inReplyTo = null;
        }

        this.props.actions.updateStatus(
            this.props.store.getState().top.source_id,
            status,
            inReplyTo
        );

        // TODO retry on fail, or save values
        form.tweet.value = '';
        form.inReplyTo.value = '';
    }

    _onSubmitTweet(event: React.FormEvent) {
        event.preventDefault();
        this._updateStatus(event.target as HTMLFormElement);
    }
    bindedOnSubmitTweet = this._onSubmitTweet.bind(this);

    _onKeyDownTweetArea(event: React.KeyboardEvent) {
        if (((event.metaKey || event.ctrlKey) && event.keyCode === 13)) {
            this._updateStatus((event.target as HTMLElement).parentNode as HTMLFormElement);
            return;
        }
    }
    bindedOnKeyDownTweetArea = this._onKeyDownTweetArea.bind(this);

    render() {
        debug('#render');
        return (
            <form id='tweetForm' onSubmit={this.bindedOnSubmitTweet as any}>
                <textarea
                    id='tweetTextArea'
                    name='tweet'
                    onKeyDown={this.bindedOnKeyDownTweetArea as any}
                    ></textarea>
                <input
                    id='tweetInReplyTo'
                    name='inReplyTo'
                    type="hidden"
                    defaultValue=''
                    />
                <input id='tweetSubmit' type='submit' value='submit'></input>
            </form>
        );
    }
}
