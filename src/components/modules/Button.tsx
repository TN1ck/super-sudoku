
import THEME from "src/theme";
import styled from "styled-components";

const Button = styled.button`
  border-radius: ${THEME.borderRadius}px;
  background: ${THEME.colors.primary};
  color: ${THEME.colors.white};
  font-size: ${THEME.fontSize.base}px;
  padding: ${THEME.spacer.x2}px;
  box-shadow: ${THEME.boxShadow};
  border: none;
  &:hover {
    cursor: pointer;
    filter: brightness(110%);
  }
`;

export default Button;
