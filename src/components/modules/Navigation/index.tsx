import * as React from 'react';
import * as Grid from 'src/components/modules/Grid';
import {Link} from 'react-static';

import './styles.scss';

export function Item(props) {
  return (
    <Link
      activeStyle={{color: 'white', fontWeight: 'bold'}}
      className={'ss_navigation-item'}
      exact
      to={props.to}
    >
      {props.children}
    </Link>
  );
}

export function Wrapper(props) {
  return (
    <div className={'ss_navigation-wrapper ss_elevation-1'}>
      <Grid.Grid>
        <Grid.Row>
          <Grid.Col xs={12}>
            {props.children}
          </Grid.Col>
        </Grid.Row>
      </Grid.Grid>
    </div>
  );
}
