
export enum Language {
  FR = 'fr',
  ES = 'es',
}

export const LanguageFullName: Record<Language, string> = {
  [Language.FR]: 'French',
  [Language.ES]: 'Spanish',
};

export const LanguageCodeForSpeech: Record<Language, string> = {
  [Language.FR]: 'fr-FR',
  [Language.ES]: 'es-ES',
};

export enum LanguageLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert',
}

export interface StoryContent {
  englishParagraphs: string[][];
  targetParagraphs: string[][];
}

export interface ApiKeyError {
  message: string;
}

// Callback for when a sentence boundary is crossed during speech
export type OnSentenceBoundary = (
    sentenceIndex: number | null, 
    charIndex: number, 
    totalCharsInUtterance: number
) => void;

// Callback for when a sentence is clicked by the user
export type OnSentenceClick = (paragraphIndex: number, sentenceInParagraphIndex: number) => void;

// Data structure to manage sentence character offsets for TTS
export interface SentenceCharOffset {
  sentenceIndex: number; // Global sentence index across all paragraphs
  charStartIndex: number;
  charEndIndex: number;
}

export enum AudioState {
  IDLE = 'IDLE', // No audio loaded or playing
  LOADING_SPEECH = 'LOADING_SPEECH', // Speech is being prepared
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR', // An error occurred with speech
}
