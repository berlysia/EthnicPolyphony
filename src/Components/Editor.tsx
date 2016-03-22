import * as React from 'react';
import {findDOMNode} from 'react-dom';
import AppContext from '../AppContext/AppContext';
import ActionCreator, {keys} from '../AppContext/ActionCreator';
import ActionEmitter from '../Flux/ActionEmitter';
import {Action} from '../Flux/Action';

const debug = require('remote').require('debug')('Components:Editor');

interface Props {
    actions: ActionCreator;
    store: AppContext;
    dispatcher: ActionEmitter;
};

type States = {
    text?: string;
    inReplyTo?: string;
    source_id?: string;
};

export default class Editor extends React.Component<Props, States> {
    removeActionListener: Function = () => { };
    removeListenersOnBeforeUnload: Function = () => { };

    constructor(props: Props) {
        super(props);

        this.state = {
            text: '',
            inReplyTo: null,
        };
    }

    subscribe() {
        this.removeActionListener = this.props.dispatcher.onAction(this.onAction.bind(this));

        window.addEventListener('beforeunload', this.unsubscribe.bind(this));
        this.removeListenersOnBeforeUnload = window.removeEventListener.bind(window, 'beforeunload', this.unsubscribe.bind(this));
    }

    unsubscribe() {
        this.removeActionListener();
        this.removeListenersOnBeforeUnload();
    }

    onAction(action: Action) {
        switch (action.type) {
            case keys.replyToStatus: {
                const status_id = action.value.status_id;
                const screen_name = action.value.screen_name;
                this.setState({
                    text: `@${screen_name} ${this.state.text}`,
                    inReplyTo: status_id
                });
            } break;
            case keys.selectTab: {
                const option = action.value.option;
                const source_id = option.source_id;
                if (source_id === this.state.source_id) {
                    break;
                }
                this.setState({
                    text: '',
                    inReplyTo: null,
                    source_id
                });
            } break;
        }
    }

    componentDidMount() {
        this.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    _updateStatus() {
        const status = this.state.text;
        let inReplyTo = this.state.inReplyTo;

        if (inReplyTo && !/^\d+$/.test(inReplyTo)) {
            inReplyTo = null;
        }

        this.props.actions.updateStatus(
            this.props.store.getState().top.source_id,
            status,
            inReplyTo
        );

        this.setState({
            text: '',
            inReplyTo: null
        });
    }

    __onSubmitTweet(event: React.FormEvent) {
        event.preventDefault();
        this._updateStatus();
    }
    _onSubmitTweet = this.__onSubmitTweet.bind(this);

    __onKeyDownTweetArea(event: React.KeyboardEvent) {
        if (((event.metaKey || event.ctrlKey) && event.keyCode === 13)) {
            this._updateStatus();
            return;
        }
    }
    _onKeyDownTweetArea = this.__onKeyDownTweetArea.bind(this);

    __onChangeTweetArea(event: React.FormEvent) {
        const text = (event.target as HTMLInputElement).value;
        this.setState({
            text,
        });
        if (text === '') {
            this.setState({
                inReplyTo: null,
            })
        }
    }
    _onChangeTweetArea = this.__onChangeTweetArea.bind(this);

    render() {
        debug('#render');
        return (
            <form id='tweetForm' onSubmit={this._onSubmitTweet}>
                <textarea
                    id='tweetTextArea'
                    name='tweet'
                    onKeyDown={this._onKeyDownTweetArea}
                    onChange={this._onChangeTweetArea}
                    value={this.state.text}
                    ></textarea>
                <input id='tweetSubmit' type='submit' value='submit'></input>
            </form>
        );
    }
}
