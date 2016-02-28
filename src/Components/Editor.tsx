import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import ActionCreator from '../AppContext/ActionCreator';

interface Props {
    actions: ActionCreator;
    stores: ViewContextStackItem;
};

type States = {};

export default class Editor extends React.Component<Props, States> {
    _editor: any;
    _inReplyTo: any;

    _onSubmit(event: React.FormEvent) {
        console.log('onSubmit');
        event.preventDefault();

        const status = this._editor.value.substr(0, 140);
        // TODO url minify considered truncat    
        let inReplyTo = this._inReplyTo.value;

        if (!inReplyTo.match(/^\d+$/)) {
            inReplyTo = null;
        }

        this.props.actions.updateStatus(
            this.props.stores.source_id,
            status,
            inReplyTo
        );

        // TODO retry on fail, or save values for re    
        this._editor.value = '';
        this._inReplyTo.value = '';
    }
    render() {
        console.log('Editor#render');
        return (
            <form id='tweetForm' onSubmit={this._onSubmit.bind(this) }>
                <textarea name='tweet' ref={el => this._editor = el} id='tweetText'></textarea>
                <input type="hidden" ref={el => this._inReplyTo = el} defaultValue=''/>
                <input type='submit' value='submit'></input>
            </form>
        );
    }
}
