import ReduceStore from '../../Flux/ReduceStore';
import {Action} from '../../Flux/Action';
import {Users as UserModel} from '../../Models/Tweet';
import {keys} from '../ActionCreator';

interface State extends UserModel {

};

export default class UserProfile extends ReduceStore {
    state: State;

    constructor(state?: State) {
        super();
        if (state) {
            this.state = state;
        }
    }

    reduce(prevState: State, action: Action): State {
        switch (action.type) {
            case keys.receiveProfile: {
                const nextState = action.value;
                return nextState;
            }

            default: {
                return prevState;
            }
        }
    }

    changed(prevState: State, nextState: State) {
        return prevState !== nextState;
    }

}
