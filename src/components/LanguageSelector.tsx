import React from "react";
import {useTranslation} from "react-i18next";
import {LANGUAGE_TRANSLATIONS, LANGUAGES} from "src/i18n";

const LanguageSelector: React.FC = () => {
  const {i18n} = useTranslation();

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
        viewBox="0 0 512 512"
        fill="currentColor"
        className="absolute left-2 pointer-events-none w-5 h-5 text-gray-600 dark:text-gray-300 z-10"
      >
        <path d="M478.33,433.6l-90-218a22,22,0,0,0-40.67,0l-90,218a22,22,0,1,0,40.67,16.79L316.66,406H419.33l18.33,44.39A22,22,0,0,0,458,464a22,22,0,0,0,20.32-30.4ZM334.83,362,368,281.65,401.17,362Z"/>
        <path d="M267.84,342.92a22,22,0,0,0-4.89-30.7c-.2-.15-15-11.13-36.49-34.73,39.65-53.68,62.11-114.75,71.27-143.49H330a22,22,0,0,0,0-44H214V70a22,22,0,0,0-44,0V90H54a22,22,0,0,0,0,44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-31.41-41.68-43.08-68.65-43.17-68.87a22,22,0,0,0-40.58,17c.58,1.38,14.55,34.23,52.86,83.93.92,1.19,1.83,2.35,2.74,3.51-39.24,44.35-77.74,71.86-93.85,80.74a22,22,0,1,0,21.07,38.63c2.16-1.18,48.6-26.89,101.63-85.59,22.52,24.08,38,35.44,38.93,36.10a22,22,0,0,0,30.75-4.90Z"/>
      </svg>
      <select
        value={i18n.language}
        onChange={handleChange}
        className="h-10 bg-white border rounded pr-6 py-1 dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
        style={{
          width: "40px",
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
            className="text-black dark:text-white dark:bg-gray-800"
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
