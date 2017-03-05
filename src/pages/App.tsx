import * as React from 'react';

import * as Grid from 'src/components/Grid';
import * as Navigation from 'src/components/Navigation';
import * as styles from './styles.css';

interface IAppProps extends React.Props<any> {};

const App: React.StatelessComponent<IAppProps> = function (props) {
    return (
        <div className={styles.appWrapper}>
            <Grid.Container>
                <Grid.Row>
                    <Navigation.Wrapper>
                        <Navigation.Item to={'/sudoku'}>{'Sudoku'}</Navigation.Item>
                        <Navigation.Item to={'/about'}>{'About'}</Navigation.Item>
                    </Navigation.Wrapper>
                </Grid.Row>
            </Grid.Container>
            {props.children}
        </div>
    );
};

export default App;
