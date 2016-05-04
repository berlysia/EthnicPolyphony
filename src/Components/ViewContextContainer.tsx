import * as React from 'react';
import ActionCreator, {ViewType} from '../AppContext/ActionCreator';
import {ViewContextStackItem} from '../AppContext/ViewManager';

import HomeTimeline from './HomeTimeline';
import UserTimeline from './UserTimeline';
import UserProfile from './UserProfile';
import MentionsTimeline from './MentionsTimeline';
import SingleTweet from './SingleTweet';
// import ListTimeline from './ListTimeline';
// import SearchTimeline from './SearchTimeline';

const debug = require('remote').require('debug')('Components:ViewContextContainer');

interface Props {
    appActions: ActionCreator;
    top: ViewContextStackItem;
    onTop: boolean;
};

export default class ViewContextContainer extends React.Component<Props, any> {
    remover: Function;
    removerOnUnload: Function;
    bindedForceUpdate: Function = this.forceUpdate.bind(this);

    _listenChange() {
        debug('#_listenChange');
        this.remover = this.props.top.store.onChange(this.bindedForceUpdate);

        window.addEventListener('beforeunload', this.bindedUnlistenChange as any);
        this.removerOnUnload = window.removeEventListener.bind(window, 'beforeunload', this.bindedUnlistenChange);
    }

    _unlistenChange() {
        debug('#_unlistenChange');
        this.remover();
        this.removerOnUnload();
    }
    bindedUnlistenChange: Function = this._unlistenChange.bind(this);

    componentDidMount() {
        this._listenChange();
    }

    componentWillUnmount() {
        this._unlistenChange();
    }

    componentWillUpdate(nextProps: Props, nextState: any) {
        if (this.props.top.store !== nextProps.top.store) {
            this._unlistenChange();
        }
    }

    componentDidUpdate(nextProps: Props, nextState: any) {
        if (this.props.top.store !== nextProps.top.store) {
            this._listenChange();
        }
    }

    render() {
        debug(`#render - type: ${this.props.top.type}`);
        let view: any = null;
        const top = this.props.top;

        switch (top.type) {
            case ViewType.HomeTimeline: {
                return (
                    <HomeTimeline
                        id='mainView'
                        {...top}
                        {...top.store.getState() }
                        appActions={this.props.appActions}
                        freeze={!this.props.onTop}
                        />
                );
            };
            case ViewType.UserTimeline: {
                return (
                    <UserTimeline
                        id='mainView'
                        {...top}
                        {...top.store.getState() }
                        appActions={this.props.appActions}
                        freeze={!this.props.onTop}
                        />
                );
            };
            case ViewType.MentionsTimeline: {
                return (
                    <MentionsTimeline
                        id='mainView'
                        {...top}
                        {...top.store.getState() }
                        appActions={this.props.appActions}
                        freeze={!this.props.onTop}
                        />
                );
            };
            case ViewType.UserProfile: {
                return (
                    <UserProfile
                        id='mainView'
                        {...top}
                        {...top.store.getState() }
                        appActions={this.props.appActions}
                        />
                );
            };
            case ViewType.SingleTweet: {
                return (
                    <SingleTweet
                        id='mainView'
                        appActions={this.props.appActions}
                        {...top}
                        />
                );
            };
            // case ViewType.ListTimeline: {
            //   view = <ListTimeline
            //     source_id={top.source_id}
            //     target_id={top.target_id}
            //     store={top.store}
            //     actions={top.actions}
            //     appActions={this.props.actions}
            //   />;
            // } break;
            // case ViewType.SearchTimeline: {
            //   view = <SearchTimeline
            //     source_id={top.source_id}
            //     query={top.query}
            //     store={top.store}
            //     actions={top.actions}
            //     appActions={this.props.actions}
            //   />;
            // } break;
        }
    }
}
