import * as fs from "node:fs";
import * as path from "node:path";
import type {Plugin} from "vite-plus";

export const BASE_DIFFICULTIES = ["easy", "medium", "hard", "expert", "evil"] as const;
export type BaseDifficulty = (typeof BASE_DIFFICULTIES)[number];

// 600 puzzles = 50 pages of 12, so every picker page maps to a single chunk (~49 KB raw / ~20 KB gzip).
export const DEFAULT_SUDOKU_CHUNK_SIZE = 600;

const MANIFEST_ID = "virtual:sudoku-manifest";
const RESOLVED_MANIFEST_ID = `\0${MANIFEST_ID}`;
const CHUNK_PREFIX = "virtual:sudoku-chunk/";
const RESOLVED_CHUNK_PREFIX = `\0${CHUNK_PREFIX}`;

export function extractPuzzleLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function slicePuzzleChunk(lines: string[], chunkIndex: number, chunkSize: number): string[] {
  const start = chunkIndex * chunkSize;
  return lines.slice(start, start + chunkSize);
}

export interface SudokuChunksPluginOptions {
  sudokusDir?: string;
  chunkSize?: number;
}

export function sudokuChunksPlugin(options: SudokuChunksPluginOptions = {}): Plugin {
  const chunkSize = options.chunkSize ?? DEFAULT_SUDOKU_CHUNK_SIZE;
  let sudokusDir = options.sudokusDir ?? path.resolve(process.cwd(), "sudokus");

  const getFilePath = (difficulty: BaseDifficulty) => path.join(sudokusDir, `${difficulty}.txt`);

  const readDifficultyLines = (difficulty: BaseDifficulty): string[] => {
    const filePath = getFilePath(difficulty);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    return extractPuzzleLines(fs.readFileSync(filePath, "utf8"));
  };

  return {
    name: "sudoku-chunks",

    configResolved(config) {
      if (!options.sudokusDir) {
        sudokusDir = path.resolve(config.root, "sudokus");
      }
    },

    resolveId(id) {
      if (id === MANIFEST_ID) {
        return RESOLVED_MANIFEST_ID;
      }
      if (id.startsWith(CHUNK_PREFIX)) {
        return `\0${id}`;
      }
      return undefined;
    },

    load(id) {
      if (id === RESOLVED_MANIFEST_ID) {
        const manifest: Record<BaseDifficulty, {count: number; chunkCount: number}> = {
          easy: {count: 0, chunkCount: 0},
          medium: {count: 0, chunkCount: 0},
          hard: {count: 0, chunkCount: 0},
          expert: {count: 0, chunkCount: 0},
          evil: {count: 0, chunkCount: 0},
        };
        const loaderEntries: string[] = [];
        let startSudokuRaw = "";

        for (const difficulty of BASE_DIFFICULTIES) {
          const filePath = getFilePath(difficulty);
          if (fs.existsSync(filePath)) {
            this.addWatchFile(filePath);
          }
          const lines = readDifficultyLines(difficulty);
          const chunkCount = Math.ceil(lines.length / chunkSize);
          manifest[difficulty] = {count: lines.length, chunkCount};

          if (difficulty === "easy" && lines.length > 0) {
            startSudokuRaw = lines[0];
          }

          for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const key = `${difficulty}/${chunkIndex}`;
            const moduleName = `sudoku-${difficulty}-${chunkIndex}`;
            loaderEntries.push(
              `  ${JSON.stringify(key)}: () => import(${JSON.stringify(`${CHUNK_PREFIX}${moduleName}`)}),`,
            );
          }
        }

        return [
          `export const CHUNK_SIZE = ${chunkSize};`,
          `export const START_SUDOKU_RAW = ${JSON.stringify(startSudokuRaw)};`,
          `export const BASE_SUDOKU_COLLECTIONS_MANIFEST = ${JSON.stringify(manifest)};`,
          `export const BASE_SUDOKU_CHUNK_LOADERS = {`,
          ...loaderEntries,
          `};`,
        ].join("\n");
      }

      if (id.startsWith(RESOLVED_CHUNK_PREFIX)) {
        const rest = id.slice(RESOLVED_CHUNK_PREFIX.length);
        const match = /^sudoku-([a-z]+)-(\d+)$/.exec(rest);
        if (!match) {
          throw new Error(`Invalid sudoku chunk module: ${rest}`);
        }
        const [, difficulty, rawIndex] = match;
        if (!BASE_DIFFICULTIES.includes(difficulty as BaseDifficulty)) {
          throw new Error(`Unknown sudoku difficulty chunk: ${rest}`);
        }
        const chunkIndex = Number.parseInt(rawIndex, 10);
        if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
          throw new Error(`Invalid sudoku chunk index: ${rest}`);
        }

        const filePath = getFilePath(difficulty as BaseDifficulty);
        if (fs.existsSync(filePath)) {
          this.addWatchFile(filePath);
        }
        const lines = readDifficultyLines(difficulty as BaseDifficulty);
        const chunkLines = slicePuzzleChunk(lines, chunkIndex, chunkSize);
        return `export default ${JSON.stringify(chunkLines.join("\n"))};`;
      }

      return undefined;
    },

    configureServer(server) {
      server.watcher.add(sudokusDir);
      const invalidateIfSudokuFile = (changedFile: string) => {
        if (!changedFile.startsWith(sudokusDir) || !changedFile.endsWith(".txt")) {
          return;
        }
        const manifestMod = server.moduleGraph.getModuleById(RESOLVED_MANIFEST_ID);
        if (manifestMod) {
          server.moduleGraph.invalidateModule(manifestMod);
        }
        for (const [id, mod] of server.moduleGraph.idToModuleMap) {
          if (id.startsWith(RESOLVED_CHUNK_PREFIX)) {
            server.moduleGraph.invalidateModule(mod);
          }
        }
        server.ws.send({type: "full-reload"});
      };

      server.watcher.on("change", invalidateIfSudokuFile);
      server.watcher.on("add", invalidateIfSudokuFile);
      server.watcher.on("unlink", invalidateIfSudokuFile);
    },
  };
}
