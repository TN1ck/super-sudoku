import sudokus from 'src/sudokus';

const NEW_GAME = 'game/NEW_GAME';
const RESET_GAME = 'game/RESET_GAME';
const PAUSE_GAME = 'game/PAUSE_GAME';
const CONTINUE_GAME = 'game/CONTINUE_GAME';
const INCREMENT_ONE_SECOND = 'game/INCREMENT_ONE_SECOND';

export function newGame (difficulty, sudokuId) {
    return {
        type: NEW_GAME,
        difficulty,
        sudokuId
    };
}

export function resetGame () {
    return {
        type: RESET_GAME
    };
}

export function pauseGame () {
    return {
        type: PAUSE_GAME
    };
}

export function continueGame () {
    return {
        type: CONTINUE_GAME
    };
}

export function incrementOneSecond () {
    return {
        type: INCREMENT_ONE_SECOND
    };
}

const gameState = {
    timePassedInSeconds: 0,
    running: false,
    currentlySelectedDifficulty: undefined,
    currentlySelectedSudokuId: undefined,
    sudokus: sudokus
};

export default function gameReducer (state = gameState, action) {
    switch (action.type) {
    case NEW_GAME:
        return Object.assign({}, state, {
            currentlySelectedDifficulty: action.difficulty,
            currentlySelectedSudokuId: action.sudokuId,
            timePassedInSeconds: 0
        });
    case PAUSE_GAME:
        return Object.assign({}, state, {
            running: false
        });
    case CONTINUE_GAME:
        return Object.assign({}, state, {
            running: true
        });
    case INCREMENT_ONE_SECOND:
        return Object.assign({}, state, {
            timePassedInSeconds: state.timePassedInSeconds + 1
        });
    default:
        return state;
    }
}
