import * as React from 'react';

import {connect} from 'react-redux';
import {SudokuState} from 'src/ducks/sudoku';
import {
    // pauseGame,
    continueGame,
    incrementOneSecond
} from 'src/ducks/game';
import {Cell} from 'src/ducks/sudoku/model';
import {GridComponent} from 'src/components/Sudoku';


// import {
//     solveGridGenerator
// } from 'src/engine/solverNaive';

import * as Grid from 'src/components/Grid';
import * as styles from './styles.css';

const Sudoku: React.StatelessComponent<{
    grid: Array<Cell>
}> = function _Sudoku (props) {
    return (
        <div className={styles.sudokuContainer}>
            <GridComponent
                grid={props.grid}
            />
        </div>
    );
};

// class SudokuStateComponent extends React.Component<{
//     sudoku: SudokuState
// }, {
//     grid: Array<Cell>,

// }> {
//     iterator: any;
//     constructor (props) {
//         super(props);
//         this.state = {
//             grid: this.props.sudoku.grid
//         };
//     }
//     componentDidMount () {
//         // this.solve();
//     }
//     solve () {
//         const grids = [this.props.sudoku.grid];
//         this.iterator = solveGridGenerator(grids);
//         this.setState({
//             grid: this.props.sudoku.grid
//         });
//         this.nextStep();
//     }
//     nextStep () {
//         const current = this.iterator.next();
//         if (!current.done) {
//             this.setState({
//                 grid: current.value
//             });
//             setTimeout(this.nextStep.bind(this), 0);
//         }

//     }
//     render () {
//         const grid = this.props.sudoku.grid;
//         return (
//             <Sudoku
//                 grid={grid}
//             />
//         )
//     }
// }

const ConnectedSudoku = connect(
    function (state) {
        return {
            sudoku: (state.sudoku as SudokuState),
            grid: (state.sudoku as SudokuState).grid
        };
    },
    function () {
        return {};
    }
)(Sudoku);

function GameTimer ({seconds}) {
    const minutes = Math.floor(seconds / 60);
    const secondRest = seconds % 60;

    const minuteString : string = minutes    < 10 ? ('0' + minutes) : String(minutes);
    const secondString : string = secondRest < 10 ? ('0' + secondRest) : String(secondRest);

    const timerString = minuteString + ':' + secondString;

    return (
        <span>{timerString}</span>
    );
}

class Game extends React.Component<{
    game: any,
    continueGame: () => any,
    incrementOneSecond: () => any,
}, {}> {
    interval: number;
    componentDidMount () {
        this.props.continueGame();
        this.interval = window.setInterval(() => {
            if (this.props.game.running) {
                this.props.incrementOneSecond();
            }
        }, 1000);
    }
    render () {
        const game = this.props.game;
        return (
            <Grid.Container>
                <Grid.Row>
                    <Grid.Col xs={12}>
                        <div className={styles.gameContainer}>
                            <GameTimer
                                seconds={game.timePassedInSeconds}
                            />
                        </div>
                    </Grid.Col>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Col xs={12}>
                        <ConnectedSudoku />
                    </Grid.Col>
                </Grid.Row>
            </Grid.Container>
        )
    }
}

export default connect(
    function (state) {
        return {
            game: state.game
        };
    },
    function (dispatch) {
        return {
            // pauseGame: () => dispatch(pauseGame()),
            continueGame: () => dispatch(continueGame()),
            incrementOneSecond: () => dispatch(incrementOneSecond()),
        };
    }
)(Game);
