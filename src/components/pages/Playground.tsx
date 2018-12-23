import * as React from "react";
import {Container} from "src/components/modules/Layout";
import {CardBody, Card} from "src/components/modules/Card";

class Playground extends React.Component {
  render() {
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
