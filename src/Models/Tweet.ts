export interface MediaSize {
    h: number;
    w: number;
    resize: string; // fit or crop;
}

export type MediaType = 'photo' | 'multi photos' | 'animated gifs' | 'videos';

export interface MediaEntity {
    id_str: string;
    media_url: string;
    url: string;
    display_url: string;
    expanded_url: string;
    sizes: {
        thumb: MediaSize;
        large: MediaSize;
        medium: MediaSize;
        small: MediaSize;
    };
    type: MediaType;
    indices: [number, number];
    video_info: [number, number];
    duration_millis: number;
    variants?: any[];
}

export interface Entities {
    hashtags: {
        text: string;
        indices: [number, number];
    }[];
    media: MediaEntity[];
    urls: {
        display_url: string;
        expanded_url: string;
        indices: [number, number];
    }[];
    user_mentions: {
        id_str: string;
        name: string;
        screen_name: string;
        indices: [number, number];
    }[];
}

export interface Users {
    contributors_enabled: boolean;
    created_at: string;
    default_profile: boolean;
    default_profile_image: boolean;
    description?: string;
    entities: Entities;
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

export interface Tweet {
    deleted?: boolean;

    annotations: any;
    contributors?: any;
    coordinates?: any;
    created_at: string;
    current_user_retweet?: {
        id_str: string;
    };
    entities: Entities;
    extended_entities: {
        media: MediaEntity[];
    };
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

export function greaterByID(a: Tweet, b: Tweet) {
    return a.id_str > b.id_str;
}
