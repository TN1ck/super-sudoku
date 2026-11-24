declare module "virtual:sudoku-manifest" {
  import type {BaseCollection} from "src/lib/database/collections";

  export interface BaseCollectionManifestEntry {
    count: number;
    chunkCount: number;
  }

  export const CHUNK_SIZE: number;
  export const START_SUDOKU_RAW: string;
  export const BASE_SUDOKU_COLLECTIONS_MANIFEST: Record<BaseCollection, BaseCollectionManifestEntry>;
  export const BASE_SUDOKU_CHUNK_LOADERS: Record<string, () => Promise<{default: string}>>;
}

declare module "virtual:sudoku-chunk/*" {
  const chunk: string;
  export default chunk;
}
