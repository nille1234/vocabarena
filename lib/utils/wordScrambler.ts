/**
 * Scrambles the letters of a word while ensuring it's different from the original
 * @param word - The word to scramble
 * @returns The scrambled word
 */
export function scrambleWord(word: string): string {
  if (word.length <= 1) return word;
  
  const letters = word.split('');
  let scrambled: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    // Fisher-Yates shuffle algorithm
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    scrambled = letters.join('');
    attempts++;
  } while (scrambled === word && attempts < maxAttempts);
  
  // If we couldn't create a different scramble (unlikely), swap first two letters
  if (scrambled === word && word.length >= 2) {
    const arr = scrambled.split('');
    [arr[0], arr[1]] = [arr[1], arr[0]];
    scrambled = arr.join('');
  }
  
  return scrambled;
}

/**
 * Validates if a scrambled word is valid (different from original)
 * @param original - The original word
 * @param scrambled - The scrambled word
 * @returns True if valid scramble
 */
export function isValidScramble(original: string, scrambled: string): boolean {
  if (original === scrambled) return false;
  
  // Check if they have the same letters
  const sortedOriginal = original.toLowerCase().split('').sort().join('');
  const sortedScrambled = scrambled.toLowerCase().split('').sort().join('');
  
  return sortedOriginal === sortedScrambled;
}

/**
 * Scrambles a word with difficulty level
 * @param word - The word to scramble
 * @param difficulty - 'easy', 'medium', or 'hard'
 * @returns The scrambled word
 */
export function scrambleWordWithDifficulty(
  word: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): string {
  if (word.length <= 1) return word;
  
  const letters = word.split('');
  
  switch (difficulty) {
    case 'easy':
      // Only scramble middle letters, keep first and last
      if (word.length <= 3) return scrambleWord(word);
      const middle = letters.slice(1, -1);
      for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
      }
      return letters[0] + middle.join('') + letters[letters.length - 1];
      
    case 'medium':
      // Standard scramble
      return scrambleWord(word);
      
    case 'hard':
      // Full scramble with possible reversal
      const scrambled = scrambleWord(word);
      return Math.random() > 0.5 ? scrambled : scrambled.split('').reverse().join('');
      
    default:
      return scrambleWord(word);
  }
}
