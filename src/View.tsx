import * as React from 'react';

import ActionCreator from './AppContext/ActionCreator';
import AppContext from './AppContext/AppContext';

import Tabs from './Components/Tabs';
import Editor from './Components/Editor';
import MainView from './Components/MainView';

interface Props {
    actions: ActionCreator;
    store: AppContext;
};

type States = {};

export default class View extends React.Component<Props, States> {
    remover: Function;

    componentDidMount() {
        this.remover = this.props.store.onChange(() => {
            console.log('View#_onChange');
            this.forceUpdate();
        });
    }

    compomentWillUnmount() {
        this.remover();
    }

    render() {
        console.log('View#render');
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
