import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleWare from 'redux-thunk';
import rootReducer from 'src/ducks';
import {createLogger} from 'redux-logger';

const logger = createLogger({collapsed: true});

const middleware = [thunkMiddleWare].concat(
  [logger as any],
);

const enhancer = compose(applyMiddleware(...middleware));

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
    (module as any).hot.accept('../ducks', () => {
      const nextRootReducer = require('src/ducks');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
