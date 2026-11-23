import {t} from "i18next";

export enum BaseCollection {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
  Expert = "expert",
  Evil = "evil",
}

const BASE_COLLECTION_TRANSLATION_KEYS: Record<BaseCollection, string> = {
  [BaseCollection.Easy]: "difficulty_easy",
  [BaseCollection.Medium]: "difficulty_medium",
  [BaseCollection.Hard]: "difficulty_hard",
  [BaseCollection.Expert]: "difficulty_expert",
  [BaseCollection.Evil]: "difficulty_evil",
};

export function translateCollectionName(
  collectionName: string,
  translate: (key: string) => string = t,
): string {
  if (Object.prototype.hasOwnProperty.call(BASE_COLLECTION_TRANSLATION_KEYS, collectionName)) {
    return translate(BASE_COLLECTION_TRANSLATION_KEYS[collectionName as BaseCollection]);
  }
  return collectionName;
}

export interface CollectionIndex {
  id: string;
  name: string;
}

export interface Collection extends CollectionIndex {
  sudokusRaw: string;
}

interface CollectionRepository {
  getCollections(): CollectionIndex[];
  getCollection(collectionId: string): Collection;
  saveCollection(collection: Collection): void;
  removeCollection(collectionId: string): void;
}

// Collections store names and puzzle lists under separate keys so the index
// can be loaded without reading every puzzle payload.
const STORAGE_COLLECTION_SUDOKUS_PREFIX = "super_sudoku_collections_sudokus_";
const STORAGE_COLLECTION_NAMES_PREFIX = "super_sudoku_collections_names_";

function createCollectionSudokusKey(collectionId: string) {
  return STORAGE_COLLECTION_SUDOKUS_PREFIX + collectionId;
}

function createCollectionNamesKey(collectionId: string) {
  return STORAGE_COLLECTION_NAMES_PREFIX + collectionId;
}

export const localStorageCollectionRepository: CollectionRepository = {
  getCollections(): CollectionIndex[] {
    if (typeof localStorage === "undefined") {
      return [];
    }

    const collectionNameKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORAGE_COLLECTION_NAMES_PREFIX),
    );

    const collections: CollectionIndex[] = [];
    for (const collectionNameKey of collectionNameKeys) {
      const collectionName = localStorage.getItem(collectionNameKey);
      if (!collectionName) {
        continue;
      }

      const collectionId = collectionNameKey.slice(STORAGE_COLLECTION_NAMES_PREFIX.length);
      if (localStorage.getItem(createCollectionSudokusKey(collectionId)) === null) {
        continue;
      }

      collections.push({
        id: collectionId,
        name: collectionName,
      });
    }
    return collections;
  },
  getCollection(collectionId: string): Collection {
    if (typeof localStorage === "undefined") {
      throw new Error("Collection not found");
    }

    const collectionSudokus = localStorage.getItem(createCollectionSudokusKey(collectionId));
    if (collectionSudokus === null) {
      throw new Error("Collection not found");
    }

    const collectionName = localStorage.getItem(createCollectionNamesKey(collectionId));
    if (collectionName === null) {
      throw new Error("Collection not found");
    }

    return {
      id: collectionId,
      name: collectionName,
      sudokusRaw: collectionSudokus,
    };
  },
  saveCollection(collection: Collection): void {
    if (typeof localStorage === "undefined") {
      return;
    }
    localStorage.setItem(createCollectionSudokusKey(collection.id), collection.sudokusRaw);
    localStorage.setItem(createCollectionNamesKey(collection.id), collection.name);
  },
  removeCollection(collectionId: string): void {
    if (typeof localStorage === "undefined") {
      return;
    }
    localStorage.removeItem(createCollectionSudokusKey(collectionId));
    localStorage.removeItem(createCollectionNamesKey(collectionId));
  },
};
