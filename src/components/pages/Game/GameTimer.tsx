import * as React from "react";
import * as _ from "lodash";

import {getTime} from "src/state/game";
import styled from "styled-components";
import THEME from "src/theme";
import {saveStopTimeToLocalStorage} from "src/sudoku-game/persistence";

const GameTimerContainer = styled.div`
  color: white;
  font-size: ${THEME.fontSize.menu}px;
  text-align: center;

  @media (max-width: 800px) {
    font-size: ${THEME.fontSize.base}px;
  }
`;

// so we don't write to localStorage every 1/60 second
const throttledSaveStopTime = _.throttle(saveStopTimeToLocalStorage, 500);

export default class GameTimer extends React.Component<{
  startTime: number;
  offsetTime: number;
  stopTime: number;
}> {
  _isMounted: boolean = false;
  componentDidMount() {
    this._isMounted = true;
    const timer = () => {
      requestAnimationFrame(() => {
        this.forceUpdate();
        throttledSaveStopTime(new Date());
        if (this._isMounted) {
          timer();
        }
      });
    };
    timer();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    const {startTime, offsetTime, stopTime} = this.props;
    const milliseconds = getTime(startTime, offsetTime, stopTime);
    const seconds = Math.round(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const secondRest = seconds % 60;

    const minuteString: string = minutes < 10 ? "0" + minutes : String(minutes);
    const secondString: string = secondRest < 10 ? "0" + secondRest : String(secondRest);

    const timerString = minuteString + ":" + secondString + " min";

    return <GameTimerContainer>{timerString}</GameTimerContainer>;
  }
}
