import * as React from 'react';

import { Provider } from 'react-redux';
import { Store } from 'redux';
import { Route, Router, browserHistory, IndexRedirect } from 'react-router';

import App from 'src/pages/App';
import About from 'src/pages/About';
import Sudoku from 'src/pages/Sudoku';

// import it here to activate hot-reloading for css
// (see index.tsx and search for module.hot)
import './styles/index.global.css';

const routes = (
    <Route path='/' component={ App }>
        <IndexRedirect to='/sudoku' />
        <Route path='/about' component={ About } />
        <Route path='/sudoku' component={ Sudoku } />
    </Route>
);

const Root: React.StatelessComponent<{
    children?: React.ReactChild,
    store: Store<any>
}> = function _Root (props) {
    return (
        <Provider store={props.store}>
            <Router history={browserHistory}>
                { routes }
            </Router>
        </Provider>
    );
};

export default Root;
