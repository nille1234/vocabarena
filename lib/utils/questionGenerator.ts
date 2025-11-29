import { VocabCard } from '@/types/game';
import { shuffleArray } from './gameLogic';
import { getFirstDefinition } from './definitionParser';

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
      getFirstDefinition(card.definition),
      ...distractors.map(d => getFirstDefinition(d.definition))
    ]);

    return {
      question: card.term,
      correctAnswer: getFirstDefinition(card.definition),
      options
    };
  } else {
    const options = shuffleArray([
      card.term,
      ...distractors.map(d => d.term)
    ]);

    return {
      question: getFirstDefinition(card.definition),
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
  // Check if this is a German card
  const isGerman = !!card.germanTerm;
  
  // German sentence templates
  const germanTemplates = [
    `Sie erlebte schwere ______ vor der Prüfung.`,
    `Der Patient zeigte Anzeichen von ______ während der Konsultation.`,
    `Nach Monaten von ______ suchte er endlich Hilfe.`,
    `Der Arzt diagnostizierte bei ihr ______.`,
    `Er kämpfte viele Jahre mit ______.`,
    `Die ______ beeinträchtigte ihr tägliches Leben.`,
    `Die Behandlung von ______ kann Zeit brauchen.`,
    `Sie lernte, mit ihrer ______ umzugehen.`,
  ];

  // English sentence templates
  const englishTemplates = [
    `She experienced severe ______ before the exam.`,
    `The patient showed signs of ______ during the consultation.`,
    `After months of ______, he finally sought help.`,
    `The doctor diagnosed her with ______.`,
    `He struggled with ______ for many years.`,
    `The ______ was affecting her daily life.`,
    `Treatment for ______ can take time.`,
    `She learned to cope with her ______.`,
  ];

  const templates = isGerman ? germanTemplates : englishTemplates;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const blankPosition = template.indexOf('______');

  // Use the appropriate term (German or English)
  const correctAnswer = isGerman ? card.germanTerm! : card.term;

  // Generate distractors from cards of the same language
  // For German cards: only use other German cards
  // For English cards: only use other English cards (cards WITHOUT germanTerm)
  const sameLanguageCards = allCards.filter(c => {
    if (c.id === card.id) return false;
    // If current card is German, only include other German cards
    if (isGerman) return !!c.germanTerm;
    // If current card is English, only include other English cards (no germanTerm)
    return !c.germanTerm;
  });
  
  const distractors = shuffleArray(sameLanguageCards).slice(0, 3);

  const options = shuffleArray([
    correctAnswer,
    ...distractors.map(d => isGerman ? d.germanTerm! : d.term)
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
