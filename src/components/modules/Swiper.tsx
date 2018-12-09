import React from "react";

interface Coordinate {
  x: number;
  y: number;
}

export class TouchProvider extends React.Component<
  {
    onTouchMove?: (c: Coordinate) => void;
    onTouchEnd?: (c: Coordinate) => void;
    style?: any;
  },
  {
    offset: Coordinate;
    initialPosition: Coordinate;
  }
> {
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
      },
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }
  componentDidMount() {
    document.addEventListener("touchstart", this.onTouchStart as any);
    document.addEventListener("touchmove", this.onTouchMove as any);
    document.addEventListener("touchend", this.onTouchEnd as any);
  }
  componentWillUnmount() {
    document.removeEventListener("tocuhstart", this.onTouchStart as any);
    document.removeEventListener("touchmove", this.onTouchMove as any);
    document.removeEventListener("touchend", this.onTouchEnd as any);
  }
  onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    // e.preventDefault();
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
    e.preventDefault();
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
      },
    });
    this.props.onTouchMove && this.props.onTouchMove(this.state.offset);
  }
  onTouchEnd(_: React.TouchEvent<HTMLDivElement>) {
    // e.preventDefault();
    this.props.onTouchEnd && this.props.onTouchEnd(this.state.offset);
  }
  render() {
    return this.props.children;
  }
}
