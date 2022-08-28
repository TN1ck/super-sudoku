import * as React from "react";
import styled from "styled-components";
import THEME from "src/theme";
import {connect} from "react-redux";

const Header = ({}) => {
  return (
    <div className="flex p-4 bg-gray-900 text-white">
      <div>{"Super Sudoku"}</div>
    </div>
  );
};

export default connect(null, {})(Header);
