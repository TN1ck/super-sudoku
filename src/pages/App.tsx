import * as React from 'react';

import * as Navigation from 'src/components/Navigation';
import * as styles from './styles.css';

const App: React.StatelessComponent<{children: React.ReactNode}> = ({
  children,
}) => {
  return (
    <div className={styles.appWrapper}>
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
