import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";

export enum Language {
  EN = "en",
  FR = "fr",
  ES = "es",
  DE = "de",
  IT = "it",
  PT = "pt",
}

export const LANGUAGE_TRANSLATIONS: Record<Language, string> = {
  [Language.EN]: "EN",
  [Language.FR]: "FR",
  [Language.ES]: "ES",
  [Language.DE]: "DE",
  [Language.IT]: "IT",
  [Language.PT]: "PT",
};

export const LANGUAGES = [Language.EN, Language.FR, Language.ES, Language.DE, Language.IT, Language.PT];

i18n.use(initReactI18next).init({
  resources: {
    [Language.EN]: {translation: en},
    [Language.FR]: {translation: fr},
    [Language.ES]: {translation: es},
    [Language.DE]: {translation: de},
    [Language.IT]: {translation: it},
    [Language.PT]: {translation: pt},
  },
  lng: Language.EN,
  fallbackLng: Language.EN,
  interpolation: {escapeValue: false},
});

export default i18n;
