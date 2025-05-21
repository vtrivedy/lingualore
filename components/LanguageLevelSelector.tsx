
import React from 'react';
import { LanguageLevel } from '../types';
import { LANGUAGE_LEVELS } from '../constants';

interface LanguageLevelSelectorProps {
  selectedLevel: LanguageLevel;
  onLevelChange: (level: LanguageLevel) => void;
  disabled?: boolean;
}

const LanguageLevelSelector: React.FC<LanguageLevelSelectorProps> = ({ selectedLevel, onLevelChange, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGE_LEVELS.map((level) => (
        <button
          key={level.code}
          type="button"
          onClick={() => onLevelChange(level.code)}
          disabled={disabled}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${selectedLevel === level.code
              ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-indigo-900'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-700 dark:text-indigo-100 dark:hover:bg-indigo-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-pressed={selectedLevel === level.code}
        >
          {level.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageLevelSelector;