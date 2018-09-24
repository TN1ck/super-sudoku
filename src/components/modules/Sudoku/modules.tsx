import styled, { css } from "styled-components";
import THEME from "src/theme";
import { withProps } from "src/utils";

export const SudokuSmallTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${THEME.colors.primary};
  border-bottom-right-radius: ${THEME.borderRadius}px;
  color: white;
  font-size: 14px;
  position: absolute;
  height: 34px;
  z-index: 4;
  width: 34px;
  top: 0;
  left: 0;
`;

export const SmallGridLineX = withProps<{
  top: number;
  height: number;
  width: number;
  background: string;
}>()(styled.div)`
  position: absolute;
  left: 0;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  top: ${props => props.top}px;
  background: ${props => props.background};
`;

export const SmallGridLineY = withProps<{
  left: number;
  height: number;
  width: number;
  background: string;
}>()(styled.div)`
  position: absolute;
  top: 0;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  left: ${props => props.left}px;
  background: ${props => props.background};
`;

export const SudokuSmall = styled.div`
  position: relative;
  background-color: white;
  color: black;
  cursor: default;
`;

export const Grid33 = styled.div`
  border: 1px solid ${THEME.colors.gray200};
  display: flex;
  flex-wrap: wrap;
  width: 33.333%;
  height: 33.333%;
`;

export const CellNote = styled.div`
  font-size: 12px;
  color: ${THEME.colors.gray200};
  position: absolute;
  transform: translate(-50%, -50%);

  @media (max-width: 600px) {
    font-size: 10px;
  }
  @media (max-width: 450px) {
    font-size: 8px;
  }
`;

export const CellNoteContainer = styled.div`
  position: absolute;
  pointer-events: none;
`;

export const CellNumber = styled.div`
  z-index: 5;
  font-size: 16px;
`;

export const CellInner = withProps<{
  active: boolean;
}>()(styled.div)`
  user-select: none;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.1s ease;

  ${props =>
    props.active &&
    css`
      z-index: 8;
      background-color: white;
      pointer-events: none;
    `}
`;

export const GridCell = withProps<{
  highlight: boolean;
}>()(styled.div)`
  &:hover {
    border: 1px solid ${THEME.colors.primary};
    margin-left: -1px;
    margin-top: -1px;
  }

  ${props =>
    props.highlight &&
    css`
      background: ${THEME.colors.cellHighlight};
    `}
`;

export const CellContainer = withProps<{
  initial: boolean;
  highlight: boolean;
}>()(styled.div)`
  position: relative;
  width: 33.333%;
  height: 33.333%;
  border-width: 1px;
  border-style: solid;
  border-color: ${THEME.colors.gray700};

  &:hover {
      border-color: ${THEME.colors.primary};
      cursor: pointer;
  }

  ${props =>
    props.initial &&
    css`
      font-weight: bold;
      pointer-events: none;
      cursor: default;

      &:hover {
        cursor: default;
      }
    `}
`;

export const GridCellNumber = withProps<{
  initial: boolean;
  left: number;
  top: number;
}>()(styled.div)`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  color: ${THEME.colors.primary};
  font-size: 16px;
  font-weight: bold;
  ${props =>
    props.initial &&
    css`
      color: black;
    `}
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 2;
`;
