import { VocabCard } from '@/types/game';
import { getFirstDefinition } from './definitionParser';

export interface CrosswordCell {
  letter: string;
  number?: number;
  isStart: boolean;
}

export interface CrosswordWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
  cardId: string;
}

export interface CrosswordGrid {
  grid: (CrosswordCell | null)[][];
  words: CrosswordWord[];
  rows: number;
  cols: number;
}

interface PlacedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  cardId: string;
}

/**
 * Normalizes German characters for crossword display
 * ä -> A, ö -> O, ü -> U, ß -> SS
 */
function normalizeGermanWord(word: string): string {
  return word
    .replace(/ä/gi, 'A')
    .replace(/ö/gi, 'O')
    .replace(/ü/gi, 'U')
    .replace(/ß/g, 'SS');
}

/**
 * Generates a crossword puzzle from vocabulary cards
 */
export function generateCrossword(cards: VocabCard[], wordCount: number, language?: 'english' | 'german'): CrosswordGrid {
  // Filter cards based on language
  let availableCards = cards;
  if (language === 'german') {
    // For German crosswords, only use cards that have germanTerm
    availableCards = cards.filter(card => 
      card.germanTerm && 
      typeof card.germanTerm === 'string' && 
      card.germanTerm.trim().length > 0
    );
    
    // If no cards with germanTerm, fall back to using term field
    if (availableCards.length === 0) {
      console.warn('No cards with germanTerm found, falling back to term field');
      availableCards = cards;
    }
  }
  
  // Select random words
  const selectedCards = selectRandomCards(availableCards, wordCount);
  
  // Sort by length (longest first for better placement)
  const sortedCards = [...selectedCards].sort((a, b) => {
    let aWord: string, bWord: string;
    
    if (language === 'german') {
      aWord = (a.germanTerm && typeof a.germanTerm === 'string' && a.germanTerm.trim().length > 0)
        ? a.germanTerm.trim()
        : a.term.trim();
      bWord = (b.germanTerm && typeof b.germanTerm === 'string' && b.germanTerm.trim().length > 0)
        ? b.germanTerm.trim()
        : b.term.trim();
      // Convert ß to SS for length calculation
      aWord = aWord.replace(/ß/g, 'SS');
      bWord = bWord.replace(/ß/g, 'SS');
    } else {
      aWord = a.term.trim();
      bWord = b.term.trim();
    }
    
    return bWord.length - aWord.length;
  });
  
  // Try to generate crossword with multiple attempts
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = tryGenerateCrossword(sortedCards, attempt, language);
    if (result) {
      return result;
    }
  }
  
  // Fallback: create a simple list-style crossword
  return generateSimpleCrossword(sortedCards, language);
}

function selectRandomCards(cards: VocabCard[], count: number): VocabCard[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, cards.length));
}

function tryGenerateCrossword(cards: VocabCard[], seed: number, language?: 'english' | 'german'): CrosswordGrid | null {
  const placed: PlacedWord[] = [];
  const maxSize = 30;
  const grid: (string | null)[][] = Array(maxSize).fill(null).map(() => Array(maxSize).fill(null));
  
  // Helper function to get the word to use based on language
  const getWord = (card: VocabCard) => {
    let word: string;
    if (language === 'german') {
      word = (card.germanTerm && typeof card.germanTerm === 'string' && card.germanTerm.trim().length > 0)
        ? card.germanTerm.trim()
        : card.term.trim();
      // Convert ß to SS for crossword compatibility
      word = word.replace(/ß/g, 'SS').trim();
    } else {
      word = card.term.trim();
    }
    
    return word;
  };
  
  // Place first word horizontally in the middle
  const firstCard = cards[0];
  const firstWord = getWord(firstCard).toUpperCase();
  const startRow = Math.floor(maxSize / 2);
  const startCol = Math.floor((maxSize - firstWord.length) / 2);
  
  const trimmedFirstWord = firstWord.trim();
  placeWord(grid, trimmedFirstWord, startRow, startCol, 'across');
  placed.push({
    word: trimmedFirstWord,
    clue: generateClue(firstCard, language),
    row: startRow,
    col: startCol,
    direction: 'across',
    cardId: firstCard.id
  });
  
  // Try to place remaining words
  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];
    const word = getWord(card).toUpperCase().trim();
    const placement = findBestPlacement(grid, word, placed, seed + i);
    
    if (placement) {
      placeWord(grid, word, placement.row, placement.col, placement.direction);
      placed.push({
        word: word,
        clue: generateClue(card, language),
        row: placement.row,
        col: placement.col,
        direction: placement.direction,
        cardId: card.id
      });
    }
  }
  
  // Need at least 50% of words placed (lowered threshold to be more lenient)
  if (placed.length < Math.max(5, cards.length * 0.5)) {
    return null;
  }
  
  // Trim and convert to final format
  return trimAndConvert(grid, placed);
}

