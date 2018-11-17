import THEME from "src/theme";
import styled, {css} from "styled-components";

const Button = styled.button<{
  active?: boolean;
}>`
  border-radius: ${THEME.borderRadius}px;
  background: ${THEME.colors.primary};
  color: ${THEME.colors.white};
  font-size: ${THEME.fontSize.base}px;
  padding: ${THEME.spacer.x2}px;
  box-shadow: ${THEME.boxShadow};
  border: none;
  transition: transform 0.3s ease-out;
  &:hover {
    cursor: pointer;
    filter: brightness(110%);
  }

  &:focus {
    outline: none;
  }

  ${props =>
    props.active &&
    css`
      filter: brightness(110%);
      transform: scale(1.1);
    `}
`;

export default Button;
