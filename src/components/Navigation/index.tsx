import * as React from 'react';
const CSSModules = require('react-css-modules');
const styles = require('./styles.css');
import { Link } from 'react-router';

function _Item (props) {
    return (
        <Link
            activeStyle={{color: 'black', fontWeight: 'bold'}}
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
            {props.children}
        </div>
    );
};

export const Item = CSSModules(_Item, styles);
export const Wrapper = CSSModules(_Wrapper, styles);
