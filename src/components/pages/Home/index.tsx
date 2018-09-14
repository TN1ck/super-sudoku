import * as React from 'react';
import { Link } from 'react-static';

import { Container } from 'src/components/modules/Layout';
import Button from 'src/components/modules/Button';
import THEME from 'src/theme';
import styled from 'styled-components';
import { Card, CardBody } from 'src/components/modules/Card';

const HomeMain = styled.div`
  h1 {
    font-size: ${THEME.sizes.header}px;
    line-height: 0.8em;
    margin-top: 0;
  }
`;

const Center = styled.div`
  text-align: center;
`;

const Home: React.StatelessComponent = () => {
  return (
    <Container>
      <HomeMain>
        <Card>
          <CardBody>
            <Center>
              <h1>
                {'SUPER'}
                <br/>
                {'SUDOKU!'}
              </h1>
              <Link to='/sudoku'>
                <Button>
                  {'Play Sudoku!'}
                </Button>
              </Link>
            </Center>
          </CardBody>
        </Card>
      </HomeMain>
    </Container>
  );
};

export default Home;
