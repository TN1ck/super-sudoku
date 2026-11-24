import React from "react";
import {Translate} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import {LANGUAGE_TRANSLATIONS, LANGUAGES} from "src/i18n";
import {safeSetStorageItem} from "src/utils/storage";

const LanguageSelector: React.FC = () => {
  const {i18n} = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value;
    if (typeof i18n.changeLanguage === "function") {
      void i18n.changeLanguage(lang);
      safeSetStorageItem("language", lang);
    }
    event.currentTarget.blur();
  };

  return (
    <div className="relative inline-flex items-center">
      <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-button-text">
        <Translate className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      </span>
      <select
        value={currentLanguage}
        onChange={handleChange}
        className="h-8 w-8 cursor-pointer rounded-sm border border-border bg-button py-1 pr-6 shadow-sm transition-colors hover:bg-button-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:h-10 md:w-10"
        style={{
          paddingLeft: "8px",
          color: "transparent",
          textIndent: "-9999px",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
        aria-label="Select language"
      >
        {LANGUAGES.map((language) => (
          <option
            key={language}
            value={language}
            className="bg-surface text-ink"
            style={{textIndent: "0", color: "inherit"}}
          >
            {LANGUAGE_TRANSLATIONS[language]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
