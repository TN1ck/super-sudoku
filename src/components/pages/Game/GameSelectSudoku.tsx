import * as React from "react";
import * as _ from "lodash";
import styled, {css} from "styled-components";

import {DIFFICULTY, ParsedComplexSudoku, parseListOfSudokusComplex} from "src/engine/utility";

import SUDOKUS from "src/sudokus";
import Button from "src/components/modules/Button";
import THEME from "src/theme";
import SmallSudokuComponent from "src/components/modules/Sudoku/SudokuSmall";
import {TouchProvider} from "src/components/modules/Swiper";
import {previousSudoku, nextSudoku, changeSudoku} from "src/ducks/game/choose";

const SelectContainer = styled.div<{
  active: boolean;
}>`
  position: absolute;
  top: 0;
  left: 50%;
  transition-property: transform, opacity, box-shadow;
  transition-duration: 500ms;
  transition-timing-function: ease-out;

  &:before {
    opacity: 0;
    transition: opacity 300ms ease-out;
    content: "Play!";
    background: ${THEME.colors.primary};
    padding: ${THEME.spacer.x2}px;
    border-radius: ${THEME.borderRadius}px;
    display: block;
    position: absolute;
    z-index: 999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: ${THEME.boxShadow};
  }

  ${props =>
    props.active &&
    css`
      &:hover {
        cursor: pointer;
        &:before {
          opacity: 1;
        }
      }
    `}
`;

const PARSED_SUDOKUS = {
  [DIFFICULTY.EASY]: parseListOfSudokusComplex(SUDOKUS[DIFFICULTY.EASY]),
  [DIFFICULTY.MEDIUM]: parseListOfSudokusComplex(SUDOKUS[DIFFICULTY.MEDIUM]),
  [DIFFICULTY.HARD]: parseListOfSudokusComplex(SUDOKUS[DIFFICULTY.HARD]),
  [DIFFICULTY.EVIL]: parseListOfSudokusComplex(SUDOKUS[DIFFICULTY.EVIL]),
};

class SelectSudoku extends React.Component<
  {
    newGame: (difficulty, sudokuId) => void;
    difficulty: DIFFICULTY;
    sudokuIndex: number;
    changeSudoku: typeof changeSudoku;
    previousSudoku: typeof previousSudoku;
    nextSudoku: typeof nextSudoku;
  },
  {
    xOffset: number;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      xOffset: 0,
    };
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.getNewIndex = this.getNewIndex.bind(this);
  }
  onTouchMove({x}) {
    this.setState({
      xOffset: x,
    });
  }
  getNewIndex(xOffset: number) {
    const sudokus = PARSED_SUDOKUS[this.props.difficulty];
    const len = sudokus.length;
    const offset = Math.round(xOffset / 60);
    const newIndex = this.props.sudokuIndex - offset;
    const safeIndex = newIndex < 0 ? len + newIndex : newIndex >= len ? newIndex - len : newIndex;
    return safeIndex;
  }
  onTouchEnd() {
    this.props.changeSudoku(this.getNewIndex(this.state.xOffset));
    this.setState({
      xOffset: 0,
    });
  }
  render() {
    let {newGame, difficulty, sudokuIndex, changeSudoku, previousSudoku, nextSudoku} = this.props;
    const SUDOKU_SHOW = 8;
    const sudokus = PARSED_SUDOKUS[difficulty];

    const _sudokusToShow: ParsedComplexSudoku[] = [];

    const newSudokuIndex = this.getNewIndex(this.state.xOffset);

    for (const i of _.range(1, SUDOKU_SHOW)) {
      const currentIndex = newSudokuIndex - i;
      _sudokusToShow.push(sudokus[(currentIndex + sudokus.length) % sudokus.length]);
    }
    _sudokusToShow.reverse();
    _sudokusToShow.push(sudokus[newSudokuIndex]);
    for (const i of _.range(1, SUDOKU_SHOW)) {
      const currentIndex = newSudokuIndex + i;
      _sudokusToShow.push(sudokus[currentIndex % sudokus.length]);
    }

    const step = 100 / (SUDOKU_SHOW - 1);
    const startStep = -100;

    const sudokusToShow = _sudokusToShow.map((sudoku, i) => {
      const middle = _sudokusToShow.length / 2;
      // const isMiddle = i === newSudokuIndex;
      const isLeft = i < middle;
      const isRight = i > middle;
      const isActive = newSudokuIndex === sudoku.id;
      let zIndex = 0;
      if (isRight) {
        zIndex = -i;
      }
      if (isActive) {
        zIndex = middle * 2 + 1;
      }

      const offset = isActive ? 0 : isLeft ? -70 : 70;

      const translate = `translate(${startStep + i * step + offset - 50}%, 0)`;
      const scale = isActive ? "scale(1.1)" : "";
      const perspective = isActive ? "" : "perspective(600px)";
      const rotate = isActive ? "" : `rotateY(${isLeft ? "" : "-"}60deg)`;

      return {
        sudoku,
        active: isActive,
        style: {
          opacity: 1 - Math.abs(startStep + i * step) / 100,
          transform: `${translate} ${scale} ${perspective} ${rotate}`,
          zIndex,
        },
      };
    });

    const items = sudokusToShow.map(({sudoku, style, active}) => {
      const {sudoku: sudokuCells, id, value} = sudoku;
      const isCenter = id === sudokuIndex;
      const onClick = () => {
        if (isCenter) {
          newGame(id, value);
        } else {
          changeSudoku(id);
        }
      };
      return (
        <SelectContainer key={id} active={active} style={style} onClick={onClick}>
          <SmallSudokuComponent darken={!isCenter} id={id + 1} sudoku={sudokuCells} />
        </SelectContainer>
      );
    });

    return (
      <TouchProvider
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 170,
            left: 0,
            right: 0,
          }}
        >
          {items}
        </div>
        <div
          style={{
            position: "absolute",
            top: 360,
            left: 0,
            right: 0,
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Button
            onClick={() => {
              previousSudoku();
            }}
            style={{
              marginRight: THEME.spacer.x2,
              padding: `${THEME.spacer.x2}px ${THEME.spacer.x3}px`,
            }}
          >
            {"<"}
          </Button>
          <Button
            onClick={() => {
              nextSudoku();
            }}
            style={{
              padding: `${THEME.spacer.x2}px ${THEME.spacer.x3}px`,
            }}
          >
            {">"}
          </Button>
        </div>
      </TouchProvider>
    );
  }
}

export default SelectSudoku;
