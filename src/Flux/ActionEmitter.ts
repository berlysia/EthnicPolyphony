import EventEmitter from '../EventEmitter';
import {Action} from './Action';

export const ACTION_KEY = ":PRIVATE:ACTION:KEY:";

export default class ActionEmitter extends EventEmitter {
    onAction(callback: Function): Function {
        this.on(ACTION_KEY, callback);
        return this.removeListener.bind(this, ACTION_KEY, callback);
    }

    dispatch(action: Action) {
        // console.log('dispatch', action.type);
        this.emit(ACTION_KEY, action);
    }
}
