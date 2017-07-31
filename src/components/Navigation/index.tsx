import * as React from 'react';
import * as Grid from '../Grid';
const styles = require('./styles.css');
import { NavLink } from 'react-router-dom';

export function Item (props) {
    return (
        <NavLink
            activeStyle={{color: 'white', fontWeight: 'bold'}}
            className={styles['navigation-item']}
            to={props.to}
        >
            {props.children}
        </NavLink>
    );
};

export function Wrapper (props) {
    return (
        <div className={styles['navigation-wrapper']}>
            <Grid.Container>
                <Grid.Row>
                    <Grid.Col xs={12}>
                        {props.children}
                    </Grid.Col>
                </Grid.Row>
            </Grid.Container>
        </div>
    );
};
