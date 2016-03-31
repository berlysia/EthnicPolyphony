import {Tweet} from './Models/Tweet';
const debug = require('debug')('TweetStorage');

export function getTweet(source_id: string, status_id: string): Tweet {
    const storage = TweetStorage.byID(source_id);
    if(storage) {
        if(storage.has(status_id)) {
            return storage.get(status_id);
        }
        return null;
    }
    return null;
}

export default class TweetStorage {
  static _account_map = new Map<string, TweetStorage>();
  private _map = new Map<string, Tweet>();
  private source_id: string;
  
  static byID(source_id: string) {
    return TweetStorage._account_map.get(source_id);
  }
  
  constructor(source_id: string) {
    this.source_id = source_id;
    TweetStorage._account_map.set(this.source_id, this);
  }
  
  has(status_id: string): boolean {
    return this._map.has(status_id);
  }
  
  get(status_id: string): Tweet {
    if(this._map.has(status_id)) {
      return this._map.get(status_id);
    } else {
      return null;
    }
  }
  
  set(status_id: string, tweet: Tweet): void {
    this._map.set(status_id, tweet);
  }
  
  delete(status_id: string): boolean {
    debug('#delete', status_id, this._map.has(status_id));
    if(this._map.has(status_id)) {
      const tw = this._map.get(status_id);
      tw.deleted = true;
      this._map.set(status_id, tw);
      return true;
    }
    return false;
  }
}
