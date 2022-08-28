import THEME from "src/theme";
import styled, {css} from "styled-components";

const Button = styled.button<{
  active?: boolean;
}>`
  border-radius: ${THEME.borderRadius}px;
  background: ${THEME.colors.foreground};
  color: ${THEME.colors.background};
  font-size: ${THEME.fontSize.base}px;
  padding: ${THEME.spacer.x2 + THEME.spacer.x1}px;
  box-shadow: ${THEME.boxShadow};
  border: none;
  transition: transform 0.3s ease-out;
  &:hover {
    filter: brightness(90%);
  }

  &:focus {
    outline: none;
  }

  ${(props) =>
    props.active &&
    css`
      filter: brightness(90%);
      transform: scale(1.1);
    `}

  @media (max-width: 800px) {
    padding: ${THEME.spacer.x2}px ${THEME.spacer.x1}px;
  }
`;

export default Button;
