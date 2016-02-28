import {Entity, trimEntity} from './Entity';
import {Users} from './Users';

export interface Tweet {
  // annotations: any;
  contributors?: any;
  coordinates?: any;
  created_at: string;
  current_user_retweet?: {
    id_str: string;
  };
  entities: Entity;
  favorite_count?: number;
  favorited?: boolean;
  id_str: string;
  in_reply_to_screen_name?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  lang?: string;
  place?: {};
  possibly_sensitive?: boolean;
  quoted_status_id_str?: string;  
  quoted_status?: Tweet;
  scopes: {};
  retweet_count: number;
  retweeted?: boolean;
  retweeted_status?: Tweet;
  source: string;
  text: string;
  truncated: boolean;
  user: Users;
};
