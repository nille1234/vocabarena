export type Direction = 
  | 'horizontal' 
  | 'vertical' 
  | 'diagonal-down' 
  | 'diagonal-up'
  | 'horizontal-reverse' 
  | 'vertical-reverse' 
  | 'diagonal-down-reverse' 
  | 'diagonal-up-reverse';

export interface GridCell {
  letter: string;
  row: number;
  col: number;
  isPartOfWord: boolean;
  wordId?: string;
  isFound: boolean;
  isSelected?: boolean;
}

export type WordSearchGrid = GridCell[][];

export interface PlacedWord {
  word: string;
  translation: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: Direction;
  cells: { row: number; col: number }[];
}

/**
 * Generates a word search grid with the given words
 * @param words - Array of vocabulary items with word and translation
 * @param size - Grid size (default 10x10)
 * @param language - Language for filler letters ('german' or 'english')
 * @returns Grid and placed words information
 */
export function generateWordSearchGrid(
  words: Array<{ word: string; translation: string }>,
  size: number = 10,
  language: 'german' | 'english' = 'english'
): { grid: WordSearchGrid; placedWords: PlacedWord[] } {
  // Initialize empty grid
  const grid: WordSearchGrid = Array(size).fill(null).map((_, row) =>
    Array(size).fill(null).map((_, col) => ({
      letter: '',
      row,
      col,
      isPartOfWord: false,
      isFound: false,
      isSelected: false,
    }))
  );

  const placedWords: PlacedWord[] = [];
  const directions: Direction[] = [
    'horizontal',
    'vertical',
    'diagonal-down',
    'diagonal-up',
    'horizontal-reverse',
    'vertical-reverse',
    'diagonal-down-reverse',
    'diagonal-up-reverse',
  ];

  // Sort words by length (longest first) for better placement
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

  // Try to place each word
  for (const vocabItem of sortedWords) {
    const word = vocabItem.word.toUpperCase();
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const result = tryPlaceWord(grid, word, vocabItem.translation, direction, size);
      
      if (result) {
        placedWords.push(result);
        placed = true;
      }
      attempts++;
    }
  }

  // Fill empty cells with random letters
  fillEmptyCells(grid, language);

  return { grid, placedWords };
}

/**
 * Tries to place a word in the grid in a specific direction
 */
function tryPlaceWord(
  grid: WordSearchGrid,
  word: string,
  translation: string,
  direction: Direction,
  size: number
): PlacedWord | null {
  const wordLength = word.length;
  
  // Get direction deltas
  const deltas = getDirectionDeltas(direction);
  if (!deltas) return null;

  const { rowDelta, colDelta } = deltas;

  // Calculate valid starting positions
  const maxRow = rowDelta >= 0 ? size - (wordLength * Math.abs(rowDelta)) : (wordLength - 1) * Math.abs(rowDelta);
  const maxCol = colDelta >= 0 ? size - (wordLength * Math.abs(colDelta)) : (wordLength - 1) * Math.abs(colDelta);

  if (maxRow < 0 || maxCol < 0) return null;

  // Try random starting positions
  const startRow = Math.floor(Math.random() * (maxRow + 1));
  const startCol = Math.floor(Math.random() * (maxCol + 1));

  // Check if word can be placed
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < wordLength; i++) {
    const row = startRow + i * rowDelta;
    const col = startCol + i * colDelta;

    if (row < 0 || row >= size || col < 0 || col >= size) {
      return null;
    }

    const cell = grid[row][col];
    // Cell must be empty or contain the same letter
    if (cell.letter !== '' && cell.letter !== word[i]) {
      return null;
    }

    cells.push({ row, col });
  }

  // Place the word
  const wordId = `word-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < wordLength; i++) {
    const { row, col } = cells[i];
    grid[row][col].letter = word[i];
    grid[row][col].isPartOfWord = true;
    grid[row][col].wordId = wordId;
  }

  return {
    word,
    translation,
    startRow,
    startCol,
    endRow: cells[cells.length - 1].row,
    endCol: cells[cells.length - 1].col,
    direction,
    cells,
  };
}

/**
 * Gets row and column deltas for a direction
 */
function getDirectionDeltas(direction: Direction): { rowDelta: number; colDelta: number } | null {
  switch (direction) {
    case 'horizontal':
      return { rowDelta: 0, colDelta: 1 };
    case 'horizontal-reverse':
      return { rowDelta: 0, colDelta: -1 };
    case 'vertical':
      return { rowDelta: 1, colDelta: 0 };
    case 'vertical-reverse':
      return { rowDelta: -1, colDelta: 0 };
    case 'diagonal-down':
      return { rowDelta: 1, colDelta: 1 };
    case 'diagonal-down-reverse':
      return { rowDelta: -1, colDelta: -1 };
    case 'diagonal-up':
      return { rowDelta: -1, colDelta: 1 };
    case 'diagonal-up-reverse':
      return { rowDelta: 1, colDelta: -1 };
    default:
      return null;
  }
}

/**
 * Fills empty cells with random letters based on language
 */
function fillEmptyCells(grid: WordSearchGrid, language: 'german' | 'english' = 'english'): void {
  // Use appropriate letter set based on language
  const letters = language === 'german' 
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ' // German letters including umlauts
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';    // English letters only
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].letter === '') {
        grid[row][col].letter = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

/**
 * Checks if a selection matches any word in the placed words
 */
export function checkWordMatch(
  selectedCells: { row: number; col: number }[],
  placedWords: PlacedWord[]
): PlacedWord | null {
  if (selectedCells.length === 0) return null;

  for (const placedWord of placedWords) {
    // Check forward match
    if (cellsMatch(selectedCells, placedWord.cells)) {
      return placedWord;
    }
    
    // Check reverse match
    const reversedCells = [...placedWord.cells].reverse();
    if (cellsMatch(selectedCells, reversedCells)) {
      return placedWord;
    }
  }

  return null;
}

/**
 * Checks if two cell arrays match
 */
function cellsMatch(
  cells1: { row: number; col: number }[],
  cells2: { row: number; col: number }[]
): boolean {
  if (cells1.length !== cells2.length) return false;

  return cells1.every((cell, index) => 
    cell.row === cells2[index].row && cell.col === cells2[index].col
  );
}
