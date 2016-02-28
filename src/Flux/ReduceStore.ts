import EventEmitter from '../EventEmitter';
import {Action} from './Action';
export const REDUCE_STORE_CHANGE_KEY = ':PRIVATE:REDUCE:STORE:CHANGE:KEY';

abstract class ReduceStore extends EventEmitter {
  protected state: any;
  
  getState() {
    return this.state;
  }
  
  onChange(onChangeHandler: Function): Function {
    this.on(REDUCE_STORE_CHANGE_KEY, onChangeHandler);
    return this.removeListener.bind(this, REDUCE_STORE_CHANGE_KEY, onChangeHandler);
  }
  
  setState(state: any) {
    this.state = state;
    this.emit(REDUCE_STORE_CHANGE_KEY); 
  }
  
  changed(prevState: any, nextState: any): boolean {
    // override me if needed
    return prevState !== nextState;
  }
  
  abstract reduce(state: any, action: Action): any;
}

export default ReduceStore;
