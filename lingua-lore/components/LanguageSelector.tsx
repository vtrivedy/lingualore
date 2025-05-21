
import React from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange, disabled }) => {
  return (
    <div className="flex space-x-2">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onLanguageChange(lang.code)}
          disabled={disabled}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${selectedLanguage === lang.code 
              ? 'bg-blue-600 text-white' 
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-700 dark:text-indigo-100 dark:hover:bg-indigo-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;