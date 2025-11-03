import { VocabCard, Attempt } from '@/types/game';

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a random game code
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[s2.length][s1.length];
}

/**
 * Check if answer is correct with fuzzy matching
 */
export function isAnswerCorrect(
  userAnswer: string,
  correctAnswer: string,
  threshold: number = 2
): boolean {
  const cleanUser = userAnswer.trim().toLowerCase();
  const cleanCorrect = correctAnswer.trim().toLowerCase();
  
  // Exact match
  if (cleanUser === cleanCorrect) return true;
  
  // Fuzzy match for typos
  const distance = levenshteinDistance(cleanUser, cleanCorrect);
  const maxLength = Math.max(cleanUser.length, cleanCorrect.length);
  
  // Allow small typos based on word length
  return distance <= Math.min(threshold, Math.floor(maxLength * 0.2));
}

/**
 * Calculate points based on time taken and streak
 */
export function calculatePoints(
  timeTaken: number,
  streak: number,
  timeLimit?: number
): number {
  let basePoints = 10;
  
  // Time bonus (if answered quickly)
  if (timeLimit && timeTaken < timeLimit * 0.5) {
    basePoints += 5; // Speed bonus
  }
  
  // Streak multiplier
  const streakBonus = Math.floor(streak / 3) * 5;
  
  return basePoints + streakBonus;
}

/**
 * Calculate XP from points
 */
export function calculateXP(points: number, accuracy: number): number {
  const baseXP = points;
  const accuracyBonus = accuracy >= 1.0 ? 50 : 0; // Perfect round bonus
  return baseXP + accuracyBonus;
}

/**
 * Calculate accuracy from attempts
 */
export function calculateAccuracy(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter((a) => a.correct).length;
  return correct / attempts.length;
}

/**
 * Get current streak from attempts
 */
export function getCurrentStreak(attempts: Attempt[]): number {
  let streak = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].correct) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Check if badge should be awarded
 */
export function checkBadgeEligibility(
  badgeType: string,
  attempts: Attempt[],
  timeTaken?: number
): boolean {
  switch (badgeType) {
    case 'speedster':
      // Average time < 2 seconds
      if (!attempts.length) return false;
      const avgTime = attempts.reduce((sum, a) => sum + a.timeTaken, 0) / attempts.length;
      return avgTime < 2000;
      
    case 'flawless':
      // 100% accuracy
      return attempts.length > 0 && attempts.every((a) => a.correct);
      
    case 'streak_master':
      // Streak of 10+
      return getCurrentStreak(attempts) >= 10;
      
    case 'marathon':
      // Session duration > 30 minutes
      return timeTaken ? timeTaken > 30 * 60 * 1000 : false;
      
    default:
      return false;
  }
}

/**
 * Format time in MM:SS
 */
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get random subset of cards
 */
export function getRandomCards(cards: VocabCard[], count: number): VocabCard[] {
  const shuffled = shuffleArray(cards);
  return shuffled.slice(0, Math.min(count, cards.length));
}
