import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {remote} from 'electron';

import ActionCreator from '../AppContext/ActionCreator';
import {ViewOption, ViewType} from '../AppContext/ActionCreator';

interface Props {
    actions: ActionCreator;
    tabs: ViewOption[];
};

type States = {};

export function generateDisplayName(option: ViewOption) {
    console.log('generateDisplayName');

    const IDSNmap_get = remote.require('../dist/TwitterClient').IDSNmap_get;
    switch (option.type) {
        case ViewType.HomeTimeline: {
            return `@${IDSNmap_get(option.source_id)}/Home`;
        }
        case ViewType.UserTimeline: {
            if (option.source_id === option.target_id) {
                return `@${IDSNmap_get(option.source_id)}/User/Self`;
            }
            return `@${IDSNmap_get(option.source_id)}/User/${option.target_id}`;
        }
        case ViewType.ListTimeline: {
            return `@${IDSNmap_get(option.source_id)}/List/`;
        }
        case ViewType.SearchTimeline: {
            return `@${IDSNmap_get(option.source_id)}/Search/${option.query}`;
        }
    }
}

export default class Tabs extends React.Component<Props, States> {
    _selectTab(option: any) {
        (this.props.actions as any)._selectTab(option);
    }

    _createTab() {
        console.warn('not implemented');
    }

    _addAccount() {
        (this.props.actions as any)._addAccount();
    }

    render() {
        console.log('Tabs#render', this.props.tabs);
        return (
            <ul id='tabs'>
                {this.props.tabs.map(tab => {
                    return <li key={tab.key} onClick={() => this._selectTab(tab) }>{generateDisplayName(tab) }</li>
                }) }
                <li onClick={this._createTab.bind(this) }>new Tab...</li>
                <li onClick={this._addAccount.bind(this) }>new Account...</li>
            </ul>
        );
    }
}