function findBestPlacement(
  grid: (string | null)[][],
  word: string,
  placed: PlacedWord[],
  seed: number
): { row: number; col: number; direction: 'across' | 'down' } | null {
  const intersections: { row: number; col: number; direction: 'across' | 'down'; score: number }[] = [];
  
  // Try to find intersections with existing words
  for (const placedWord of placed) {
    for (let i = 0; i < word.length; i++) {
      for (let j = 0; j < placedWord.word.length; j++) {
        if (word[i] === placedWord.word[j]) {
          // Try perpendicular placement
          const newDirection = placedWord.direction === 'across' ? 'down' : 'across';
          
          let newRow: number, newCol: number;
          if (newDirection === 'across') {
            newRow = placedWord.row + j;
            newCol = placedWord.col - i;
          } else {
            newRow = placedWord.row - i;
            newCol = placedWord.col + j;
          }
          
          if (canPlaceWord(grid, word, newRow, newCol, newDirection)) {
            intersections.push({
              row: newRow,
              col: newCol,
              direction: newDirection,
              score: 1 // Simple scoring
            });
          }
        }
      }
    }
  }
  
  if (intersections.length > 0) {
    // Use seed to make selection deterministic but varied
    const index = seed % intersections.length;
    return intersections[index];
  }
  
  return null;
}

function canPlaceWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down'
): boolean {
  const maxSize = grid.length;
  
  // Check bounds
  if (direction === 'across') {
    if (col < 0 || col + word.length > maxSize || row < 0 || row >= maxSize) {
      return false;
    }
    
    // Check space before and after
    if (col > 0 && grid[row][col - 1] !== null) return false;
    if (col + word.length < maxSize && grid[row][col + word.length] !== null) return false;
    
    // Check each position
    for (let i = 0; i < word.length; i++) {
      const cell = grid[row][col + i];
      if (cell !== null && cell !== word[i]) {
        return false;
      }
      // Check cells above and below (except at intersections)
      if (cell === null) {
        if (row > 0 && grid[row - 1][col + i] !== null) return false;
        if (row < maxSize - 1 && grid[row + 1][col + i] !== null) return false;
      }
    }
  } else {
    if (row < 0 || row + word.length > maxSize || col < 0 || col >= maxSize) {
      return false;
    }
    
    // Check space before and after
    if (row > 0 && grid[row - 1][col] !== null) return false;
    if (row + word.length < maxSize && grid[row + word.length][col] !== null) return false;
    
    // Check each position
    for (let i = 0; i < word.length; i++) {
      const cell = grid[row + i][col];
      if (cell !== null && cell !== word[i]) {
        return false;
      }
      // Check cells left and right (except at intersections)
      if (cell === null) {
        if (col > 0 && grid[row + i][col - 1] !== null) return false;
        if (col < maxSize - 1 && grid[row + i][col + 1] !== null) return false;
      }
    }
  }
  
  return true;
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down'
): void {
  for (let i = 0; i < word.length; i++) {
    if (direction === 'across') {
      grid[row][col + i] = word[i];
    } else {
      grid[row + i][col] = word[i];
    }
  }
}

