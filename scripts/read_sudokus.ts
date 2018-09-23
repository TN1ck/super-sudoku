import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import {groupBy} from 'lodash';

const infile = path.join(__dirname, '../sudokus.txt');
const outfile = path.join(__dirname, '../sudokus.json');

const lineReader = readline.createInterface({
  input: fs.createReadStream(infile),
});


const sudokus = [];
let index = 0;
let currentIterations = 0;
let currentSudoku = [];

lineReader.on('line', (line) => {
  if (index === 0) {
    currentIterations = parseInt(line, 10);
  }
  if (index > 0 && index < 10) {
    currentSudoku.push(line);
  }
  if (index === 11) {
    sudokus.push({
      iterations: currentIterations,
      sudoku: currentSudoku.join('\n')
    })
    currentIterations = 0;
    index = 0;
    currentSudoku = [];
  } else {
    index += 1;
  }
});

const difficultyMapping = [
  [0, 17, 'easy'],
  [20, 40, 'medium'],
  [70, 120, 'hard'],
  [300, 1000, 'evil'],
];

lineReader.on('close', () => {
  const groupedSudokus = groupBy(sudokus, s => {
    const difficulty = difficultyMapping.find(d => {
      return s.iterations >= d[0] && s.iterations < d[1];
    });
    return difficulty ? difficulty[2] : 'not_grouped';
  });
  console.log(Object.keys(groupedSudokus).map(k => [k, groupedSudokus[k].length]));
  delete groupedSudokus.not_grouped;
  fs.writeFileSync(outfile, JSON.stringify(groupedSudokus));
});
