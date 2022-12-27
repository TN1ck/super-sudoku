import * as React from "react";
import * as _ from "lodash";

import {connect, ConnectedProps} from "react-redux";
import {RootState} from "src/state/rootReducer";
import {GameStateMachine, updateTimer} from "src/state/game";
import {formatDuration} from "src/utils/format";

const connector = connect(
  (state: RootState) => {
    return {
      secondsPlayed: state.game.secondsPlayed,
      state: state.game.state,
      sudokuId: state.game.sudokuId,
    };
  },
  {updateTimer},
);

type PropsFromRedux = ConnectedProps<typeof connector>;

class GameTimer extends React.Component<PropsFromRedux> {
  _isMounted: boolean = false;
  _startTime: number = 0;
  _sudokuId: number = -1;
  _state: GameStateMachine = GameStateMachine.paused;
  componentDidMount() {
    const seconds = this.props.secondsPlayed;
    this._startTime = Number(new Date()) - seconds * 1000;
    this._isMounted = true;
    this._sudokuId = this.props.sudokuId;
    this._state = this.props.state;
    const timer = _.throttle(() => {
      requestAnimationFrame(() => {
        const now = Number(new Date());
        if (
          this.props.state !== GameStateMachine.running ||
          this._sudokuId !== this.props.sudokuId ||
          this._state !== this.props.state
        ) {
          this._startTime = now - this.props.secondsPlayed * 1000;
          this._sudokuId = this.props.sudokuId;
          this._state = this.props.state;
        }
        if (this.props.state === GameStateMachine.running) {
          const diff = now - this._startTime;
          const seconds = diff / 1000;
          this.props.updateTimer(seconds);
          this.forceUpdate();
        }
        if (this._isMounted) {
          timer();
        }
      });
    }, 200);
    timer();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    const {secondsPlayed, state} = this.props;

    return <div className="text-center text-white">{formatDuration(secondsPlayed)}</div>;
  }
}

export default connector(GameTimer);
