import * as React from "react";
import * as _ from "lodash";

import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";
import {GameStateMachine, updateTimer} from "src/state/game";

const connector = connect(
  (state: RootState) => {
    return {
      secondsPlayed: state.game.secondsPlayed,
      state: state.game.state,
    };
  },
  {updateTimer},
);

type PropsFromRedux = ConnectedProps<typeof connector>;

class GameTimer extends React.Component<PropsFromRedux> {
  _isMounted: boolean = false;
  _startTime: number = 0;
  componentDidMount() {
    const seconds = this.props.secondsPlayed;
    this._startTime = Number(new Date()) - seconds * 10 * 60;
    this._isMounted = true;
    const timer = _.throttle(() => {
      requestAnimationFrame(() => {
        const now = Number(new Date());
        if (this.props.state !== GameStateMachine.running) {
          this._startTime = now - this.props.secondsPlayed * 10 * 60;
        }
        const diff = now - this._startTime;
        const seconds = diff / 10 / 60;
        this.props.updateTimer(seconds);
        this.forceUpdate();
        if (this._isMounted) {
          timer();
        }
      });
    }, 100);
    timer();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    const {secondsPlayed} = this.props;
    const seconds = Math.floor(secondsPlayed);
    const minutes = Math.floor(seconds / 60);
    const secondRest = seconds % 60;

    const minuteString: string = minutes < 10 ? "0" + minutes : String(minutes);
    const secondString: string = secondRest < 10 ? "0" + secondRest : String(secondRest);

    const timerString = minuteString + ":" + secondString + " min";

    return <div className="text-center text-white">{timerString}</div>;
  }
}

export default connector(GameTimer);
