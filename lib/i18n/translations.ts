export const translations = {
  teacher: {
    title: "Teacher Dashboard",
    subtitle: "Create and manage vocabulary games for your students",
    createGame: "Create New Game",
    activeGames: "Active Games",
    noActiveGames: "No active games",
    noActiveGamesDesc: "Create a new game to get started",
    gameCode: "Game Code",
    players: "Players",
    mode: "Mode",
    status: "Status",
    actions: "Actions",
    viewGame: "View Game",
    endGame: "End Game",
  },
  createGame: {
    title: "Create New Game",
    description: "Choose an existing vocabulary set or upload a new wordlist",
    useExisting: "Use Existing Set",
    uploadNew: "Upload New Wordlist",
    selectVocab: "Select Vocabulary Set",
    chooseVocab: "Choose a vocabulary set",
    words: "words",
    custom: "Custom",
    languageMode: "Language Mode",
    languageModeDesc: "Choose which language version to use for the game questions",
    englishDanish: "🇬🇧 English → Danish",
    germanDanish: "🇩🇪 German → Danish",
    wordlistTitle: "Wordlist Title",
    wordlistTitlePlaceholder: "e.g., Medical Vocabulary",
    descriptionLabel: "Description (Optional)",
    descriptionPlaceholder: "Brief description of this wordlist",
    uploadFile: "Upload Wordlist File",
    dropFile: "Drop your file here or click to browse",
    supportedFormats: "Supports .csv, .json, and .docx files",
    fileUploaded: "File uploaded",
    remove: "Remove",
    parseError: "Parse Error",
    successParsed: "Successfully parsed",
    vocabCards: "vocabulary cards",
    preview: "Preview (First 5 cards)",
    term: "Term",
    definition: "Definition",
    german: "German",
    formatHelp: "Format Help",
    csvFormat: "CSV Format:",
    csvFormatDesc: "term,definition (header required)",
    jsonFormat: "JSON Format:",
    jsonFormatDesc: "Array of objects with term and definition fields",
    docxFormat: "DOCX Format:",
    docxFormatDesc: "Each line: Term → Definition (e.g., Dog → hund)",
    cancel: "Cancel",
    createGameBtn: "Create Game",
    selectVocabError: "Please select a vocabulary set",
    uploadFileError: "Please upload a valid wordlist file",
    enterTitleError: "Please enter a title for the wordlist",
  },
};

export type TranslationKey = keyof typeof translations;

export function getTranslation(key: string): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
