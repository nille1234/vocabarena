import { GameMode } from '@/types/game';

export const ALL_GAME_MODES: { 
  id: GameMode; 
  name: string; 
  icon: string; 
  description: string;
  color?: string;
}[] = [
  { 
    id: 'flashcards', 
    name: 'Flashcards', 
    icon: '🎴', 
    description: 'Interactive flashcards',
    color: 'from-blue-500/20 to-blue-600/20'
  },
  { 
    id: 'match', 
    name: 'Match', 
    icon: '🎯', 
    description: 'Match terms with definitions',
    color: 'from-purple-500/20 to-purple-600/20'
  },
  { 
    id: 'gravity', 
    name: 'Gravity', 
    icon: '🚀', 
    description: 'Type before words fall',
    color: 'from-pink-500/20 to-pink-600/20'
  },
  { 
    id: 'learn', 
    name: 'Learn', 
    icon: '📚', 
    description: 'Step-by-step learning',
    color: 'from-green-500/20 to-green-600/20'
  },
  { 
    id: 'spell', 
    name: 'Spell', 
    icon: '✍️', 
    description: 'Practice spelling',
    color: 'from-yellow-500/20 to-yellow-600/20'
  },
  { 
    id: 'test', 
    name: 'Test', 
    icon: '📝', 
    description: 'Test your knowledge',
    color: 'from-red-500/20 to-red-600/20'
  },
  { 
    id: 'hangman', 
    name: 'Hangman', 
    icon: '🎮', 
    description: 'Guess the word',
    color: 'from-indigo-500/20 to-indigo-600/20'
  },
  { 
    id: 'falling-words', 
    name: 'Falling Words', 
    icon: '⬇️', 
    description: 'Catch falling words',
    color: 'from-cyan-500/20 to-cyan-600/20'
  },
  { 
    id: 'mystery-word', 
    name: 'Mystery Word', 
    icon: '🔍', 
    description: 'Reveal hidden words',
    color: 'from-orange-500/20 to-orange-600/20'
  },
  { 
    id: 'word-ladder', 
    name: 'Word Ladder', 
    icon: '🪜', 
    description: 'Climb word ladder',
    color: 'from-teal-500/20 to-teal-600/20'
  },
  { 
    id: 'word-maze', 
    name: 'Word Maze', 
    icon: '🌀', 
    description: 'Navigate word maze',
    color: 'from-violet-500/20 to-violet-600/20'
  },
  { 
    id: 'speed-challenge', 
    name: 'Speed Challenge', 
    icon: '⚡', 
    description: 'Answer quickly',
    color: 'from-amber-500/20 to-amber-600/20'
  },
  { 
    id: 'survival', 
    name: 'Survival', 
    icon: '💪', 
    description: 'Survive as long as possible',
    color: 'from-rose-500/20 to-rose-600/20'
  },
  { 
    id: 'sentence-builder', 
    name: 'Sentence Builder', 
    icon: '🔨', 
    description: 'Build sentences',
    color: 'from-lime-500/20 to-lime-600/20'
  },
  { 
    id: 'memory', 
    name: 'Memory', 
    icon: '🧠', 
    description: 'Match pairs',
    color: 'from-fuchsia-500/20 to-fuchsia-600/20'
  },
  { 
    id: 'othello', 
    name: 'Othello', 
    icon: '⚫', 
    description: 'Strategic board game',
    color: 'from-slate-500/20 to-slate-600/20'
  },
  { 
    id: 'tic-tac-toe', 
    name: 'Five-in-a-Row', 
    icon: '❌', 
    description: '10×10 tic-tac-toe',
    color: 'from-emerald-500/20 to-emerald-600/20'
  },
  { 
    id: 'hex', 
    name: 'Hex', 
    icon: '⬡', 
    description: 'Connect your sides',
    color: 'from-sky-500/20 to-sky-600/20'
  },
  { 
    id: 'crossword', 
    name: 'Crossword', 
    icon: '📋', 
    description: 'Solve the crossword puzzle',
    color: 'from-stone-500/20 to-stone-600/20'
  },
];
