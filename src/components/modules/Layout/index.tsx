import * as React from 'react';
import * as classNames from 'classnames';
import {COLORS, AvailableColors, MARGINS} from 'src/utils/constants';

import './Layout.scss';

export const Card: React.StatelessComponent = ({children}) => {
  return (
    <div className="ss_card">
      {children}
    </div>
  );
};

export const Divider: React.StatelessComponent<{
  negativeMargin?: number;
}> = ({negativeMargin}) => {
  const className = classNames('ss_divider', {
    'ss_divider--n1': negativeMargin === 1,
    'ss_divider--n2': negativeMargin === 2,
    'ss_divider--n3': negativeMargin === 3,
    'ss_divider--n4': negativeMargin === 4,
  });
  return <hr className={className} />;
};

export const Section: React.StatelessComponent<{
  children: React.ReactNode;
  color?: AvailableColors;
  fullHeight?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  marginTop?: number;
  marginBottom?: number;
  elevation?: number;
}> = ({
  children,
  color,
  fullHeight,
  paddingTop: _paddingTop,
  marginTop: _marginTop,
  paddingBottom: _paddingBottom,
  marginBottom: _marginBottom,
  elevation,
}) => {
  const backgroundColor = COLORS[color];
  const paddingTop = MARGINS[_paddingTop];
  const marginTop = MARGINS[_marginTop];
  const paddingBottom = MARGINS[_paddingBottom];
  const marginBottom = MARGINS[_marginBottom];
  const style = {
    backgroundColor,
    paddingTop,
    marginTop,
    paddingBottom,
    marginBottom,
  };
  const className = classNames(`${elevation ? `ss_elevation-${elevation}` : ''}`, 'ss_section', {
    'ss_section--full-height': fullHeight,
  });
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
