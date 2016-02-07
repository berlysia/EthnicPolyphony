import {app, BrowserWindow} from "electron";

require("crash-reporter").start();

class BrowserTransceiver {
  constructor() {
    this.mainWindow = null;

    let ready;
    this.ready = new Promise(done => ready = done);

    app.on('window-all-closed', () =>{
      if (process.platform != 'darwin'){
        app.quit()
      }
    });

    app.on('activate', ()=>{
      if(!this.mainWindow){
        this.createWindow();
      }
    });

    app.on('ready', ()=>{
      this.createWindow();
      ready();
    });
  }

  createWindow() {
    if(this.mainWindow) {
      return;
    }
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 900,
      show: false
    });

    this.mainWindow.loadUrl(`file://${__dirname}/../../static/index.html`);
    this.mainWindow.show();

    this.mainWindow.on('closed', () => this.mainWindow = null);
  }
}

export default new BrowserTransceiver();
