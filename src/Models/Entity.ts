interface MediaSize {
  h: number;
  w: number;
  resize: string; // fit or crop;
}

function trimMediaSize(object: any): MediaSize {
  return {
    h: object.h,
    w: object.w,
    resize: object.resize,
  };
}

export interface Entity {
  hashtags: {
    [index: number]: {
      text: string;
    }
  }
  media: {
    [index: number]: {
      id_str: string;
      type: string;
      display_url: string;
      expanded_url: string;
      media_url: string;
      sizes: {
        thumb: MediaSize;
        large: MediaSize;
        medium: MediaSize;
        small: MediaSize;
      }
    }
  }
  urls: {
    [index: number]: {
      display_url: string;
      expanded_url: string;
    }
  };
  user_mentions: {
    [index: number]: {
      id_str: string;
      name: string;
      screen_name: string;
    }
  }
}

export function trimEntity(object: any): Entity {
  const entity: Entity = {
    hashtags: [],
    media: [],
    urls: [],
    user_mentions: []
  }
  
  if(object.hashtags != null) {
    for(let i = 0, l = object.hashtags.length; i < l; ++i) {
      entity.hashtags[i].text = object.hashtags[i].text;
    }
  }
  if(object.media != null) {
    for(let i = 0, l = object.media.length; i < l; ++i) {
      entity.media[i].id_str = object.media[i].id_str;
      entity.media[i].type = object.media[i].type;
      entity.media[i].display_url = object.media[i].display_url;
      entity.media[i].expanded_url = object.media[i].expanded_url;
      entity.media[i].media_url = object.media[i].media_url;
      if(entity.media[i].sizes != null){
        entity.media[i].sizes = {
          thumb: trimMediaSize(object.media[i].sizes.thumb),
          large: trimMediaSize(object.media[i].sizes.large),
          small: trimMediaSize(object.media[i].sizes.small),
          medium: trimMediaSize(object.media[i].sizes.medium),
        }
      }
    }
  }
  if(object.urls != null) {
    for(let i = 0, l = object.urls.length; i < l; ++i) {
      entity.urls[i].display_url = object.urls[i].display_url;
      entity.urls[i].expanded_url = object.urls[i].expanded_url;
    }
  }
  if(object.user_mentions != null) {
    for(let i = 0, l = object.user_mentions.length; i < l; ++i) {
      entity.user_mentions[i].id_str = object.user_mentions[i].id_str;
      entity.user_mentions[i].name = object.user_mentions[i].name;
      entity.user_mentions[i].screen_name = object.user_mentions[i].screen_name;
    }
  }
  
  return entity;
}