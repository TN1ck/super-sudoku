import * as React from 'react';
import * as _ from 'lodash';

import {
  changeIndex,
} from 'src/ducks/game';
import {DIFFICULTY} from 'src/engine/utility';

import {parseSudoku} from 'src/ducks/sudoku/model';

import SUDOKUS from 'src/sudokus';
import { GameMenuContainer } from 'src/components/pages/Game/GameMenu';
import Button from 'src/components/modules/Button';
import THEME from 'src/theme';
import SmallSudokuComponent from 'src/components/modules/Sudoku/SmallSudoku';

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
  setDifficulty: () => void;
  difficulty: DIFFICULTY;
  sudokuIndex: number;
  changeIndex: typeof changeIndex;
}> = function({newGame, setDifficulty, difficulty, sudokuIndex, changeIndex}) {

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
      elevation: isActive ? 4 : 1,
      style: {
        opacity: 1 - Math.abs(startStep + i * step) / 100,
        transform: `${translate} ${scale} ${perspective} ${rotate}`,
        zIndex,
      },
    };
  });

  const items = sudokusToShow.map(({sudoku, style, elevation}) => {
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
      <div
        key={id}
        className={`ss_elevation-${elevation}`}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          ...style,
          transitionProperty: 'transform, opacity, box-shadow',
          transitionDuration: '500ms',
          transitionTimingFunction: 'ease-out',
        }}
      >
        <SmallSudokuComponent
          darken={!isCenter}
          id={id}
          onClick={onClick}
          sudoku={sudokuCells}
        />
      </div>
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
