import * as React from "react";

import {getTime} from "src/ducks/game";
import styled from "styled-components";

const GameTimerContainer = styled.div`
  position: absolute;
  color: #aaaaaa;
  font-size: 20px;
  top: 7px;
`;

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

    const timerString = minuteString + ":" + secondString;

    return <GameTimerContainer>{timerString}</GameTimerContainer>;
  }
}
