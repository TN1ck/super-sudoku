import * as React from 'react';
import * as classNames from 'classnames';

export const Col: React.StatelessComponent<{
    xs?: number,
    sm?: number,
    md?: number,
    lg?: number,
    children?: React.ReactChild
}> = function _Col (props) {

    const xsClass = props.xs ? 'col-' + props.xs : '';
    const smClass = props.sm ? 'sm-col-' + props.sm : '';
    const mdClass = props.md ? 'md-col-' + props.md : '';
    const lgClass = props.lg ? 'lg-col-' + props.lg : '';

    return (
        <div className={classNames('left px2', xsClass, smClass, mdClass, lgClass)}>
            {props.children}
        </div>
    );
};

export const Row: React.StatelessComponent<{
    children?: React.ReactChild
}> = function _Row (props) {
    return (
        <div className='clearfix mxn2'>
            {props.children}
        </div>
    );
};

export const Container: React.StatelessComponent<{
    children?: React.ReactChild,
    fluid?: boolean
}> = function _Container (props) {
    const classes = classNames('clearfix', 'mx-auto', {
        'max-width-4': !props.fluid
    });
    return (
        <div className={classes}>
            {props.children}
        </div>
    );
};
