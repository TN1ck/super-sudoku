import {safeGetStorageItem, safeParseJson, safeSetStorageItem} from "src/utils/storage";

const STORAGE_KEY_USER_PREFERENCES = "super-sudoku-user-preferences";

export interface UserPreferences {
  showHints: boolean;
  showWrongEntries: boolean;
  showConflicts: boolean;
  showCircleMenu: boolean;
  showOccurrences: boolean;
  showTimer: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  showHints: false,
  showWrongEntries: false,
  showConflicts: true,
  showCircleMenu: true,
  showOccurrences: false,
  showTimer: true,
};

interface UserPreferencesRepository {
  getPreferences(): UserPreferences;
  savePreferences(preferences: UserPreferences): void;
}

export const localStorageUserPreferencesRepository: UserPreferencesRepository = {
  getPreferences(): UserPreferences {
    const storedPreferences = safeGetStorageItem(STORAGE_KEY_USER_PREFERENCES);
    if (!storedPreferences) {
      return DEFAULT_USER_PREFERENCES;
    }

    const parsed = safeParseJson<Record<string, unknown>>(storedPreferences);
    if (!parsed || typeof parsed !== "object") {
      console.warn("Failed to parse user preferences from localStorage");
      return DEFAULT_USER_PREFERENCES;
    }

    return {
      showHints: typeof parsed.showHints === "boolean" ? parsed.showHints : DEFAULT_USER_PREFERENCES.showHints,
      showWrongEntries:
        typeof parsed.showWrongEntries === "boolean"
          ? parsed.showWrongEntries
          : DEFAULT_USER_PREFERENCES.showWrongEntries,
      showConflicts:
        typeof parsed.showConflicts === "boolean" ? parsed.showConflicts : DEFAULT_USER_PREFERENCES.showConflicts,
      showCircleMenu:
        typeof parsed.showCircleMenu === "boolean" ? parsed.showCircleMenu : DEFAULT_USER_PREFERENCES.showCircleMenu,
      showOccurrences:
        typeof parsed.showOccurrences === "boolean" ? parsed.showOccurrences : DEFAULT_USER_PREFERENCES.showOccurrences,
      showTimer: typeof parsed.showTimer === "boolean" ? parsed.showTimer : DEFAULT_USER_PREFERENCES.showTimer,
    };
  },

  savePreferences(preferences: UserPreferences): void {
    safeSetStorageItem(STORAGE_KEY_USER_PREFERENCES, JSON.stringify(preferences));
  },
};
