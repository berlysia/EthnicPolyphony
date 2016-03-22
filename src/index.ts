import {app, ipcMain, BrowserWindow, dialog} from 'electron';
import BrowserWindowWrapper from './BrowserWindowWrapper';
import {dispatcher, actions, store} from './app';
import * as Authentication from './Authentication';
import TwitterClient from './TwitterClient';
import {keys} from './AppContext/ActionCreator';

// initialize electron
const mainPageURL = `file://${__dirname}/../static/index.html`;
const mainWindow = new BrowserWindowWrapper(mainPageURL, {
    width: 900,
    height: 1200,
});
const editorPageURL = `file://${__dirname}/../static/editor.html`;
const editorWindow = new BrowserWindowWrapper(editorPageURL, {
    width: 400,
    height: 80,
});

app.on('ready', () => {
    Authentication.authorized()
        .then(() => Promise.all([Authentication.getCredentials(), Authentication.getAccounts()]))
        .then(data => {
            const credentials = data[0];
            const accounts = data[1];
            accounts.map((account: any) => new TwitterClient(account, credentials));
        })
        .then(() => actions.initialize())
        .then(() => {
            mainWindow.createWindow();
            editorWindow.createWindow();
        })
        .catch(e => {
            console.error(`caught on initialization: ${e}`);
            app.quit();
        });

    // ipcMain.on(IPC_ACTION_KEY, (event: Electron.IPCMainEvent, action: Action) => {
    //   actionEmitter.dispatch(action);
    // });
});

app.on('window-all-closed', function() {
    // nop
});

app.on('activate', function() {
    if (mainWindow.window == null) {
        mainWindow.createWindow();
    }
    if (editorWindow.window == null) {
        editorWindow.createWindow();
    }
});

dispatcher.onAction((action: any) => {
    if (action.type === keys.focusEditor) {
        if (editorWindow.window == null) {
            editorWindow.createWindow();
        }
        editorWindow.window.focus();
    }
})
