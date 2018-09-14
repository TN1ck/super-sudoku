import * as React from 'react';

import { Router } from "react-static";
import Routes from "react-static-routes";
import { hot } from "react-hot-loader";

import {AppContainer} from 'react-hot-loader';

import {Provider} from 'react-redux';

import configureStore from 'src/store/configureStore';

import Header from 'src/components/modules/Header';
import Footer from 'src/components/modules/Footer';
import styled, {injectGlobal} from 'styled-components';
import THEME from 'src/theme';

injectGlobal`
  body {
    padding: 0;
    margin: 0;
    font-family: ${THEME.fontFamily};
    background: ${THEME.colors.gray700};
    font-size: ${THEME.fontSize.base}px;
  }
  html, body, #root {
    height: 100%;
    line-height: ${THEME.lineHeight}em;
  }
`;

const Main = styled.div`
  min-height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header"
    "main"
    "footer";
}`;

const HeaderArea = styled.div`
  grid-area: header;
`;

const MainArea = styled.div`
  grid-area: main;
`;

const FooterArea = styled.div`
  grid-area: footer;
  background: ${THEME.colors.gray200};
`;

const store = configureStore({});

const Root: React.StatelessComponent = () => {
  return (
    <AppContainer>
      <Provider store={store}>
        <Router>
          <Main>
            <HeaderArea>
              <Header />
            </HeaderArea>
            <MainArea>
              <Routes />
            </MainArea>
            <FooterArea>
              <Footer />
            </FooterArea>
          </Main>
        </Router>
      </Provider>
    </AppContainer>
  );
};

export default hot(module)(Root);
