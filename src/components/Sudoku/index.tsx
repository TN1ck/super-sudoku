import * as React from 'react';
import {connect} from 'react-redux';
import {
    SudokuState, showMenu, setNumber, clearNumber
} from 'src/ducks/sudoku';
import {
    Cell
} from 'src/ducks/sudoku/model';
import * as _ from 'lodash';
const styles = require('./styles.css');
const CSSModules = require('react-css-modules');

//
// Menu
//

const MenuRow : React.StatelessComponent<{
    cell: Cell;
    numbers: Array<number>;
    setNumber: (cell, number) => void
}> = CSSModules(function _MenuRow (props) {
    const cell = props.cell;
    return (
        <div styleName='menu-row'>
            {
                props.numbers.map(n => {
                    return (
                        <div
                            styleName='menu-item'
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
}, styles);

const _Menu : React.StatelessComponent<{
    cell: Cell;
    setNumber: (cell, number) => void;
    showMenu: (cell) => void;
    clearNumber: (cell) => void;

}> = CSSModules(function _Menu (props) {
    const cell = props.cell;

    return (
        <div styleName='menu-container'>
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
            <div styleName='menu-row'>
                <div
                    styleName='menu-item'
                    onClick={() => props.clearNumber(cell)}
                >
                    {'H'}
                </div>
                <div
                    styleName='menu-item'
                    onClick={() => props.clearNumber(cell)}
                >
                    {'C'}
                </div>
            </div>
        </div>
    );
}, styles);

export const MenuComponent = connect(
    function (state) {
        return {}
    },
    function (dispatch) {
        return {
            showMenu: (cell) => dispatch(showMenu(cell)),
            setNumber: (cell, number) => dispatch(setNumber(cell, number)),
            clearNumber: (cell) => dispatch(clearNumber(cell))
        };
    }
// TODO
)(_Menu) as any;

//
// Cell
//

class CellComponentBasic extends React.Component<{
    cell: Cell;
    showMenu: (cell) => void
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
            <div className={styles['cell-container']} onClick={this.toggleMenu}>
                {this.props.cell.showMenu  ?
                    <MenuComponent cell={this.props.cell} /> :
                    null
                }
                <div className={styles['cell']}>
                    <div className={styles['cell-number']}>
                        {this.props.cell.number}
                    </div>
                    <div className={styles['cell-note-container']}>
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

export const CellComponent = connect(
    function (state) {
        return {}
    },
    function (dispatch) {
        return {
            showMenu: (cell) => dispatch(showMenu(cell))
        };
    }
// TODO
)(CellComponentBasic) as any;

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

const _Grid : React.StatelessComponent<{
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
        <div styleName='grid-container' >
            {keys.map((key) => {
                const container = threeTimesThreeContainer[key];
                const sorted = _.sortBy(container, c => {
                    return `${c.y}-${c.x}`;
                });
                return (
                    <div key={key} styleName='grid-3x3'>
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

export const GridComponent = CSSModules(_Grid, styles);


