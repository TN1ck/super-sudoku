import * as React from 'react';

import {connect} from 'react-redux';
import {SudokuState} from 'src/ducks/sudoku';
import {Cell, printSudoku, parseSudoku, parseSudokuToSimple, solvableSudoku1} from 'src/ducks/sudoku/model';
import {GridComponent} from 'src/components/Sudoku';
import {
    solveGrid
} from 'src/engine/solver';
import * as solverOptimized from 'src/engine/solverOptimized';

const sudoku1 = parseSudokuToSimple(parseSudoku(solvableSudoku1));
console.log(solverOptimized.solveGrid([sudoku1]));

import * as Grid from 'src/components/Grid';

const styles = require('./styles.css');

const Sudoku: React.StatelessComponent<{
    grid: Array<Cell>
}> = function _Sudoku (props) {
    return (
        <div>
            <Grid.Container>
                <Grid.Row>
                    <Grid.Col xs={12}>
                        <h1>{'Sudoku'}</h1>
                        <div className={styles['sudoku-container']}>
                            <GridComponent
                                grid={props.grid}
                            />
                        </div>
                    </Grid.Col>
                </Grid.Row>
            </Grid.Container>
        </div>
    );
};

class SudokuStateComponent extends React.Component<{
    sudoku: SudokuState
}, {
    grid: Array<Cell>,

}> {
    iterator: any;
    constructor (props) {
        super(props);
        this.state = {
            grid: this.props.sudoku.grid
        };
    }
    componentDidMount () {
        this.solve();
    }
    solve () {
        const grids = [this.props.sudoku.grid];
        this.iterator = solveGrid(grids);
        this.setState({
            grid: this.props.sudoku.grid
        });
        this.nextStep();
    }
    nextStep () {
        const current = this.iterator.next();
        if (!current.done) {
            this.setState({
                grid: current.value
            });
            setTimeout(this.nextStep.bind(this), 0);
        }

    }
    render () {
        const grid = this.state.grid;
        return (
            <Sudoku
                grid={grid}
            />
        )
    }
}

export default connect(
    function (state) {
        return {
            sudoku: (state.sudoku as SudokuState)
        };
    },
    function (dispatch) {
        return {
        };
    }
)(SudokuStateComponent);
