
import React from 'react';
import { Language, LanguageLevel } from './types';

export const SUPPORTED_LANGUAGES = [
  { code: Language.FR, name: 'French' },
  { code: Language.ES, name: 'Spanish' },
];

export const LANGUAGE_LEVELS = [
  { code: LanguageLevel.BEGINNER, name: 'Beginner (A1-A2)' },
  { code: LanguageLevel.INTERMEDIATE, name: 'Intermediate (B1-B2)' },
  { code: LanguageLevel.EXPERT, name: 'Expert (C1-C2)' },
];
export const DEFAULT_LANGUAGE_LEVEL = LanguageLevel.INTERMEDIATE;


export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const LinguaLoreLogo: React.FC<{ className?: string }> = ({ className = "h-10" }) => {
  // Using React.createElement for SVG
  return React.createElement(
    "svg",
    {
      viewBox: "0 0 200 40",
      className: className,
      xmlns: "http://www.w3.org/2000/svg",
      "aria-label": "Lingua Lore Logo"
    },
    React.createElement(
      "text",
      {
        x: "0",
        y: "30",
        fontFamily: "Inter, sans-serif",
        fontSize: "30",
        fontWeight: "bold",
        fill: "#2563eb" /* blue-600 */,
      },
      "Lingua"
    ),
    React.createElement(
      "text",
      {
        x: "105", // Adjust spacing as needed
        y: "30",
        fontFamily: "Inter, sans-serif",
        fontSize: "30",
        fontWeight: "bold", // Can change weight for "Lore"
        fill: "#7c3aed" /* violet-600 */,
      },
      "Lore"
    )
  );
};


export const PlayIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className: className,
      "aria-hidden": "true",
    },
    React.createElement("path", {
      fillRule: "evenodd",
      d: "M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.279 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z",
      clipRule: "evenodd",
    })
  );
};

export const PauseIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className: className,
      "aria-hidden": "true",
    },
    React.createElement("path", {
      fillRule: "evenodd",
      d: "M6.75 6.75a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V6.75zm7.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V6.75z",
      clipRule: "evenodd",
    })
  );
};


export const StopIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className: className,
      "aria-hidden": "true",
    },
    React.createElement("path", {
      fillRule: "evenodd",
      d: "M6.75 5.25a.75.75 0 00-.75.75V18a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75V6a.75.75 0 00-.75-.75H6.75z",
      clipRule: "evenodd",
    })
  );
};

export const CheckIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => {
  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      className: className,
      "aria-hidden": "true",
    },
    React.createElement("path", {
      fillRule: "evenodd",
      d: "M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z",
      clipRule: "evenodd",
    })
  );
};

export const SparklesIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => {
  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: 1.5, 
      stroke: "currentColor",
      className: className,
      "aria-hidden": "true",
    },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a4.5 4.5 0 012.098 2.098L24 12l-2.846.813a4.5 4.5 0 01-2.098 2.098L18.25 17.25l-.813-2.846a4.5 4.5 0 01-2.098-2.098L12.5 12l2.846-.813a4.5 4.5 0 012.098-2.098L18.25 7.5z",
    })
  );
};