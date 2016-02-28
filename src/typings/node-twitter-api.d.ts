declare module TwitterAuth {
    interface Options {
        consumerKey: string,
        consumerSecret: string,
        callback: string
    }

    export class Authenticator {
        constructor(options: Options);
        getRequestToken(callback: (err: Error, requestToken: string, requestTokenSecret: string, results: any) => void): any;
        getAuthUrl(requestToken: string): string;
        getAccessToken(requestToken: string, requestTokenSecret: string, pincode: string, callback: (err: Error, accessToken: string, accessTokenSecret: string, results: any) => void): any;
        verifyCredentials(accessToken: string, accessTokenSecret: string, params: any, callback: (err: Error, data: any, response: any) => void): any;
    }
}

declare module "node-twitter-api" {
    var tw: typeof TwitterAuth.Authenticator;
    export = tw;
}
