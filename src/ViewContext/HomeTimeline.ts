import ActionEmitter from '../Flux/ActionEmitter';
import ReduceStore from '../Flux/ReduceStore';
import BaseTimeline from './BaseTimeline';
import Tweets from './Tweets';
import ViewInfo from './ViewInfo';
import {ViewType, generateViewOptionFromSeed} from '../AppContext/ActionCreator';

export default class HomeTimeline extends BaseTimeline {
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
