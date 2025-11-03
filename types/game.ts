export type GameMode = 
  | 'flashcards' | 'match' | 'gravity' | 'learn' | 'spell' | 'test' 
  | 'hangman' | 'falling-words' | 'mystery-word' | 'word-ladder' 
  | 'word-maze' | 'speed-challenge' | 'survival' | 'sentence-builder'
  | 'memory' | 'othello' | 'tic-tac-toe' | 'hex' | 'crossword';

export type GameStatus = 'waiting' | 'active' | 'completed';

export interface VocabCard {
  id: string;
  term: string;
  definition: string;
  germanTerm?: string;
  synonyms?: string[];
  audioUrl?: string;
  orderIndex: number;
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
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}
