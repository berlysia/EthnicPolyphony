import {BrowserWindow} from "electron";
import {Action} from './Flux/Action';

export default class BrowserWindowWrapper {
  private _window: Electron.BrowserWindow;
  listeners: {[key: string]: Function[]};
 
  constructor(private url: string, private options: Electron.BrowserWindowOptions) {
    this._window = null;
    this.listeners = {};
  }
  
  get window() {
    return this._window;
  }
  
  on(channel: string, listener: Function) {
    if(this._window) {
      this._window.on(channel, listener);
    }
    this.listeners[channel] = this.listeners[channel] || [];
    this.listeners[channel].push(listener);
  }

  createWindow(url?: string) {
    if(this._window) {
      return;
    }
    
    if(!url){
      url = this.url;
    }
    
    // create window
    this._window = new BrowserWindow(this.options);
    
    Object.keys(this.listeners).forEach(key => {
      this.listeners[key].forEach(fn => {
        this._window.on(key, fn);
      })
    });

    this._window.loadURL(url);
    this._window.show();

    this._window.on('closed', () => {
      this._window = null;
    });
  }
  
  // removeListener() {
  //   this.removeListeners.map(remover => remover());
  // }
  
  // setStoreGroups(storeGroups: Map<string, StoreGroup>) {
  //   this.storeGroups = storeGroups;
  //   this.subscribe();
  // }
  
  // subscribe() {
  //   this.removeListener();
  //   this.removeListeners = mapIterator(this.storeGroups.entries(), ([key, sg]: [string, StoreGroup]) => 
  //     sg.onChange(() => {
  //       this._window.webContents.send(`${IPC_CHANGE_PREFIX}${key}`);
  //     }));
  // }
}
