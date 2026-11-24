import {describe, expect, it} from "vite-plus/test";
import {DEFAULT_THEME, getThemeDefinition, isThemeId, THEMES} from "./themes";

describe("themes", () => {
  it("defines unique theme ids with both light and dark palettes", () => {
    const ids = THEMES.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_THEME);

    for (const theme of THEMES) {
      expect(isThemeId(theme.id)).toBe(true);
      expect(getThemeDefinition(theme.id)).toEqual(theme);
      for (const mode of ["light", "dark"] as const) {
        expect(theme.themeColor[mode]).toMatch(/^#[0-9a-f]{6}$/i);
        expect(theme.swatches[mode]).toHaveLength(3);
      }
    }
  });

  it("rejects unknown theme identifiers", () => {
    expect(isThemeId("unknown")).toBe(false);
    expect(isThemeId("ocean")).toBe(false);
    expect(isThemeId("forest")).toBe(false);
    expect(isThemeId("")).toBe(false);
    expect(isThemeId(null)).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
    expect(isThemeId(123)).toBe(false);
  });
});
