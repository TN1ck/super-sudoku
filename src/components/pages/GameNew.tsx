import * as React from 'react';
import SUDOKUS from "src/assets/sudokus-new";
import { connect } from 'react-redux';
import { RootState } from 'src/ducks';
import { DIFFICULTY } from 'src/engine/utility';
import { Container } from '../modules/Layout';
import styled from 'styled-components';
import SmallSudokuComponent from '../modules/Sudoku/SudokuSmall';

const TabBar = styled.div`
  width: 100%;
  background: red;
  display: flex;
  background: #444444;
  color: white;
`;

const TabItem = styled.div<{
  active: boolean;
}>`
  padding: 10px 10px;
  background: ${p => p.active ? "black": "transparent"};
`;

const Grid = styled.div`
  min-height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header"
    "main";
`;

const MainArea = styled.div`
  grid-area: main;
  padding-top: 30px;
  background: black;
  position: relative;
`;

const SudokusContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
`;

const SudokuContainer = styled.div`
  padding: 10px;
`;

const Header = styled.div`
  grid-area: header;
`;

class GameIndex extends React.Component<
  {
    difficulty: DIFFICULTY;
  }
> {
  constructor(props) {
    super(props);
  }
  render() {
    let {difficulty} = this.props;
    const sudokus = SUDOKUS[difficulty];

    return (
      <SudokusContainer>
        {sudokus.map(sudoku => {
          return (
            <SudokuContainer key={sudoku.id}>
              <SmallSudokuComponent id={sudoku.id + 1} sudoku={sudoku.sudoku} darken />
            </SudokuContainer>
          );
        })}
      </SudokusContainer>
    );
  }
}

interface GameNewProps {
  difficulty: DIFFICULTY;
}

const GameNew: React.StatelessComponent<GameNewProps> = ({difficulty}) => {
  return (
    <Grid>
      <Header>
        <Container>
          <h1>New Game</h1>
          <TabBar>
            {[DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.EVIL].map(d => {
              return (
                <TabItem active={d === difficulty}>
                  {d}
                </TabItem>
              )
            })}
          </TabBar>
        </Container>
      </Header>
      <MainArea>
        <Container>
          <GameIndex difficulty={difficulty} />
        </Container>
      </MainArea>
    </Grid>
  )
}

const GameNewConnected = connect(
  (state: RootState) => {
    return {
      difficulty: state.choose.difficulty,
    };
  }
)(GameNew);

export default GameNewConnected;
