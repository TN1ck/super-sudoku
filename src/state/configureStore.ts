import {createStore, applyMiddleware, compose} from "redux";
import thunkMiddleWare from "redux-thunk";
import rootReducer from "src/state/rootReducer";
import {createLogger} from "redux-logger";

const logger = createLogger({collapsed: true});

const middleware = [thunkMiddleWare].concat([logger as any]);

const enhancer = compose(applyMiddleware(...middleware));

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
    (module as any).hot.accept("./rootReducer", () => {
      const nextRootReducer = require("./rootReducer");
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
