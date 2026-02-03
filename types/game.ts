export type GameMode = 
  | 'match' | 'gravity' 
  | 'hangman'
  | 'memory' | 'othello' | 'tic-tac-toe' | 'crossword'
  | 'word-scramble' | 'word-search' | 'word-finder' | 'flashcards' | 'gap-fill' | 'connect-four' | 'jeopardy' | 'blokus';

export type GameStatus = 'waiting' | 'active' | 'completed';

export interface VocabCard {
  id: string;
  term: string;
  definition: string;
  germanTerm?: string;
  synonyms?: string[];
  audioUrl?: string;
  orderIndex: number;
  jeopardyCategory?: string; // Optional category for Jeopardy game
}

export type LanguageMode = 'english' | 'german';

export interface GameSession {
  id: string;
  code: string;
  name?: string; // Optional game name for easy identification
  mode: GameMode;
  status: GameStatus;
  cards: VocabCard[];
  settings: GameSettings;
  startedAt?: Date;
  endedAt?: Date;
  score?: number; // Single player score
  streak?: number; // Single player streak
}

export interface GameSettings {
  timeLimit?: number; // seconds per question
  cardCount?: number;
  crosswordWordCount?: number; // number of words in crossword puzzle
  wordSearchWordCount?: number; // number of words in word search grid
  wordSearchShowList?: boolean; // whether to show word list with translations in word search
  gapFillGapCount?: number; // number of gaps in gap-fill summary (10, 15, 20, 25)
  gapFillSummaryLength?: number; // word count for gap-fill summary
  jeopardyAnswerMode?: 'text-input' | 'multiple-choice'; // answer mode for jeopardy
  allowHints: boolean;
  playMusic: boolean;
  playSFX: boolean;
}

export interface Attempt {
  cardId: string;
  answer: string;
  correct: boolean;
  timeTaken: number; // milliseconds
  timestamp: Date;
}

export interface Badge {
  id: string;
  type: 'speedster' | 'flawless' | 'comeback' | 'night_owl' | 'marathon' | 'streak_master';
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
}

export interface PlayerStats {
  totalXP: number;
  level: number;
  badges: Badge[];
  gamesPlayed: number;
  averageAccuracy: number;
  longestStreak: number;
}

// Vocabulary Management Types
export interface VocabularyList {
  id: string;
  name: string;
  description?: string;
  language?: 'english' | 'german'; // Language for clues in games like crossword
  cards: VocabCard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameLink {
  id: string;
  code: string;
  name: string;
  listId: string;
  vocabularyList?: VocabularyList;
  enabledGames: GameMode[];
  crosswordWordCount?: number; // number of words in crossword puzzle
  wordSearchWordCount?: number; // number of words in word search grid
  wordSearchShowList?: boolean; // whether to show word list with translations in word search
  othelloAnswerMode?: 'text-input' | 'multiple-choice'; // answer mode for othello
  ticTacToeAnswerMode?: 'text-input' | 'multiple-choice'; // answer mode for five-in-a-row
  connectFourAnswerMode?: 'text-input' | 'multiple-choice'; // answer mode for connect four
  jeopardyAnswerMode?: 'text-input' | 'multiple-choice'; // answer mode for jeopardy
  jeopardyTimeLimit?: number; // time limit per question in jeopardy (10, 20, 30, 40, 50, 60 seconds)
  blokusAnswerMode?: 'text-input' | 'multiple-choice'; // answer mode for blokus
  blokusTimeLimit?: number; // time limit per question in blokus (10, 20, 30, 40, 50, 60 seconds, or null for no limit)
  gapFillGapCount?: number; // number of gaps in gap-fill summary
  gapFillSummaryLength?: number; // word count for gap-fill summary
  requirePrerequisiteGames?: boolean; // if true, students must complete Match and Flashcards before accessing other games
  allowWordListDownload?: boolean; // if true, students can download the vocabulary word list
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}
