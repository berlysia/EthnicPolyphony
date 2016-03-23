import * as React from 'react';

import ActionCreator from '../AppContext/ActionCreator';
import AppContext from '../AppContext/AppContext';

import Tabs from './Tabs';
import Editor from './Editor';
import MainView from './MainView';

const debug = require('remote').require('debug')('Components:View');

interface Props {
    actions: ActionCreator;
    store: AppContext;
};

type States = {};

export default class View extends React.Component<Props, States> {
    remover: Function;
    removerOnUnload: Function;

    componentDidMount() {
        this.remover = this.props.store.onChange(() => {
            this.forceUpdate();
        });
        const removerOnUnload = () => { this.remover(); };
        window.addEventListener('beforeunload', removerOnUnload);
        this.removerOnUnload = window.removeEventListener.bind(window, 'beforeunload', removerOnUnload);
    }

    compomentWillUnmount() {
        this.remover();
        this.removerOnUnload();
    }

    render() {
        debug('#render');
        const state = this.props.store.getState();
        // <Editor actions={this.props.actions} store={this.props.store} />
        return (
            <section id='app'>
                <Tabs actions={this.props.actions} tabs={state.tabs} current={state.current}/>
                <MainView actions={this.props.actions} top={state.top} />
            </section>
        );
    }
}
