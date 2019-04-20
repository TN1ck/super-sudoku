import * as React from "react";

import {Root, Routes} from "react-static";
import {Router} from "@reach/router";

import {Provider} from "react-redux";

import configureStore from "src/store/configureStore";

import {createGlobalStyle} from "styled-components";
import THEME from "src/theme";
import Header from "./components/modules/Header";

const GlobalStyle = createGlobalStyle`

  * {
    box-sizing: border-box;
  }

  body {
    padding: 0;
    margin: 0;
    font-family: ${THEME.fontFamily};
    background: black;
    font-size: ${THEME.fontSize.base}px;
    height: 100vh;
    width: 100vw;
    /* overflow-x: hidden; */
    /* overflow-y: scroll; */
    /* -webkit-overflow-scrolling: touch; */
    /* -webkit-touch-callout: none; */
    -webkit-tap-highlight-color: rgba(0,0,0,0);

  }
  html, body, #root {
    height: 100%;
  }

  html {
    line-height: ${THEME.lineHeight}em;
    /* position: fixed; */
    /* overflow: hidden; */
    /* touch-action: manipulation; */
    height: 100%;
  }
`;

const store = configureStore({});

const App: React.StatelessComponent = () => {
  return (
    <Root>
      <Provider store={store}>
        <Header />
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
