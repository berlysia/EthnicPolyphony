// import 'babel-polyfill';
import ActionEmitter from './Flux/ActionEmitter';

// AppContext
import {
  default as AppActionCreator,
} from './AppContext/ActionCreator';
import AppContext from './AppContext/AppContext';

export const dispatcher = new ActionEmitter();
export const actions = new AppActionCreator(dispatcher);
export const store = new AppContext(dispatcher);

