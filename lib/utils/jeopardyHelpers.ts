import { VocabCard } from '@/types/game';

export interface JeopardyCategory {
  name: string;
  cards: VocabCard[];
}

export interface JeopardyQuestion {
  card: VocabCard;
  value: number;
  categoryName: string;
  answered: boolean;
}

export interface JeopardyBoard {
  categories: JeopardyCategory[];
  questions: JeopardyQuestion[][];
}

/**
 * Generate Jeopardy categories from vocabulary cards
 * Uses AI-generated categories if available, otherwise creates automatic categories
 */
export function generateJeopardyCategories(cards: VocabCard[]): JeopardyCategory[] {
  // First, try to use AI-generated categories
  const categorizedCards = new Map<string, VocabCard[]>();
  const uncategorizedCards: VocabCard[] = [];

  cards.forEach(card => {
    if (card.jeopardyCategory) {
      if (!categorizedCards.has(card.jeopardyCategory)) {
        categorizedCards.set(card.jeopardyCategory, []);
      }
      categorizedCards.get(card.jeopardyCategory)!.push(card);
    } else {
      uncategorizedCards.push(card);
    }
  });

  // Sort categories by size (largest first) to prioritize well-populated categories
  const sortedCategories = Array.from(categorizedCards.entries())
    .sort(([, a], [, b]) => b.length - a.length);

  const validCategories: JeopardyCategory[] = [];
  const redistributeCards: VocabCard[] = [...uncategorizedCards];

  // Process categories and redistribute cards to ensure 5 questions per category
  for (const [name, categoryCards] of sortedCategories) {
    if (validCategories.length >= 5) {
      // Already have 5 categories, add remaining cards to redistribute pool
      redistributeCards.push(...categoryCards);
      continue;
    }

    if (categoryCards.length >= 5) {
      // Category has enough cards, use it
      validCategories.push({ name, cards: categoryCards });
    } else if (categoryCards.length >= 4) {
      // Category has 4 cards, try to add one more from redistribute pool
      if (redistributeCards.length > 0) {
        const extraCard = redistributeCards.shift()!;
        validCategories.push({ name, cards: [...categoryCards, extraCard] });
      } else {
        // Not enough cards to complete this category, add to redistribute pool
        redistributeCards.push(...categoryCards);
      }
    } else {
      // Category has too few cards, add to redistribute pool
      redistributeCards.push(...categoryCards);
    }
  }

  // If we still don't have 5 categories, generate automatic ones from remaining cards
  if (validCategories.length < 5 && redistributeCards.length >= 5) {
    const autoCategories = generateAutomaticCategories(redistributeCards);
    
    // Fill up to 5 categories
    for (const autoCategory of autoCategories) {
      if (validCategories.length >= 5) break;
      validCategories.push(autoCategory);
    }
  }

  // Ensure we have exactly 5 categories
  if (validCategories.length < 5) {
    // Last resort: use all cards and generate automatic categories
    const autoCategories = generateAutomaticCategories(cards);
    return autoCategories.slice(0, 5);
  }

  return validCategories.slice(0, 5);
}

/**
 * Generate automatic categories based on word characteristics
 * Only used as fallback when AI categorization is not available
 */
