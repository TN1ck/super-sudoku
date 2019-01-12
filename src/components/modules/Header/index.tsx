import * as React from "react";
import {Link} from "react-router-dom";
import styled from "styled-components";
import THEME from "src/theme";
import {connect} from "react-redux";

const HeaderContainer = styled.div`
  padding: ${THEME.spacer.x2}px;
  background: ${THEME.colors.gray600};
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
    color: ${THEME.colors.gray400};
    text-decoration: none;

    &:visited {
      color: ${THEME.colors.gray400};
    }
    padding: ${THEME.spacer.x1}px ${THEME.spacer.x2}px;
    border-radius: ${THEME.borderRadius}px;

    &:hover {
      color: ${THEME.colors.gray100};
    }

    /* &.active {
      color: white;
      background-color: ${THEME.colors.gray200};
    } */
  }
`;

const Header = ({}) => {
  return (
    <HeaderContainer>
      <HeaderLinks>
        <HeaderLink>
          <Link to={"/"}>{"Sudoku"}</Link>
        </HeaderLink>
      </HeaderLinks>
    </HeaderContainer>
  );
};

export default connect(
  null,
  {},
)(Header);
