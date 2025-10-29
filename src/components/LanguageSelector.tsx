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
    <div className="relative inline-flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-2 pointer-events-none w-5 h-5 text-gray-600 dark:text-gray-300"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <select
        value={i18n.language}
        onChange={handleChange}
        className="text-black h-10 bg-white border rounded pl-8 pr-6 py-1 dark:text-white dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
        style={{minWidth: 80}}
        aria-label="Select language"
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
