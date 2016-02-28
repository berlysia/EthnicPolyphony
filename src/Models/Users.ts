import {Entity, trimEntity} from './Entity';
import {Tweet} from './Tweet';

export interface Users {
    contributors_enabled: boolean;
    created_at: string;
    default_profile: boolean;
    default_profile_image: boolean;
    description?: string;
    entities: Entity;
    favourites_count: number;
    follow_request_sent?: boolean;
    followers_count: number;
    friends_count: number;
    geo_enabled: boolean;
    id_str: string;
    // is_translator: boolean;
    lang: string;
    listed_count: number;
    location: string;
    name: string;
    profile_background_color: string;
    profile_background_image_url: string;
    profile_background_image_url_https: string;
    profile_background_tile: boolean;
    profile_banner_url: string;
    profile_image_url: string;
    profile_image_url_https: string;
    profile_link_color: string;

    protected: boolean;
    screen_name: string;
    status: Tweet;
    statuses_count: number;
    time_zone?: string;
    url?: string;
    verified: boolean;

}
