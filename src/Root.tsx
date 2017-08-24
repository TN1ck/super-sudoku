import * as React from 'react';

import {Route, Switch} from 'react-router-dom';

import App from 'src/pages/App';
import About from 'src/pages/About';
import Sudoku from 'src/pages/Sudoku';

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
            <Route exact path="/about" component={About} />
            <Route exact path="/sudoku" component={Sudoku} />
          </Switch>
        </App>
      </Route>
    </Switch>
  );
};

export default Root;
