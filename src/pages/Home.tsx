import * as React from 'react';

import * as Grid from 'src/components/Grid';
import {solve} from 'src/engine/solver';
import {parseSudoku, parseSudokuToSimple, solvableSudoku1} from 'src/ducks/sudoku/model';

solve(parseSudokuToSimple(parseSudoku(solvableSudoku1)));


const Home: React.StatelessComponent<{}> = function (props) {
    return (
        <div>
            <Grid.Container>
                <Grid.Row>
                    <Grid.Col xs={12}>
                        <h1>{'Introduction'}</h1>
                        <p>
                            {'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'}
                        </p>
                    </Grid.Col>
                </Grid.Row>
            </Grid.Container>
        </div>
    );
};

export default Home;
