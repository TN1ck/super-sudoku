
export interface Cell {
    readonly x: number; // x position in the Sudoku
    readonly y: number; // y position in the Sudoku
    number: number | undefined; // we also allow that no number is set
    notes: Set<number>;
    showMenu: boolean; // show the menu for this cell
    allowed: Set<number>;
}

export function createCell (
    x: number,
    y: number,
    number: number | undefined,
    notes: Set<number>,
    allowed: Set<number>
) : Cell {
    return {
        x,
        y,
        number,
        notes,
        allowed,
        showMenu: false
    };
}

export const solvableSudoku1 = [
    '_1____674',
    '_897_____',
    '__2_638__',
    '_28___76_',
    '___1__43_',
    '__692__18',
    '_6_235___',
    '2__4_81_6',
    '57_______',
].join('\n');

export function parseSudokuToSimple (sudoku: Array<Cell>) : Array<Array<number>> {
    const simple = [[], [], [], [], [], [], [], [], []];
    sudoku.forEach(cell => {
        simple[cell.y - 1][cell.x - 1] = cell.number;
    });
    return simple;
}

export function parseSudoku (sudoku: String): Array<Cell> {
    const lines = sudoku.split('\n');
    return [].concat(...lines
        .map((line, y) => {
            const characters = line.split('');
            return characters.map((c, x) => {
                const number = c === '_' ? undefined : Number(c);
                return createCell(
                    x + 1,
                    y + 1,
                    number,
                    new Set([]),
                    new Set([])
                );
            });
        }));
};

export function printSudoku (grid: Array<Cell>) {
    return _(grid)
        .groupBy(c => {
            return c.y;
        })
        .toPairs()
        .sortBy(([, k]) => k)
        .map(([, cells]: [String, Array<Cell>]) => {
            return _.sortBy(cells, c => c.x).map(c => {
                return c.number === undefined ? '_' : String(c.number);
            }).join('');
        }).join('\n');
}
