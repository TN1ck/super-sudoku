import * as React from 'react';
import * as classNames from 'classnames';
import {connect} from 'react-redux';
import {
    showMenu, setNumber, clearNumber
} from 'src/ducks/sudoku';
import {
    Cell
} from 'src/ducks/sudoku/model';
import {
    SUDOKU_NUMBERS
} from 'src/engine/utility';
import * as _ from 'lodash';
// import * as colors from 'src/utility/colors';
import * as styles from './styles.css';

//
// Menu
//

// const MenuRow : React.StatelessComponent<{
//     cell: Cell;
//     numbers: Array<number>;
//     setNumber: (cell, number) => void
// }> = function _MenuRow (props) {
//     const cell = props.cell;
//     return (
//         <div className={styles.menuRow}>
//             {
//                 props.numbers.map(n => {
//                     return (
//                         <div
//                             className={styles.menuItem}
//                             onClick={() => {
//                                 props.setNumber(cell, n);
//                             }}
//                         >
//                             {n}
//                         </div>
//                     );
//                 })
//             }
//         </div>
//     );
// };

const MenuItem : React.StatelessComponent<{
    cell: Cell;
    number: number;
    style: React.CSSProperties;
}> = function _MenuItem ({style, number}) {
    return (
         <div
            className={styles.menuItem}
            style={style}
        >
            {number}
        </div>
    );
};

const Menu : React.StatelessComponent<{
    cell: Cell;
    setNumber: (cell, number) => any;
    showMenu: (cell) => any;
    clearNumber: (cell) => any;

}> = function Menu (props) {
    const cell = props.cell;

    const TAU = Math.PI * 2;
    const radius = 50;
    const circleRadius = 45;
    const degreePerStep = TAU / SUDOKU_NUMBERS.length;

    return (
        <div className={styles.menuContainer}>
            <svg
                className={styles.menuCircleContainer}
                style={{
                    height: circleRadius * 4,
                    width: circleRadius * 4,
                }}
            >
                <circle
                    r={circleRadius}
                    cx={circleRadius * 2}
                    cy={circleRadius * 2}
                    style={{
                        pointerEvents: 'none'
                    }}
                    fill='none'
                    className={styles.menuCircle}
                />
                {
                    SUDOKU_NUMBERS.map((number, i) => {
                        const circumcircle = TAU * circleRadius;
                        const step = (degreePerStep / TAU) * circumcircle;
                        const percentage = Math.ceil(step * i);
                        return (
                            <g key={number}>
                                <circle
                                    r={circleRadius}
                                    cx={circleRadius * 2}
                                    cy={circleRadius * 2}
                                    fill='none'
                                    className={styles.menuCircle}
                                    onClick={() => {
                                        props.setNumber(cell, number);
                                    }}
                                    style={{
                                        strokeDashoffset: -percentage,
                                        strokeDasharray: `${step} ${circumcircle}`
                                    }}
                                />
                            </g>
                        );
                    })
                }
                <rect
                    className={styles.menuSquare}
                    fill={'white'}
                    height={'40px'}
                    width={'40px'}
                    x={circleRadius * 2}
                    y={circleRadius * 2}
                />
            </svg>
            {
                SUDOKU_NUMBERS.map((n, i) => {
                    // the 0.5 is for centering
                    const x = radius *  Math.cos(degreePerStep * (i + 0.5));
                    const y = radius *  Math.sin(degreePerStep * (i + 0.5));
                    const style = {
                        left: x,
                        top: y,
                        zIndex: 100,
                        color: 'white'
                    };
                    return (
                        <MenuItem
                            key={n}
                            style={style}
                            cell={cell}
                            number={n}
                        />
                    );
                })
            }
        </div>
    );
};

export const MenuComponent = connect<{}, {}, {
    cell: Cell
}>(
    function () {
        return {};
    },
    function (dispatch) {
        return {
            showMenu: (cell) => dispatch(showMenu(cell)),
            setNumber: (cell, number) => dispatch(setNumber(cell, number)),
            clearNumber: (cell) => dispatch(clearNumber(cell))
        };
    }
)(Menu);

//
// Cell
//

class CellComponentBasic extends React.Component<{
    cell: Cell;
    showMenu: (cell) => any
}, {
}> {
    constructor (props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
    }
    shouldComponentUpdate (props) {
        return props.cell !== this.props.cell;
    }
    toggleMenu () {
        this.props.showMenu(this.props.cell);
    }
    render () {
        const cell = this.props.cell;
        const notes = [...cell.notes.values()];
        return (
            <div
                className={classNames(styles.cellContainer, {
                    [styles.cellContainerInitial]: cell.initial
                })}
                onClick={this.toggleMenu}
            >
                <div className={classNames(styles.cell, {
                    [styles.cellActive]: cell.showMenu
                })}>
                    <div className={styles.cellNumber}
                    >
                        {this.props.cell.number}
                    </div>
                    <div className={styles.cellNoteContainer}>
                        {notes.map(n => {
                            return (
                                <div className={styles['cell-note']}>{n}</div>
                            );
                        })}
                    </div>
                </div>
                {this.props.cell.showMenu  ?
                    <MenuComponent
                        cell={this.props.cell}
                    /> :
                    null
                }
            </div>
        );
    }
};

export const CellComponent = connect<{}, {}, {
    cell: Cell
}>(
    function () {
        return {};
    },
    function (dispatch) {
        return {
            showMenu: (cell) => dispatch(showMenu(cell))
        };
    }
)(CellComponentBasic);

//
// Grid
//

/*
    _x = 1       _x = 2     _x = 3
.-----------------------------------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 1
|   y < 3   | y < 3     |   y < 3   |
|-----------------------------------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 2
| 3 < y < 6 | 3 < y < 6 | 3 < y < 6 |
.-----------------------------------|
|   x < 3   | 3 < x < 6 |   x > 6   |  _y = 3
|   y > 6   | y > 6     |   y > 6   |
|-----------------------------------|
*/

export const GridComponent : React.StatelessComponent<{
     grid: Array<Cell>;
}> = function _Grid (props) {
    const threeTimesThreeContainer = _.groupBy(
        props.grid,
        cell => {
            return `${Math.floor((cell.y) / 3)}-${Math.floor((cell.x) / 3)}`;
        }
    );
    const keys = _.sortBy(_.keys(threeTimesThreeContainer), k => k);
    return (
        <div className={styles.gridContainer} >
            {keys.map((key) => {
                const container = threeTimesThreeContainer[key];
                const sorted = _.sortBy(container, c => {
                    return `${c.y}-${c.x}`;
                });
                return (
                    <div key={key} className={styles.grid3X3}>
                        {sorted.map(cell => {
                            const k = `${cell.y}-${cell.x}`;
                            return <CellComponent key={k} cell={cell} />;
                        })}
                    </div>
                );
            })}
        </div>
    );
};


