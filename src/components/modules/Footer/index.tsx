import * as React from 'react';
import styled from 'styled-components';
import THEME from 'src/theme';

const Footer = styled.footer`
  padding: ${THEME.spacer.x3}px;
  color: white;
`;

export default () => {
  return (
    <Footer>
      {'Made with <3 in Berlin'}
    </Footer>
  );
};
