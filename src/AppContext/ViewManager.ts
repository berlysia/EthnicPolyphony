import ReduceStore from '../Flux/ReduceStore';
import ViewContextStoreGroup from '../ViewContext/ViewContext';
import ActionEmitter from '../Flux/ActionEmitter';
import ActionCreator, {
    ViewType,
    keys,
    ViewOption,
    generateKey
} from './ActionCreator';
import {Action} from '../Flux/Action';
import JSONLoader from '../JSONLoader';
import {view_storage} from '../Constants';

// for pushStack
import {default as ViewActionCreator} from '../ViewContext/ActionCreator';
import HomeTimeline from '../ViewContext/HomeTimeline';
import ListTimeline from '../ViewContext/ListTimeline';
import UserTimeline from '../ViewContext/UserTimeline';
import SearchTimeline from '../ViewContext/SearchTimeline';
import SingleTweet from '../ViewContext/SingleTweet';

export interface ViewContextStackItem extends ViewOption {
    store: ViewContextStoreGroup;
    actions: ViewActionCreator;
    temporary: boolean;
}

interface State {
    tabs: ViewOption[];
    stack: ViewContextStackItem[];
}
type key = string;

export function generateStackItem(option: ViewOption, temporary?: boolean): ViewContextStackItem {
    const key = option.key;
    const dispatcher = new ActionEmitter();
    const actions = new ViewActionCreator(dispatcher);
    let store: ViewContextStoreGroup;
    switch (option.type) {
        case ViewType.HomeTimeline: {
            store = new HomeTimeline(dispatcher, option.source_id);
        } break;

        case ViewType.UserTimeline: {
            store = new UserTimeline(dispatcher, option.source_id, option.target_id);
        } break;

        case ViewType.ListTimeline: {
            store = new ListTimeline(dispatcher, option.source_id, option.target_id);
        } break;

        case ViewType.SearchTimeline: {
            store = new SearchTimeline(dispatcher, option.source_id, option.query);
        } break;

        case ViewType.SingleTweet: {
            store = new SingleTweet(dispatcher, option.source_id, option.target_id);
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

    getStackTop(): ViewContextStackItem {
        if (this.state.stack.length === 0) {
            return null;
        }

        return this.state.stack[this.state.stack.length - 1];
    }

    getStackTopStore(): ViewContextStoreGroup {
        const tmp = this.getStackTop();
        if (!tmp) {
            return null;
        }
        return tmp.store;
    }

    reduce(prevState: State, action: Action): State {
        switch (action.type) {
            case keys.fetchTweet: {
                // value: {append: boolean, param        
                const top = prevState.stack[0];
                switch (top.type) {
                    case ViewType.HomeTimeline: {
                        top.actions.fetchHomeTimeline(top.source_id, action.value.params, action.value.append);
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

            case keys.selectTab: {
                // value: {option: ViewOption}
                const option: ViewOption = action.value.option;
                const key: string = generateKey(option);
                const item: ViewContextStackItem = permanentContext.get(key);

                const nextState = {
                    tabs: prevState.tabs,
                    stack: [item],
                };

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

                const nextState = {
                    tabs: [...prevState.tabs, option],
                    stack: prevState.stack,
                };

                return nextState;
            }

            case keys.deleteTab: {
                // value: {option: ViewOption}
                const option: ViewOption = action.value.option;
                const key: string = generateKey(option);

                const nextState = {
                    tabs: prevState.tabs.filter(x => x.key !== key),
                    stack: prevState.stack,
                }

                return nextState;
            }

            case keys.pushStack: {
                // value: {option: ViewOption}
                const option: ViewOption = action.value.option;
                const key: string = option.key;
                let item: ViewContextStackItem;

                if (permanentContext.has(key)) {
                    item = permanentContext.get(key);
                } else {
                    if (temporaryContext.has(key)) {
                        item = temporaryContext.get(key);
                    } else {
                        item = generateStackItem(option, true);
                    }
                }

                const nextState = {
                    tabs: prevState.tabs,
                    stack: [...prevState.stack, item],
                };

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

            default:
                return prevState;
        }
    }
}
