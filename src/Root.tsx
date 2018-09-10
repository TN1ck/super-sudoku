import * as React from 'react';

import { Router } from "react-static";
import Routes from "react-static-routes";
import { hot } from "react-hot-loader";

import App from 'src/components/pages/App';
import About from 'src/components/pages/About';
import Home from 'src/components/pages/Home';
import Game from 'src/components/pages/Game';

// import it here to activate hot-reloading for css
// (see index.tsx and search for module.hot)
import 'src/styles/index.scss';

const Root: React.StatelessComponent<{
  children?: React.ReactNode;
}> = function _Root() {
  return (
    <Router>
      <App>
        <Routes />
      </App>
    </Router>
  );
};

export default hot(module)(Root);
