import ActionEmitter from './ActionEmitter';

export default class ActionCreator {
    protected dispatcher: ActionEmitter;
    constructor(dispatcher: ActionEmitter) {
        this.dispatcher = dispatcher;
    }
}
