import { VocabCard } from '@/types/game';
import { shuffleArray } from './gameLogic';

/**
 * Generate a multiple choice question with distractors
 */
export function generateMultipleChoice(
  card: VocabCard,
  allCards: VocabCard[],
  questionType: 'term-to-def' | 'def-to-term' = 'term-to-def'
): {
  question: string;
  correctAnswer: string;
  options: string[];
} {
  const otherCards = allCards.filter(c => c.id !== card.id);
  const distractors = shuffleArray(otherCards).slice(0, 3);

  if (questionType === 'term-to-def') {
    const options = shuffleArray([
      card.definition,
      ...distractors.map(d => d.definition)
    ]);

    return {
      question: card.term,
      correctAnswer: card.definition,
      options
    };
  } else {
    const options = shuffleArray([
      card.term,
      ...distractors.map(d => d.term)
    ]);

    return {
      question: card.definition,
      correctAnswer: card.term,
      options
    };
  }
}

/**
 * Generate a fill-in-the-blank sentence
 */
export function generateFillInBlank(
  card: VocabCard,
  allCards: VocabCard[]
): {
  sentence: string;
  correctAnswer: string;
  options: string[];
  blankPosition: number;
} {
  // Contextual sentence templates using the Danish word
  const sentenceTemplates = [
    { template: `She experienced severe ______ before the exam.`, type: 'definition' as const },
    { template: `The patient showed signs of ______ during the consultation.`, type: 'definition' as const },
    { template: `After months of ______, he finally sought help.`, type: 'definition' as const },
    { template: `The doctor diagnosed her with ______.`, type: 'definition' as const },
    { template: `He struggled with ______ for many years.`, type: 'definition' as const },
    { template: `The ______ was affecting her daily life.`, type: 'definition' as const },
    { template: `Treatment for ______ can take time.`, type: 'definition' as const },
    { template: `She learned to cope with her ______.`, type: 'definition' as const },
  ];

  const selectedTemplate = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
  const template = selectedTemplate.template;
  const blankPosition = template.indexOf('_____');

  // Use Danish definition as the answer
  const correctAnswer = card.definition;
  const questionType = 'definition';

  // Generate distractors
  const otherCards = allCards.filter(c => c.id !== card.id);
  const distractors = shuffleArray(otherCards).slice(0, 3);

  const options = shuffleArray([
    correctAnswer,
    ...distractors.map(d => d.definition)
  ]);

  return {
    sentence: template,
    correctAnswer,
    options,
    blankPosition
  };
}

/**
 * Generate a random question type
 */
export function generateRandomQuestion(
  card: VocabCard,
  allCards: VocabCard[]
): {
  type: 'multiple-choice' | 'fill-blank';
  question: string;
  correctAnswer: string;
  options: string[];
  sentence?: string;
} {
  const questionTypes: ('multiple-choice' | 'fill-blank')[] = ['multiple-choice', 'fill-blank'];
  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  if (type === 'fill-blank') {
    const fillBlank = generateFillInBlank(card, allCards);
    return {
      type: 'fill-blank',
      question: fillBlank.sentence.replace('_____', '______'),
      correctAnswer: fillBlank.correctAnswer,
      options: fillBlank.options,
      sentence: fillBlank.sentence
    };
  } else {
    const questionType = Math.random() > 0.5 ? 'term-to-def' : 'def-to-term';
    const mc = generateMultipleChoice(card, allCards, questionType);
    return {
      type: 'multiple-choice',
      question: mc.question,
      correctAnswer: mc.correctAnswer,
      options: mc.options
    };
  }
}

/**
 * Get a hint for a word (first letter + length)
 */
export function getHint(word: string): string {
  if (word.length <= 2) return word[0];
  return `${word[0]}${'_'.repeat(word.length - 1)}`;
}

/**
 * Check if a letter is in a word
 */
export function checkLetter(word: string, letter: string): boolean {
  return word.toLowerCase().includes(letter.toLowerCase());
}

/**
 * Get revealed word with guessed letters
 */
export function getRevealedWord(word: string, guessedLetters: string[]): string {
  return word
    .split('')
    .map(char => {
      if (char === ' ' || char === '-') return char;
      return guessedLetters.includes(char.toLowerCase()) ? char : '_';
    })
    .join('');
}

/**
 * Generate maze path (simple grid-based)
 */
export function generateMazePath(gridSize: number = 8): {
  path: { x: number; y: number }[];
  checkpoints: number[];
} {
  const path: { x: number; y: number }[] = [];
  let x = 0;
  let y = 0;

  path.push({ x, y });

  // Generate a simple path to the end
  while (x < gridSize - 1 || y < gridSize - 1) {
    if (x < gridSize - 1 && (y === gridSize - 1 || Math.random() > 0.5)) {
      x++;
    } else if (y < gridSize - 1) {
      y++;
    }
    path.push({ x, y });
  }

  // Select checkpoint positions (every ~5 steps)
  const checkpoints: number[] = [];
  for (let i = 5; i < path.length; i += 5) {
    checkpoints.push(i);
  }

  return { path, checkpoints };
}
