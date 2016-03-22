import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {remote} from 'electron';

import ActionCreator from '../AppContext/ActionCreator';
import {ViewOption, ViewType} from '../AppContext/ActionCreator';

const debug = require('remote').require('debug')('Components:Tabs');

export function generateDisplayName(option: ViewOption) {
    const IDSNmap_get = remote.require('../dist/TwitterClient').IDSNmap_get;
    switch (option.type) {
        case ViewType.HomeTimeline: {
            return `${IDSNmap_get(option.source_id)}/Home`;
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
    currentKey: string;
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
                className={(this.props.currentKey === this.props.tab.key) ? 'selected' : ''}
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

type States = {};

export default class Tabs extends React.Component<Props, States> {

    _createTab() {
        console.warn('not implemented');
    }
    bindedCreateTab = this._createTab.bind(this);

    _addAccount() {
        debug('add account...');
        this.props.actions.addAccount();
    }
    bindedAddAccount = this._addAccount.bind(this);

    render() {
        debug('#render', this.props.tabs);
        // TODO cutting out tab element as ReactComponent (optimize for onClick) 
        return (
            <ul id='tabs'>
                {this.props.tabs.map(tab => (
                    <Tab key={tab.key} tab={tab} currentKey={this.props.current.key} actions={this.props.actions} />
                )) }
                <li onClick={this.bindedCreateTab }>new Tab...</li>
                <li onClick={this.bindedAddAccount }>new Account...</li>
            </ul>
        );
    }
}
