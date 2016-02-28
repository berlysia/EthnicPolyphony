import ActionEmitter from './Flux/ActionEmitter';
import {Action} from './Flux/Action';

export class AsyncAction {
  private done: string;
  private fail: string;
  private routine: (value: any) => Promise<any>;
  
  constructor(done: string, fail: string, routine: (value: any) => Promise<any>) {
    this.done = done;
    this.fail = fail;
    this.routine = routine;
  }

  execute(value: any): Promise<Action> {
    return this.routine(value).then(result => ({
      type: this.done,
      value: result 
    }), err => Promise.resolve({
      type: this.fail,
      value: err
    }));
  }
};

export default Driver;
abstract class Driver {
  private dispatcher: ActionEmitter;
  protected mapping: Map<string, AsyncAction>;
  
  constructor(dispatcher: ActionEmitter) {
    this.initialize();
    this.mapping = new Map<string, AsyncAction>();
    this.dispatcher = dispatcher;
    this.dispatcher.onAction(this.onAction.bind(this));
    this.setMapping();
  }
  
  abstract initialize(): void;
  abstract setMapping(): void;
  
  onAction(action: Action) {
  	if(this.mapping.has(action.type)) {
      const asyncAction = this.mapping.get(action.type)
      asyncAction.execute(action.value)
        .then(this.dispatcher.dispatch.bind(this.dispatcher))
        .catch(err => console.error(`caught in subtask ${err}`));
    }
  }
}