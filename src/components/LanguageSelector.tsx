import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  // Load the saved language on mount

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== i18n.language && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value;
    if (typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={handleChange}
        className="text-black bg-white border rounded px-2 py-1 pr-6 dark:text-white dark:bg-gray-800 dark:border-gray-600"
        style={{ minWidth: 60 }}
      >
        <option value="en" className="text-black dark:text-white dark:bg-gray-800">en</option>
        <option value="fr" className="text-black dark:text-white dark:bg-gray-800">fr</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
