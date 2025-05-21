
import React, { useState, useEffect, useCallback } from 'react';
import TopicInput from './components/TopicInput';
import StoryPanel from './components/StoryPanel';
import { 
  Language, 
  StoryContent, 
  LanguageFullName, 
  LanguageCodeForSpeech, 
  ApiKeyError, 
  LanguageLevel,
  AudioState,
} from './types';
import { getStories } from './services/geminiService';
import { speak, stopSpeaking, pauseSpeech, resumeSpeech, isSpeaking, isPaused } from './services/ttsService';
import { DEFAULT_LANGUAGE_LEVEL, LinguaLoreLogo } from './constants';

// Helper functions
const getTotalSentencesInParagraphs = (paragraphs: string[][] | null): number => {
  if (!paragraphs) return 0;
  return paragraphs.reduce((count, p) => count + p.length, 0);
};

const getGlobalSentenceIndex = (
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

const findSentenceCoordsFromGlobalIndex = (
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
  return null; // Index out of bounds
};


const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.FR);
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>(DEFAULT_LANGUAGE_LEVEL);
  
  const [englishParagraphs, setEnglishParagraphs] = useState<string[][] | null>(null);
  const [targetParagraphs, setTargetParagraphs] = useState<string[][] | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyIssue, setApiKeyIssue] = useState<string | null>(null);

  const [isEnglishBlurred, setIsEnglishBlurred] = useState<boolean>(false);
  const [isTargetBlurred, setIsTargetBlurred] = useState<boolean>(true);
  
  const [audioState, setAudioState] = useState<AudioState>(AudioState.IDLE);
  const [currentGlobalSpokenSentenceIndex, setCurrentGlobalSpokenSentenceIndex] = useState<number | null>(null);
  const [currentSpeechProgress, setCurrentSpeechProgress] = useState<number>(0); // 0-100

  const handleGenerateStories = useCallback(async (
    currentTopic: string, 
    currentLanguage: Language, 
    currentLevel: LanguageLevel
  ) => {
    if (audioState === AudioState.PLAYING || audioState === AudioState.PAUSED) {
      stopSpeaking();
    }
    setAudioState(AudioState.LOADING_SPEECH); // Indicates content loading AND speech prep
    setIsLoading(true);
    setError(null);
    setEnglishParagraphs(null);
    setTargetParagraphs(null);
    setCurrentGlobalSpokenSentenceIndex(null);
    setCurrentSpeechProgress(0);

    setTopic(currentTopic);
    setSelectedLanguage(currentLanguage);
    setSelectedLevel(currentLevel);

    const result = await getStories(currentTopic, currentLanguage, currentLevel);

    if ('message' in result) {
        setError(result.message);
        setAudioState(AudioState.ERROR);
        if (result.message.toLowerCase().includes("api_key") || result.message.toLowerCase().includes("api key")) {
            setApiKeyIssue(result.message);
        }
    } else {
      setEnglishParagraphs(result.englishParagraphs);
      setTargetParagraphs(result.targetParagraphs);
      setAudioState(AudioState.IDLE); // Ready to play
    }
    setIsLoading(false);
  }, [audioState]);

  const playAudioInternal = useCallback((startIndexGlobal: number = 0) => {
    if (targetParagraphs && getTotalSentencesInParagraphs(targetParagraphs) > 0) {
      if (isSpeaking() || isPaused()) {
        stopSpeaking(); // Ensure clean state before starting new speech
      }
      
      setAudioState(AudioState.LOADING_SPEECH);
      setCurrentGlobalSpokenSentenceIndex(startIndexGlobal); // Set initial highlight

      // Ensure progress resets if starting from beginning
      if (startIndexGlobal === 0) {
        setCurrentSpeechProgress(0);
      } else {
        // Estimate progress if starting from non-zero index
        const totalSentences = getTotalSentencesInParagraphs(targetParagraphs);
        if (totalSentences > 0) {
             setCurrentSpeechProgress(Math.round((startIndexGlobal / totalSentences) * 100));
        }
      }


      speak(
        targetParagraphs,
        LanguageCodeForSpeech[selectedLanguage],
        startIndexGlobal,
        (sentenceIndex, charIndex, totalCharsInUtterance) => { // onSentenceBoundary
          setCurrentGlobalSpokenSentenceIndex(sentenceIndex);
          if (totalCharsInUtterance > 0) {
            const progress = Math.round((charIndex / totalCharsInUtterance) * 100);
            setCurrentSpeechProgress(progress);
          } else if (sentenceIndex === null) { // End of speech
             setCurrentSpeechProgress(100);
          }
        },
        () => { // onEnd
          setAudioState(AudioState.IDLE);
          setCurrentGlobalSpokenSentenceIndex(null);
          setCurrentSpeechProgress(100); // Mark as complete
        },
        (speechEvent: SpeechSynthesisErrorEvent) => { // onError
          console.error("SpeechSynthesisErrorEvent received in App:", speechEvent);
          let detailMessage = 'Unknown speech issue.';
          if (speechEvent && speechEvent.error) {
            detailMessage = typeof speechEvent.error === 'string' ? speechEvent.error : JSON.stringify(speechEvent.error);
          }
          setError(`Speech synthesis error: ${detailMessage}`);
          setAudioState(AudioState.ERROR);
          setCurrentGlobalSpokenSentenceIndex(null);
          setCurrentSpeechProgress(0);
        }
      );
      setAudioState(AudioState.PLAYING);
    }
  }, [targetParagraphs, selectedLanguage]);

  const handlePlayPauseResumeAudio = useCallback(() => {
    if (!targetParagraphs) return;

    switch (audioState) {
      case AudioState.IDLE:
      case AudioState.ERROR:
        playAudioInternal(currentGlobalSpokenSentenceIndex ?? 0);
        break;
      case AudioState.PLAYING:
        pauseSpeech();
        setAudioState(AudioState.PAUSED);
        break;
      case AudioState.PAUSED:
        resumeSpeech();
        setAudioState(AudioState.PLAYING);
        break;
      default:
        break; // Do nothing for LOADING_SPEECH
    }
  }, [audioState, playAudioInternal, currentGlobalSpokenSentenceIndex, targetParagraphs]);

  const handleStopAudio = useCallback(() => {
    stopSpeaking();
    setAudioState(AudioState.IDLE);
    setCurrentGlobalSpokenSentenceIndex(null);
    setCurrentSpeechProgress(0);
  }, []);

  const handleSentenceClick = useCallback((globalSentenceIndex: number) => {
    if (!targetParagraphs) return;
    if (audioState === AudioState.PLAYING || audioState === AudioState.PAUSED) {
      stopSpeaking(); // Stop current speech before starting new
    }
    setCurrentGlobalSpokenSentenceIndex(globalSentenceIndex);
    playAudioInternal(globalSentenceIndex);
  }, [playAudioInternal, targetParagraphs, audioState]);

  const handleSeek = useCallback((progressPercentage: number) => {
    if (!targetParagraphs) return;
    
    const totalSentences = getTotalSentencesInParagraphs(targetParagraphs);
    if (totalSentences === 0) return;

    const targetSentenceGlobalIndex = Math.min(
        totalSentences - 1, 
        Math.max(0, Math.floor((progressPercentage / 100) * totalSentences))
    );

    if (audioState === AudioState.PLAYING || audioState === AudioState.PAUSED) {
      stopSpeaking();
    }
    
    setCurrentSpeechProgress(progressPercentage); // Update slider immediately
    setCurrentGlobalSpokenSentenceIndex(targetSentenceGlobalIndex);
    playAudioInternal(targetSentenceGlobalIndex);

  }, [targetParagraphs, audioState, playAudioInternal]);


  useEffect(() => {
    // This effect monitors the native speech synthesis state
    // and updates our app's audioState if they go out of sync
    // (e.g. speech ends naturally but onEnd callback was missed, or browser intervention)
    const interval = setInterval(() => {
      if (audioState === AudioState.PLAYING && !isSpeaking() && !isPaused()) {
        // Speech was playing but now it's not, and it's not paused by us
        setAudioState(AudioState.IDLE);
        setCurrentGlobalSpokenSentenceIndex(null); // Clear highlight
        // Keep currentSpeechProgress as is, or set to 100 if it was near end
      } else if (audioState === AudioState.PAUSED && !isPaused() && !isSpeaking()){
        // Speech was paused by us, but browser unpaused it or stopped it
        setAudioState(AudioState.IDLE);
        setCurrentGlobalSpokenSentenceIndex(null);
      }
    }, 500);
    return () => {
      clearInterval(interval);
      if (isSpeaking() || isPaused()) { 
          stopSpeaking(); // Cleanup on unmount
      }
    };
  }, [audioState]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-indigo-950 text-slate-900 dark:text-indigo-100 p-4 sm:p-8 transition-colors duration-300">
      <header className="mb-10 text-center flex flex-col items-center">
        <LinguaLoreLogo className="h-12 sm:h-14 mb-2" />
        <p className="text-lg text-indigo-600 dark:text-indigo-300">
          Master languages with immersive story listening.
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <TopicInput 
          onGenerate={handleGenerateStories} 
          isLoading={isLoading && (audioState === AudioState.LOADING_SPEECH || audioState === AudioState.IDLE)}
          initialLanguage={selectedLanguage}
          initialLevel={selectedLevel}
          disabled={!!apiKeyIssue || audioState === AudioState.LOADING_SPEECH}
        />

        {apiKeyIssue && (
          <div className="p-4 text-center bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
            <h3 className="font-semibold">Configuration Issue</h3>
            <p>{apiKeyIssue}</p>
            <p>Story generation is disabled until this is resolved.</p>
          </div>
        )}

        {error && !apiKeyIssue && (
          <div className="p-4 text-center bg-amber-100 dark:bg-amber-900 border border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-200 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <StoryPanel
            title="English Story"
            paragraphs={englishParagraphs}
            isBlurred={isEnglishBlurred}
            onToggleBlur={() => setIsEnglishBlurred(!isEnglishBlurred)}
            isLoading={isLoading && !englishParagraphs}
            showAudioControls={false}
            currentGlobalSpokenSentenceIndex={currentGlobalSpokenSentenceIndex}
            totalSentences={getTotalSentencesInParagraphs(englishParagraphs)}
            audioState={AudioState.IDLE} // No audio controls for English panel
            currentProgress={0}
          />
          <StoryPanel
            title={`${LanguageFullName[selectedLanguage]} Story`}
            paragraphs={targetParagraphs}
            languageCode={LanguageCodeForSpeech[selectedLanguage]}
            isBlurred={isTargetBlurred}
            onToggleBlur={() => setIsTargetBlurred(!isTargetBlurred)}
            
            onPlayPauseResume={handlePlayPauseResumeAudio}
            onStopAudio={handleStopAudio}
            onSeek={handleSeek}
            onSentenceClick={handleSentenceClick}

            audioState={audioState}
            currentGlobalSpokenSentenceIndex={currentGlobalSpokenSentenceIndex}
            currentProgress={currentSpeechProgress}
            
            isLoading={isLoading && !targetParagraphs}
            showAudioControls={!!targetParagraphs && getTotalSentencesInParagraphs(targetParagraphs) > 0 && !isLoading}
            totalSentences={getTotalSentencesInParagraphs(targetParagraphs)}
          />
        </div>
      </main>
      <footer className="text-center mt-12 py-4 text-sm text-indigo-500 dark:text-indigo-400">
        <p>Powered by Gemini API & Web Speech API. Happy learning!</p>
      </footer>
    </div>
  );
};

export default App;