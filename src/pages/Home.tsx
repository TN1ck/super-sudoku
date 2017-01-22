import * as React from 'react';

import * as Grid from 'src/components/Grid';
import * as Test from 'src/engine/solver';

console.log(Test);

const Home: React.StatelessComponent<{}> = function (props) {
    return (
        <div>
            <Grid.Container>
                <Grid.Row>
                    <Grid.Col xs={12}>
                        <h1>{'Introduction'}</h1>
                        <p>
                            {'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'}
                        </p>
                    </Grid.Col>
                </Grid.Row>
            </Grid.Container>
        </div>
    );
};

export default Home;
