import * as React from "react";
import {Container} from "src/components/modules/Layout";
import {CardBody, Card} from "src/components/modules/Card";

import SUDOKUS from "src/sudokus";
import {parseListOfSudokus, DIFFICULTY, ParsedSudoku} from "src/engine/utility";
import * as solverAC3 from "src/engine/solverAC3";

class Playground extends React.Component {
  render() {
    const list = parseListOfSudokus(SUDOKUS[DIFFICULTY.EVIL]);
    const bla = solverAC3.solve(list[0].sudoku);
    console.log(bla);
    console.log(list.map(s => solverAC3.solve(s.sudoku).iterations));
    const transform = (sudoku: ParsedSudoku) => {
      const solved = solverAC3.solve(sudoku.sudoku);
      return {
        sudoku: sudoku.sudoku.map(d => d.map(dd => dd || 0)),
        id: sudoku.id,
        solved: solved.sudoku.map(d => d.map(dd => dd || 0)),
        iterations: solved.iterations,
      };
    };
    const newThing = {};
    Object.keys(SUDOKUS).forEach(key => {
      const list = parseListOfSudokus(SUDOKUS[key]);
      newThing[key] = list.map(transform);
    });
    console.log(newThing);
    return (
      <Container>
        <Card>
          <CardBody>
            <h1 className="ss_header">{"Playground"}</h1>
          </CardBody>
        </Card>
      </Container>
    );
  }
}

export default Playground;
