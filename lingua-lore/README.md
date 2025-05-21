# Lingua Lore - Language Listening Practice

**Lingua Lore** is an interactive web application designed to help English speakers practice their listening comprehension skills in French or Spanish. Users can input a topic of interest, and the application will generate a bilingual story, presenting it side-by-side in English and the chosen target language. The app features text-to-speech for the target language, synchronized sentence highlighting, and various controls to tailor the learning experience.

**This application was completely developed within Google AI Studio.**

## Features

*   **Bilingual Story Generation**: Enter any topic, and Lingua Lore uses the Google Gemini API to craft a story in English and your selected target language (French or Spanish).
*   **Target Language Selection**: Choose between French and Spanish for your listening practice.
*   **Difficulty Levels**: Select from "Beginner", "Intermediate", or "Expert" to match the story's complexity to your learning stage.
*   **Dual Story Panels**: View the English story in the left panel and the target language story in the right panel, with sentences perfectly aligned.
*   **Text-to-Speech**: Listen to the story read aloud in the target language using the browser's native Web Speech API.
*   **Synchronized Highlighting**: As the audio plays, the current sentence being spoken is highlighted in *both* the English and target language panels.
*   **Interactive Audio Controls**:
    *   **Play/Pause/Resume**: Full control over audio playback.
    *   **Progress Slider**: See your progress through the story and scrub to different parts.
    *   **Click-to-Play**: Click on any sentence in the target language panel to start audio playback from that point.
*   **Blur Functionality**: Independently blur the text in the English or target language panel to focus on listening or test your recall.
*   **Sleek UI**: A modern, responsive design with a vibrant blue and purple theme for an enjoyable user experience.
*   **API Key Handling**: Securely uses an environment variable for the Google Gemini API key.
*   **Error Handling**: Provides feedback for API issues or speech synthesis problems.

## How It Works

Lingua Lore leverages the power of the Google Gemini API to generate creative and contextually relevant stories based on user input. The frontend, built with React and TypeScript, manages the user interface, state, and interaction with the Web Speech API for audio playback and highlighting.

## Getting Started

To run Lingua Lore on your local machine, follow these steps:

1.  **Prerequisites**:
    *   A modern web browser that supports the Web Speech API (e.g., Chrome, Edge, Firefox, Safari).
    *   A valid **Google Gemini API Key**.

2.  **Setup**:
    *   Download or clone all the application files (`index.html`, `index.tsx`, `App.tsx`, `types.ts`, `constants.ts`, `metadata.json`, and all files within the `components/` and `services/` directories) into a single project folder on your computer.
    *   **Crucial Step: API Key Configuration**
        *   Lingua Lore requires a Google Gemini API key to function. This key must be set as an environment variable named `API_KEY`.
        *   **How you set this environment variable depends on your local development setup.**
            *   If you are using a simple HTTP server or opening `index.html` directly in a browser (which may have limitations for module loading and API calls), you might need to temporarily hardcode it for testing (NOT RECOMMENDED FOR PRODUCTION OR SHARING).
            *   Ideally, if you are using a development server (like Vite, Parcel, or `npx serve`), you would set this environment variable in your terminal session before starting the server (e.g., `API_KEY="YOUR_API_KEY_HERE" npx serve`).
            *   Within Google AI Studio, this environment variable is typically managed by the Studio environment itself.

3.  **Running the App**:
    *   Once the files are in place and the `API_KEY` environment variable is accessible to the browser's JavaScript context, simply open the `index.html` file in your web browser.
    *   Alternatively, if you have Node.js installed, you can use a simple local server. Navigate to the project directory in your terminal and run:
        ```bash
        npx serve .
        ```
        Then open the provided local URL (e.g., `http://localhost:3000`) in your browser.

4.  **Usage**:
    *   Enter a topic you're interested in (e.g., "a detective solving a mystery in Paris").
    *   Select your desired practice language (French or Spanish).
    *   Choose a difficulty level (Beginner, Intermediate, Expert).
    *   Click "Generate Story".
    *   Use the audio controls and blur toggles to practice your listening skills!

## Technology Stack

*   **Frontend**:
    *   React 18 (using ES Modules via `esm.sh`)
    *   TypeScript
    *   Tailwind CSS (via CDN)
*   **APIs**:
    *   Google Gemini API (`@google/genai` library) for story generation.
    *   Web Speech API (SpeechSynthesis) for text-to-speech.
*   **Development Environment**:
    *   Google AI Studio (where this app was fully developed).

## File Structure

```
.
├── index.html                # Main HTML file, includes Tailwind CSS and import maps
├── index.tsx                 # React entry point
├── App.tsx                   # Main application component, layout, and state management
├── types.ts                  # TypeScript types and enums
├── constants.ts              # Global constants, SVG icons
├── metadata.json             # Application metadata (not directly used by runtime)
│
├── components/               # React components
│   ├── LanguageLevelSelector.tsx # Component for selecting language difficulty
│   ├── LanguageSelector.tsx  # Component for selecting target language
│   ├── LoadingSpinner.tsx    # SVG loading spinner
│   ├── StoryPanel.tsx        # Component to display a story panel (English or target)
│   └── TopicInput.tsx        # Component for user topic input and settings
│
└── services/                 # Services for API interactions
    ├── geminiService.ts      # Service for interacting with the Google Gemini API
    └── ttsService.ts         # Service for text-to-speech functionality
```

## Development Note

This application was entirely conceived and developed within the Google AI Studio environment, demonstrating the capabilities of integrating generative AI into web applications.

---

Enjoy your language learning journey with Lingua Lore!
