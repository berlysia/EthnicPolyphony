export default class EventEmitter {
    _listeners: { [event: string]: Function[] } = {};

    listeners(event: string) {
        if (!this._listeners[event]) this._listeners[event] = [];
        return this._listeners[event];
    }

    on(event: string, listener: Function) {
        this.listeners(event).push(listener);
    }

    once(event: string, listener: Function) {
        let remover: Function;
        const wrapped = (...args: any[]) => {
            remover();
            return listener(...args);
        }
        (wrapped as any).originial = listener;
        remover = this.removeListener.bind(this, event, wrapped);
    }

    off = this.removeListener;

    removeListener(event: string, listener: Function) {
        const listeners = this.listeners(event);
        if (!listeners) return;

        for (let i = 0, l = listeners.length; i < l; ++i) {
            const fn = listeners[i];
            if (fn === listener || fn === (listener as any).original) {
                this.listeners(event).splice(i, 1);
                break;
            }
        }
    }
    removeAllListeners(event?: string) {
        if (event) {
            this._listeners[event] = [];
        } else {
            this._listeners = {};
        }
    }
    emit(event: string, ...args: any[]) {
        const results = this.listeners(event).map(fn => fn(...args));
        return Promise.all(results);
    }
}
