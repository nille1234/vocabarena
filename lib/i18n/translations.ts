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
  wordScramble: {
    title: {
      da: "Word Scramble – Gæt ordet!",
      en: "Word Scramble – Guess the word!"
    },
    instruction: {
      da: "Bogstaverne er blevet blandet – kan du finde ordet? Skriv det rigtige ord så hurtigt du kan!",
      en: "The letters have been scrambled – can you find the word? Type the correct word as fast as you can!"
    },
    scrambledWord: {
      da: "Blandet ord:",
      en: "Scrambled word:"
    },
    yourAnswer: {
      da: "Dit svar",
      en: "Your answer"
    },
    attemptsLeft: {
      da: "Forsøg tilbage:",
      en: "Attempts left:"
    },
    submit: {
      da: "Send svar",
      en: "Submit"
    },
    nextWord: {
      da: "Næste ord",
      en: "Next word"
    },
    correct: {
      da: "Korrekt!",
      en: "Correct!"
    },
    incorrect: {
      da: "Forkert!",
      en: "Incorrect!"
    },
    correctAnswer: {
      da: "Det rigtige svar var:",
      en: "The correct answer was:"
    },
    translation: {
      da: "Oversættelse:",
      en: "Translation:"
    },
    timeBonus: {
      da: "Tidsbonus!",
      en: "Time bonus!"
    },
    difficulty: {
      da: "Sværhedsgrad:",
      en: "Difficulty:"
    },
    easy: {
      da: "Let",
      en: "Easy"
    },
    medium: {
      da: "Mellem",
      en: "Medium"
    },
    hard: {
      da: "Svær",
      en: "Hard"
    },
    selectDifficulty: {
      da: "Vælg sværhedsgrad",
      en: "Select difficulty"
    },
    startGame: {
      da: "Start spil",
      en: "Start game"
    },
    enableTimer: {
      da: "Aktiver timer",
      en: "Enable timer"
    },
    timerDuration: {
      da: "Timer varighed (sekunder)",
      en: "Timer duration (seconds)"
    },
    playerName: {
      da: "Spillernavn",
      en: "Player name"
    },
    enterName: {
      da: "Indtast dit navn",
      en: "Enter your name"
    },
    oneAttempt: {
      da: "Du har ét forsøg per ord",
      en: "You have one attempt per word"
    },
  },
  wordSearch: {
    title: {
      da: "Ordjagt – Find gloserne!",
      en: "Word Search – Find the words!"
    },
    instruction: {
      da: "Ordjagten er i gang! Find alle gloserne i gitteret – de kan gemme sig vandret, lodret eller diagonalt. Nogle står endda baglæns!",
      en: "The word hunt is on! Find all the words in the grid – they can hide horizontally, vertically or diagonally. Some are even backwards!"
    },
    wordsToFind: {
      da: "Ord at finde:",
      en: "Words to find:"
    },
    wordsFound: {
      da: "Ord fundet:",
      en: "Words found:"
    },
    selectCells: {
      da: "Træk over bogstaverne for at vælge et ord",
      en: "Drag over letters to select a word"
    },
    wordFound: {
      da: "Ord fundet!",
      en: "Word found!"
    },
    notAWord: {
      da: "Det er ikke et ord fra listen",
      en: "That's not a word from the list"
    },
    allWordsFound: {
      da: "Alle ord fundet!",
      en: "All words found!"
    },
    completionBonus: {
      da: "Fuldførelsesbonus!",
      en: "Completion bonus!"
    },
    newGame: {
      da: "Nyt spil",
      en: "New game"
    },
    enableTimer: {
      da: "Aktiver timer",
      en: "Enable timer"
    },
    startGame: {
      da: "Start spil",
      en: "Start game"
    },
  },
  raceToFinish: {
    germany: {
      title: "Reise durch Deutschland",
      instruction: "Beantworte die Fragen richtig, um dein Auto durch Deutschland zu steuern! Jede richtige Antwort bringt dich ein Feld weiter. Wer zuerst das Ziel erreicht, gewinnt!",
      correct: "Richtig!",
      incorrect: "Leider falsch!",
      winner: "Gewonnen!",
      player: "Spieler",
      yourTurn: "Du bist dran!",
      waiting: "Warte auf den anderen Spieler...",
      question: "Frage",
      translate: "Übersetze das Wort",
      chooseCorrect: "Wähle die richtige Übersetzung für",
      typeAnswer: "Schreibe die Übersetzung",
      submit: "Absenden",
      nextQuestion: "Nächste Frage",
      position: "Position",
      trackLength: "Streckenlänge",
      fields: "Felder",
      playerName: "Spielername",
      startRace: "Rennen starten",
      playAgain: "Nochmal spielen",
      backToMenu: "Zurück zum Menü",
      congratulations: "Herzlichen Glückwunsch!",
      hasWon: "hat gewonnen!",
      finalStats: "Endstatistik",
      correctAnswers: "Richtige Antworten",
    },
    britain: {
      title: "Tour of Britain",
      instruction: "Answer the questions correctly to move across Britain! Each right answer moves you one step closer to the finish line. Who will reach the goal first?",
      correct: "Well done!",
      incorrect: "Try again!",
      winner: "You won!",
      player: "Player",
      yourTurn: "Your turn!",
      waiting: "Waiting for the other player...",
      question: "Question",
      translate: "Translate the word",
      chooseCorrect: "Choose the correct meaning of",
      typeAnswer: "Type the translation",
      submit: "Submit",
      nextQuestion: "Next Question",
      position: "Position",
      trackLength: "Track Length",
      fields: "Fields",
      playerName: "Player Name",
      startRace: "Start Race",
      playAgain: "Play Again",
      backToMenu: "Back to Menu",
      congratulations: "Congratulations!",
      hasWon: "has won!",
      finalStats: "Final Statistics",
      correctAnswers: "Correct Answers",
    },
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
