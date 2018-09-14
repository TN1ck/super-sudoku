import * as React from 'react';
import { Container } from 'src/components/modules/Layout';
import { CardBody, Card } from 'src/components/modules/Card';

const Home: React.StatelessComponent<{}> = function() {
  return (
    <Container>
      <Card>
        <CardBody>
          <h1 className="ss_header">
            {'ABOUT'}
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
        </CardBody>
      </Card>
    </Container>
  );
};

export default Home;
