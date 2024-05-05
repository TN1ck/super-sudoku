import {UnknownAction} from "redux";

export enum ApplicationStateMachine {
  chooseGame = "CHOSE_GAME",
  playGame = "PLAY_GAME",
}

const SET_APPLICATION_STATE = "application/SET_APPLICATION_STATE";

interface SetApplicationStateAction {
  type: typeof SET_APPLICATION_STATE;
  state: ApplicationStateMachine;
}

export function chooseGame(): SetApplicationStateAction {
  return {
    type: SET_APPLICATION_STATE,
    state: ApplicationStateMachine.chooseGame,
  };
}

export function playGame(): SetApplicationStateAction {
  return {
    type: SET_APPLICATION_STATE,
    state: ApplicationStateMachine.playGame,
  };
}

export interface ApplicationState {
  state: ApplicationStateMachine;
}

export const INITIAL_APPLICATION_STATE: ApplicationState = {
  state: ApplicationStateMachine.chooseGame,
};

export default function application(
  state: ApplicationState = INITIAL_APPLICATION_STATE,
  action: SetApplicationStateAction,
) {
  switch (action.type) {
    case SET_APPLICATION_STATE:
      return {...state, state: action.state};
  }
  return state;
}
