import EventEmitter from '../EventEmitter';
import ActionEmitter from './ActionEmitter';
import {Action} from './Action';
import ReduceStore from './ReduceStore';
import * as assert from 'assert';

export const STORE_GROUPS_CHANGE = `:PRIVATE:STORE:GROUPS:CHANGE:`;
export const DISPATCH_AFTER = `:PRIVATE:STORE:GROUPS:DISPATCH:AFTER:`;
export const DISPATCH_BEFORE = `:PRIVATE:STORE:GROUPS:DISPATCH:BEFORE:`;

abstract class StoreGroup extends EventEmitter {
  protected dispatcher: ActionEmitter;
  protected stores: ReduceStore[];
  protected options: any;
  private remover: Function[];
  private actionListenerRemover: Function;
  private storeReceived: boolean;
  
  constructor(dispatcher: ActionEmitter) {
    super();
    
    this.join(dispatcher);
    this.remover = [];
    this.stores = this.getStores();
    this._setupOnChangeHandler();
    this.storeReceived = this.stores.length !== 0;
  }
  
  getStores(): ReduceStore[] {
    // override me if needed
    return [];
  }
  
  setStores(...stores: ReduceStore[]) {
    assert(!this.storeReceived);
    this.removeAllListeners();
    this.stores = stores;
    this._setupOnChangeHandler();
    this.storeReceived = true;
  }
  
  abstract getState(): any;
  
  join(newDispatcher?: ActionEmitter) {
    if(newDispatcher) this.dispatcher = newDispatcher;
    this.actionListenerRemover = this.dispatcher.onAction(this.dispatch.bind(this));
  }
  
  prune() {
    this.actionListenerRemover();
  }
  
  removeListeners() {
    this.remover.map(fn => fn());
  }
  
  _setupOnChangeHandler() {
    let isChanged = false;
    const onChange = () => {
      isChanged = true;
    };
    const afterChange = () => {
      if(isChanged) {
        this.emitChange();
      }
      isChanged = false;
    };
    for(let store of this.stores) {
      this.remover.push(store.onChange(onChange));
    };
    this.on(DISPATCH_AFTER, () => {
      afterChange();
    });
  }
  
  emitChange() {
    this.emit(STORE_GROUPS_CHANGE);
  }
  
  onChange(onChangeHandler: Function): Function {
    this.on(STORE_GROUPS_CHANGE, onChangeHandler);
    return this.removeListener.bind(this, STORE_GROUPS_CHANGE, onChangeHandler);
  }
  
  purge() {
    this.removeAllListeners(STORE_GROUPS_CHANGE);
  }
  
  dispatch(action: Action) {
    this.emit(DISPATCH_BEFORE);
    for(let store of this.stores) {
      const prevState = store.getState();
      const newState = store.reduce(prevState, action);
      if(store.changed(prevState, newState)) {
        store.setState(newState);
      }
    };
    this.emit(DISPATCH_AFTER);
  }
}

export default StoreGroup;
