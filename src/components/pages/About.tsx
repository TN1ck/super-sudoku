import * as React from "react";
import {Container} from "src/components/modules/Layout";
import {CardBody, Card} from "src/components/modules/Card";

const About = function () {
  return (
    <Container>
      <Card>
        <CardBody className="mt-8">
          <h1 className="text-xl">{"ABOUT"}</h1>
          <p>
            {`
              This is a completely free and open-source Sudoku game. It is free of ads and free of tracking.
              It is built by Tom Nick, you can find more information at his website at `}
            <a className="text-blue-800 underline" href="https://tn1ck.com">
              {"https://tn1ck.com"}
            </a>{" "}
            or the GitHub repository{" "}
            <a className="text-blue-800 underline" href="https://github.com/TN1ck/super-sudoku">
              {"https://github.com/TN1ck/super-sudoku"}
            </a>
            {"."}
          </p>
        </CardBody>
      </Card>
    </Container>
  );
};

export default About;
