const NEW_GAME = 'game/NEW_GAME';
const RESET_GAME = 'game/RESET_GAME';
const PAUSE_GAME = 'game/PAUSE_GAME';
const CONTINUE_GAME = 'game/CONTINUE_GAME';

export function newGame () {
    return {
        type: NEW_GAME
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

const gameState = {
    timePassedInSeconds: 0,
    running: false
};

export default function gameReducer (state = gameState, action) {
    switch (action.type) {
    case PAUSE_GAME:
        return Object.assign({}, state, {
            running: false
        });
    case CONTINUE_GAME:
        return Object.assign({}, state, {
            running: true
        });
    default:
        return state;
    }
}
