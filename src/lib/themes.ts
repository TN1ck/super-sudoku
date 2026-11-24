export type ThemeId = "light" | "paper" | "high-contrast" | "dark" | "ocean" | "forest";

export type ThemeColorScheme = "light" | "dark";

export interface ThemeDefinition {
  id: ThemeId;
  labelKey: "theme_light" | "theme_paper" | "theme_high_contrast" | "theme_dark" | "theme_ocean" | "theme_forest";
  colorScheme: ThemeColorScheme;
  themeColor: string;
  /** Preview colors: [canvas, board, accent] */
  swatches: readonly [string, string, string];
}

export const DEFAULT_LIGHT_THEME: ThemeId = "light";
export const DEFAULT_DARK_THEME: ThemeId = "dark";

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "light",
    labelKey: "theme_light",
    colorScheme: "light",
    themeColor: "#f1f5f9",
    swatches: ["#f1f5f9", "#ffffff", "#0d9488"],
  },
  {
    id: "paper",
    labelKey: "theme_paper",
    colorScheme: "light",
    themeColor: "#f4efe6",
    swatches: ["#f4efe6", "#fffdf9", "#b45309"],
  },
  {
    id: "high-contrast",
    labelKey: "theme_high_contrast",
    colorScheme: "light",
    themeColor: "#ffffff",
    swatches: ["#ffffff", "#fde047", "#0047ab"],
  },
  {
    id: "dark",
    labelKey: "theme_dark",
    colorScheme: "dark",
    themeColor: "#111827",
    swatches: ["#111827", "#1f2937", "#0d9488"],
  },
  {
    id: "ocean",
    labelKey: "theme_ocean",
    colorScheme: "dark",
    themeColor: "#0b1220",
    swatches: ["#0b1220", "#131f33", "#0891b2"],
  },
  {
    id: "forest",
    labelKey: "theme_forest",
    colorScheme: "dark",
    themeColor: "#0d1712",
    swatches: ["#0d1712", "#15241c", "#059669"],
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

export function isDarkTheme(themeId: ThemeId): boolean {
  return THEME_MAP[themeId].colorScheme === "dark";
}
