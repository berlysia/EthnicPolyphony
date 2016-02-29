import ActionEmitter from '../Flux/ActionEmitter';
import ReduceStore from '../Flux/ReduceStore';
import ViewContext from './ViewContext';
import Tweets from './Tweets';
import ViewInfo from './ViewInfo';
import {ViewType, generateViewOptionFromSeed} from '../AppContext/ActionCreator';

export function isHomeTimelineStoreGroup(x: ViewContext): x is ViewContext {
    return x.stores[0].type === ViewType.HomeTimeline;
}

export default class HomeTimeline extends ViewContext {
    stores: [ViewInfo, Tweets];

    constructor(dispatcher: ActionEmitter, id: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState(generateViewOptionFromSeed({
            type: ViewType.HomeTimeline,
            source_id: id,
        }));
        this.setStores(info, new Tweets());
    }

    getState() {
        return {
            type: this.stores[0].getState(),
            tweets: this.stores[1].getState(),
        }
    }

    // NOTE these methods are banned by TypeScript Compile  
    // getTweets() {
    //   return this.stores[1].tweets;
    // }  
    // getKey() {
    //   return this.stores[0].y;
    // }  
    // getType() {
    //   return this.store0].type;
    // }  
    // getSourceID() {
    //   return this.stor[0].source_id;
    // }  
    // getTargetID() {
    //   return thistores[0].target_id;
    // }  
    // getQuery() {
    //   return this.stores[0].query;
    // }
}

// for Electron's remote module's bug
Object.defineProperty(HomeTimeline.prototype, 'getState', { enumerable: true });
Object.defineProperty(HomeTimeline.prototype, '_onChange', {
    enumerable: true,
    value: function(listener: Function) {
        return this.onChange(listener);
    }
});
