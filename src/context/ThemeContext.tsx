import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {ColorMode, DEFAULT_THEME, getThemeDefinition, isThemeId, ThemeId} from "src/lib/themes";
import {safeGetStorageItem, safeParseJson, safeSetStorageItem} from "src/utils/storage";

export const THEME_STORAGE_KEY = "theme";
export const DARK_MODE_STORAGE_KEY = "darkMode";

function getSystemColorMode(): ColorMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): ThemeId | undefined {
  const raw = safeGetStorageItem(THEME_STORAGE_KEY);
  return isThemeId(raw) ? raw : undefined;
}

function getStoredDarkMode(): boolean | undefined {
  const parsed = safeParseJson<unknown>(safeGetStorageItem(DARK_MODE_STORAGE_KEY));
  return typeof parsed === "boolean" ? parsed : undefined;
}

export function resolveInitialTheme(): ThemeId {
  return getStoredTheme() ?? DEFAULT_THEME;
}

export function resolveInitialColorMode(): ColorMode {
  const storedDarkMode = getStoredDarkMode();
  if (storedDarkMode !== undefined) {
    return storedDarkMode ? "dark" : "light";
  }
  return getSystemColorMode();
}

export function applyThemeToDocument(themeId: ThemeId, colorMode: ColorMode): void {
  if (typeof document === "undefined") {
    return;
  }

  const definition = getThemeDefinition(themeId);
  document.documentElement.dataset.theme = definition.id;
  document.documentElement.dataset.colorMode = colorMode;
  document.documentElement.style.colorScheme = colorMode;
  document.body?.classList.toggle("dark", colorMode === "dark");

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", definition.themeColor[colorMode]);
  }
}

interface ThemeContextValue {
  theme: ThemeId;
  colorMode: ColorMode;
  isDark: boolean;
  setTheme: (theme: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [theme, setThemeState] = useState<ThemeId>(resolveInitialTheme);
  const [colorMode, setColorModeState] = useState<ColorMode>(resolveInitialColorMode);

  useEffect(() => {
    applyThemeToDocument(theme, colorMode);
  }, [theme, colorMode]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (getStoredDarkMode() === undefined) {
        setColorModeState(event.matches ? "dark" : "light");
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
      }
      if (event.key === DARK_MODE_STORAGE_KEY || event.key === null) {
        setColorModeState(resolveInitialColorMode());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    setThemeState(nextTheme);
    safeSetStorageItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const setColorMode = useCallback((nextColorMode: ColorMode) => {
    setColorModeState(nextColorMode);
    safeSetStorageItem(DARK_MODE_STORAGE_KEY, JSON.stringify(nextColorMode === "dark"));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setColorModeState((currentMode) => {
      const nextMode: ColorMode = currentMode === "dark" ? "light" : "dark";
      safeSetStorageItem(DARK_MODE_STORAGE_KEY, JSON.stringify(nextMode === "dark"));
      return nextMode;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      colorMode,
      isDark: colorMode === "dark",
      setTheme,
      setColorMode,
      toggleDarkMode,
    }),
    [theme, colorMode, setTheme, setColorMode, toggleDarkMode],
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
