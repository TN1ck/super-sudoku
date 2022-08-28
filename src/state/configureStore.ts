import {createStore, applyMiddleware, compose} from "redux";
import thunkMiddleWare from "redux-thunk";
import rootReducer, {RootState} from "src/state/rootReducer";
import {createLogger} from "redux-logger";

const logger = createLogger({collapsed: true});

const middleware = [thunkMiddleWare].concat([logger as any]);

const enhancer = compose(applyMiddleware(...middleware));

export default function configureStore(initialState: RootState) {
  const store = createStore(rootReducer as any, initialState, enhancer);
  return store;
}
