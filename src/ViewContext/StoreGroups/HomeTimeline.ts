import ActionEmitter from '../../Flux/ActionEmitter';
import ReduceStore from '../../Flux/ReduceStore';
import BaseTimeline from './BaseTimeline';
import Tweets from '../ReduceStores/Tweets';
import ViewInfo from '../ReduceStores/ViewInfo';
import {ViewType, generateViewOptionFromSeed} from '../../AppContext/ActionCreator';

export default class HomeTimeline extends BaseTimeline {
    constructor(dispatcher: ActionEmitter, id: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState(generateViewOptionFromSeed({
            type: ViewType.HomeTimeline,
            source_id: id,
        }));
        this.setStores(info, new Tweets());
    }
}
