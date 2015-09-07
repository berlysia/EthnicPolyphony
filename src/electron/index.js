import BrowserWindow from "browser-window";

let window = new BrowserWindow({
  width: 1200,
  height: 900
});

window.loadUrl(`file://${__dirname}/../index.html`);

window.on('closed', () => window = null);
