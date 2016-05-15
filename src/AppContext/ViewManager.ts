import ReduceStore from '../Flux/ReduceStore';
// import BaseTimelineStoreGroup from '../ViewContext/StoreGroups/BaseTimeline';
import StoreGroup from '../Flux/StoreGroup';
import ActionEmitter from '../Flux/ActionEmitter';
import ActionCreator, {
    ViewType,
    keys,
    ViewOption,
    generateKey,
    equalsViewOption
} from './ActionCreator';
import {Action} from '../Flux/Action';
import JSONLoader from '../JSONLoader';
import {view_storage} from '../Constants';

// for pushStack
import {default as ViewActionCreator} from '../ViewContext/ActionCreator';
import HomeTimeline from '../ViewContext/StoreGroups/HomeTimeline';
import MentionsTimeline from '../ViewContext/StoreGroups/MentionsTimeline';
import ListTimeline from '../ViewContext/StoreGroups/ListTimeline';
import UserTimeline from '../ViewContext/StoreGroups/UserTimeline';
import UserProfile from '../ViewContext/StoreGroups/UserProfile';
import SearchTimeline from '../ViewContext/StoreGroups/SearchTimeline';

const debug = require('debug')('AppContext:ViewManager');

export interface ViewContextStackItem extends ViewOption {
    store: StoreGroup;
    actions: ViewActionCreator;
    temporary: boolean;
}

interface State {
    current: ViewOption;
    tabs: ViewOption[];
    stack: ViewContextStackItem[];
}
type key = string;

export function generateStackItem(option: ViewOption, temporary?: boolean): ViewContextStackItem {
    debug('generateStackItem', JSON.stringify(option));
    const dispatcher = new ActionEmitter();
    const actions = new ViewActionCreator(dispatcher);
    let store: StoreGroup;
    switch (option.type) {
        case ViewType.SingleTweet: {
            // stateless
            return Object.assign({
                store: null,
                actions: null,
                temporary: !!temporary,
            }, option);
        }

        case ViewType.HomeTimeline: {
            store = new HomeTimeline(dispatcher, option.source_id);
            actions.connectUserStream(option.source_id);
        } break;

        case ViewType.MentionsTimeline: {
            store = new MentionsTimeline(dispatcher, option.source_id);
        } break;

        case ViewType.UserTimeline: {
            store = new UserTimeline(dispatcher, option.source_id, option.target_id);
        } break;

        case ViewType.UserProfile: {
            store = new UserProfile(dispatcher, option.source_id, option.target_id, option.user);
            if (!option.user) {
                actions.fetchUserProfile(option.source_id, option.target_id);
            }
        } break;

        case ViewType.ListTimeline: {
            store = new ListTimeline(dispatcher, option.source_id, option.target_id);
        } break;

        case ViewType.SearchTimeline: {
            store = new SearchTimeline(dispatcher, option.source_id, option.query);
        } break;

        default: {
            console.error(`unknown ViewType: ${option.type}`);
            return null;
        }
    }
    return Object.assign({
        store,
        actions,
        temporary: !!temporary,
    }, option);
}

export const permanentContext = new Map<key, ViewContextStackItem>();
export const temporaryContext = new Map<key, ViewContextStackItem>();

export default class ViewManager extends ReduceStore {
    getTabs(): ViewOption[] {
        return this.state.tabs;
    }

    getStack() {
        return this.state.stack;
    }

    getStackTop(): ViewContextStackItem {
        if (this.state.stack.length === 0) {
            return null;
        }

        return this.state.stack[0];
    }

    getCurrentTab(): ViewOption {
        return this.state.current;
    }

    getStackTopStore(): StoreGroup {
        const tmp = this.getStackTop();
        if (!tmp) {
            return null;
        }
        return tmp.store;
    }

