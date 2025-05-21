
import React from 'react';
import { PlayIcon, PauseIcon, StopIcon } from '../constants';
import { AudioState } from '../types'; // Removed LanguageFullName as it's no longer used
import LoadingSpinner from './LoadingSpinner';

interface StoryPanelProps {
  title: string;
  paragraphs: string[][] | null;
  languageCode?: string; // Kept for potential future use, but not for current aria-labels
  isBlurred: boolean;
  onToggleBlur: () => void;
  
  onPlayPauseResume?: () => void;
  onStopAudio?: () => void;
  onSeek?: (progress: number) => void; // progress is 0-100
  onSentenceClick?: (globalSentenceIndex: number) => void;

  audioState: AudioState;
  currentGlobalSpokenSentenceIndex: number | null;
  currentProgress: number; // 0-100

  isLoading: boolean;
  showAudioControls: boolean;
  totalSentences: number; // Total sentences in this panel's content
}

// Helper function to find sentence coordinates from a global index within THIS panel's paragraphs
const findSentenceCoordsInPanel = (
  globalIndex: number | null,
  paragraphs: string[][] | null
): { paragraphIndex: number; sentenceInParagraphIndex: number } | null => {
  if (globalIndex === null || !paragraphs) return null;
  let currentGlobalIndex = 0;
  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const paragraph = paragraphs[pIdx];
    if (globalIndex < currentGlobalIndex + paragraph.length) {
      return { paragraphIndex: pIdx, sentenceInParagraphIndex: globalIndex - currentGlobalIndex };
    }
    currentGlobalIndex += paragraph.length;
  }
  return null; 
};

// Helper function to calculate global sentence index within THIS panel's paragraphs
const getGlobalSentenceIndexInPanel = (
  paragraphIndex: number,
  sentenceInParagraphIndex: number,
  paragraphs: string[][]
): number => {
  let globalIndex = 0;
  for (let i = 0; i < paragraphIndex; i++) {
    globalIndex += paragraphs[i].length;
  }
  globalIndex += sentenceInParagraphIndex;
  return globalIndex;
};


const StoryPanel: React.FC<StoryPanelProps> = ({
  title,
  paragraphs,
  languageCode, // keep prop for flexibility, though not used in aria-labels now
  isBlurred,
  onToggleBlur,
  onPlayPauseResume,
  onStopAudio,
  onSeek,
  onSentenceClick,
  audioState,
  currentGlobalSpokenSentenceIndex,
  currentProgress,
  isLoading,
  showAudioControls,
  totalSentences
}) => {

  const handleSentenceClickInternal = (pIndex: number, sIndex: number) => {
    if (onSentenceClick && paragraphs) {
      const globalIndex = getGlobalSentenceIndexInPanel(pIndex, sIndex, paragraphs);
      onSentenceClick(globalIndex);
    }
  };

  const currentSentenceCoords = findSentenceCoordsInPanel(currentGlobalSpokenSentenceIndex, paragraphs);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full min-h-[150px]"><LoadingSpinner /></div>;
    }
    if (!paragraphs || paragraphs.length === 0 || paragraphs.every(p => p.length === 0)) {
      return <p className="text-slate-500 dark:text-indigo-400 italic text-center py-10">No story generated yet, or the story is empty.</p>;
    }

    // let globalSentenceCounter = 0; // Not needed here with current highlighting logic
    return paragraphs.map((paragraph, pIndex) => (
      <div key={`para-${pIndex}`} className="paragraph-container">
        {paragraph.map((sentence, sIndex) => {
          const isHighlighted = 
            currentSentenceCoords?.paragraphIndex === pIndex &&
            currentSentenceCoords?.sentenceInParagraphIndex === sIndex;
          
          // const sentenceGlobalIndex = globalSentenceCounter++; // Not needed

          return (
            <p
              key={`sent-${pIndex}-${sIndex}`}
              className={`cursor-pointer transition-colors duration-150 ${isBlurred ? 'blur-sm select-none' : ''} ${isHighlighted ? 'highlighted-sentence' : 'hover:bg-violet-100 dark:hover:bg-indigo-800'}`}
              onClick={onSentenceClick && !isBlurred ? () => handleSentenceClickInternal(pIndex, sIndex) : undefined}
              role={onSentenceClick ? "button" : undefined}
              tabIndex={onSentenceClick && !isBlurred ? 0 : undefined}
              aria-label={onSentenceClick && !isBlurred ? `Play from sentence: ${sentence.substring(0,30)}...` : undefined}
            >
              {sentence}
            </p>
          );
        })}
      </div>
    ));
  };

  let playPauseResumeIcon: React.ReactNode;
  let playPauseResumeLabel = "Play";

  switch (audioState) {
    case AudioState.PLAYING:
      playPauseResumeIcon = <PauseIcon className="w-6 h-6" />;
      playPauseResumeLabel = "Pause";
      break;
    case AudioState.PAUSED:
      playPauseResumeIcon = <PlayIcon className="w-6 h-6" />;
      playPauseResumeLabel = "Resume";
      break;
    default: // IDLE, ERROR, LOADING_SPEECH (though button might be disabled)
      playPauseResumeIcon = <PlayIcon className="w-6 h-6" />;
      playPauseResumeLabel = "Play";
  }
  
  const audioControlsDisabled = audioState === AudioState.LOADING_SPEECH || isLoading || !paragraphs || totalSentences === 0;

  return (
    <div className="bg-white dark:bg-indigo-900 shadow-xl rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-violet-700 dark:text-violet-400">{title}</h2>
        <button
          onClick={onToggleBlur}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-500 dark:border-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-indigo-800 transition-colors"
          aria-pressed={isBlurred}
          aria-label={isBlurred ? `Unblur ${title}` : `Blur ${title}`}
        >
          {isBlurred ? 'Unblur' : 'Blur'} Text
        </button>
      </div>
      
      <div className={`story-content overflow-y-auto flex-grow prose prose-slate dark:prose-invert max-w-none prose-p:my-1 ${isBlurred ? 'select-none' : ''} text-slate-700 dark:text-indigo-200`}>
        {renderContent()}
      </div>

      {showAudioControls && (
        <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-indigo-700 space-y-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onPlayPauseResume}
              disabled={audioControlsDisabled}
              className="p-2 rounded-full text-slate-100 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-indigo-700 disabled:cursor-not-allowed transition-colors"
              aria-label={`${playPauseResumeLabel} audio for ${title}`}
            >
              {playPauseResumeIcon}
            </button>
            <button
              onClick={onStopAudio}
              disabled={audioControlsDisabled || audioState === AudioState.IDLE || audioState === AudioState.ERROR}
              className="p-2 rounded-full text-slate-100 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 dark:disabled:bg-indigo-700 disabled:cursor-not-allowed transition-colors"
              aria-label={`Stop audio for ${title}`}
            >
              <StopIcon className="w-6 h-6" />
            </button>
             <input
                type="range"
                min="0"
                max="100"
                value={audioControlsDisabled ? 0 : currentProgress}
                onChange={(e) => onSeek && onSeek(parseInt(e.target.value, 10))}
                disabled={audioControlsDisabled}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed" /* Global styles apply for track/thumb */
                aria-label={`Seek audio progress for ${title}`}
              />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryPanel;