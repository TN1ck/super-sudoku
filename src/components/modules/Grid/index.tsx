// Adapted from https://github.com/LIQIDTechnology/liqid-react-components

import * as React from 'react';
import * as classNames from 'classnames';

import './Grid.scss';

/**
 * Grid wrapper component
 */
export const Grid: React.StatelessComponent<{
  fluid?: boolean;
  fullHeight?: boolean;
  className?: string;
  tagName?: string;
  children: React.ReactNode;
}> = props => {
  const containerClass = props.fluid ? 'fb-container-fluid' : 'fb-container';
  const classes = classNames(props.className, containerClass, {
    'fb-container-full-height': props.fullHeight,
  });
  const tag = props.tagName || 'div';

  return React.createElement(tag as any, {className: classes}, props.children);
};

const classMap = {
  // Define width for breakpoints
  xs: 'fb-col-xs',
  sm: 'fb-col-sm',
  md: 'fb-col-md',
  lg: 'fb-col-lg',
  // Define from which breakpoints on the given offset should be applied
  xsOffset: 'fb-col-xs-offset',
  smOffset: 'fb-col-sm-offset',
  mdOffset: 'fb-col-md-offset',
  lgOffset: 'fb-col-lg-offset',
};

type ColumType = number | boolean | string;
/**
 * Column component
 */
export const Col: React.StatelessComponent<{
  xs?: ColumType; // display as column from xs-breakpoint on
  sm?: ColumType; // display as column from sm-breakpoint on
  md?: ColumType; // display as column from md-breakpoint on
  lg?: ColumType; // display as column from lg-breakpoint on
  xsOffset?: number; // add an xs offset to the column
  smOffset?: number; // add an sm offset to the column
  mdOffset?: number; // add an md offset to the column
  lgOffset?: number; // add an lg offset to the column
  reverse?: boolean; // display elements reversed
  className?: string; // classes that should be added to the column
  tagName?: string; // tag that should be used instead of a div
  children?: React.ReactNode; // content which should be wrapped by the column
  noFlex?: boolean; // should the column not be displayed as flex item?
  flex?: boolean;
}> = props => {
  const colBaseClasses = Object.keys(props)
    .filter(key => {
      // filter props that match any item in classMap
      return classMap[key];
    })
    .map(key => {
      // take care of valid classnames
      const colBase = !(typeof props[key] === 'boolean')
        ? classMap[key] + '-' + props[key]
        : classMap[key];
      return colBase;
    })
    .join(' ')
    .toString();

  const hasBreakpoint = props.xs || props.sm || props.md || props.lg;
  const classes = classNames('fb-col', props.className, colBaseClasses, {
    'fb-flex': !props.noFlex && props.flex !== undefined,
    'reverse': props.reverse,
    [classMap.xs]: !hasBreakpoint,
  });

  const tag = props.tagName || 'div';
  return React.createElement(tag as any, {className: classes}, props.children);
};

/**
 * Converts string from hyphen to cameCase
 */
function toCamelCase(str: string) {
  // TODO: In utility
  const regex = /-([a-z])/g; // search for hyphen which is followed by a lowercase letter
  return str.replace(regex, letter => {
    return letter[1].toUpperCase(); // strip hyphen and return letter as uppercase
  });
}

// Valid props that can be used to modify behaviour
const modificatorKeys = [
  'start',
  'center',
  'end',
  'top',
  'middle',
  'blockcenter',
  'bottom',
  'around',
  'between',
  'first',
  'last',
  'stretch',
  'no-reverse-col',
  'reverse-col',
  'reverse-row',
  'no-reverse-row',
];

type RowModificatorType = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Row component
 */
export const Row: React.StatelessComponent<{
  column?: RowModificatorType;
  row?: RowModificatorType;
  noGutter?: boolean;
  gutterTopBottom?: boolean;
  reverse?: boolean; // display elements reversed
  start?: RowModificatorType; // place left for given viewport
  center?: RowModificatorType; // center boxes and text for given viewport
  end?: RowModificatorType; // place right for given viewport
  blockcenter?: RowModificatorType; // center boxes and not the text-content itself
  top?: RowModificatorType; // vertical align top
  middle?: RowModificatorType; // vertical align middle
  bottom?: RowModificatorType; // vertical align bottom
  around?: RowModificatorType; // distribute unused space around items evenly
  stretch?: RowModificatorType; // stretch items to fill space
  between?: RowModificatorType; // distribute unused space between items
  first?: RowModificatorType; // make element first first in the order
  last?: RowModificatorType; // make element last first in the order
  className?: string; // classes that should be added to the row
  tagName?: string; // tag that should be used instead of a div
  children?: React.ReactNode; // content which should be wrapped by the row
  noFlex?: boolean; // should the row not be displayed as flex item?
}> = props => {
  const modificators = modificatorKeys
    .filter(modificatorKey => {
      // filter modificatorKeys that are matching props
      const key = toCamelCase(modificatorKey);
      return props[key];
    })
    .map(modificatorKey => {
      // create valid classnames
      const value = props[toCamelCase(modificatorKey)];
      return `fb-${modificatorKey}-${value}`;
    });

  const classes = classNames(props.className, modificators, {
    // Col
    [`fb-col-${props.column}`]: props.column !== undefined,
    // Row
    'fb-row': !props.noFlex,
    [`fb-row-${props.row}`]: props.row !== undefined,
    'fb-row--no-gutter': props.noGutter,
    'fb-row--gutter-top-bottom': props.gutterTopBottom,
  });

  const tag = props.tagName || 'div';
  return React.createElement(tag as any, {className: classes}, props.children);
};

export default {
  Grid,
  Col,
  Row,
};
