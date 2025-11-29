/**
 * Hangman game helper utilities
 */

const ENGLISH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const GERMAN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');

/**
 * Detects if a word contains German-specific characters
 */
export const isGermanWord = (word: string): boolean => {
  const germanChars = /[äöüßÄÖÜ]/;
  return germanChars.test(word);
};

/**
 * Returns the appropriate alphabet based on the word
 */
export const getAlphabet = (word: string): string[] => {
  return isGermanWord(word) ? GERMAN_ALPHABET : ENGLISH_ALPHABET;
};

/**
 * Cleans a term by trimming whitespace and replacing ß with ss
 */
export const cleanTerm = (term: string): string => {
  return term.trim().replace(/ß/g, 'ss');
};

/**
 * Validates timer duration (10-300 seconds)
 */
export const validateTimerDuration = (seconds: number): boolean => {
  return seconds >= 10 && seconds <= 300;
};

/**
 * Formats time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
