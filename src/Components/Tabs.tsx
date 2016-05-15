import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {remote} from 'electron';

import ActionCreator from '../AppContext/ActionCreator';
import {ViewOption, ViewType, equalsViewOption, generateKey} from '../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:Tabs');

export function generateDisplayName(option: ViewOption) {
    const IDSNmap_get = remote.require('../dist/TwitterClient').IDSNmap_get;
    switch (option.type) {
        case ViewType.HomeTimeline: {
            return `${IDSNmap_get(option.source_id)}/Home`;
        }
        case ViewType.MentionsTimeline: {
            return `${IDSNmap_get(option.source_id)}/Replies`;
        }
        case ViewType.UserTimeline: {
            if (option.source_id === option.target_id) {
                return `${IDSNmap_get(option.source_id)}/User/Self`;
            }
            return `${IDSNmap_get(option.source_id)}/User/${option.target_id}`;
        }
        case ViewType.ListTimeline: {
            return `${IDSNmap_get(option.source_id)}/List/`;
        }
        case ViewType.SearchTimeline: {
            return `${IDSNmap_get(option.source_id)}/Search/${option.query}`;
        }
        case ViewType.UserProfile: {
            if (option.source_id === option.target_id) {
                return `${IDSNmap_get(option.source_id)}/Prof/Self`;
            }
            return `${IDSNmap_get(option.source_id)}/Prof/${option.target_id}`;
        }
    }
}

interface TabProps {
    actions: ActionCreator;
    tab: ViewOption;
    currentTab: ViewOption;
    key: string;
}

export class Tab extends React.Component<TabProps, {}> {
    _selectTab() {
        this.props.actions.selectTab(this.props.tab);
    }
    bindedSelectTab = this._selectTab.bind(this);

    render() {
        return (
            <li
                className={equalsViewOption(this.props.currentTab, this.props.tab) ? 'selected' : ''}
                onClick={this.bindedSelectTab}
                >{generateDisplayName(this.props.tab) }</li>
        );
    }
}

interface Props {
    actions: ActionCreator;
    tabs: ViewOption[];
    current: ViewOption;
};

type State = {};

export default class Tabs extends React.Component<Props, State> {

    __createTab() {
        console.warn('not implemented');
    }
    _createTab = this.__createTab.bind(this);

    __addAccount() {
        debug('add account...');
        this.props.actions.addAccount();
    }
    _addAccount = this.__addAccount.bind(this);

    __popStack() {
        debug(`${this.constructor.name}#_popStack`);
        this.props.actions.popStack();
    }
    _popStack = this.__popStack.bind(this);

    render() {
        debug('#render');
        // TODO cutting out tab element as ReactComponent (optimize for onClick) 
        return (
            <ul id='tabs'>
                {this.props.tabs.map(tab => (
                    <Tab key={generateKey(tab) } tab={tab} currentTab={this.props.current} actions={this.props.actions} />
                )) }
                <li onClick={this._createTab }>new Tab...</li>
                <li onClick={this._addAccount }>new Account...</li>
                <li onClick={this._popStack }>back...</li>
            </ul>
        );
    }
}
