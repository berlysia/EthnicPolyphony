import * as React from 'react';
import {ViewContextStackItem} from '../AppContext/ViewManager';
import HomeTimelineStoreGroup from '../ViewContext/StoreGroups/HomeTimeline';
import UserTimelineStoreGroup from '../ViewContext/StoreGroups/UserTimeline';
import ActionCreator, {ViewType} from '../AppContext/ActionCreator';
import ViewContextContainer from './ViewContextContainer';

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
        return <ViewContextContainer {...this.props} appActions={this.props.actions} onTop={this.state.onTop} />
    }
}
