import ReduceStore from '../Flux/ReduceStore';
import {Action} from '../Flux/Action';
import {ViewType, ViewOption as State} from '../AppContext/ActionCreator';

export default class TimelineInfo extends ReduceStore {
  reduce(prevState: State, action: Action): State {
    return prevState; // immutable
  }
  
  get key() {
    return this.state.key;
  }
  
  get type() {
    return this.state.type;
  }
  
  get source_id() {
    return this.state.source_id;
  }
  
  get target_id() {
    return this.state.target_id;
  }
  
  get query() {
    return this.state.query;
  }
}