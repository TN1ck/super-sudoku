import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group'
// import * as classNames from 'classnames';

import {connect} from 'react-redux';
import {SudokuState} from 'src/ducks/sudoku';
import {
    pauseGame,
    continueGame,
    incrementOneSecond,
    resetGame
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

    const minuteString : string = minutes    < 10 ? ('0' + minutes)    : String(minutes);
    const secondString : string = secondRest < 10 ? ('0' + secondRest) : String(secondRest);

    const timerString = minuteString + ':' + secondString;

    return (
        <span>{timerString}</span>
    );
}

function PauseButton ({pauseGame}) {
    return (
        <div
            onClick={pauseGame}
            className={styles.pauseButton}
        >
            {'Pause'}
        </div>
    )
}

function GameMenuItem (props) {
    return (
        <li className={styles.gameMenuListItem} onClick={props.onClick}>
            {props.children}
        </li>
    );
}

const GameMenu = connect(
    function (state) {
        return {
            running: state.game.running
        };
    },
    function (dispatch) {
        return {
            continueGame: () => dispatch(continueGame()),
            resetGame: () => dispatch(resetGame())
        }
    }
)(function GameMenu ({continueGame, running}) {
    const actualMenu = (
        <div className={styles.gameMenu} key='el'>
            <ul className={styles.gameMenuList}>
                <GameMenuItem onClick={continueGame}>
                    {'Continue'}
                </GameMenuItem>
                <GameMenuItem onClick={resetGame}>
                    {'Reset Game'}
                </GameMenuItem>
                <GameMenuItem>
                    {'New Game'}
                </GameMenuItem>
            </ul>
        </div>
    );
    const inner = running ? [] : [actualMenu];
    return (
        <div>
            <ReactCSSTransitionGroup
                component='div'
                transitionName='opacity'
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}
                transitionAppear
                transitionAppearTimeout={500}
            >
                {inner}
            </ReactCSSTransitionGroup>
        </div>
    );
});

class Game extends React.Component<{
    game: any,
    continueGame: () => any,
    incrementOneSecond: () => any,
    pauseGame: () => any
}, {}> {
    interval: number;
    componentDidMount () {
        this.interval = window.setInterval(() => {
            if (this.props.game.running) {
                this.props.incrementOneSecond();
            }
        }, 1000);
    }
    render () {
        const {
            game,
            pauseGame
        } = this.props;
        return (
            <div className={styles.game}>
                <GameMenu />
                <Grid.Container>
                    <Grid.Row>
                        <Grid.Col xs={12}>
                            <div className={styles.gameContainer}>
                                <GameTimer
                                    seconds={game.timePassedInSeconds}
                                />
                                <PauseButton pauseGame={pauseGame} />
                            </div>
                        </Grid.Col>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Col xs={12}>
                            <ConnectedSudoku />
                        </Grid.Col>
                    </Grid.Row>
                </Grid.Container>
            </div>
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
            continueGame: () => dispatch(continueGame()),
            incrementOneSecond: () => dispatch(incrementOneSecond()),
            pauseGame: () => dispatch(pauseGame())
        };
    }
)(Game);
