import app from 'app';
import BrowserWindow from "browser-window";

app.on('window-all-closed', () =>{
  if (process.platform != 'darwin')
    app.quit()
});

app.on('ready', () => {
  let window = new BrowserWindow({
    width: 1200,
    height: 900
  });

  window.loadUrl(`file://${__dirname}/../index.html`);

  window.on('closed', () => window = null);
});
