import {BrowserWindow} from "electron";
import * as mapIterator from 'map-iterator';
// import StoreGroup from './Flux/StoreGroup';
// import ActionEmitter from './Flux/ActionEmitter';
import {Action} from './Flux/Action';

export default class BrowserWindowWrapper {
  private _window: Electron.BrowserWindow;
  // private storeGroups: Map<string, StoreGroup>;
  // private removeListeners: Function[];
 
  constructor(private url: string, private options: Electron.BrowserWindowOptions) {
    this._window = null;
    // this.storeGroups = new Map();
    // this.removeListeners = [];
  }
  
  get window() {
    return this._window;
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
    // this.subscribe();

    this._window.loadURL(url);
    this._window.show();

    this._window.on('closed', () => {
      // this.removeListener();
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
