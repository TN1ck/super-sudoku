import * as React from 'react';

import * as Grid from 'src/components/modules/Grid';
import {Section, Card} from 'src/components/modules/Layout';

const Home: React.StatelessComponent<{}> = function() {
  return (
    <Section paddingBottom={4} paddingTop={4}>
      <Grid.Grid fullHeight>
        <Grid.Row center='xs' start='sm'>
          <Grid.Col xs='auto' sm={12}>
            <h1 className="ss_header">
              {'ABOUT'}
            </h1>
            <Card>
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
            </Card>
          </Grid.Col>
        </Grid.Row>
      </Grid.Grid>
    </Section>
  );
};

export default Home;
