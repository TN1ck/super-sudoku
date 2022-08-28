import * as React from "react";
import {Link} from "@reach/router";
import styled from "styled-components";
import THEME from "src/theme";
import {connect} from "react-redux";

const HeaderContainer = styled.div`
  padding: ${THEME.spacer.x2}px;
  background: ${THEME.colors.foreground};
  display: flex;
`;

const HeaderLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HeaderLink = styled.li`
  float: left;
  a {
    position: relative;
    ${THEME.colors.background};
    text-decoration: none;

    &:visited {
      color: ${THEME.colors.background};
    }
    padding: ${THEME.spacer.x1}px ${THEME.spacer.x2}px;
    border-radius: ${THEME.borderRadius}px;

    &:hover {
      color: ${THEME.colors.primary};
    }
  }
`;

const Header = ({}) => {
  return (
    <HeaderContainer>
      <HeaderLinks>
        <HeaderLink>
          <Link to={"/"}>{"Super Sudoku"}</Link>
        </HeaderLink>
      </HeaderLinks>
    </HeaderContainer>
  );
};

export default connect(null, {})(Header);
