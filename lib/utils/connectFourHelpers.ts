// Connect Four game logic helpers

export const ROWS = 6;
export const COLS = 7;
export const CONNECT = 4;

export type CellValue = 0 | 1 | 2; // 0 = empty, 1 = Player 1, 2 = Player 2
export type Board = CellValue[][];

/**
 * Creates an empty Connect Four board
 */
export function createEmptyBoard(): Board {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

/**
 * Checks if a column is full
 */
export function isColumnFull(board: Board, col: number): boolean {
  return board[0][col] !== 0;
}

/**
 * Gets the row where a disc would land in a column (lowest empty row)
 * Returns -1 if column is full
 */
export function getDropRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      return row;
    }
  }
  return -1;
}

/**
 * Drops a disc into a column
 * Returns the new board and the row where the disc landed, or null if invalid
 */
export function dropDisc(
  board: Board,
  col: number,
  player: 1 | 2
): { board: Board; row: number } | null {
  const row = getDropRow(board, col);
  if (row === -1) return null;

  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = player;
  return { board: newBoard, row };
}

/**
 * Checks if there's a winner starting from a specific position
 * Returns the winning player (1 or 2) or null if no winner
 */
export function checkWinFromPosition(
  board: Board,
  row: number,
  col: number
): 1 | 2 | null {
  const player = board[row][col];
  if (player === 0) return null;

  // Check all 4 directions: horizontal, vertical, diagonal-right, diagonal-left
  const directions = [
    { dr: 0, dc: 1 },  // Horizontal
    { dr: 1, dc: 0 },  // Vertical
    { dr: 1, dc: 1 },  // Diagonal down-right
    { dr: 1, dc: -1 }, // Diagonal down-left
  ];

  for (const { dr, dc } of directions) {
    let count = 1; // Count the current position

    // Count in positive direction
    for (let i = 1; i < CONNECT; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) {
        break;
      }
      count++;
    }

    // Count in negative direction
    for (let i = 1; i < CONNECT; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) {
        break;
      }
      count++;
    }

    if (count >= CONNECT) {
      return player as 1 | 2;
    }
  }

  return null;
}

/**
 * Checks if the board is full (draw condition)
 */
export function isBoardFull(board: Board): boolean {
  return board[0].every(cell => cell !== 0);
}

/**
 * Gets all valid (non-full) columns
 */
export function getValidColumns(board: Board): number[] {
  const validCols: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (!isColumnFull(board, col)) {
      validCols.push(col);
    }
  }
  return validCols;
}

/**
 * Checks the game status after a move
 */
export function checkGameStatus(
  board: Board,
  lastRow: number,
  lastCol: number
): 'player1-wins' | 'player2-wins' | 'draw' | 'ongoing' {
  const winner = checkWinFromPosition(board, lastRow, lastCol);
  
  if (winner === 1) return 'player1-wins';
  if (winner === 2) return 'player2-wins';
  if (isBoardFull(board)) return 'draw';
  
  return 'ongoing';
}
