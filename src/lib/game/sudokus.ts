import {useCallback, useState} from "react";
import {
  BASE_SUDOKU_CHUNK_LOADERS,
  BASE_SUDOKU_COLLECTIONS_MANIFEST,
  CHUNK_SIZE,
  START_SUDOKU_RAW,
} from "virtual:sudoku-manifest";
import {SimpleSudoku} from "src/lib/engine/types";
import {parseSudoku, stringifySudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3_bitmask";
import {
  BaseCollection,
  Collection,
  CollectionIndex,
  localStorageCollectionRepository,
  translateCollectionName,
} from "../database/collections";

export interface SudokuRaw {
  iterations: number;
  sudoku: SimpleSudoku;
  solution: SimpleSudoku;
}

export interface SudokuPreviewItem {
  sudoku: SimpleSudoku;
  raw: string;
}

export interface PaginatedSudokus {
  sudokus: SudokuRaw[];
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedSudokuPreviews {
  sudokus: SudokuPreviewItem[];
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const SUDOKU_CHUNK_SIZE = CHUNK_SIZE;

const ROW_CACHE_LIMIT = 20;
const parsedRowCache = new Map<string, string[]>();

function getPuzzleRows(sudokusRaw: string): string[] {
  const cached = parsedRowCache.get(sudokusRaw);
  if (cached) {
    return cached;
  }
  const rows = sudokusRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (parsedRowCache.size >= ROW_CACHE_LIMIT) {
    parsedRowCache.clear();
  }
  parsedRowCache.set(sudokusRaw, rows);
  return rows;
}

function parsePreviewRows(lines: string[], collectionId: string): SudokuPreviewItem[] {
  const sudokus: SudokuPreviewItem[] = [];
  for (const line of lines) {
    try {
      const sudoku = parseSudoku(line);
      sudokus.push({
        sudoku,
        raw: stringifySudoku(sudoku),
      });
    } catch (error) {
      console.warn("Failed to parse sudoku line in collection", collectionId, error);
    }
  }
  return sudokus;
}

const baseChunkCache = new Map<string, string[]>();
const baseChunkInFlight = new Map<string, Promise<string[]>>();

function getChunkKey(collectionId: BaseCollection, chunkIndex: number): string {
  return `${collectionId}/${chunkIndex}`;
}

export function getBaseCollectionCount(collectionId: BaseCollection): number {
  return BASE_SUDOKU_COLLECTIONS_MANIFEST[collectionId]?.count ?? 0;
}

export function getCachedBaseCollectionChunk(collectionId: BaseCollection, chunkIndex: number): string[] | undefined {
  return baseChunkCache.get(getChunkKey(collectionId, chunkIndex));
}

export async function loadBaseCollectionChunk(collectionId: BaseCollection, chunkIndex: number): Promise<string[]> {
  const key = getChunkKey(collectionId, chunkIndex);
  const cached = baseChunkCache.get(key);
  if (cached) {
    return cached;
  }

  const inFlight = baseChunkInFlight.get(key);
  if (inFlight) {
    return inFlight;
  }

  const loader = BASE_SUDOKU_CHUNK_LOADERS[key];
  if (!loader) {
    return [];
  }

  const promise = loader()
    .then((mod) => {
      const rows = mod.default
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      baseChunkCache.set(key, rows);
      baseChunkInFlight.delete(key);
      return rows;
    })
    .catch((error) => {
      baseChunkInFlight.delete(key);
      throw error;
    });

  baseChunkInFlight.set(key, promise);
  return promise;
}

function getNeededChunkIndices(startIndex: number, endIndex: number, totalRows: number): number[] {
  const clampedEnd = Math.min(endIndex, totalRows);
  if (startIndex >= clampedEnd || startIndex < 0) {
    return [];
  }
  const firstChunk = Math.floor(startIndex / CHUNK_SIZE);
  const lastChunk = Math.floor((clampedEnd - 1) / CHUNK_SIZE);
  const indices: number[] = [];
  for (let i = firstChunk; i <= lastChunk; i++) {
    indices.push(i);
  }
  return indices;
}

function sliceLinesFromChunks(
  chunks: Map<number, string[]>,
  startIndex: number,
  endIndex: number,
  totalRows: number,
): string[] {
  const clampedEnd = Math.min(endIndex, totalRows);
  const result: string[] = [];
  for (let globalIndex = startIndex; globalIndex < clampedEnd; globalIndex++) {
    const chunkIndex = Math.floor(globalIndex / CHUNK_SIZE);
    const offset = globalIndex - chunkIndex * CHUNK_SIZE;
    const chunk = chunks.get(chunkIndex);
    if (chunk && offset < chunk.length) {
      result.push(chunk[offset]);
    }
  }
  return result;
}

export function getBaseCollectionPageSync(
  collectionId: BaseCollection,
  page: number = 0,
  pageSize: number = 12,
): PaginatedSudokuPreviews | null {
  const totalRows = getBaseCollectionCount(collectionId);
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const neededChunks = getNeededChunkIndices(startIndex, endIndex, totalRows);

  if (neededChunks.length === 0) {
    return {sudokus: [], totalRows, page, pageSize, totalPages};
  }

  const chunkMap = new Map<number, string[]>();
  for (const chunkIndex of neededChunks) {
    const cached = getCachedBaseCollectionChunk(collectionId, chunkIndex);
    if (!cached) {
      return null;
    }
    chunkMap.set(chunkIndex, cached);
  }

  const pageLines = sliceLinesFromChunks(chunkMap, startIndex, endIndex, totalRows);
  return {
    sudokus: parsePreviewRows(pageLines, collectionId),
    totalRows,
    page,
    pageSize,
    totalPages,
  };
}

export async function loadBaseCollectionPage(
  collectionId: BaseCollection,
  page: number = 0,
  pageSize: number = 12,
): Promise<PaginatedSudokuPreviews> {
  const syncResult = getBaseCollectionPageSync(collectionId, page, pageSize);
  if (syncResult) {
    return syncResult;
  }

  const totalRows = getBaseCollectionCount(collectionId);
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const neededChunks = getNeededChunkIndices(startIndex, endIndex, totalRows);

  const loadedChunks = await Promise.all(
    neededChunks.map(
      async (chunkIndex) => [chunkIndex, await loadBaseCollectionChunk(collectionId, chunkIndex)] as const,
    ),
  );
  const chunkMap = new Map<number, string[]>(loadedChunks);
  const pageLines = sliceLinesFromChunks(chunkMap, startIndex, endIndex, totalRows);

  return {
    sudokus: parsePreviewRows(pageLines, collectionId),
    totalRows,
    page,
    pageSize,
    totalPages,
  };
}

export function getCustomCollectionPage(
  collection: Collection,
  page: number = 0,
  pageSize: number = 12,
): PaginatedSudokuPreviews {
  const rawLines = getPuzzleRows(collection.sudokusRaw);
  const totalRows = rawLines.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    sudokus: parsePreviewRows(rawLines.slice(startIndex, endIndex), collection.id),
    totalRows,
    page,
    pageSize,
    totalPages,
  };
}

// Returns the puzzle string if immediately available, null if out of bounds, or undefined if a base chunk must be loaded.
export function getCollectionPuzzleRawSync(
  collectionId: string,
  index: number,
  getCollection: (id: string) => CollectionIndex,
): string | null | undefined {
  if (index < 0) {
    return null;
  }
  if (isBaseCollectionId(collectionId)) {
    const totalRows = getBaseCollectionCount(collectionId);
    if (index >= totalRows) {
      return null;
    }
    const chunkIndex = Math.floor(index / CHUNK_SIZE);
    const cached = getCachedBaseCollectionChunk(collectionId, chunkIndex);
    if (!cached) {
      return undefined;
    }
    return cached[index - chunkIndex * CHUNK_SIZE] ?? null;
  }

  try {
    const collection = getCollection(collectionId);
    if (!isCustomCollection(collection)) {
      return null;
    }
    const rows = getPuzzleRows(collection.sudokusRaw);
    return rows[index] ?? null;
  } catch {
    return null;
  }
}

export async function loadCollectionPuzzleRaw(
  collectionId: string,
  index: number,
  getCollection: (id: string) => CollectionIndex,
): Promise<string | null> {
  const syncResult = getCollectionPuzzleRawSync(collectionId, index, getCollection);
  if (syncResult !== undefined) {
    return syncResult;
  }
  if (!isBaseCollectionId(collectionId)) {
    return null;
  }
  const chunkIndex = Math.floor(index / CHUNK_SIZE);
  const chunk = await loadBaseCollectionChunk(collectionId, chunkIndex);
  return chunk[index - chunkIndex * CHUNK_SIZE] ?? null;
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

function buildStartSudoku(): SudokuRaw {
  const sudoku = parseSudoku(START_SUDOKU_RAW);
  const solved = solve(sudoku);
  if (solved.sudoku === null) {
    throw new Error("Start sudoku could not be solved");
  }
  return {
    sudoku,
    solution: solved.sudoku,
    iterations: solved.iterations,
  };
}

export const START_SUDOKU_INDEX = 0;
export const START_SUDOKU_COLLECTION: CollectionIndex = {
  id: BaseCollection.Easy,
  name: BaseCollection.Easy,
};
export const START_SUDOKU = buildStartSudoku();

export function isBaseCollectionId(collectionId: string): collectionId is BaseCollection {
  return Object.prototype.hasOwnProperty.call(BASE_SUDOKU_COLLECTIONS_MANIFEST, collectionId);
}

export function isCustomCollection(collection: CollectionIndex): collection is Collection {
  return "sudokusRaw" in collection && typeof collection.sudokusRaw === "string";
}

export function getCollections(): CollectionIndex[] {
  const baseCollections = Object.keys(BASE_SUDOKU_COLLECTIONS_MANIFEST);
  const customCollections = localStorageCollectionRepository.getCollections();
  return [...baseCollections.map((collection) => ({id: collection, name: collection})), ...customCollections];
}

export function resolveCollectionDisplayName(
  collectionId: string,
  getCollection: (id: string) => CollectionIndex,
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

  const getCollection = useCallback((collectionId: string): CollectionIndex => {
    if (isBaseCollectionId(collectionId)) {
      return {
        id: collectionId,
        name: collectionId,
      };
    }
    return localStorageCollectionRepository.getCollection(collectionId);
  }, []);

  const removeCollection = useCallback((collectionId: string) => {
    localStorageCollectionRepository.removeCollection(collectionId);
    setCollections(getCollections());
  }, []);

  let activeCollection: CollectionIndex;
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
