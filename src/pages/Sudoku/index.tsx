import * as React from 'react';

import {connect} from 'react-redux';
import {SudokuState} from 'src/ducks/sudoku';
import {Cell} from 'src/ducks/sudoku/model';
import {GridComponent} from 'src/components/Sudoku';
import {
    solveGridGenerator
} from 'src/engine/solverNaive';

import * as Grid from 'src/components/Grid';
import * as styles from './styles.css';

const Sudoku: React.StatelessComponent<{
    grid: Array<Cell>
}> = function _Sudoku (props) {
    return (
        <div>
            <Grid.Container>
                <Grid.Row>
                    <Grid.Col xs={12}>
                        <h1>{'Sudoku'}</h1>
                        <div className={styles.sudokuContainer}>
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
        this.iterator = solveGridGenerator(grids);
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
    function () {
        return {};
    }
)(SudokuStateComponent);
