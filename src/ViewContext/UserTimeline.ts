import ActionEmitter from '../Flux/ActionEmitter';
import ReduceStore from '../Flux/ReduceStore';
import ViewContext from './ViewContext';
import Tweets from './Tweets';
import ViewInfo from './ViewInfo';
import {ViewType, generateViewOptionFromSeed} from '../AppContext/ActionCreator';

export default class UserTimeline extends ViewContext {
    stores: [ViewInfo, Tweets];
    constructor(dispatcher: ActionEmitter, id: string, user_id: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState(generateViewOptionFromSeed({
            type: ViewType.UserTimeline,
            source_id: id,
            target_id: user_id,
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
