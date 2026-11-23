import {describe, expect, it} from "vitest";
import en from "./en.json";
import de from "./de.json";
import es from "./es.json";
import fr from "./fr.json";
import itLocale from "./it.json";
import pt from "./pt.json";
import zh from "./zh.json";

const LOCALES: Record<string, Record<string, string>> = {
  en,
  de,
  es,
  fr,
  it: itLocale,
  pt,
  zh,
};

function extractPlaceholders(template: string): string[] {
  return [...template.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
}

describe("locale translations", () => {
  const referenceKeys = Object.keys(en).sort();

  for (const [locale, messages] of Object.entries(LOCALES)) {
    it(`has complete keys and matching placeholders for "${locale}"`, () => {
      expect(Object.keys(messages).sort()).toEqual(referenceKeys);

      for (const key of referenceKeys) {
        expect(messages[key].trim().length, `${locale}.${key} should be non-empty`).toBeGreaterThan(0);
        expect(extractPlaceholders(messages[key]), `${locale}.${key} placeholders`).toEqual(
          extractPlaceholders(en[key as keyof typeof en]),
        );
      }
    });
  }
});
