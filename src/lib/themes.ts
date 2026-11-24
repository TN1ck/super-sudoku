export type ThemeId = "default" | "paper" | "high-contrast";

export type ColorMode = "light" | "dark";

export interface ThemeDefinition {
  id: ThemeId;
  labelKey: "theme_default" | "theme_paper" | "theme_high_contrast";
  themeColor: Record<ColorMode, string>;
  /** Preview colors per color mode: [canvas, board, accent] */
  swatches: Record<ColorMode, readonly [string, string, string]>;
}

export const DEFAULT_THEME: ThemeId = "default";

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "default",
    labelKey: "theme_default",
    themeColor: {
      light: "#f1f5f9",
      dark: "#111827",
    },
    swatches: {
      light: ["#f1f5f9", "#ffffff", "#0d9488"],
      dark: ["#111827", "#1f2937", "#0d9488"],
    },
  },
  {
    id: "paper",
    labelKey: "theme_paper",
    themeColor: {
      light: "#f4efe6",
      dark: "#1c1917",
    },
    swatches: {
      light: ["#f4efe6", "#fffdf9", "#b45309"],
      dark: ["#1c1917", "#292524", "#d97706"],
    },
  },
  {
    id: "high-contrast",
    labelKey: "theme_high_contrast",
    themeColor: {
      light: "#ffffff",
      dark: "#0a0c10",
    },
    swatches: {
      light: ["#ffffff", "#fde047", "#0047ab"],
      dark: ["#0a0c10", "#1f3a5f", "#1f6feb"],
    },
  },
] as const;

const THEME_MAP: Record<ThemeId, ThemeDefinition> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme]),
) as Record<ThemeId, ThemeDefinition>;

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && value in THEME_MAP;
}

export function getThemeDefinition(themeId: ThemeId): ThemeDefinition {
  return THEME_MAP[themeId];
}
