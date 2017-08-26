import * as React from 'react';
import {Link} from 'react-router-dom';

import * as Grid from 'src/components/modules/Grid';
import {Section} from 'src/components/modules/Layout';

import './Home.scss';

const Home: React.StatelessComponent<{}> = function() {
  return (
    <Section paddingBottom={4} paddingTop={4}>
      <Grid.Grid fullHeight>
          <Grid.Row>
            <Grid.Col xs={12}>
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
