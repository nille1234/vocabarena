/**
 * Word Scramble Game Logic Utilities
 */

export interface ScoreCalculation {
  points: number;
  hasTimeBonus: boolean;
}

/**
 * Calculate score for a correct answer
 * @param timeTaken - Time taken to answer in seconds
 * @param timerEnabled - Whether timer is enabled
 * @param timerDuration - Total timer duration
 * @returns Score calculation result
 */
export function calculateScore(
  timeTaken: number,
  timerEnabled: boolean,
  timerDuration: number
): ScoreCalculation {
  let points = 10; // Base points for correct answer
  let hasTimeBonus = false;

  // Time bonus: if answered in less than 1/3 of the timer duration
  if (timerEnabled && timeTaken < timerDuration / 3) {
    points += 5;
    hasTimeBonus = true;
  }

  return { points, hasTimeBonus };
}

/**
 * Validate if the user's answer matches the correct answer
 * @param userAnswer - User's submitted answer
 * @param correctAnswer - The correct answer
 * @returns Whether the answer is correct
 */
export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
}

/**
 * Clean German word by removing articles in parentheses
 * @param word - The word to clean
 * @returns Cleaned word
 */
export function cleanGermanWord(word: string): string {
  return word.replace(/\s*\([^)]*\)/g, '').trim();
}
