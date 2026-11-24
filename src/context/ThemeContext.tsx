import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
  DEFAULT_DARK_THEME,
  DEFAULT_LIGHT_THEME,
  getThemeDefinition,
  isDarkTheme,
  isThemeId,
  ThemeId,
} from "src/lib/themes";
import {safeGetStorageItem, safeParseJson, safeSetStorageItem} from "src/utils/storage";

export const THEME_STORAGE_KEY = "theme";
export const DARK_MODE_STORAGE_KEY = "darkMode";
const LAST_LIGHT_THEME_STORAGE_KEY = "lastLightTheme";
const LAST_DARK_THEME_STORAGE_KEY = "lastDarkTheme";

function getSystemDarkMode(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getStoredTheme(): ThemeId | undefined {
  const raw = safeGetStorageItem(THEME_STORAGE_KEY);
  return isThemeId(raw) ? raw : undefined;
}

function getStoredDarkMode(): boolean | undefined {
  const parsed = safeParseJson<unknown>(safeGetStorageItem(DARK_MODE_STORAGE_KEY));
  return typeof parsed === "boolean" ? parsed : undefined;
}

function getStoredPreferredTheme(scheme: "light" | "dark"): ThemeId {
  const key = scheme === "dark" ? LAST_DARK_THEME_STORAGE_KEY : LAST_LIGHT_THEME_STORAGE_KEY;
  const fallback = scheme === "dark" ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
  const raw = safeGetStorageItem(key);
  if (isThemeId(raw) && getThemeDefinition(raw).colorScheme === scheme) {
    return raw;
  }
  return fallback;
}

export function resolveInitialTheme(): ThemeId {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  const storedDarkMode = getStoredDarkMode();
  if (storedDarkMode !== undefined) {
    return storedDarkMode ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
  }

  return getSystemDarkMode() ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
}

export function applyThemeToDocument(themeId: ThemeId): void {
  if (typeof document === "undefined") {
    return;
  }

  const definition = getThemeDefinition(themeId);
  document.documentElement.dataset.theme = definition.id;
  document.documentElement.style.colorScheme = definition.colorScheme;
  document.body?.classList.toggle("dark", definition.colorScheme === "dark");

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", definition.themeColor);
  }
}

interface ThemeContextValue {
  theme: ThemeId;
  isDark: boolean;
  setTheme: (theme: ThemeId) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [theme, setThemeState] = useState<ThemeId>(resolveInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme() === undefined && getStoredDarkMode() === undefined) {
        setThemeState(event.matches ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setThemeState(resolveInitialTheme());
      } else if (event.key === DARK_MODE_STORAGE_KEY) {
        const storedTheme = getStoredTheme();
        const storedDarkMode = getStoredDarkMode();
        if (storedTheme && storedDarkMode !== undefined && isDarkTheme(storedTheme) === storedDarkMode) {
          setThemeState(storedTheme);
        } else if (storedDarkMode !== undefined) {
          setThemeState(getStoredPreferredTheme(storedDarkMode ? "dark" : "light"));
        } else {
          setThemeState(resolveInitialTheme());
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    setThemeState(nextTheme);
    const dark = isDarkTheme(nextTheme);
    safeSetStorageItem(THEME_STORAGE_KEY, nextTheme);
    safeSetStorageItem(DARK_MODE_STORAGE_KEY, JSON.stringify(dark));
    safeSetStorageItem(dark ? LAST_DARK_THEME_STORAGE_KEY : LAST_LIGHT_THEME_STORAGE_KEY, nextTheme);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setThemeState((currentTheme) => {
      const currentlyDark = isDarkTheme(currentTheme);
      safeSetStorageItem(currentlyDark ? LAST_DARK_THEME_STORAGE_KEY : LAST_LIGHT_THEME_STORAGE_KEY, currentTheme);

      const targetScheme = currentlyDark ? "light" : "dark";
      const nextTheme = getStoredPreferredTheme(targetScheme);
      safeSetStorageItem(THEME_STORAGE_KEY, nextTheme);
      safeSetStorageItem(DARK_MODE_STORAGE_KEY, JSON.stringify(!currentlyDark));
      return nextTheme;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: isDarkTheme(theme),
      setTheme,
      toggleDarkMode,
    }),
    [theme, setTheme, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
