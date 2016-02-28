import _ActionCreator from '../Flux/ActionCreator';
import TwitterClient from '../TwitterClient';
import * as Authentication from '../Authentication';
import JSONLoader from '../JSONLoader';
import {view_storage} from '../Constants';

export enum ViewType {
  HomeTimeline,
  UserTimeline,
  SingleTweet,
  ListTimeline,
  SearchTimeline,
};

export const keys = {
  selectTab: 'selectTab',
  createTab: 'createTab',
  deleteTab: 'deleteTab',
  saveTabs: 'saveTabs',
  popStack: 'popStack',
  pushStack: 'pushStack',
  fetchTweet: 'fetchTweet',
  updateStatus: 'updateStatus',
  destroyStatus: 'destroyStatus',
  retweet: 'retweet',
  unretweet: 'unretweet',
  favorite: 'favorite',
  unfavorite: 'unfavorite', 
};

export interface ViewOptionSeed {
  type: ViewType;
  source_id: string;
  target_id?: string;
  query?: string;
}

export interface ViewOption extends ViewOptionSeed {
  key: string;
}

export function generateKey(o: ViewOptionSeed): string {
  return `:VIEWKEY:${o.type}:${o.source_id}:${o.target_id || -1}:${o.query || ''}:`;
}

export function generateViewOption(key: string): ViewOption {
 const matched = key.match(/^:VIEWKEY:([\:]+):([\:]+):([\:]+):(.*):$/)
 const ret: ViewOption = {
   key,
   type: Number(matched[1]),
   source_id: matched[2]
 };
 if(matched[3] !== '-1') {
   ret.target_id = matched[3];
 }
 if(matched[4] && matched[4] !== '') {
   ret.query = matched[4];
 }
 return ret;
}

export function generateViewOptionFromSeed(option: ViewOptionSeed): ViewOption {
  return Object.assign({key: generateKey(option)}, option);
}

// for user action
export default class ActionCreator extends _ActionCreator {
  initialize() {
    return JSONLoader.read(view_storage)
      .catch(()=>Promise.resolve({}))
      .then(data => {
        const tabs = data.tabs;
        if(tabs && tabs.length && tabs.length !== 0) {
          return tabs;
        } else {
          return Authentication.getAccounts()
            .then(accounts => accounts.map(account => ({
              type: ViewType.HomeTimeline,
              source_id: account.id,
            })));
        }
      })
      .then(tabs => {
        tabs.map(this.createTab.bind(this));
        this.selectTab(tabs[0]);
      });
  }
  
  selectTab(option: ViewOptionSeed): void;
  selectTab(option: ViewOption) {
    if(option.key == undefined) {
      option = generateViewOptionFromSeed(option);
    }
    this.dispatcher.dispatch({
      type: keys.selectTab,
      value: {
        option
      }
    })
  }
  
  createTab(option: ViewOptionSeed): void;
  createTab(option: ViewOption) {
    if(option.key == undefined) {
      option = generateViewOptionFromSeed(option);
    }
    this.dispatcher.dispatch({
      type: keys.createTab,
      value: {
        option
      }
    });
    this.saveTabs();
  }
  
  deleteTab(option: ViewOptionSeed): void;
  deleteTab(option: ViewOption) {
    if(option.key == undefined) {
      option = generateViewOptionFromSeed(option);
    }
    this.dispatcher.dispatch({
      type: keys.deleteTab,
      value: {
        option
      }
    });
    this.saveTabs();
  }
  
  saveTabs() {
    this.dispatcher.dispatch({
      type: keys.saveTabs,
      value: null
    })
  }
  
  popStack() {
    this.dispatcher.dispatch({
      type: keys.pushStack,
      value: {}
    })
  }
  
  pushStack(option: ViewOptionSeed): void;
  pushStack(option: ViewOption) {
    if(option.key == undefined) {
      option = generateViewOptionFromSeed(option);
    }
    this.dispatcher.dispatch({
      type: keys.pushStack,
      value: {
        option
      }
    });
  }
  
  fetchTweet(params: any, append?: boolean) {
    this.dispatcher.dispatch({
      type: keys.fetchTweet,
      value: {
        append,
        params,
      },
    });
  }
  
  updateStatus(id: string, status: string, inReplyTo?: string) {
    TwitterClient.byID(id).updateStatus(status, inReplyTo);
  }
  
  destroyStatus(id: string, target_id: string) {
    TwitterClient.byID(id).destroyStatus(target_id);
  }
  
  retweet(id: string, target_id: string) {
    TwitterClient.byID(id).retweet(target_id);
  }
  
  unretweet(id: string, target_id: string) {
    TwitterClient.byID(id).unretweet(target_id);
  }
  
  favorite(id: string, target_id: string) {
    TwitterClient.byID(id).favorite(target_id);
  }
  
  unfavorite(id: string, target_id: string) {
    TwitterClient.byID(id).unfavorite(target_id);
  }
  
  addAccount() {
    Authentication.authenticate()
      .then((data: any) => {
        Authentication.addAccount(data)
          .then(()=> this.createTab({
            type: ViewType.HomeTimeline,
            source_id: <string>data.id,
          }));
      })
  }
}


Object.defineProperty(ActionCreator.prototype, '_selectTab', {
  enumerable: true,
  value: function(...args: any[]) {
    this.selectTab(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_createTab', {
  enumerable: true,
  value: function(...args: any[]) {
    this.createTab(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_deleteTab', {
  enumerable: true,
  value: function(...args: any[]) {
    this.deleteTab(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_saveTabs', {
  enumerable: true,
  value: function(...args: any[]) {
    this.saveTabs(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_popStack', {
  enumerable: true,
  value: function(...args: any[]) {
    this.popStack(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_pushStack', {
  enumerable: true,
  value: function(...args: any[]) {
    this.pushStack(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_fetchTweet', {
  enumerable: true,
  value: function(...args: any[]) {
    this.fetchTweet(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_updateStatus', {
  enumerable: true,
  value: function(...args: any[]) {
    this.updateStatus(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_destroyStatus', {
  enumerable: true,
  value: function(...args: any[]) {
    this.destroyStatus(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_retweet', {
  enumerable: true,
  value: function(...args: any[]) {
    this.retweet(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_unretweet', {
  enumerable: true,
  value: function(...args: any[]) {
    this.unretweet(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_favorite', {
  enumerable: true,
  value: function(...args: any[]) {
    this.favorite(...args);
  }
});
Object.defineProperty(ActionCreator.prototype, '_unfavorite', {
  enumerable: true,
  value: function(...args: any[]) {
    this.unfavorite(...args);
  }
}); 
Object.defineProperty(ActionCreator.prototype, '_addAccount', {
  enumerable: true,
  value: function(...args: any[]) {
    this.addAccount(...args);
  }
}); 

