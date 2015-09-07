import app from 'app';
import BrowserWindow from "browser-window";

global.twitterAppCredentials = {
  "consumer_key": process.env["TWITTER_CONSUMER_KEY"],
  "consumer_secret": process.env["TWITTER_CONSUMER_SECRET"]
};

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
