import * as React from 'react';

import {Route, Switch} from 'react-router-dom';

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
    <Switch>
      <Route path="/">
        <App>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/about" component={About} />
            <Route exact path="/sudoku" component={Game} />
          </Switch>
        </App>
      </Route>
    </Switch>
  );
};

export default Root;
