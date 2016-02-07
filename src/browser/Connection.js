import Twitter from 'node-twitter-api';
import request from 'request';
import {app as twitterAppCredentials} from 'config';
import {BrowserWindow, ipcMain} from "electron";

const twitter = new Twitter(twitterAppCredentials);
const connections = new Map();
/* 
key: account id(numeric value)
value: <Connection>
*/

export default class Connection {
  constructor(id, accessToken, accessTokenSecret){
    this.id = id;
    this.accessToken = accessToken;
    this.accessTokenSecret = accessTokenSecret;
    connections.set(id, this);
  }
}

Connection.hasConnectionFor = hasConnectionFor;
Connection.connect = connect;
Connection.authenticate = authenticate;
Connection.connections = connections;

function hasConnectionFor(user_id) {
  return connections.has(user_id);
}

function connect(user_id, accessToken, accessTokenSecret) {
  new Connection(user_id, accessToken, accessTokenSecret);
}

function authenticate() { // must be '.catch'ed
  return Promise.resolve()
    .then(getRequestToken)
    .then(getPinCode)
    .then(getAccessToken);
}

function getRequestToken() {
  return new Promise((resolve, reject)=>{
    twitter.getRequestToken((error, requestToken, requestTokenSecret, results) => {
      if (error) {
        console.error(`Error getting OAuth request token : ${error}`);
        return reject(error);
      }
      console.log(`requestToken: ${carry.requestToken}, requestTokenSecret: ${carry.requestTokenSecret}`);

      const carry = {
        requestToken,
        requestTokenSecret,
        results,
      };

      resolve(carry);
    });
  });
}

let pincodeReqCount = 0; // number of pincode request

function getPinCode(carry) {
  return new Promise((resolve, reject)=>{    
    const authUrl = `https://twitter.com/oauth/authenticate?oauth_token=${carry.requestToken}`;
    console.log(`authUrl: ${authUrl}`);

    const authUrlEncoded = encodeURIComponent(authUrl);

    const authWindow = new BrowserWindow({
      width: 1200,
      height: 900
    });

    let done = false; // pincode is given or not
    authWindow.on('closed', () => {
      if(!done){
        reject('ERR_NOPINCODE');
      }
    });

    ++pincodeReqCount;

    authWindow.loadUrl(`file://${__dirname}/../../static/pin.html?seq=${pincodeReqCount}&url=${authUrlEncoded}`);
    
    ipcMain.once(`pincodeinput_${pincodeReqCount}`, pincode => {
      done = true;
      carry.pincode = pincode;

      resolve(carry);
      authWindow.close();
    });
  });
}

function getAccessToken(carry) {
  return new Promise((resolve, reject)=>{
    twitter.getAccessToken(carry.requestToken, carry.requestTokenSecret, carry.pincode, (error, accessToken, accessTokenSecret, results) => {
      if (error) {
        console.error(error);
        return reject(error);
      }
      
      console.log(`accessToken: ${accessToken}, accessTokenSecret: ${accessTokenSecret}, results: ${results}`);
      new Connection(results.id, accessToken, accessTokenSecret);
    });
  });
}

