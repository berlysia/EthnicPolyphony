import EventEmitter from '../EventEmitter';
import {Action} from './Action';

const debug = require('debug')('Flux:ActionEmitter');

export const ACTION_KEY = ":PRIVATE:ACTION:KEY:";

export default class ActionEmitter extends EventEmitter {
    onAction(callback: Function): Function {
        this.on(ACTION_KEY, callback);
        return this.removeListener.bind(this, ACTION_KEY, callback);
    }

    dispatch(action: Action) {
        debug('dispatch', action.type);
        this.emit(ACTION_KEY, action);
    }
}
