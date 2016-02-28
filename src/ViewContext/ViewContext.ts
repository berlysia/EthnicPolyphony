import StoreGroup from '../Flux/StoreGroup';
import ReduceStore from '../Flux/ReduceStore';
import ViewInfo from './ViewInfo';
import Tweets from './Tweets';

abstract class ViewContext extends StoreGroup {
  stores: [ViewInfo, Tweets];
}
export default ViewContext;
