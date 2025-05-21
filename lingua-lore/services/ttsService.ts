
import { OnSentenceBoundary, SentenceCharOffset } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let sentenceCharOffsets: SentenceCharOffset[] = [];
let onSentenceBoundaryCallback: OnSentenceBoundary | null = null;
let speechStartIndexGlobal = 0; // Stores the global starting sentence index for the current speech batch

export const speak = (
  paragraphs: string[][],
  lang: string,
  startIndexGlobal: number = 0, // The global index across all sentences in all paragraphs to start from
  onBoundary: OnSentenceBoundary,
  onEnd: () => void,
  onError: (e: SpeechSynthesisErrorEvent) => void
): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    const dummyUtterance = new SpeechSynthesisUtterance(); // Required for the event
    onError(new SpeechSynthesisErrorEvent('error', { error: 'synthesis-unavailable', utterance: dummyUtterance }));
    return;
  }

  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
  }
  
  onSentenceBoundaryCallback = onBoundary;
  speechStartIndexGlobal = startIndexGlobal;

  const allSentences: string[] = paragraphs.flat();
  if (allSentences.length === 0) {
    onEnd();
    return;
  }
  
  const sentencesToSpeak = allSentences.slice(startIndexGlobal);
  if (sentencesToSpeak.length === 0) {
      onEnd(); // Nothing to speak from this start index
      return;
  }

  const fullText = sentencesToSpeak.join(' '); 
  
  sentenceCharOffsets = [];
  let currentCharIndex = 0;
  sentencesToSpeak.forEach((sentence, relativeIndex) => {
    const sentenceLength = sentence.length;
    sentenceCharOffsets.push({
      sentenceIndex: relativeIndex, // This is the index within sentencesToSpeak
      charStartIndex: currentCharIndex,
      charEndIndex: currentCharIndex + sentenceLength,
    });
    currentCharIndex += sentenceLength + 1; // +1 for the space
  });

  const totalCharsInUtterance = fullText.length;

  // Small delay for cancellation processing
  setTimeout(() => {
    if (currentUtterance) { // Clean up previous utterance listeners if any linger
        currentUtterance.onboundary = null;
        currentUtterance.onend = null;
        currentUtterance.onerror = null;
    }
    currentUtterance = new SpeechSynthesisUtterance(fullText);
    currentUtterance.lang = lang;
    currentUtterance.rate = 0.9;

    currentUtterance.onboundary = (event) => {
      if (event.name === 'sentence' || event.name === 'word') { 
        const charIdx = event.charIndex;
        let currentRelativeSentenceIdx = -1;

        for (const offset of sentenceCharOffsets) {
          if (charIdx >= offset.charStartIndex && charIdx <= offset.charEndIndex) {
             currentRelativeSentenceIdx = offset.sentenceIndex;
             break;
          }
        }
        if (currentRelativeSentenceIdx === -1) { // Fallback: find closest preceding
            for (let i = sentenceCharOffsets.length - 1; i >=0; i--) {
                if (charIdx >= sentenceCharOffsets[i].charStartIndex) {
                    currentRelativeSentenceIdx = sentenceCharOffsets[i].sentenceIndex;
                    break;
                }
            }
        }

        if (onSentenceBoundaryCallback) {
          const globalSentenceIdx = currentRelativeSentenceIdx !== -1 ? currentRelativeSentenceIdx + speechStartIndexGlobal : null;
          onSentenceBoundaryCallback(globalSentenceIdx, charIdx, totalCharsInUtterance);
        }
      }
    };

    currentUtterance.onend = () => {
      if (onSentenceBoundaryCallback) onSentenceBoundaryCallback(null, totalCharsInUtterance, totalCharsInUtterance); // Clear highlight, indicate completion
      onEnd();
      currentUtterance = null;
    };
    
    currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      if (onSentenceBoundaryCallback) onSentenceBoundaryCallback(null, event.charIndex, totalCharsInUtterance); // Clear highlight
      onError(event);
      currentUtterance = null;
    };
    
    speechSynthesis.speak(currentUtterance);
  }, 100);
};

export const stopSpeaking = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    if (currentUtterance) {
        // Detach listeners before cancel, helps prevent lingering events
        currentUtterance.onboundary = null;
        currentUtterance.onend = null;
        currentUtterance.onerror = null;
    }
    speechSynthesis.cancel();
    currentUtterance = null;
    // onSentenceBoundaryCallback = null; // Potentially problematic if new speech starts immediately
  }
};

export const pauseSpeech = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis && speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
};

export const resumeSpeech = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis && speechSynthesis.paused) {
    speechSynthesis.resume();
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return speechSynthesis.speaking;
  }
  return false;
};

export const isPaused = (): boolean => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return speechSynthesis.paused;
  }
  return false;
};