function generateAutomaticCategories(cards: VocabCard[]): JeopardyCategory[] {
  const categories: JeopardyCategory[] = [];
  const usedCards = new Set<string>();

  // Distribute cards more evenly to ensure we get 5 categories with 5 cards each
  const cardsPerCategory = Math.max(5, Math.ceil(cards.length / 5));
  
  // Category 1: Short Words (≤5 letters)
  const shortWords = cards.filter(c => c.term.length <= 5 && !usedCards.has(c.id));
  if (shortWords.length >= 5) {
    const selected = shortWords.slice(0, cardsPerCategory);
    selected.forEach(c => usedCards.add(c.id));
    categories.push({ name: 'Short Words', cards: selected });
  }

  // Category 2: Medium Words (6-8 letters)
  const mediumWords = cards.filter(c => c.term.length >= 6 && c.term.length <= 8 && !usedCards.has(c.id));
  if (mediumWords.length >= 5) {
    const selected = mediumWords.slice(0, cardsPerCategory);
    selected.forEach(c => usedCards.add(c.id));
    categories.push({ name: 'Medium Words', cards: selected });
  }

  // Category 3: Long Words (9+ letters)
  const longWords = cards.filter(c => c.term.length >= 9 && !usedCards.has(c.id));
  if (longWords.length >= 5) {
    const selected = longWords.slice(0, cardsPerCategory);
    selected.forEach(c => usedCards.add(c.id));
    categories.push({ name: 'Long Words', cards: selected });
  }

  // Category 4: Challenge Zone (longest definitions)
  const challengeWords = cards
    .filter(c => !usedCards.has(c.id))
    .sort((a, b) => b.definition.length - a.definition.length)
    .slice(0, cardsPerCategory);
  
  if (challengeWords.length >= 5) {
    challengeWords.forEach(c => usedCards.add(c.id));
    categories.push({ name: 'Challenge Zone', cards: challengeWords });
  }

  // Category 5: Mixed Bag (remaining words, shuffled)
  const remainingWords = cards.filter(c => !usedCards.has(c.id));
  if (remainingWords.length >= 5) {
    const shuffled = shuffleArray([...remainingWords]).slice(0, cardsPerCategory);
    shuffled.forEach(c => usedCards.add(c.id));
    categories.push({ name: 'Mixed Bag', cards: shuffled });
  }
  
  // If we still don't have 5 categories, create generic ones from remaining cards
  while (categories.length < 5 && cards.filter(c => !usedCards.has(c.id)).length >= 5) {
    const remaining = cards.filter(c => !usedCards.has(c.id));
    const categoryCards = remaining.slice(0, cardsPerCategory);
    categoryCards.forEach(c => usedCards.add(c.id));
    categories.push({ 
      name: `Category ${categories.length + 1}`, 
      cards: categoryCards 
    });
  }

  return categories;
}

/**
 * Create a Jeopardy board with 5 categories and 5 questions each
 */
export function createJeopardyBoard(cards: VocabCard[]): JeopardyBoard {
  const categories = generateJeopardyCategories(cards);
  
  // Create questions grid (5 categories × 5 questions)
  const questions: JeopardyQuestion[][] = [];
  const pointValues = [100, 200, 300, 400, 500];

  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    const category = categories[categoryIndex];
    const categoryQuestions: JeopardyQuestion[] = [];

    // Sort cards by difficulty (term length + definition length)
    const sortedCards = [...category.cards].sort((a, b) => {
      const difficultyA = a.term.length + a.definition.length;
      const difficultyB = b.term.length + b.definition.length;
      return difficultyA - difficultyB;
    });

    // Take up to 5 cards for this category
    for (let i = 0; i < Math.min(5, sortedCards.length); i++) {
      categoryQuestions.push({
        card: sortedCards[i],
        value: pointValues[i],
        categoryName: category.name,
        answered: false,
      });
    }

    questions.push(categoryQuestions);
  }

  return { categories, questions };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if an answer is correct (case-insensitive, trimmed)
 * Accepts the definition (Danish translation) and any synonyms as correct answers
 * If definition contains multiple words separated by commas/slashes/semicolons, any one is accepted
 */
export function checkJeopardyAnswer(
  userAnswer: string, 
  correctDefinition: string,
  synonyms?: string[]
): boolean {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const normalizedAnswer = normalize(userAnswer);
  const normalizedDefinition = normalize(correctDefinition);
  
  // First check if answer matches the complete definition
  if (normalizedAnswer === normalizedDefinition) {
    return true;
  }
  
  // Split definition by common separators (comma, slash, semicolon)
  // This handles cases like "opfatte, forstå, begribe" or "opfatte/forstå/begribe"
  const definitionParts = correctDefinition
    .split(/[,;\/]/)
    .map(part => normalize(part.trim()))
    .filter(part => part.length > 0);
  
  // Check if answer matches any part of the definition
  if (definitionParts.some(part => normalizedAnswer === part)) {
    return true;
  }
  
  // Check if answer matches any synonym (Danish synonyms)
  if (synonyms && synonyms.length > 0) {
    return synonyms.some(synonym => normalizedAnswer === normalize(synonym));
  }
  
  return false;
}

/**
 * Calculate score based on question value
 * Returns only the tile value (no time bonus)
 */
export function calculateJeopardyScore(
  questionValue: number,
  timeTaken: number,
  timeLimit: number
): number {
  // Return only the question value from the tile
  return questionValue;
}