function trimAndConvert(grid: (string | null)[][], placed: PlacedWord[]): CrosswordGrid {
  // Find bounds
  let minRow = grid.length, maxRow = 0, minCol = grid[0].length, maxCol = 0;
  
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }
  
  // Add padding
  minRow = Math.max(0, minRow - 1);
  minCol = Math.max(0, minCol - 1);
  maxRow = Math.min(grid.length - 1, maxRow + 1);
  maxCol = Math.min(grid[0].length - 1, maxCol + 1);
  
  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  
  // Create trimmed grid
  const trimmedGrid: (CrosswordCell | null)[][] = [];
  for (let r = minRow; r <= maxRow; r++) {
    const row: (CrosswordCell | null)[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      const letter = grid[r][c];
      row.push(letter ? { letter, isStart: false } : null);
    }
    trimmedGrid.push(row);
  }
  
  // Adjust placed word positions and assign numbers
  const adjustedWords: CrosswordWord[] = placed
    .map((p, index) => ({
      ...p,
      row: p.row - minRow,
      col: p.col - minCol,
      number: index + 1
    }))
    .sort((a, b) => {
      // Sort by row, then col, then direction (across before down)
      if (a.row !== b.row) return a.row - b.row;
      if (a.col !== b.col) return a.col - b.col;
      return a.direction === 'across' ? -1 : 1;
    });
  
  // Renumber based on sorted order
  adjustedWords.forEach((word, index) => {
    word.number = index + 1;
    // Mark start cell
    if (trimmedGrid[word.row][word.col]) {
      trimmedGrid[word.row][word.col]!.isStart = true;
      trimmedGrid[word.row][word.col]!.number = word.number;
    }
  });
  
  return {
    grid: trimmedGrid,
    words: adjustedWords,
    rows,
    cols
  };
}

function generateSimpleCrossword(cards: VocabCard[], language?: 'english' | 'german'): CrosswordGrid {
  // Helper function to get the word to use based on language
  const getWord = (card: VocabCard) => {
    let word: string;
    if (language === 'german') {
      word = (card.germanTerm && typeof card.germanTerm === 'string' && card.germanTerm.trim().length > 0)
        ? card.germanTerm.trim()
        : card.term.trim();
      // Convert ß to SS for crossword compatibility
      word = word.replace(/ß/g, 'SS').trim();
    } else {
      word = card.term.trim();
    }
    
    return word;
  };
  
  // Create a simple vertical list of words
  const maxLength = Math.max(...cards.map(c => getWord(c).length));
  const cols = maxLength + 2;
  const rows = cards.length * 2;
  
  const grid: (CrosswordCell | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const words: CrosswordWord[] = [];
  
  cards.forEach((card, index) => {
    const word = getWord(card).toUpperCase().trim();
    const row = index * 2;
    const col = 1;
    
    for (let i = 0; i < word.length; i++) {
      grid[row][col + i] = {
        letter: word[i],
        isStart: i === 0,
        number: i === 0 ? index + 1 : undefined
      };
    }
    
    words.push({
      word: word,
      clue: generateClue(card, language),
      row,
      col,
      direction: 'across',
      number: index + 1,
      cardId: card.id
    });
  });
  
  return { grid, words, rows, cols };
}

function generateClue(card: VocabCard, language?: 'english' | 'german'): string {
  // Guard clause: ensure card is defined
  if (!card) {
    return 'Fill in';
  }
  
  // Use only the first definition (before comma, semicolon, "or", etc.)
  if (card.definition && typeof card.definition === 'string' && card.definition.length > 0) {
    const firstDef = getFirstDefinition(card.definition);
    return firstDef.length > 50 
      ? firstDef.substring(0, 47) + '...'
      : firstDef;
  }
  
  // Fallback - with safe property access
  let word: string;
  
  if (language === 'german') {
    if (card.germanTerm && typeof card.germanTerm === 'string') {
      word = card.germanTerm.trim();
    } else if (card.term && typeof card.term === 'string') {
      word = card.term.trim();
    } else {
      word = 'xxx'; // fallback
    }
    // Convert ß to SS for length calculation
    word = word.replace(/ß/g, 'SS');
  } else {
    word = (card.term || 'xxx').trim();
  }
  
  const wordLength = word.length;
  return wordLength > 3 ? `${wordLength} letters` : 'Fill in';
}
