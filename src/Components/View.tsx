import * as React from 'react';

import ActionCreator from '../AppContext/ActionCreator';
import AppContext from '../AppContext/AppContext';

import Tabs from './Tabs';
import Editor from './Editor';
import MainView from './MainView';

interface Props {
    actions: ActionCreator;
    store: AppContext;
};

type States = {};

export default class View extends React.Component<Props, States> {
    remover: Function;

    componentDidMount() {
        this.remover = this.props.store.onChange(() => {
            this.forceUpdate();
        });
    }

    compomentWillUnmount() {
        this.remover();
    }

    render() {
        const state = this.props.store.getState();
        return (
            <section id='app'>
                <Tabs actions={this.props.actions} tabs={state.tabs} />
                <Editor actions={this.props.actions} stores={state.top} />
                <MainView actions={this.props.actions} stores={state.top} />
            </section>
        );
    }
}
