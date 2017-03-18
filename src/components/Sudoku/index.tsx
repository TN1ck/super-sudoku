import * as React from 'react';
import * as classNames from 'classnames';
import {connect} from 'react-redux';
import {
    showMenu, setNumber, clearNumber, setNote, clearNote
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

const TAU = Math.PI * 2;

//
// Menu
//

const MenuCircle : React.StatelessComponent<{
    radius: number;
    notesMode: boolean;
    isActive: boolean;
    onClick: (any) => void;
    minRad: number;
    maxRad: number;
    children?: React.ReactChild,
}> = function MenuCircle ({
    radius, notesMode, isActive, onClick, minRad, maxRad, children
}) {
    const yOffset = 7;
    const circumCircle = TAU * radius;
    const step = Math.abs(maxRad - minRad);
    const center = radius * 2;
    const x = (radius * Math.cos(minRad + step * 0.5)) + center;
    const y = (radius * Math.sin(minRad + step * 0.5)) + center + yOffset;

    return (
        <g>
            <circle
                r={radius}
                cx={radius * 2}
                cy={radius * 2}
                fill='none'
                className={classNames({
                    [styles.menuCircle]: !notesMode,
                    [styles.menuCircleHover]: !notesMode && isActive,
                    [styles.menuCircleNotes]: notesMode,
                    [styles.menuCircleNotesHover]: notesMode && isActive,
                })}
                onClick={onClick}
                style={{
                    strokeDashoffset: -(minRad / TAU * circumCircle),
                    strokeDasharray: `${step / TAU * circumCircle} ${circumCircle}`
                }}
            />
            <text
                x={x}
                y={y}
                style={{
                    fill: 'white',
                    textAnchor: 'middle',
                    zIndex: 100,
                    pointerEvents: 'none'
                }}
            >
                {children}
            </text>
        </g>
    );
}

class Menu extends React.Component<{
    cell: Cell;
    setNumber: (cell, number) => any;
    setNote: (cell, number) => any;
    clearNote: (cell, number) => any;
    showMenu: (cell) => any;
    clearNumber: (cell) => any;
    notesMode: boolean;
}, {}> {
    render () {
        const cell = this.props.cell;
        const circleRadius = 45;

        // TODO: use these only dymanically on small screens
        let minRad = 0;
        let maxRad = TAU;


        let containerLeft = '0%';
        let containerTop = '-50%';

        if (cell.x === 0) {
            minRad = (TAU / 4) * -1;
            maxRad = (TAU / 4) * 1;
            containerLeft = '-50%';
        }

        if (cell.x === 8) {
            minRad = (TAU / 4) * 1;
            maxRad = (TAU / 4) * 3;
            containerLeft = '50%';
        }

        const usedRad = Math.abs(maxRad - minRad);
        const circumCircle = TAU * circleRadius;
        const radPerStep = usedRad / SUDOKU_NUMBERS.length;
        // const step = (radPerStep / TAU);

        return (
            <div
                className={styles.menuContainer}
                style={{
                    left: containerLeft,
                    top: containerTop,
                }}
            >
                <svg
                    className={styles.menuCircleContainer}
                    style={{
                        height: circleRadius * 4,
                        width: circleRadius * 4,
                        transform: `translate(-50%, -50%) rotate(${minRad}rad)`
                    }}
                >
                    <circle
                        r={circleRadius}
                        cx={circleRadius * 2}
                        cy={circleRadius * 2}
                        style={{
                            pointerEvents: 'none',
                            strokeDashoffset: 0,
                            strokeDasharray: `${(usedRad / TAU) * circumCircle} ${circumCircle}`
                        }}
                        fill='none'
                        className={this.props.notesMode ? styles.menuCircleNotes : styles.menuCircle}
                    />
                    {
                        SUDOKU_NUMBERS.map((number, i) => {
                            const currentMinRad = minRad + radPerStep * i;
                            const currentMaxRad = currentMinRad + radPerStep;
                            let isActive = number === cell.number;
                            if (this.props.notesMode) {
                                isActive = cell.notes.has(number);
                            }
                            return (
                                <MenuCircle
                                    radius={circleRadius}
                                    notesMode={this.props.notesMode}
                                    isActive={isActive}
                                    minRad={currentMinRad}
                                    maxRad={currentMaxRad}
                                    onClick={(e) => {
                                        if (this.props.notesMode) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }
                                        if (isActive) {
                                            if (this.props.notesMode) {
                                                this.props.clearNote(cell, number);
                                            } else {
                                                this.props.clearNumber(cell);
                                            }
                                            return;
                                        }
                                        if (this.props.notesMode) {
                                            this.props.setNote(cell, number);
                                        } else {
                                            this.props.setNumber(cell, number);
                                        }
                                    }}
                                >
                                    {number}
                                </MenuCircle>
                            );
                        })
                    }
                </svg>
            </div>
        );
    }
};

export const MenuComponent = connect<{}, {}, {
    cell: Cell;
    notesMode: boolean;
}>(
    function () {
        return {};
    },
    function (dispatch) {
        return {
            showMenu: (cell) => dispatch(showMenu(cell)),
            setNumber: (cell, number) => dispatch(setNumber(cell, number)),
            setNote: (cell, number) => dispatch(setNote(cell, number)),
            clearNote: (cell, number) => dispatch(clearNote(cell, number)),
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
    notesMode: boolean
}> {
    clickTimer: Date;
    constructor (props) {
        super(props);
        this.state = {
            notesMode: false
        };
        this.toggleMenu = this.toggleMenu.bind(this);
        this.enterNotesMode = this.enterNotesMode.bind(this);
        this.exitNotesMode = this.exitNotesMode.bind(this);
    }
    shouldComponentUpdate (props, state) {
        return props.cell !== this.props.cell || this.state !== state;
    }
    enterNotesMode() {
        this.setState({
            notesMode: true
        });
    }
    exitNotesMode() {
        this.setState({
            notesMode: false
        });
    }
    toggleMenu () {
        const newDate = new Date();
        const shouldEnterNotesMode = (+newDate - +this.clickTimer) < 500;
        if (shouldEnterNotesMode) {
            this.enterNotesMode();
            return;
        }
        this.clickTimer = newDate;
        this.props.showMenu(this.props.cell);
        this.exitNotesMode();
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
                        {notes.sort().map(n => {
                            return (
                                <div className={styles['cell-note']}>{n}</div>
                            );
                        })}
                    </div>
                </div>
                {this.props.cell.showMenu  ?
                    <MenuComponent
                        notesMode={this.state.notesMode}
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


