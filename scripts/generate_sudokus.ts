import * as fs from 'fs';
import * as program from 'commander';
import * as generate from '../src/engine/generate';
import {
    SimpleSudoku,
    printSimpleSudoku,
    DIFFICULTY
} from '../src/engine/utility';

program
    .version('0.0.1')
    .option('-n, --number <n>', 'Number of sudokus to generate', parseInt, 20)
    .option(
        '-d, --difficulty [type]',
        'Difficulty [easy], [medium], [hard], [evil]',
        /^(easy|medium|hard|evil)$/i,
        'medium'
    )
    .parse(process.argv);

const mapping = {
    easy: DIFFICULTY.EASY,
    medium: DIFFICULTY.MEDIUM,
    hard: DIFFICULTY.HARD,
    evil: DIFFICULTY.EVIL
};


const difficulty = (program as any).difficulty;
const sudokuDifficulty = mapping[difficulty];


function writeSudoku (sudoku : SimpleSudoku) {
    const printedSudoku = printSimpleSudoku(sudoku);
    console.log('write sudoku\n', printedSudoku);
    fs.appendFile('sudokus.txt', printedSudoku + '\n\n', (err) => {
        if (err) throw err;
    });
}

const number = (program as any).number;
console.log(`Generate ${number} sudokus with difficulty ` + difficulty);
new Array(number).fill(0).forEach((_, i) => {
    console.log('Generate sudoku ' + (i + 1));
    writeSudoku(generate.generateSudoku(sudokuDifficulty));
});
