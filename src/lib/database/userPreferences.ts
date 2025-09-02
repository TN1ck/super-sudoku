const STORAGE_KEY_USER_PREFERENCES = "super-sudoku-user-preferences";

export interface UserPreferences {
  showHints: boolean;
  showWrongEntries: boolean;
  showConflicts: boolean;
  showCircleMenu: boolean;
  showOccurrences: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  showHints: false,
  showWrongEntries: false,
  showConflicts: true,
  showCircleMenu: true,
  showOccurrences: false,
};

interface UserPreferencesRepository {
  getPreferences(): UserPreferences;
  savePreferences(preferences: UserPreferences): void;
}

export const localStorageUserPreferencesRepository: UserPreferencesRepository = {
  getPreferences(): UserPreferences {
    if (typeof localStorage === "undefined") {
      return DEFAULT_USER_PREFERENCES;
    }

    const storedPreferences = localStorage.getItem(STORAGE_KEY_USER_PREFERENCES);

    if (!storedPreferences) {
      return DEFAULT_USER_PREFERENCES;
    }

    try {
      const parsed = JSON.parse(storedPreferences);

      // Merge with defaults to handle cases where new preferences are added
      return {
        ...DEFAULT_USER_PREFERENCES,
        ...parsed,
      };
    } catch (error) {
      console.warn("Failed to parse user preferences from localStorage:", error);
      return DEFAULT_USER_PREFERENCES;
    }
  },

  savePreferences(preferences: UserPreferences): void {
    if (typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY_USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn("Failed to save user preferences to localStorage:", error);
    }
  },
};
