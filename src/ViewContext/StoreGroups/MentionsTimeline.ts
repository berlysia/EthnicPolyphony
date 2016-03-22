import ActionEmitter from '../../Flux/ActionEmitter';
import ReduceStore from '../../Flux/ReduceStore';
import BaseTimeline from './BaseTimeline';
import Tweets from '../ReduceStores/Tweets';
import ViewInfo from '../ReduceStores/ViewInfo';
import {ViewType} from '../../AppContext/ActionCreator';

export default class MentionTimeline extends BaseTimeline {
    constructor(dispatcher: ActionEmitter, id: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState({
            type: ViewType.MentionsTimeline,
            source_id: id,
        });
        this.setStores(info, new Tweets());
    }
}
