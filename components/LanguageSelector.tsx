import React from 'react';

type Language = 'fr' | 'en';

interface Props {
  language: Language;
  onChange: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ language, onChange }) => (
  <select value={language} onChange={e => onChange(e.target.value as Language)}>
    <option value="fr">Français</option>
    <option value="en">English</option>
  </select>
);

export default LanguageSelector;
