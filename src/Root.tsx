import * as React from 'react';

import { Router } from "react-static";
import Routes from "react-static-routes";
import { hot } from "react-hot-loader";

import {AppContainer} from 'react-hot-loader';

import {Provider} from 'react-redux';

import App from 'src/components/pages/App';

import configureStore from 'src/store/configureStore';
const store = configureStore({});

// import it here to activate hot-reloading for css
// (see index.tsx and search for module.hot)
import 'src/styles/index.scss';

const Root: React.StatelessComponent<{
  children?: React.ReactNode;
}> = function _Root() {
  return (
    <AppContainer>
      <Provider store={store}>
        <Router>
          <App>
            <Routes />
          </App>
        </Router>
    </Provider>
  </AppContainer>
  );
};

export default hot(module)(Root);
