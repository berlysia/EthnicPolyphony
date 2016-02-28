import ReduceStore from '../Flux/ReduceStore';
import StoreGroup, {DISPATCH_AFTER, DISPATCH_BEFORE} from '../Flux/StoreGroup';
import {Action} from '../Flux/Action';
import ViewManager from './ViewManager';

class AppContext extends StoreGroup {
  protected stores: [ViewManager];

  getStores() {
    const vm = new ViewManager();
    vm.setState({tabs: [], stack: []})
    return [vm];
  }

  getState() {
    return {
      tabs: this.stores[0].getTabs(),
      top: this.stores[0].getStackTop(),
    };
  }
  
  getTabs() {
    return this.stores[0].getTabs();
  }
  
  getTop() {
    return this.stores[0].getStackTop();
  }
}

export default AppContext;
