import * as React from 'react';
import * as Grid from '../Grid';
import {NavLink} from 'react-router-dom';

import './styles.scss';

export function Item(props) {
  return (
    <NavLink
      activeStyle={{color: 'white', fontWeight: 'bold'}}
      className={'ss_navigation-item'}
      to={props.to}
    >
      {props.children}
    </NavLink>
  );
}

export function Wrapper(props) {
  return (
    <div className={'ss_navigation-wrapper'}>
      <Grid.Container>
        <Grid.Row>
          <Grid.Col xs={12}>
            {props.children}
          </Grid.Col>
        </Grid.Row>
      </Grid.Container>
    </div>
  );
}
