import * as React from 'react';

import * as Navigation from 'src/components/modules/Navigation';
import Footer from 'src/components/modules/Footer';

const App: React.StatelessComponent<{children: React.ReactNode}> = ({
  children,
}) => {
  return (
    <div style={{height: '100%'}}>
      <Navigation.Wrapper>
        <Navigation.Item to={'/'}>
          {'Home'}
        </Navigation.Item>
        <Navigation.Item to={'/sudoku'}>
          {'Sudoku'}
        </Navigation.Item>
        <Navigation.Item to={'/about'}>
          {'About'}
        </Navigation.Item>
      </Navigation.Wrapper>
      <div style={{height: 'calc(100% - 44px)'}}>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default App;
