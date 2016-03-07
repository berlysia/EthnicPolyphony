import ActionEmitter from '../../Flux/ActionEmitter';
import ReduceStore from '../../Flux/ReduceStore';
import BaseTimeline from './BaseTimeline';
import Tweets from '../ReduceStores/Tweets';
import ViewInfo from '../ReduceStores/ViewInfo';
import {ViewType, generateViewOptionFromSeed} from '../../AppContext/ActionCreator';

export default class UserTimeline extends BaseTimeline {
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
}
