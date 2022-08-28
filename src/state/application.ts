import {AnyAction} from "redux";

export enum ApplicationStateMachine {
  chooseGame = "CHOSE_GAME",
  playGame = "PLAY_GAME",
}

const SET_APPLICATION_STATE = "application/SET_APPLICATION_STATE";

export function chooseGame() {
  return {
    type: SET_APPLICATION_STATE,
    state: ApplicationStateMachine.chooseGame,
  };
}

export function playGame() {
  return {
    type: SET_APPLICATION_STATE,
    state: ApplicationStateMachine.playGame,
  };
}

export interface ApplicationState {
  state: ApplicationStateMachine;
}

const INITIAL_APPLICATION_STATE: ApplicationState = {
  state: ApplicationStateMachine.chooseGame,
};

export default function application(state: ApplicationState = INITIAL_APPLICATION_STATE, action: AnyAction) {
  switch (action.type) {
    case SET_APPLICATION_STATE:
      return {...state, state: action.state};
  }
  return state;
}
