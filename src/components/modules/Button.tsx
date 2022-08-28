import THEME from "src/theme";
import styled, {css} from "styled-components";

const Button = styled.button.attrs({
  className: "px-4 py-2",
})<{
  active?: boolean;
}>`
  border-radius: ${THEME.borderRadius}px;
  background: ${THEME.colors.foreground};
  color: ${THEME.colors.background};
  font-size: ${THEME.fontSize.base}px;
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
    padding: ${8}px ${4}px;
  }
`;

export default Button;
