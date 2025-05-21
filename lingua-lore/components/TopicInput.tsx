
import React, { useState } from 'react';
import { Language, LanguageLevel } from '../types';
import LanguageSelector from './LanguageSelector';
import LanguageLevelSelector from './LanguageLevelSelector'; // New import
import { SparklesIcon } from '../constants';
import { DEFAULT_LANGUAGE_LEVEL } from '../constants';

interface TopicInputProps {
  onGenerate: (topic: string, language: Language, level: LanguageLevel) => void; // Added level
  isLoading: boolean;
  initialLanguage?: Language;
  initialLevel?: LanguageLevel;
  disabled?: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ 
  onGenerate, 
  isLoading, 
  initialLanguage = Language.FR, 
  initialLevel = DEFAULT_LANGUAGE_LEVEL,
  disabled 
}) => {
  const [topic, setTopic] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>(initialLevel); // New state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading && !disabled) {
      onGenerate(topic.trim(), selectedLanguage, selectedLevel); // Pass level
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-indigo-900 shadow-xl rounded-xl space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-indigo-200 mb-1">
          Enter a topic:
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., a friendly cat, a trip to Paris, a space adventure"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-indigo-800 border border-slate-300 dark:border-indigo-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 dark:text-indigo-50"
          disabled={isLoading || disabled}
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-indigo-200 mb-2">
            Practice Language:
          </label>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            disabled={isLoading || disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-indigo-200 mb-2">
            Difficulty Level:
          </label>
          <LanguageLevelSelector
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            disabled={isLoading || disabled}
          />
        </div>
      </div>
      

      <button
        type="submit"
        disabled={isLoading || !topic.trim() || disabled}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-indigo-900 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Story...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Story
          </>
        )}
      </button>
    </form>
  );
};

export default TopicInput;