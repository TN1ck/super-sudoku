import React, {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {LANGUAGE_TRANSLATIONS, LANGUAGES} from "src/i18n";

const LanguageSelector: React.FC = () => {
  const {i18n} = useTranslation();

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value;
    if (typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
    }
  };

  return (
    <div>
      <select
        value={i18n.language}
        onChange={handleChange}
        className="text-black h-10 bg-white border rounded px-2 py-1 pr-6 dark:text-white dark:bg-gray-800 dark:border-gray-600"
        style={{minWidth: 60}}
      >
        {LANGUAGES.map((language) => (
          <option key={language} value={language} className="text-black dark:text-white dark:bg-gray-800">
            {LANGUAGE_TRANSLATIONS[language]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
