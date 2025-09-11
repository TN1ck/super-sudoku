import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export enum Language {
  EN = "en",
  FR = "fr",
}

export const LANGUAGE_TRANSLATIONS: Record<Language, string> = {
  [Language.EN]: "EN",
  [Language.FR]: "FR",
};

export const LANGUAGES = [Language.EN, Language.FR];

i18n.use(initReactI18next).init({
  resources: {
    [Language.EN]: {translation: en},
    [Language.FR]: {translation: fr},
  },
  lng: Language.EN,
  fallbackLng: Language.EN,
  interpolation: {escapeValue: false},
});

export default i18n;
