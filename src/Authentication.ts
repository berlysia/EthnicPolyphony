import * as NodeTwitterAPI from 'node-twitter-api';
import JSONLoader from './JSONLoader';
import {BrowserWindow} from "electron";
import {account_storage, credential_storage} from './Constants';

const debug = require('debug')('Authentication');

export function authorized(): Promise<any> {
    return new Promise((resolve, reject) => {
        defaultAccount()
            .then(account => {
                if (account && account['accessToken']) {
                    resolve();
                    return;
                }

                return authenticate()
                    .then(addAccount)
                    .then(resolve);
            })
            .catch(reject)
    });
}

export function getCredentials(): Promise<any> {
    return JSONLoader.read(credential_storage)
        .then((data: any) => new Promise((resolve, reject) => {
            if (data['consumerKey'] === 'YOUR CONSUMER KEY'
                || data['consumerSecret'] === 'YOUR CONSUMER SECRET') {
                return reject(new Error('put your consumer key/secret into resources/credentials.json'));
            }
            resolve(data);
        }));
}

export function getAccounts(): Promise<any[]> {
    return JSONLoader.read(account_storage)
        .catch(() => Promise.resolve([]));
}

export function defaultAccount() {
    return getAccounts()
        .then((list: any[]) => list[0])
}

export function addAccount(account: {
    screenName: string,
    id: string,
    accessToken: string,
    accessTokenSecret: string
}) {
    return getAccounts()
        .then(data => {
            data.push(account);
            return JSONLoader.write(account_storage, data);
        });
}

export function uniquifyAccounts(accounts: any[]) {
    const map = new Map<string, any>();
    for (let item of accounts) {
        if (map.has(item['screenName'])) {
            continue;
        }
        map.set(item['screenName'], item);
    }
    return JSONLoader.write(account_storage, Array.from(map.values()));
}

export function getAccountByScreenName(screenName: string) {
    return getAccounts().then((list: any[]) => {
        for (let item of list) {
            if (item['screenName'] === screenName) {
                return item;
            }
        }
        return {};
    });
}

// this algorithm is derived from k0kubun/Nocturn
export function authenticate() {
    return getCredentials()
        .then(credentials => new Promise((resolve, reject) => {
            const auther = new NodeTwitterAPI({
                callback: 'http://example.com',
                consumerKey: credentials['consumerKey'],
                consumerSecret: credentials['consumerSecret']
            });

            auther.getRequestToken((err, requestToken, requestTokenSecret) => {
                if (err) {
                    console.error('#authenticate: error on getRequestToken', err);
                    return;
                }
                // console.log(`requestToken: ${requestToken}, requestTokenSecret: ${requestTokenSecret}`)
                const authUrl = auther.getAuthUrl(requestToken);
                // console.log(`authUrl: ${authUrl}`);
                let authWindow = new BrowserWindow({
                    width: 800,
                    height: 600,
                    webPreferences: {
                        nodeIntegration: false,
                    }
                });

                authWindow.webContents.on('will-navigate', (event: any, url: string) => {
                    const matched = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/);
                    if (matched) {
                        event.preventDefault();
                        auther.getAccessToken(requestToken, requestTokenSecret, matched[2], (err, accessToken, accessTokenSecret) => {
                            if (err) {
                                console.error('error on getAccessToken:', err);
                                resolve(authenticate()); // retry
                                authWindow.close();
                                return; // dont 'return resolve(...)' 
                            }

                            const token: any = {
                                accessToken,
                                accessTokenSecret
                            };

                            auther.verifyCredentials(accessToken, accessTokenSecret, {}, (err, data, response) => {
                                token['id'] = data['id_str'];
                                token['screenName'] = data['screen_name'];

                                resolve(token); // authentication is done!

                                if (authWindow) {
                                    authWindow.close();
                                }
                            });
                        })
                    } else if (url.match(/\/accout\/login_verification/)) {

                    } else if (url.match(/\/oauth\/authenticate/)) {

                    } else {
                        event.preventDefault();

                        debug(`#authenticate: else clause`, url);
                        resolve(authenticate());
                        authWindow.close();
                        return;
                    }
                });

                authWindow.on('closed', () => {
                    authWindow = null;
                    reject();
                });

                authWindow.loadURL(`${authUrl}&force_login=true`);
            });
        }));
}
