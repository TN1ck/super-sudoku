import React from 'react';

interface Coordinate {
  x: number;
  y: number;
}

export class TouchProvider extends React.Component<{
  onTouchMove?: (c: Coordinate) => void;
  onTouchEnd?: (c: Coordinate) => void;
}, {
  offset: Coordinate;
  initialPosition: Coordinate;
}> {
  constructor(props) {
    super(props);
    this.state = {
      offset: {
        x: 0,
        y: 0,
      },
      initialPosition: {
        x: 0,
        y: 0,
      }
    }
    this.onTouchStart =  this.onTouchStart.bind(this);
    this.onTouchMove =  this.onTouchMove.bind(this);
    this.onTouchEnd =  this.onTouchEnd.bind(this);
  }
  onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length !== 1) {
      return;
    }
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    this.setState({
      offset: {x: 0, y: 0},
      initialPosition: {x, y},
    });
  }
  onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length !== 1) {
      return;
    }
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    this.setState({
      offset: {
        x: x - this.state.initialPosition.x,
        y: y - this.state.initialPosition.y,
      }
    });
    this.props.onTouchMove && this.props.onTouchMove(this.state.offset);
  }
  onTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    this.props.onTouchEnd && this.props.onTouchEnd(this.state.offset);
  }
  render() {
    return (
      <div
        style={{
          touchAction: "manipulate",
        }}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
        onTouchMove={this.onTouchMove}
      >
        {this.props.children}
      </div>
    )
  }

}
