import ActionEmitter from '../../Flux/ActionEmitter';
import ReduceStore from '../../Flux/ReduceStore';
import BaseTimeline from './BaseTimeline';
import Tweets from '../ReduceStores/Tweets';
import ViewInfo from '../ReduceStores/ViewInfo';
import {ViewType} from '../../AppContext/ActionCreator';

export default class ListTimeline extends BaseTimeline {
    constructor(dispatcher: ActionEmitter, id: string, list_id: string) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState({
            type: ViewType.ListTimeline,
            source_id: id,
            target_id: list_id,
        });
        this.setStores(info, new Tweets());
    }
}
