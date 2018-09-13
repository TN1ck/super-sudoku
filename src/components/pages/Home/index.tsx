import * as React from 'react';
import { Link } from 'react-static';

import * as Grid from 'src/components/modules/Grid';
import {Section} from 'src/components/modules/Layout';

import './Home.scss';

const Home: React.StatelessComponent = () => {
  return (
    <Section paddingBottom={4} paddingTop={4}>
      <Grid.Grid fullHeight>
          <Grid.Row center='xs' start='sm'>
            <Grid.Col xs='auto' sm={12}>
              <h1 className="ss_header">
                {'SUPER'}
                <br/>
                {'SUDOKU'}
              </h1>
              <Link to='/sudoku'>
                <button className={'ss_play'}>
                  {'Play Sudoku!'}
                </button>
              </Link>
            </Grid.Col>
          </Grid.Row>
      </Grid.Grid>
    </Section>
  );
};

export default Home;
