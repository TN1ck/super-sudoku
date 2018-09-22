import * as React from 'react';
import * as _ from 'lodash';
import styled, { css } from 'styled-components';

import {
  changeIndex,
} from 'src/ducks/game';
import {DIFFICULTY} from 'src/engine/utility';

import {parseSudoku} from 'src/ducks/sudoku/model';

import SUDOKUS from 'src/sudokus';
import Button from 'src/components/modules/Button';
import THEME from 'src/theme';
import SmallSudokuComponent from 'src/components/modules/Sudoku/SmallSudoku';
import { withProps } from 'src/utils';

const SelectContainer = withProps<{
  active: boolean;
}>()(styled.div)`
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

  ${props => props.active && css`
    &:hover {
      cursor: pointer;
      &:before {
        opacity: 1;
      }
    }
  `}
`;

const parseListOfSudokus = (sudokus: Array<{value: string, id: number}>) => {
  return sudokus.map(({value, id}) => {
    return {sudoku: parseSudoku(value), id, value};
  });
};

const PARSED_SUDOKUS = {
  [DIFFICULTY.EASY]: parseListOfSudokus(SUDOKUS[DIFFICULTY.EASY]),
  [DIFFICULTY.MEDIUM]: parseListOfSudokus(SUDOKUS[DIFFICULTY.MEDIUM]),
  [DIFFICULTY.HARD]: parseListOfSudokus(SUDOKUS[DIFFICULTY.HARD]),
  [DIFFICULTY.EVIL]: parseListOfSudokus(SUDOKUS[DIFFICULTY.EVIL]),
 };

const SelectSudoku: React.StatelessComponent<{
  newGame: (difficulty, sudokuId) => void;
  difficulty: DIFFICULTY;
  sudokuIndex: number;
  changeIndex: typeof changeIndex;
}> = function({newGame, difficulty, sudokuIndex, changeIndex}) {

  const SUDOKU_SHOW = 8;
  const sudokus = PARSED_SUDOKUS[difficulty];

  const _sudokusToShow = [];

  for (const i of _.range(1, SUDOKU_SHOW)) {
    const currentIndex = sudokuIndex - i;
    _sudokusToShow.push(sudokus[(currentIndex + sudokus.length) % sudokus.length]);
  }
  _sudokusToShow.reverse();
  _sudokusToShow.push(sudokus[sudokuIndex]);
  for (const i of _.range(1, SUDOKU_SHOW)) {
    const currentIndex = sudokuIndex + i;
    _sudokusToShow.push(sudokus[(currentIndex) % sudokus.length]);
  }

  const step = 100 / (SUDOKU_SHOW - 1);
  const startStep = -100;

  const sudokusToShow = _sudokusToShow.map((sudoku, i) => {
    const middle = _sudokusToShow.length / 2;
    // const isMiddle = i === sudokuIndex;
    const isLeft = i < middle;
    const isRight = i > middle;
    const isActive = sudokuIndex === sudoku.id;
    let zIndex = 0;
    if (isRight) {
      zIndex = -i;
    }
    if (isActive) {
      zIndex = middle * 2 + 1;
    }

    const offset = isActive ? 0 : (isLeft ? -70 : 70);

    const translate = `translate(${(startStep + i * step) + offset - 50}%, 0)`;
    const scale = isActive ? 'scale(1.1)' : '';
    const perspective = isActive ? '' : 'perspective(600px)';
    const rotate = isActive ? '' : `rotateY(${isLeft ? '' : '-'}60deg)`;

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
        changeIndex(id);
      }
    };
    return (
      <SelectContainer
        active={active}
        key={id}
        style={style}
        onClick={onClick}
      >
        <SmallSudokuComponent
          darken={!isCenter}
          id={id + 1}
          sudoku={sudokuCells}
        />
      </SelectContainer>
    );
  });

  return (
    <div>
      <div style={{
        position: 'absolute',
        top: 170,
        left: 0,
        right: 0,
      }}>
        {items}
      </div>
      <div style={{
          position: 'absolute',
          top: 360,
          left: 0,
          right: 0,
          justifyContent: 'center',
          display: 'flex',
        }}
      >
        <Button
          onClick={() => {
            changeIndex((sudokuIndex - 1 + sudokus.length) % sudokus.length);
          }}
          style={{
            marginRight: THEME.spacer.x2,
          }}
        >
          {'Previous'}
        </Button>
        <Button
          onClick={() => {
          changeIndex((sudokuIndex + 1) % sudokus.length);
        }}>
          {'Next'}
        </Button>
      </div>
    </div>
  );
};

export default SelectSudoku;
