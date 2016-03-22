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
    _editor: any;
    _inReplyTo: any;
    editorRef = (el: any) => this._editor = el;
    inReplyToRef = (el: any) => this._inReplyTo = el;

    source_id: string;
    remover: Function;

    _updateStatus() {
        const status = this._editor.value.substr(0, 140);
        // TODO url minify considered truncate   
        let inReplyTo = this._inReplyTo.value;

        if (!inReplyTo.match(/^\d+$/)) {
            inReplyTo = null;
        }

        this.props.actions.updateStatus(
            this.props.store.getState().top.source_id,
            status,
            inReplyTo
        );

        // TODO retry on fail, or save values
        this._editor.value = '';
        this._inReplyTo.value = '';
    }

    _onSubmitTweet(event: React.FormEvent) {
        event.preventDefault();
        this._updateStatus();
    }
    bindedOnSubmitTweet = this._onSubmitTweet.bind(this);

    _onKeyDownTweetArea(event: React.KeyboardEvent) {
        if (((event.metaKey || event.ctrlKey) && event.keyCode === 13)) {
            this._updateStatus();
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
                    ref={this.editorRef as any}
                    onKeyDown={this.bindedOnKeyDownTweetArea as any}
                    ></textarea>
                <input
                    id='tweetInReplyTo'
                    type="hidden"
                    ref={this.inReplyToRef as any}
                    defaultValue=''
                    />
                <input id='tweetSubmit' type='submit' value='submit'></input>
            </form>
        );
    }
}
