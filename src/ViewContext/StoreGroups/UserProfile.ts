import ActionEmitter from '../../Flux/ActionEmitter';
import ReduceStore from '../../Flux/ReduceStore';
import StoreGroup from '../../Flux/StoreGroup';
import ViewInfo from '../ReduceStores/ViewInfo';
import {default as UserProfileStore} from '../ReduceStores/UserProfile';
import {ViewType, ViewOption} from '../../AppContext/ActionCreator';
import {Users} from '../../Models/Tweet';
import TwitterClient from '../../TwitterClient';

export default class UserProfile extends StoreGroup {
    constructor(dispatcher: ActionEmitter, id: string, target_id: string, profile?: Users) {
        super(dispatcher);

        const info = new ViewInfo();
        info.setState({
            type: ViewType.UserProfile,
            source_id: id,
            target_id,
        });

        const user = new UserProfileStore();
        if (profile) {
            user.setState(profile);
        }

        this.setStores(info, user);
    }

    getState(): { type: ViewOption, user: Users } {
        return {
            type: this.stores[0].getState() as ViewOption,
            user: this.stores[1].getState() as Users,
        }
    }
}
