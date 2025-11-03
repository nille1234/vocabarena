import { VocabCard } from '@/types/game';

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
 * Generates a crossword puzzle from vocabulary cards
 */
export function generateCrossword(cards: VocabCard[], wordCount: number, language?: 'english' | 'german'): CrosswordGrid {
  // Filter cards based on language
  let availableCards = cards;
  if (language === 'german') {
    // For German crosswords, only use cards that have germanTerm
    availableCards = cards.filter(card => card.germanTerm && card.germanTerm.trim().length > 0);
  }
  
  // Select random words
  const selectedCards = selectRandomCards(availableCards, wordCount);
  
  // Sort by length (longest first for better placement)
  // Use the appropriate field for length calculation
  const sortedCards = [...selectedCards].sort((a, b) => {
    const aLength = language === 'german' ? (a.germanTerm?.length || 0) : a.term.length;
    const bLength = language === 'german' ? (b.germanTerm?.length || 0) : b.term.length;
    return bLength - aLength;
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
    return language === 'german' ? (card.germanTerm || card.term) : card.term;
  };
  
  // Place first word horizontally in the middle
  const firstCard = cards[0];
  const firstWord = getWord(firstCard).toUpperCase();
  const startRow = Math.floor(maxSize / 2);
  const startCol = Math.floor((maxSize - firstWord.length) / 2);
  
  placeWord(grid, firstWord, startRow, startCol, 'across');
  placed.push({
    word: firstWord,
    clue: generateClue(firstCard, language),
    row: startRow,
    col: startCol,
    direction: 'across',
    cardId: firstCard.id
  });
  
  // Try to place remaining words
  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];
    const word = getWord(card).toUpperCase();
    const placement = findBestPlacement(grid, word, placed, seed + i);
    
    if (placement) {
      placeWord(grid, word, placement.row, placement.col, placement.direction);
      placed.push({
        word,
        clue: generateClue(card, language),
        row: placement.row,
        col: placement.col,
        direction: placement.direction,
        cardId: card.id
      });
    }
  }
  
  // Need at least 60% of words placed
  if (placed.length < cards.length * 0.6) {
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
    return language === 'german' ? (card.germanTerm || card.term) : card.term;
  };
  
  // Create a simple vertical list of words
  const maxLength = Math.max(...cards.map(c => getWord(c).length));
  const cols = maxLength + 2;
  const rows = cards.length * 2;
  
  const grid: (CrosswordCell | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const words: CrosswordWord[] = [];
  
  cards.forEach((card, index) => {
    const word = getWord(card).toUpperCase();
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
      word,
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
  // The clue should be in the same language as the answer
  // - If answer is in English (term), use English clue (definition)
  // - If answer is in German (germanTerm), use German clue (term, which is typically English explaining the German word)
  
  if (language === 'german') {
    // For German crosswords: answer is germanTerm, clue is term (English)
    if (card.term && card.term.length > 0) {
      return card.term.length > 50 
        ? card.term.substring(0, 47) + '...'
        : card.term;
    }
  } else {
    // For English crosswords: answer is term, clue is definition
    if (card.definition && card.definition.length > 0) {
      return card.definition.length > 50 
        ? card.definition.substring(0, 47) + '...'
        : card.definition;
    }
  }
  
  // Fallback
  const wordLength = language === 'german' ? (card.germanTerm?.length || card.term.length) : card.term.length;
  return wordLength > 3 ? `${wordLength} letters` : 'Fill in';
}
