
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, LanguageFullName, StoryContent, ApiKeyError, LanguageLevel } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

const getApiKey = (): string | ApiKeyError => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return { message: "API_KEY environment variable is not set. Please configure it to use the story generation feature." };
  }
  return apiKey;
};

let ai: GoogleGenAI | null = null;
let apiKeyError: ApiKeyError | null = null;

const initializeAi = () => {
  if (ai) return; 
  const apiKeyResult = getApiKey();
  if (typeof apiKeyResult === 'string') {
    ai = new GoogleGenAI({ apiKey: apiKeyResult });
  } else {
    apiKeyError = apiKeyResult;
  }
};

initializeAi();

export const getStories = async (
  topic: string, 
  targetLanguage: Language,
  languageLevel: LanguageLevel
): Promise<StoryContent | ApiKeyError> => {
  if (apiKeyError) return apiKeyError;
  if (!ai) return { message: "Gemini AI client is not initialized due to missing API key." };
  
  const targetLanguageName = LanguageFullName[targetLanguage];

  const prompt = `You are a language learning assistant. Generate a story about "${topic}".
The story should be suitable for a ${languageLevel} language learner.
Provide the story in two languages: English and ${targetLanguageName}.
The story should be divided into natural paragraphs. Each paragraph should contain multiple sentences. Aim for 2-4 paragraphs in total.
Each sentence should be relatively short and clear for the specified language level.

The response MUST be a JSON object with the exact following structure:
{
  "englishParagraphs": [
    ["Paragraph 1, Sentence 1 in English.", "Paragraph 1, Sentence 2 in English.", ...],
    ["Paragraph 2, Sentence 1 in English.", "Paragraph 2, Sentence 2 in English.", ...]
  ],
  "targetParagraphs": [
    ["Paragraph 1, Sentence 1 in ${targetLanguageName}.", "Paragraph 1, Sentence 2 in ${targetLanguageName}.", ...],
    ["Paragraph 2, Sentence 1 in ${targetLanguageName}.", "Paragraph 2, Sentence 2 in ${targetLanguageName}.", ...]
  ]
}

Ensure that:
1.  The "englishParagraphs" and "targetParagraphs" arrays have the same number of paragraphs.
2.  Each corresponding paragraph (e.g., englishParagraphs[0] and targetParagraphs[0]) has the same number of sentences.
3.  Each sentence in an English paragraph directly corresponds to the sentence at the same index in the corresponding ${targetLanguageName} paragraph.
4.  There are between 3 to 7 sentences per paragraph.
5.  The total story should contain approximately 8-15 sentences in total across all paragraphs.

Do not include any introductory or concluding phrases like 'Here is the story:' or any text outside the JSON object. Output only the raw JSON.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Handles optional language in fence
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as Partial<StoryContent>;

    if (
      !parsedData.englishParagraphs || !parsedData.targetParagraphs ||
      !Array.isArray(parsedData.englishParagraphs) || !Array.isArray(parsedData.targetParagraphs) ||
      parsedData.englishParagraphs.length === 0 ||
      parsedData.englishParagraphs.length !== parsedData.targetParagraphs.length
    ) {
      console.error("Invalid paragraph structure or count mismatch:", parsedData);
      throw new Error("Received misaligned or improperly formatted paragraph data from the AI.");
    }

    for (let i = 0; i < parsedData.englishParagraphs.length; i++) {
      const engPara = parsedData.englishParagraphs[i];
      const targetPara = parsedData.targetParagraphs[i];
      if (
        !Array.isArray(engPara) || !Array.isArray(targetPara) ||
        engPara.length === 0 ||
        engPara.length !== targetPara.length ||
        !engPara.every(s => typeof s === 'string') ||
        !targetPara.every(s => typeof s === 'string')
      ) {
        console.error(`Invalid sentence structure in paragraph ${i}:`, engPara, targetPara);
        throw new Error(`Received misaligned or improperly formatted sentences within paragraph ${i + 1} from the AI.`);
      }
    }
    
    return {
      englishParagraphs: parsedData.englishParagraphs as string[][],
      targetParagraphs: parsedData.targetParagraphs as string[][],
    };

  } catch (error) {
    console.error("Error in getStories:", error);
    let message = error instanceof Error ? error.message : "An unknown error occurred while fetching stories.";
     if (message.toLowerCase().includes("api key") || message.toLowerCase().includes("api_key")) {
        return { message: "There seems to be an issue with the API key configuration. Please check and ensure it is correctly set up." };
    }
    if (error instanceof SyntaxError) { // JSON parsing error
        message = "Failed to parse story data from the AI. The AI might have returned an unexpected response format or non-JSON text. Please try again.";
    }
    return { message };
  }
};
