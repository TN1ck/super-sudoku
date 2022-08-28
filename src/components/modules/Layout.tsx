import styled from "styled-components";
import THEME from "src/theme";

export const Container = styled.div`
  max-width: ${THEME.widths.maxDesktop}px;
  margin: 0 auto;

  @media (max-width: ${THEME.widths.maxDesktop}px) {
    padding-left: ${8}px;
    padding-right: ${8}px;
  }
`;
