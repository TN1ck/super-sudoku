import * as React from 'react';
import {connect} from 'react-redux';
import {
    showMenu, setNumber, clearNumber
} from 'src/ducks/sudoku';
import {
    Cell
} from 'src/ducks/sudoku/model';
import * as _ from 'lodash';
import * as styles from './styles.css';

//
// Menu
//

const MenuRow : React.StatelessComponent<{
    cell: Cell;
    numbers: Array<number>;
    setNumber: (cell, number) => void
}> = function _MenuRow (props) {
    const cell = props.cell;
    return (
        <div className={styles.menuRow}>
            {
                props.numbers.map(n => {
                    return (
                        <div
                            className={styles.menuItem}
                            onClick={() => {
                                props.setNumber(cell, n);
                            }}
                        >
                            {n}
                        </div>
                    );
                })
            }
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

    return (
        <div className={styles.menuContainer}>
            <MenuRow
                cell={cell}
                numbers={[1, 2, 3]}
                setNumber={props.setNumber}
            />
            <MenuRow
                cell={cell}
                numbers={[4, 5, 6]}
                setNumber={props.setNumber}
            />
            <MenuRow
                cell={cell}
                numbers={[7, 8, 9]}
                setNumber={props.setNumber}
            />
            <div className={styles.menuRow}>
                <div
                    className={styles.menuItem}
                    onClick={() => props.clearNumber(cell)}
                >
                    {'H'}
                </div>
                <div
                    className={styles.menuItem}
                    onClick={() => props.clearNumber(cell)}
                >
                    {'C'}
                </div>
            </div>
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
            <div className={styles.cellContainer} onClick={this.toggleMenu}>
                {this.props.cell.showMenu  ?
                    <MenuComponent
                        cell={this.props.cell}
                    /> :
                    null
                }
                <div className={styles.cell}>
                    <div className={styles.cellNumber}>
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


