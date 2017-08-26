import * as React from 'react';

import * as Grid from 'src/components/modules/Grid';
import {Card, Section} from 'src/components/modules/Layout';

const Home: React.StatelessComponent<{}> = function() {
  return (
    <Section paddingBottom={4} paddingTop={4}>
      <Grid.Grid fullHeight>
        <Card>
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
        </Card>
      </Grid.Grid>
    </Section>
  );
};

export default Home;
