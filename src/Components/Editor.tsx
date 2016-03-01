import * as React from 'react';
import {findDOMNode} from 'react-dom';
import AppContext from '../AppContext/AppContext';
import ActionCreator from '../AppContext/ActionCreator';

interface Props {
    actions: ActionCreator;
    store: AppContext;
};

type States = {};

export default class Editor extends React.Component<Props, States> {
    _editor: any;
    _inReplyTo: any;
    source_id: string;
    remover: Function;
    removerOnUnload: Function;

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

    _onKeyDownTweetArea(event: React.KeyboardEvent) {
        if (((event.metaKey || event.ctrlKey) && event.keyCode === 13)) {
            this._updateStatus();
            return;
        }
    }

    render() {
        return (
            <form id='tweetForm' onSubmit={this._onSubmitTweet.bind(this) }>
                <textarea
                    id='tweetTextArea'
                    name='tweet'
                    ref={el => this._editor = el}
                    onKeyDown={this._onKeyDownTweetArea.bind(this) }
                    ></textarea>
                <input id='tweetInReplyTo' type="hidden" ref={el => this._inReplyTo = el} defaultValue=''/>
                <input id='tweetSubmit' type='submit' value='submit'></input>
            </form>
        );
    }
}
