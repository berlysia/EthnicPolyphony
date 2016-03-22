import ActionEmitter from '../../Flux/ActionEmitter';
import ReduceStore from '../../Flux/ReduceStore';
import BaseTimeline from './BaseTimeline';
import Tweets from '../ReduceStores/Tweets';
import ViewInfo from '../ReduceStores/ViewInfo';
import {ViewType} from '../../AppContext/ActionCreator';

export default class SingleTweet extends BaseTimeline {
    constructor(dispatcher: ActionEmitter, id: string, status_id: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState({
            type: ViewType.SingleTweet,
            source_id: id,
            target_id: status_id,
        });
        this.setStores(info, new Tweets());
    }
}
