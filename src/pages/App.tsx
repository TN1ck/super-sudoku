import * as React from 'react';

import * as Navigation from 'src/components/Navigation';
import './styles.scss';

const App: React.StatelessComponent<{children: React.ReactNode}> = ({
  children,
}) => {
  return (
    <div className={'ss_app-wrapper'}>
      <Navigation.Wrapper>
        <Navigation.Item to={'/sudoku'}>
          {'Sudoku'}
        </Navigation.Item>
        <Navigation.Item to={'/about'}>
          {'About'}
        </Navigation.Item>
      </Navigation.Wrapper>
      {children}
    </div>
  );
};

export default App;
