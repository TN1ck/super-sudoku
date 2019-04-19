import * as React from "react";

import {Root, Routes} from "react-static";
import {Router} from "@reach/router";

import {Provider} from "react-redux";

import configureStore from "src/store/configureStore";

import {createGlobalStyle} from "styled-components";
import THEME from "src/theme";

const GlobalStyle = createGlobalStyle`

  * {
    box-sizing: border-box;
  }

  body {
    padding: 0;
    margin: 0;
    font-family: ${THEME.fontFamily};
    background: ${THEME.colors.gray700};
    font-size: ${THEME.fontSize.base}px;
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100vh;
    width: 100vw;
    -webkit-overflow-scrolling: touch;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0,0,0,0);

  }
  html, body, #root {
    height: 100%;
  }

  html {
    line-height: ${THEME.lineHeight}em;
    position: fixed;
    overflow: hidden;
    height: 100%;
    touch-action: manipulation;
  }
`;

const store = configureStore({});

const App: React.StatelessComponent = () => {
  return (
    <Root>
      <Provider store={store}>
        <React.Suspense fallback={<em>Loading...</em>}>
          <Router style={{height: '100%'}}>
            <Routes path="*" />
          </Router>
        </React.Suspense>
      <GlobalStyle />
      </Provider>
    </Root>
  );
};

export default App;
