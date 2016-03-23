import * as React from 'react';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import HomeTimelineStoreGroup from '../ViewContext/StoreGroups/HomeTimeline';
import UserTimelineStoreGroup from '../ViewContext/StoreGroups/UserTimeline';
import ActionCreator, {ViewType} from '../AppContext/ActionCreator';

import HomeTimeline from './HomeTimeline';
import UserTimeline from './UserTimeline';
import UserProfile from './UserProfile';
import MentionsTimeline from './MentionsTimeline';
// import ListTimeline from './ListTimeline';
// import SearchTimeline from './SearchTimeline';

const debug = require('remote').require('debug')('Components:MainView');

interface Props {
    actions: ActionCreator;
    top: ViewContextStackItem;
};

interface States {
    onTop: boolean;
}

export default class MainView extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = { onTop: true };
    }

    listenerOnScroll: EventListener;

    _setListenerOnScroll() {
        window.removeEventListener('scroll', this.listenerOnScroll);
        let timer: NodeJS.Timer;
        this.listenerOnScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.setState({ onTop: window.scrollY === 0 });
            }, 500);
        };
        window.addEventListener('scroll', this.listenerOnScroll);
    }

    componentDidMount() {
        this._setListenerOnScroll();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.listenerOnScroll);
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({ onTop: window.scrollY === 0 });
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
                        appActions={this.props.actions}
                        freeze={!this.state.onTop}
                        max_status_id={top.max_status_id}
                        min_status_id={top.min_status_id}
                        />
                );
            };
            case ViewType.UserTimeline: {
                return (
                    <UserTimeline
                        id='mainView'
                        {...top}
                        appActions={this.props.actions}
                        freeze={!this.state.onTop}
                        max_status_id={top.max_status_id}
                        min_status_id={top.min_status_id}
                        />
                );
            };
            case ViewType.MentionsTimeline: {
                return (
                    <MentionsTimeline
                        id='mainView'
                        {...top}
                        appActions={this.props.actions}
                        freeze={!this.state.onTop}
                        max_status_id={top.max_status_id}
                        min_status_id={top.min_status_id}
                        />
                );
            };
            case ViewType.UserProfile: {
                return (
                    <UserProfile
                        id='mainView'
                        {...top}
                        appActions={this.props.actions}
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
