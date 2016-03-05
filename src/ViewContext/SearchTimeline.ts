import ActionEmitter from '../Flux/ActionEmitter';
import ReduceStore from '../Flux/ReduceStore';
import BaseTimeline from './BaseTimeline';
import Tweets from './Tweets';
import ViewInfo from './ViewInfo';
import {ViewType, generateViewOptionFromSeed} from '../AppContext/ActionCreator';

export default class SearchTimeline extends BaseTimeline {
    stores: [ViewInfo, Tweets];
    constructor(dispatcher: ActionEmitter, id: string, query: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState(generateViewOptionFromSeed({
            type: ViewType.SearchTimeline,
            source_id: id,
            query,
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
