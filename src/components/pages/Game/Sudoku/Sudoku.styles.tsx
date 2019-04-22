import styled, {css} from "styled-components";
import THEME from "src/theme";
import {Bounds} from "src/utils/types";

export const SudokuContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: ${THEME.sudokuColors.background};
  border-radius: ${THEME.borderRadius}px;
`;

export const GridLineX = styled.div<{
  top: number;
  width: number;
  makeBold: boolean;
}>`
  position: absolute;
  left: 0;
  width: ${props => props.width}%;
  top: ${props => props.top}%;
  transform: translateY(-50%);
  height: 1px;
  background: ${THEME.sudokuColors.gridLine};
  ${props =>
    props.makeBold &&
    css`
      background: ${THEME.sudokuColors.gridLineBold};
      height: 2px;
      z-index: 1;
    `};
`;

export const GridLineY = styled.div<{
  left: number;
  height: number;
  makeBold: boolean;
}>`
  position: absolute;
  top: 0;
  height: ${props => props.height}%;
  left: ${props => props.left}%;
  background: ${THEME.sudokuColors.gridLine};
  width: 1px;
  transform: translateX(-50%);
  ${props =>
    props.makeBold &&
    css`
      background: ${THEME.sudokuColors.gridLineBold};
      width: 2px;
    `};
`;

export const CellNote = styled.div<{
  left: number;
  top: number;
}>`
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  font-size: 12px;
  color: ${THEME.sudokuColors.note};
  position: absolute;
  transform: translate(-50%, -50%);

  @media (max-width: 600px) {
    font-size: 10px;
  }
  @media (max-width: 450px) {
    font-size: 8px;
  }
`;

export const CellNoteContainer = styled.div<{
  initial: boolean;
  bounds: Bounds;
}>`
  position: absolute;
  pointer-events: none;
  font-weight: ${props => (props.initial ? "bold" : "normal")};

  width: ${props => props.bounds.width}%;
  height: ${props => props.bounds.height}%;
  top: ${props => props.bounds.top}%;
  left: ${props => props.bounds.left}%;
`;

export const GridCell = styled.div<{
  conflict: boolean;
  highlight: boolean;
  bounds: Bounds;
  active: boolean;
  notesMode: boolean;
}>`
  position: absolute;
  z-index: 0;
  background-color: transparent;
  transition: background-color 0s ease;
  &:hover {
    transition: background-color 0s ease;
    border: 1px solid ${THEME.sudokuColors.gridLineBold};
    background: ${THEME.sudokuColors.cellBackgroundHover};
  }

  width: ${props => props.bounds.width}%;
  height: ${props => props.bounds.height}%;
  top: ${props => props.bounds.top}%;
  left: ${props => props.bounds.left}%;

  ${props =>
    props.active &&
    css`
      border: 2px solid
        ${props.notesMode ? THEME.sudokuColors.cellBorderHighlightNote : THEME.sudokuColors.cellBorderHighlight};
      background: ${THEME.sudokuColors.cellBackgroundHighlight};
    `}

  ${props =>
    props.highlight &&
    css`
      background-color: ${THEME.sudokuColors.cellHighlight};
    `}

  ${props =>
    props.conflict &&
    css`
      transition: background-color 0.3s ease;
      background-color: ${THEME.sudokuColors.cellConflict};
    `}
`;

export const GridCellNumber = styled.div<{
  initial: boolean;
  left: number;
  top: number;
}>`
  position: absolute;
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  color: ${THEME.sudokuColors.number};
  font-size: 20px;
  font-weight: bold;
  ${props =>
    props.initial &&
    css`
      color: ${THEME.sudokuColors.numberInitial};
    `}
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 2;
`;
