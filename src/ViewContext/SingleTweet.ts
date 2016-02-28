import ActionEmitter from '../Flux/ActionEmitter';
import ReduceStore from '../Flux/ReduceStore';
import ViewContext from './ViewContext';
import Tweets from './Tweets';
import ViewInfo from './ViewInfo';
import {ViewType, generateViewOptionFromSeed} from '../AppContext/ActionCreator';

export default class SingleTweet extends ViewContext {
    stores: [ViewInfo, Tweets];
    constructor(dispatcher: ActionEmitter, id: string, status_id: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState(generateViewOptionFromSeed({
            type: ViewType.SingleTweet,
            source_id: id,
            target_id: status_id,
        }));
        this.setStores(info, new Tweets());
    }

    getState() {
        return {
            tweets: this.stores[1].getState(),
            type: this.stores[0].getState(),
        }
    }
}

// for Electron's remote module's bug
Object.defineProperty(SingleTweet.prototype, 'getState', { enumerable: true });
