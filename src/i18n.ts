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
  [Language.EN]: "English",
  [Language.FR]: "Français",
  [Language.ES]: "Español",
  [Language.DE]: "Deutsch",
  [Language.IT]: "Italiano",
  [Language.PT]: "Português",
};

export const LANGUAGES = [Language.EN, Language.FR, Language.ES, Language.DE, Language.IT, Language.PT];

// Detect browser language and return a supported language
const getBrowserLanguage = (): Language => {
  const savedLang = localStorage.getItem("language");
  if (savedLang && Object.values(Language).includes(savedLang as Language)) {
    return savedLang as Language;
  }

  const browserLang = navigator.language.split("-")[0].toLowerCase();
  const supportedLang = Object.values(Language).find((lang) => lang === browserLang);
  return supportedLang || Language.EN;
};

i18n.use(initReactI18next).init({
  resources: {
    [Language.EN]: {translation: en},
    [Language.FR]: {translation: fr},
    [Language.ES]: {translation: es},
    [Language.DE]: {translation: de},
    [Language.IT]: {translation: it},
    [Language.PT]: {translation: pt},
  },
  lng: getBrowserLanguage(),
  fallbackLng: Language.EN,
  interpolation: {escapeValue: false},
});

export default i18n;
