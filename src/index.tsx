require('whatwg-fetch');
import 'babel-polyfill';
const { AppContainer } = require('react-hot-loader');

import { Provider } from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Root from './Root';

import configureStore from 'src/store/configureStore';
const store = configureStore({});

function renderApp (RootComponent) {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <BrowserRouter>
                    <RootComponent />
                </BrowserRouter>
            </Provider>
        </AppContainer>,
        document.getElementById('root')
    );
}

renderApp(Root);

if (module.hot) {
    module.hot.accept(
        './Root.tsx',
        () => renderApp(require('./Root.tsx').default)
    );
}
