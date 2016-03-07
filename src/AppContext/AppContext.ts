import ReduceStore from '../Flux/ReduceStore';
import StoreGroup, {DISPATCH_AFTER, DISPATCH_BEFORE} from '../Flux/StoreGroup';
import {Action} from '../Flux/Action';
import ViewManager from './ViewManager';

class AppContext extends StoreGroup {
    stores: [ViewManager];

    getStores() {
        const vm = new ViewManager();
        vm.setState({ tabs: [], stack: [], current: null });
        return [vm];
    }

    getState() {
        return {
            tabs: this.stores[0].getTabs(),
            top: this.stores[0].getStackTop(),
            current: this.stores[0].getCurrentTab(),
        };
    }

    getTabs() {
        return this.stores[0].getTabs();
    }

    getStack() {
        return this.stores[0].getStack();
    }

    getStackTop() {
        return this.stores[0].getStackTop();
    }

    getCurrentTab() {
        return this.stores[0].getCurrentTab();
    }
}

export default AppContext;