    reduce(prevState: State, action: Action): State {
        debug(`#reduce type:${action.type}`);
        switch (action.type) {
            case keys.fetchTweet: {
                // value: {append: boolean, param        
                const top = prevState.stack[0];
                switch (top.type) {
                    case ViewType.HomeTimeline: {
                        top.actions.fetchHomeTimeline(top.source_id, action.value.params, action.value.append);
                    } break;

                    case ViewType.MentionsTimeline: {
                        top.actions.fetchMentionsTimeline(top.source_id, action.value.params, action.value.append);
                    } break;

                    case ViewType.ListTimeline: {
                        top.actions.fetchListTimeline(top.source_id, top.target_id, action.value.params, action.value.append);
                    } break;

                    case ViewType.SearchTimeline: {
                        top.actions.fetchSearchTimeline(top.source_id, top.query, action.value.params, action.value.append);
                    } break;

                    case ViewType.UserTimeline: {
                        top.actions.fetchUserTimelineByID(top.source_id, top.target_id, action.value.params, action.value.append);
                    } break;

                    case ViewType.SingleTweet: {
                        // TODO define operation flow of SingleTweet
                    } break;

                    default: {
                        console.error(`unknown ViewType: ${top.type}`);
                    }
                }

                return prevState;
            }

            case keys.fetchProfile: {
                const top = prevState.stack[0];
                if (top.type === ViewType.UserProfile) {
                    top.actions.fetchUserProfile(action.value.source_id, action.value.target_id);
                }

                return prevState;
            }

            case keys.selectTab: {
                // value: {option: ViewOption}
                const option: ViewOption = action.value.option;
                const key: string = generateKey(option);
                const item: ViewContextStackItem = permanentContext.get(key);

                const nextState = Object.assign({}, prevState, {
                    stack: [item],
                    current: item
                });

                return nextState;
            }

            case keys.createTab: {
                // value: {option: ViewOption}
                const option: ViewOption = action.value.option;
                const key: string = generateKey(option);


                if (!permanentContext.has(key)) {
                    const item = generateStackItem(option);
                    permanentContext.set(key, item);
                }

                const nextState = Object.assign({}, prevState, {
                    tabs: [...prevState.tabs, option],
                });

                return nextState;
            }

            case keys.deleteTab: {
                // value: {option: ViewOption}
                const option: ViewOption = action.value.option;
                const key: string = generateKey(option);

                const tabs = prevState.tabs.filter(x => !equalsViewOption(x, option));

                if (equalsViewOption(option, prevState.current)) {
                    const nextState = Object.assign({}, prevState, {
                        tabs,
                        stack: [permanentContext.get(generateKey(tabs[0]))],
                        current: tabs[0]
                    });

                    return nextState;
                } else {
                    const nextState = Object.assign({}, prevState, {
                        tabs,
                    });

                    return nextState;
                }
            }

            case keys.pushStack: {
                // value: {option: ViewOption}
                const option: ViewOption = action.value.option;
                const key: string = generateKey(option);
                let item: ViewContextStackItem;

                if (permanentContext.has(key)) {
                    item = permanentContext.get(key);
                } else {
                    if (temporaryContext.has(key)) {
                        item = temporaryContext.get(key);
                    } else {
                        item = generateStackItem(option, true);
                        temporaryContext.set(key, item);
                    }
                }

                if (option.max_status_id) {
                    item = Object.assign({}, item);
                    item.max_status_id = option.max_status_id;
                }

                if (option.min_status_id) {
                    item = Object.assign({}, item);
                    item.min_status_id = option.min_status_id;
                }
                debug(`#reduce - pushStack, max: ${item.max_status_id}, min: ${item.min_status_id}`);

                const nextState = Object.assign({}, prevState, {
                    stack: [item, ...prevState.stack],
                    current: item,
                });
                
                return nextState;
            }

            case keys.popStack: {
                const nextStack = prevState.stack.slice(1, prevState.stack.length);
                const nextState = Object.assign({}, prevState, {
                    stack: nextStack,
                    current: nextStack[0],
                });

                return nextState;
            }

            case keys.saveTabs: {
                JSONLoader.read(view_storage)
                    .catch(() => Promise.resolve({}))
                    .then((data: any) => {
                        data['tabs'] = prevState.tabs;
                        return JSONLoader.write(view_storage, data);
                    });

                return prevState;
            }

            case keys.destroyStatus: {
                prevState.stack[0].actions.destroyStatus(action.value.status_id);
            }

            default:
                return prevState;
        }
    }
}
