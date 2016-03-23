import StoreGroup, {StoreCollection} from '../../Flux/StoreGroup';
import ReduceStore from '../../Flux/ReduceStore';
import {ViewOption} from '../../AppContext/ActionCreator';
import {Tweet} from '../../Models/Tweet';
import Tweets from '../ReduceStores/Tweets';

abstract class BaseTimeline extends StoreGroup {
    getState(): { type: ViewOption, tweets: Tweet[] } {
        return {
            type: this.stores[0].getState() as ViewOption,
            tweets: this.stores[1].getState() as Tweet[],
        }
    }
}
export default BaseTimeline;
