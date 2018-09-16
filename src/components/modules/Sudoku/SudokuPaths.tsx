import React from 'react';
import { COLORS } from 'src/utils/colors';
import { ConflictingPath } from 'src/components/modules/Sudoku/state';

const SudokuPaths: React.StatelessComponent<{
  width: number;
  height: number;
  paths: ConflictingPath[];
  fontSize: number;
}> = ({
  width,
  height,
  paths,
  fontSize
}) => {
  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        zIndex: 1,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {paths.map((c, i) => {
        const from = c.from.cell;
        const to = c.to.cell;
        const path = `
          M ${from.x} ${from.y}
          L ${from.x} ${to.y}
          L ${to.x} ${to.y}
        `;

        const color = COLORS[from.cell.number];
        return (
          <g key={i}>
            <path
              stroke={color} strokeWidth="2" fill="none"
              d={path}
            />
            <circle r={fontSize} cx={from.x} cy={from.y} stroke={color} strokeWidth="2" fill="white"/>
            <circle r={fontSize} cx={to.x} cy={to.y} stroke={color} strokeWidth="2" fill="white" />
          </g>
        );
      })}
    </svg>
  );
}

export default SudokuPaths;
