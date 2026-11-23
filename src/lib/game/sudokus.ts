import {useCallback, useState} from "react";
import {SimpleSudoku} from "src/lib/engine/types";
import {parseSudoku, stringifySudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";
import {
  BaseCollection,
  Collection,
  CollectionIndex,
  localStorageCollectionRepository,
  translateCollectionName,
} from "../database/collections";

import easySudokus from "../../../sudokus/easy.txt?raw";
import mediumSudokus from "../../../sudokus/medium.txt?raw";
import hardSudokus from "../../../sudokus/hard.txt?raw";
import expertSudokus from "../../../sudokus/expert.txt?raw";
import evilSudokus from "../../../sudokus/evil.txt?raw";

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

const BASE_SUDOKU_COLLECTIONS: Record<BaseCollection, string> = {
  [BaseCollection.Easy]: easySudokus,
  [BaseCollection.Medium]: mediumSudokus,
  [BaseCollection.Hard]: hardSudokus,
  [BaseCollection.Expert]: expertSudokus,
  [BaseCollection.Evil]: evilSudokus,
} as const;

function getPuzzleRows(sudokusRaw: string): string[] {
  return sudokusRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getSudokusPaginated(collection: Collection, page: number = 0, pageSize: number = 12): PaginatedSudokus {
  const rawLines = getPuzzleRows(collection.sudokusRaw);
  const totalRows = rawLines.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  const sudokus: SudokuRaw[] = [];

  for (const line of rawLines.slice(startIndex, endIndex)) {
    try {
      const sudoku = parseSudoku(line);
      const solved = solve(sudoku);
      if (solved.sudoku !== null) {
        sudokus.push({
          sudoku,
          solution: solved.sudoku,
          iterations: solved.iterations,
        });
      } else {
        console.warn("Invalid sudoku: ", sudoku, solved);
      }
    } catch (error) {
      console.warn("Failed to parse sudoku line in collection", collection.id, error);
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
export const START_SUDOKU_COLLECTION: Collection = {
  id: BaseCollection.Easy,
  name: BaseCollection.Easy,
  sudokusRaw: BASE_SUDOKU_COLLECTIONS.easy,
};
export const START_SUDOKU = getSudokusPaginated(START_SUDOKU_COLLECTION, START_SUDOKU_INDEX, START_SUDOKU_INDEX + 1)
  .sudokus[0];

export function isBaseCollectionId(collectionId: string): collectionId is BaseCollection {
  return Object.prototype.hasOwnProperty.call(BASE_SUDOKU_COLLECTIONS, collectionId);
}

export function getCollections(): CollectionIndex[] {
  const baseCollections = Object.keys(BASE_SUDOKU_COLLECTIONS);
  const customCollections = localStorageCollectionRepository.getCollections();
  return [...baseCollections.map((collection) => ({id: collection, name: collection})), ...customCollections];
}

export function resolveCollectionDisplayName(
  collectionId: string,
  getCollection: (id: string) => Collection,
  translate?: (key: string) => string,
): string {
  try {
    return translateCollectionName(getCollection(collectionId).name, translate);
  } catch {
    return translateCollectionName(collectionId, translate);
  }
}

function createCollectionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `collection-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useSudokuCollections() {
  const [collections, setCollections] = useState<CollectionIndex[]>(getCollections);
  const [activeCollectionId, setActiveCollectionId] = useState<string>(BaseCollection.Easy);

  const isBaseCollection = useCallback((collectionId: string) => isBaseCollectionId(collectionId), []);

  const addCollection = useCallback((collectionName: string) => {
    const collectionId = createCollectionId();
    const newCollection: Collection = {id: collectionId, name: collectionName, sudokusRaw: ""};
    localStorageCollectionRepository.saveCollection(newCollection);
    setCollections(getCollections());
    return newCollection;
  }, []);

  const addSudokuToCollection = useCallback((collectionId: string, sudoku: SimpleSudoku) => {
    const stringifiedSudoku = stringifySudoku(sudoku);
    const collection = localStorageCollectionRepository.getCollection(collectionId);
    const appendedIndex = getPuzzleRows(collection.sudokusRaw).length;
    const newSudokusRaw =
      collection.sudokusRaw.length > 0 ? `${collection.sudokusRaw}\n${stringifiedSudoku}` : stringifiedSudoku;
    localStorageCollectionRepository.saveCollection({
      ...collection,
      sudokusRaw: newSudokusRaw,
    });
    setCollections(getCollections());
    return appendedIndex;
  }, []);

  const getCollection = useCallback((collectionId: string): Collection => {
    if (isBaseCollectionId(collectionId)) {
      return {
        id: collectionId,
        name: collectionId,
        sudokusRaw: BASE_SUDOKU_COLLECTIONS[collectionId],
      };
    }
    return localStorageCollectionRepository.getCollection(collectionId);
  }, []);

  const removeCollection = useCallback((collectionId: string) => {
    localStorageCollectionRepository.removeCollection(collectionId);
    setCollections(getCollections());
  }, []);

  let activeCollection: Collection;
  try {
    activeCollection = getCollection(activeCollectionId);
  } catch {
    activeCollection = START_SUDOKU_COLLECTION;
  }

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
