import styled from "styled-components";
import THEME from "src/theme";

export const Container = styled.div`
  min-width: 300px;
  max-width: 1000px;
  padding: 0 ${THEME.spacer.x3}px;
  margin: 0 auto;
`;
