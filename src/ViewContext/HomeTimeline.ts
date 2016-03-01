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
}
