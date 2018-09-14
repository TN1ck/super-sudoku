import styled from 'styled-components';
import THEME from 'src/theme';

export const Card = styled.div`
  background: white;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
  border-radius: ${THEME.borderRadius}px;
`;

export const CardBody = styled.div`
  padding: ${THEME.spacer.x3}px;
`;
