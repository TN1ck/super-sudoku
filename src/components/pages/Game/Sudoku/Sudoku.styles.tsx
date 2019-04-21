import styled, {css} from "styled-components";
import THEME from "src/theme";
import {Bounds} from "src/utils/types";

export const SudokuContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
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
  background: #eeeeee;
  ${props =>
    props.makeBold &&
    css`
      background: #aaaaaa;
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
  background: #eeeeee;
  width: 1px;
  transform: translateX(-50%);
  ${props =>
    props.makeBold &&
    css`
      background: #aaaaaa;
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

export const CellNumber = styled.div`
  z-index: 5;
  font-size: 16px;
`;

export const CellInner = styled.div<{
  active: boolean;
}>`
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

export const GridCell = styled.div<{
  highlight: boolean;
  bounds: Bounds;
  active: boolean;
}>`
  position: absolute;
  z-index: 0;
  background-color: transparent;
  transition: background-color 0.3s ease;
  &:hover {
    border: 1px solid ${THEME.colors.primary};
  }

  width: ${props => props.bounds.width}%;
  height: ${props => props.bounds.height}%;
  top: ${props => props.bounds.top}%;
  left: ${props => props.bounds.left}%;

  ${props =>
    props.active &&
    css`
      border: 1px solid ${THEME.colors.primary};
    `}

  ${props =>
    props.highlight &&
    css`
      background-color: ${THEME.colors.cellHighlight};
    `}
`;

export const CellContainer = styled.div<{
  initial: boolean;
  highlight: boolean;
}>`
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

export const GridCellNumber = styled.div<{
  initial: boolean;
  left: number;
  top: number;
}>`
  position: absolute;
  left: ${props => props.left}%;
  top: ${props => props.top}%;
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
