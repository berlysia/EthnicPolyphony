declare module Twitter {
  interface Option {
    consumer_key: string,
    consumer_secret: string,
    access_token_key: string,
    access_token_secret: string,
    request_options?: any,
  }
  
  export class Twitter {
    constructor(options: Option);
    get(path: string, param: any, callback: (error: Error, data: any, response: any) => any): void;
    get(path: string, callback: (error: Error, data: any, response: any) => any): void;
    post(path: string, param: any, callback: (error: Error, data: any, response: any) => any): void;
    post(path: string, callback: (error: Error, data: any, response: any) => any): void;
    stream(path: string, param: any, callback: (stream: any) => any): void;
    stream(path: string, callback: (stream: any) => any): void;
  }
}

declare module "twitter" {
  var tw: typeof Twitter.Twitter;
  export = tw;
}