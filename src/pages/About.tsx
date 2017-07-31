import * as React from 'react';

import * as Grid from 'src/components/Grid';
// import {generateSudoku, DIFFICULTY, checkForUniqueness} from 'src/engine/generate';
// import {solve} from 'src/engine/solver';
// import {complexSudokuToSimpleSudoku, printSimpleSudoku, parseSudoku, solvableSudoku1} from 'src/engine/utility';

// const sudoku = parseSudoku([
//     '_________',
//     '_________',
//     '_________',
//     '_____4___',
//     '_________',
//     '_________',
//     '_________',
//     '_________',
//     '_________'
// ].join('\n'));

// console.log('is it unque?', checkForUniqueness(sudoku));
// console.log('is it unque?', checkForUniqueness(parseSudoku(solvableSudoku1)));

// setTimeout(() => {
//     console.log(printSimpleSudoku(generateSudoku(DIFFICULTY.HARD)));
// });

const Home: React.StatelessComponent<{}> = function() {
  return (
    <div>
      <Grid.Container>
        <Grid.Row>
          <Grid.Col xs={12}>
            <h1>
              {'Introduction'}
            </h1>
            <p>
              {`Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                                sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                                sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
                                Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
                                invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
                                At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
                                no sea takimata sanctus est Lorem ipsum dolor sit amet.`}
            </p>
          </Grid.Col>
        </Grid.Row>
      </Grid.Container>
    </div>
  );
};

export default Home;
