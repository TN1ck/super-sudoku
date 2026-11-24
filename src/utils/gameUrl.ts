export interface GameSearchParams {
  sudokuIndex: number;
  sudoku: string;
  sudokuCollectionName: string;
}

export interface ParsedGameSearchParams {
  sudokuIndex: number | undefined;
  sudoku: string | undefined;
  sudokuCollectionName: string | undefined;
}

export function createGameSearchParams(
  sudoku: string,
  zeroBasedIndex: number,
  sudokuCollectionName: string,
): GameSearchParams {
  return {
    sudokuIndex: zeroBasedIndex + 1,
    sudoku,
    sudokuCollectionName,
  };
}

export function createShareUrl(sudoku: string, zeroBasedIndex: number, sudokuCollectionName: string): string {
  const params = new URLSearchParams({
    sudokuIndex: String(zeroBasedIndex + 1),
    sudoku,
    sudokuCollectionName,
  });
  return `${window.location.origin}${window.location.pathname}#/?${params.toString()}`;
}

function stripWrappingQuotes(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
}

function getWindowSearchFallback(name: string) {
  if (typeof window === "undefined" || !window.location.search) {
    return undefined;
  }
  const value = new URLSearchParams(window.location.search).get(name);
  return value !== null ? stripWrappingQuotes(value) : undefined;
}

function getSearchString(search: Record<string, unknown>, name: string) {
  const value = search[name];
  if (typeof value === "string") {
    return stripWrappingQuotes(value);
  }
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return value.toString();
  }
  return getWindowSearchFallback(name);
}

function getPositiveIntegerSearchParam(search: Record<string, unknown>, name: string) {
  const value = getSearchString(search, name);
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : undefined;
}

export function parseGameSearchParams(search: Record<string, unknown>): ParsedGameSearchParams {
  return {
    sudokuIndex: getPositiveIntegerSearchParam(search, "sudokuIndex"),
    sudoku: getSearchString(search, "sudoku"),
    sudokuCollectionName: getSearchString(search, "sudokuCollectionName"),
  };
}
