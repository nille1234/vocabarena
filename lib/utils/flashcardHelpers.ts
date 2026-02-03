import { VocabCard } from '@/types/game';

export interface FlashCardProgress {
  unseenWords: string[]; // Card IDs not yet studied
  knownWords: string[]; // Card IDs marked as "I know this"
  reviewWords: string[]; // Card IDs marked as "I don't know" (need review)
  sessionStats: {
    cardsStudied: number;
    timeSpent: number;
    lastStudied: number; // timestamp
  };
}

/**
 * Initialize progress for a new game session
 */
export function initializeProgress(vocabulary: VocabCard[]): FlashCardProgress {
  return {
    unseenWords: vocabulary.map(card => card.id),
    knownWords: [],
    reviewWords: [],
    sessionStats: {
      cardsStudied: 0,
      timeSpent: 0,
      lastStudied: Date.now(),
    },
  };
}

/**
 * Get the next card to show based on two-phase learning
 * Phase 1: Show all unseen words first
 * Phase 2: Review words marked as "don't know"
 */
export function getNextCard(
  vocabulary: VocabCard[],
  progress: FlashCardProgress
): VocabCard | null {
  // Phase 1: Show unseen words first (in order)
  if (progress.unseenWords.length > 0) {
    const cardId = progress.unseenWords[0];
    return vocabulary.find(card => card.id === cardId) || null;
  }

  // Phase 2: After all words seen, show review words
  if (progress.reviewWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * progress.reviewWords.length);
    const cardId = progress.reviewWords[randomIndex];
    return vocabulary.find(card => card.id === cardId) || null;
  }

  // All words mastered!
  return null;
}

/**
 * Mark a card as known and update progress
 */
export function markCardAsKnown(
  cardId: string,
  progress: FlashCardProgress
): FlashCardProgress {
  const newProgress = { ...progress };

  // Remove from unseen
  newProgress.unseenWords = newProgress.unseenWords.filter(id => id !== cardId);

  // Remove from review
  newProgress.reviewWords = newProgress.reviewWords.filter(id => id !== cardId);

  // Add to known if not already there
  if (!newProgress.knownWords.includes(cardId)) {
    newProgress.knownWords.push(cardId);
  }

  // Update stats
  newProgress.sessionStats.cardsStudied += 1;

  return newProgress;
}

/**
 * Mark a card for review and update progress
 */
export function markCardForReview(
  cardId: string,
  progress: FlashCardProgress
): FlashCardProgress {
  const newProgress = { ...progress };

  // Remove from unseen
  newProgress.unseenWords = newProgress.unseenWords.filter(id => id !== cardId);

  // Remove from known
  newProgress.knownWords = newProgress.knownWords.filter(id => id !== cardId);

  // Add to review if not already there
  if (!newProgress.reviewWords.includes(cardId)) {
    newProgress.reviewWords.push(cardId);
  }

  // Update stats
  newProgress.sessionStats.cardsStudied += 1;

  return newProgress;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleCards<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Load progress from localStorage
 */
export function loadProgress(gameCode: string): FlashCardProgress | null {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = `flashcards-progress-${gameCode}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading flashcard progress:', e);
  }

  return null;
}

/**
 * Save progress to localStorage
 */
export function saveProgress(gameCode: string, progress: FlashCardProgress): void {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = `flashcards-progress-${gameCode}`;
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving flashcard progress:', e);
  }
}

/**
 * Reset progress for a game
 */
export function resetProgress(gameCode: string): void {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = `flashcards-progress-${gameCode}`;
    localStorage.removeItem(storageKey);
  } catch (e) {
    console.error('Error resetting flashcard progress:', e);
  }
}

/**
 * Calculate overall progress percentage
 */
export function calculateProgress(progress: FlashCardProgress, totalCards: number): number {
  if (totalCards === 0) return 0;
  return Math.round((progress.knownWords.length / totalCards) * 100);
}
