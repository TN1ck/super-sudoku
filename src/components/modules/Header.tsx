import * as React from "react";
import styled from "styled-components";
import THEME from "src/theme";
import {connect} from "react-redux";

const Header = ({}) => {
  return (
    <div className="flex justify-between bg-gray-900 p-4 text-white">
      <div>{"Super Sudoku"}</div>
      <a href="https://tn1ck.com" target="_blank" className="text-gray-500 hover:underline">
        {"By tn1ck.com"}
      </a>
    </div>
  );
};

export default connect(null, {})(Header);
