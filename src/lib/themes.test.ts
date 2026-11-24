import {describe, expect, it} from "vite-plus/test";
import {DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, getThemeDefinition, isDarkTheme, isThemeId, THEMES} from "./themes";

describe("themes", () => {
  it("defines unique ids with valid color schemes and swatches", () => {
    const ids = THEMES.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_LIGHT_THEME);
    expect(ids).toContain(DEFAULT_DARK_THEME);

    for (const theme of THEMES) {
      expect(isThemeId(theme.id)).toBe(true);
      expect(getThemeDefinition(theme.id)).toEqual(theme);
      expect(["light", "dark"]).toContain(theme.colorScheme);
      expect(theme.themeColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.swatches).toHaveLength(3);
      expect(isDarkTheme(theme.id)).toBe(theme.colorScheme === "dark");
    }
  });

  it("rejects unknown theme identifiers", () => {
    expect(isThemeId("unknown")).toBe(false);
    expect(isThemeId("")).toBe(false);
    expect(isThemeId(null)).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
    expect(isThemeId(123)).toBe(false);
  });
});
