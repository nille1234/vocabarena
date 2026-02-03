import { VocabCard } from "@/types/game";

export interface GapFillData {
  summary: string;
  gaps: Gap[];
  wordBank: string[];
}

export interface Gap {
  id: number;
  position: number; // character position in original text
  correctAnswer: string;
  filledAnswer?: string;
}

export interface GapFillProgress {
  gaps: Gap[];
  startTime: number;
  endTime?: number;
  score?: number;
}

/**
 * Generate a summary with gaps from vocabulary cards using AI
 */
export async function generateSummaryWithGapsAI(
  vocabulary: VocabCard[],
  gapCount: number,
  summaryLength: number
): Promise<GapFillData> {
  // Select vocabulary words to use based on gap count
  const selectedVocab = selectVocabularyForGaps(vocabulary, gapCount);
  
  try {
    // Call API to generate AI summary (language is auto-detected)
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vocabulary: selectedVocab.map(v => ({
          term: v.term,
          definition: v.definition,
          germanTerm: v.germanTerm,
        })),
        summaryLength,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI summary');
    }

    const { summary } = await response.json();
    
    // Identify gap positions
    const gaps = identifyGaps(summary, selectedVocab);
    
    // Create word bank (shuffled)
    const wordBank = shuffleArray(gaps.map(g => g.correctAnswer));
    
    return {
      summary,
      gaps,
      wordBank
    };
  } catch (error) {
    console.error('Error generating AI summary, falling back to simple generation:', error);
    // Fallback to simple generation
    return generateSummaryWithGaps(vocabulary, gapCount, summaryLength);
  }
}

/**
 * Generate a summary with gaps from vocabulary cards
 * This is a client-side fallback when AI generation fails.
 */
export function generateSummaryWithGaps(
  vocabulary: VocabCard[],
  gapCount: number,
  summaryLength: number
): GapFillData {
  // Select vocabulary words to use based on gap count
  const selectedVocab = selectVocabularyForGaps(vocabulary, gapCount);
  
  // Generate summary text incorporating the vocabulary
  const summary = generateSummaryText(selectedVocab, summaryLength);
  
  // Identify gap positions
  const gaps = identifyGaps(summary, selectedVocab);
  
  // Create word bank (shuffled)
  const wordBank = shuffleArray(gaps.map(g => g.correctAnswer));
  
  return {
    summary,
    gaps,
    wordBank
  };
}

/**
 * Select vocabulary words to use for gaps
 */
function selectVocabularyForGaps(
  vocabulary: VocabCard[],
  gapCount: number
): VocabCard[] {
  // Shuffle and take the requested number
  const shuffled = shuffleArray([...vocabulary]);
  return shuffled.slice(0, Math.min(gapCount, vocabulary.length));
}

/**
 * Generate summary text from vocabulary
 * This is a simple template-based approach for fallback
 */
function generateSummaryText(
  vocabulary: VocabCard[],
  targetLength: number
): string {
  const sentences: string[] = [];
  let currentLength = 0;
  
  for (const card of vocabulary) {
    // Create a sentence using the term and definition
    const sentence = `${card.term} refers to ${card.definition}.`;
    
    if (currentLength + sentence.split(' ').length > targetLength) {
      break;
    }
    
    sentences.push(sentence);
    currentLength += sentence.split(' ').length;
  }
  
  // Join sentences and add connecting words for flow
  return sentences.join(' ');
}

/**
 * Identify gap positions in the summary text
 */
function identifyGaps(summary: string, vocabulary: VocabCard[]): Gap[] {
  const gaps: Gap[] = [];
  let gapId = 1;
  
  for (const card of vocabulary) {
    // Find the term in the summary (case-insensitive)
    const regex = new RegExp(`\\b${escapeRegex(card.term)}\\b`, 'i');
    const match = summary.match(regex);
    
    if (match && match.index !== undefined) {
      gaps.push({
        id: gapId++,
        position: match.index,
        correctAnswer: card.term,
      });
    }
  }
  
  // Sort gaps by position
  return gaps.sort((a, b) => a.position - b.position);
}

/**
 * Replace vocabulary terms with gap placeholders
 */
export function createGappedText(summary: string, gaps: Gap[]): string {
  let gappedText = summary;
  
  // Sort gaps by position in reverse to maintain correct indices
  const sortedGaps = [...gaps].sort((a, b) => b.position - a.position);
  
  for (const gap of sortedGaps) {
    const before = gappedText.substring(0, gap.position);
    const after = gappedText.substring(gap.position + gap.correctAnswer.length);
    gappedText = before + `___${gap.id}___` + after;
  }
  
  return gappedText;
}

/**
 * Check if an answer is correct (case-insensitive, trimmed)
 */
export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

/**
 * Calculate score based on correct answers
 */
export function calculateScore(gaps: Gap[]): {
  correct: number;
  total: number;
  percentage: number;
  score: number;
} {
  const total = gaps.length;
  const correct = gaps.filter(g => 
    g.filledAnswer && checkAnswer(g.filledAnswer, g.correctAnswer)
  ).length;
  const percentage = Math.round((correct / total) * 100);
  const score = correct * 10; // 10 points per correct answer
  
  return { correct, total, percentage, score };
}

/**
 * Add time bonus to score
 */
export function calculateTimeBonus(timeElapsed: number, baseScore: number): number {
  // Bonus for completing quickly (max 50 bonus points)
  // Under 2 minutes = 50 points, scales down to 0 at 10 minutes
  const minutes = timeElapsed / 60;
  const bonus = Math.max(0, Math.round(50 * (1 - (minutes - 2) / 8)));
  return baseScore + bonus;
}

/**
 * Shuffle array utility
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
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Save progress to localStorage
 */
export function saveProgress(gameCode: string, progress: GapFillProgress): void {
  try {
    localStorage.setItem(
      `gap-fill-progress-${gameCode}`,
      JSON.stringify(progress)
    );
  } catch (error) {
    console.error('Failed to save gap-fill progress:', error);
  }
}

/**
 * Load progress from localStorage
 */
export function loadProgress(gameCode: string): GapFillProgress | null {
  try {
    const saved = localStorage.getItem(`gap-fill-progress-${gameCode}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load gap-fill progress:', error);
    return null;
  }
}

/**
 * Clear progress from localStorage
 */
export function clearProgress(gameCode: string): void {
  try {
    localStorage.removeItem(`gap-fill-progress-${gameCode}`);
  } catch (error) {
    console.error('Failed to clear gap-fill progress:', error);
  }
}
