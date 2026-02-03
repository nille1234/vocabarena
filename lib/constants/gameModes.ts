import { GameMode } from '@/types/game';

export const ALL_GAME_MODES: { 
  id: GameMode; 
  name: string; 
  icon: string; 
  description: string;
  color?: string;
}[] = [
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
    id: 'hangman', 
    name: 'Hangman', 
    icon: '🎮', 
    description: 'Guess the word',
    color: 'from-indigo-500/20 to-indigo-600/20'
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
    id: 'crossword', 
    name: 'Crossword', 
    icon: '📋', 
    description: 'Solve the crossword puzzle',
    color: 'from-stone-500/20 to-stone-600/20'
  },
  { 
    id: 'word-scramble', 
    name: 'Word Scramble', 
    icon: '🔤', 
    description: 'Unscramble the letters',
    color: 'from-lime-500/20 to-lime-600/20'
  },
  { 
    id: 'word-search', 
    name: 'Word Search', 
    icon: '🔍', 
    description: 'Find words in the grid',
    color: 'from-blue-500/20 to-blue-600/20'
  },
  { 
    id: 'word-finder', 
    name: 'Word Finder Battle', 
    icon: '⚔️', 
    description: 'Two-player word search race',
    color: 'from-red-500/20 to-blue-500/20'
  },
  { 
    id: 'flashcards', 
    name: 'Flash Cards', 
    icon: '🎴', 
    description: 'Study with interactive flash cards',
    color: 'from-cyan-500/20 to-cyan-600/20'
  },
  { 
    id: 'gap-fill', 
    name: 'Gap Text', 
    icon: '📝', 
    description: 'Fill in missing words in a text',
    color: 'from-amber-500/20 to-amber-600/20'
  },
  { 
    id: 'connect-four', 
    name: 'Connect Four', 
    icon: '🔴', 
    description: 'Translate to drop discs and connect four',
    color: 'from-red-500/20 to-yellow-500/20'
  },
  { 
    id: 'jeopardy', 
    name: 'Jeopardy', 
    icon: '💰', 
    description: 'Answer questions in themed categories',
    color: 'from-yellow-500/20 to-orange-500/20'
  },
  { 
    id: 'blokus', 
    name: 'Blokus', 
    icon: '🧩', 
    description: 'Strategic tile placement game',
    color: 'from-violet-500/20 to-purple-500/20'
  },
];
