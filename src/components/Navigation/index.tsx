import * as React from 'react';
import * as Grid from '../Grid';
const CSSModules = require('react-css-modules');
const styles = require('./styles.css');
import { Link } from 'react-router';

function _Item (props) {
    return (
        <Link
            activeStyle={{color: 'white', fontWeight: 'bold'}}
            className={styles['navigation-item']}
            to={props.to}
        >
            {props.children}
        </Link>
    );
};

function _Wrapper (props) {
    return (
        <div styleName='navigation-wrapper'>
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

export const Item = CSSModules(_Item, styles);
export const Wrapper = CSSModules(_Wrapper, styles);
