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

// The collections have an id, name and a list of sudokus.
// We do not want to parse the whole sudokus, just to show an index of the sudokus.
// That's why we save the name and and sudokus in different local storage keys.
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
    const collectionNameKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORAGE_COLLECTION_NAMES_PREFIX),
    );

    return collectionNameKeys
      .map((collectionNameKey) => {
        const collectionName = localStorage.getItem(collectionNameKey);
        if (!collectionName) {
          return null;
        }

        const collectionId = collectionNameKey.replace(STORAGE_COLLECTION_NAMES_PREFIX, "");
        const result: CollectionIndex = {
          id: collectionId,
          name: collectionName,
        };
        return result;
      })
      .filter((collection) => collection !== null);
  },
  getCollection(collectionId: string): Collection {
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
    localStorage.setItem(createCollectionSudokusKey(collection.id), collection.sudokusRaw);
    localStorage.setItem(createCollectionNamesKey(collection.id), collection.name);
  },
  removeCollection(collectionId: string): void {
    localStorage.removeItem(createCollectionSudokusKey(collectionId));
    localStorage.removeItem(createCollectionNamesKey(collectionId));
  },
};
