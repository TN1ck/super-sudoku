import {SimpleSudoku} from "src/lib/engine/types";

import easySudokus from "../../../sudokus/easy.txt?raw";
import mediumSudokus from "../../../sudokus/medium.txt?raw";
import hardSudokus from "../../../sudokus/hard.txt?raw";
import expertSudokus from "../../../sudokus/expert.txt?raw";
import evilSudokus from "../../../sudokus/evil.txt?raw";
import {parseSudoku, stringifySudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";
import {useCallback, useMemo, useState} from "react";
import {Collection, CollectionIndex, localStorageCollectionRepository} from "../database/collections";

export interface SudokuRaw {
  iterations: number;
  sudoku: SimpleSudoku;
  solution: SimpleSudoku;
}

export interface PaginatedSudokus {
  sudokus: SudokuRaw[];
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BASE_SUDOKU_COLLECTIONS: Record<string, string> = {
  easy: easySudokus,
  medium: mediumSudokus,
  hard: hardSudokus,
  expert: expertSudokus,
  evil: evilSudokus,
} as const;

// Cache for raw line counts
const lineCountCache: Record<string, number> = {} as Record<string, number>;

function getLineCount(collection: Collection): number {
  if (!lineCountCache[collection.id]) {
    lineCountCache[collection.id] = collection.sudokusRaw.split("\n").filter((line) => line.trim()).length;
  }
  return lineCountCache[collection.id];
}

export function getSudokusPaginated(collection: Collection, page: number = 0, pageSize: number = 12): PaginatedSudokus {
  const totalRows = getLineCount(collection);
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  if (collection.sudokusRaw === "") {
    return {
      sudokus: [],
      totalRows: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const rawLines = collection.sudokusRaw.split("\n");
  const sudokus: SudokuRaw[] = [];

  for (const line of rawLines.slice(startIndex, endIndex)) {
    const sudoku = parseSudoku(line);
    const solved = solve(sudoku);
    const result = {
      sudoku,
      solution: solved.sudoku,
      iterations: solved.iterations,
    };
    if (result.solution !== null) {
      sudokus.push(result as SudokuRaw);
    } else {
      console.warn("Invalid sudoku: ", sudoku, solved);
    }
  }

  return {
    sudokus,
    totalRows,
    page,
    pageSize,
    totalPages,
  };
}

export const START_SUDOKU_INDEX = 0;
export const START_SUDOKU_COLLECTION = {id: "easy", name: "easy", sudokusRaw: BASE_SUDOKU_COLLECTIONS.easy};
export const START_SUDOKU = getSudokusPaginated(START_SUDOKU_COLLECTION, START_SUDOKU_INDEX, START_SUDOKU_INDEX + 1)
  .sudokus[0];

export function getCollections() {
  const baseCollections = Object.keys(BASE_SUDOKU_COLLECTIONS);
  const collections = localStorageCollectionRepository.getCollections();
  return [...baseCollections.map((collection) => ({id: collection, name: collection})), ...collections];
}

export function useSudokuCollections() {
  const [collections, setCollections] = useState<CollectionIndex[]>(getCollections());

  const [activeCollectionId, setActiveCollectionId] = useState<string>("easy");

  const isBaseCollection = useCallback((collectionId: string) => {
    return Object.keys(BASE_SUDOKU_COLLECTIONS).includes(collectionId);
  }, []);

  const addCollection = useCallback((collection: string) => {
    const collectionId = crypto.randomUUID();
    const newCollection = {id: collectionId, name: collection, sudokusRaw: ""};
    localStorageCollectionRepository.saveCollection(newCollection);
    setCollections(getCollections());
    return newCollection;
  }, []);

  const addSudokuToCollection = useCallback((collectionId: string, sudoku: SimpleSudoku) => {
    const stringifiedSudoku = stringifySudoku(sudoku);
    const collection = localStorageCollectionRepository.getCollection(collectionId);
    const newSudokusRaw =
      collection.sudokusRaw.length > 0 ? collection.sudokusRaw + "\n" + stringifiedSudoku : stringifiedSudoku;
    localStorageCollectionRepository.saveCollection({
      ...collection,
      sudokusRaw: newSudokusRaw,
    });
    setCollections(getCollections());
  }, []);

  const getCollection = useCallback(
    (collectionId: string) => {
      if (isBaseCollection(collectionId)) {
        return {
          id: collectionId,
          name: collectionId,
          sudokusRaw: BASE_SUDOKU_COLLECTIONS[collectionId],
        };
      }
      return localStorageCollectionRepository.getCollection(collectionId);
    },
    [isBaseCollection],
  );

  const activeCollection = useMemo(() => getCollection(activeCollectionId), [activeCollectionId, getCollection]);

  const removeCollection = (collectionId: string) => {
    localStorageCollectionRepository.removeCollection(collectionId);
    setCollections(getCollections());
  };

  return {
    collections,
    addCollection,
    removeCollection,
    addSudokuToCollection,
    isBaseCollection,
    getCollection,
    activeCollection,
    setActiveCollectionId,
  };
}
