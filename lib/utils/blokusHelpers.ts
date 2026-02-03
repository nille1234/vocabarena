// Blokus Game Logic and Helpers

export type CellState = null | 1 | 2; // null = empty, 1 = player 1, 2 = player 2
export type Board = CellState[][];
export type Position = { row: number; col: number };

// Piece shape definitions (relative coordinates from anchor point)
export interface PieceShape {
  id: string;
  name: string;
  cells: Position[];
  size: number; // number of squares
}

// All 21 Blokus pieces (polyominoes)
export const BLOKUS_PIECES: PieceShape[] = [
  // Monomino (1 square)
  { id: 'I1', name: 'Single', cells: [{ row: 0, col: 0 }], size: 1 },
  
  // Domino (2 squares)
  { id: 'I2', name: 'Domino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], size: 2 },
  
  // Trominoes (3 squares)
  { id: 'I3', name: 'I-Tromino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }], size: 3 },
  { id: 'V3', name: 'V-Tromino', cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }], size: 3 },
  
  // Tetrominoes (4 squares)
  { id: 'I4', name: 'I-Tetromino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }], size: 4 },
  { id: 'O4', name: 'O-Tetromino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }], size: 4 },
  { id: 'T4', name: 'T-Tetromino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }], size: 4 },
  { id: 'L4', name: 'L-Tetromino', cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }], size: 4 },
  { id: 'Z4', name: 'Z-Tetromino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }], size: 4 },
  
  // Pentominoes (5 squares)
  { id: 'F', name: 'F-Pentomino', cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 }], size: 5 },
  { id: 'I5', name: 'I-Pentomino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }], size: 5 },
  { id: 'L5', name: 'L-Pentomino', cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 3, col: 1 }], size: 5 },
  { id: 'N', name: 'N-Pentomino', cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 3, col: 0 }], size: 5 },
  { id: 'P', name: 'P-Pentomino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }], size: 5 },
  { id: 'T5', name: 'T-Pentomino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 1 }], size: 5 },
  { id: 'U', name: 'U-Pentomino', cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }], size: 5 },
  { id: 'V5', name: 'V-Pentomino', cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }], size: 5 },
  { id: 'W', name: 'W-Pentomino', cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 2, col: 2 }], size: 5 },
  { id: 'X', name: 'X-Pentomino', cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 }], size: 5 },
  { id: 'Y', name: 'Y-Pentomino', cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }], size: 5 },
  { id: 'Z5', name: 'Z-Pentomino', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 2, col: 2 }], size: 5 },
];

export interface PlayerPieces {
  available: string[]; // piece IDs
  used: string[];
}

export interface GameState {
  board: Board;
  player1Pieces: PlayerPieces;
  player2Pieces: PlayerPieces;
  currentPlayer: 1 | 2;
  firstMove: { player1: boolean; player2: boolean };
}

// Create empty 20x20 board
export function createEmptyBoard(): Board {
  return Array(20).fill(null).map(() => Array(20).fill(null));
}

// Initialize player pieces (all 21 pieces available)
export function initializePlayerPieces(): PlayerPieces {
  return {
    available: BLOKUS_PIECES.map(p => p.id),
    used: [],
  };
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    player1Pieces: initializePlayerPieces(),
    player2Pieces: initializePlayerPieces(),
    currentPlayer: 1,
    firstMove: { player1: true, player2: true },
  };
}

// Get piece by ID
export function getPieceById(pieceId: string): PieceShape | undefined {
  return BLOKUS_PIECES.find(p => p.id === pieceId);
}

// Rotate piece 90 degrees clockwise
export function rotatePiece(piece: PieceShape): PieceShape {
  const rotatedCells = piece.cells.map(({ row, col }) => ({
    row: col,
    col: -row,
  }));
  
  // Normalize to positive coordinates
  const minRow = Math.min(...rotatedCells.map(c => c.row));
  const minCol = Math.min(...rotatedCells.map(c => c.col));
  
  return {
    ...piece,
    cells: rotatedCells.map(({ row, col }) => ({
      row: row - minRow,
      col: col - minCol,
    })),
  };
}

// Flip piece horizontally
export function flipPiece(piece: PieceShape): PieceShape {
  const maxCol = Math.max(...piece.cells.map(c => c.col));
  return {
    ...piece,
    cells: piece.cells.map(({ row, col }) => ({
      row,
      col: maxCol - col,
    })),
  };
}

// Check if position is on board
function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < 20 && col >= 0 && col < 20;
}

// Get all cells occupied by piece at position
function getPieceCells(piece: PieceShape, position: Position): Position[] {
  return piece.cells.map(({ row, col }) => ({
    row: position.row + row,
    col: position.col + col,
  }));
}

// Check if piece placement is valid
export function isValidPlacement(
  board: Board,
  piece: PieceShape,
  position: Position,
  player: 1 | 2,
  isFirstMove: boolean
): boolean {
  const cells = getPieceCells(piece, position);
  
  // Check all cells are on board and empty
  for (const cell of cells) {
    if (!isOnBoard(cell.row, cell.col)) return false;
    if (board[cell.row][cell.col] !== null) return false;
  }
  
  // First move must touch a corner
  if (isFirstMove) {
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: 19 },
      { row: 19, col: 0 },
      { row: 19, col: 19 },
    ];
    
    // Player 1 starts at top-left (0,0), Player 2 at bottom-right (19,19)
    const requiredCorner = player === 1 ? corners[0] : corners[3];
    
    const touchesCorner = cells.some(
      cell => cell.row === requiredCorner.row && cell.col === requiredCorner.col
    );
    
    return touchesCorner;
  }
  
  // Subsequent moves: must touch corner of same color, not edge
  let touchesCorner = false;
  let touchesEdge = false;
  
  for (const cell of cells) {
    // Check adjacent cells (edges)
    const adjacent = [
      { row: cell.row - 1, col: cell.col },
      { row: cell.row + 1, col: cell.col },
      { row: cell.row, col: cell.col - 1 },
      { row: cell.row, col: cell.col + 1 },
    ];
    
    for (const adj of adjacent) {
      if (isOnBoard(adj.row, adj.col) && board[adj.row][adj.col] === player) {
        touchesEdge = true;
      }
    }
    
    // Check diagonal cells (corners)
    const diagonals = [
      { row: cell.row - 1, col: cell.col - 1 },
      { row: cell.row - 1, col: cell.col + 1 },
      { row: cell.row + 1, col: cell.col - 1 },
      { row: cell.row + 1, col: cell.col + 1 },
    ];
    
    for (const diag of diagonals) {
      if (isOnBoard(diag.row, diag.col) && board[diag.row][diag.col] === player) {
        touchesCorner = true;
      }
    }
  }
  
  return touchesCorner && !touchesEdge;
}

// Place piece on board
export function placePiece(
  board: Board,
  piece: PieceShape,
  position: Position,
  player: 1 | 2
): Board {
  const newBoard = board.map(row => [...row]);
  const cells = getPieceCells(piece, position);
  
  for (const cell of cells) {
    newBoard[cell.row][cell.col] = player;
  }
  
  return newBoard;
}

// Check if player has any valid moves
export function hasValidMoves(
  board: Board,
  availablePieces: string[],
  player: 1 | 2,
  isFirstMove: boolean
): boolean {
  for (const pieceId of availablePieces) {
    const piece = getPieceById(pieceId);
    if (!piece) continue;
    
    // Try all rotations and flips
    const variations = [
      piece,
      rotatePiece(piece),
      rotatePiece(rotatePiece(piece)),
      rotatePiece(rotatePiece(rotatePiece(piece))),
      flipPiece(piece),
      rotatePiece(flipPiece(piece)),
      rotatePiece(rotatePiece(flipPiece(piece))),
      rotatePiece(rotatePiece(rotatePiece(flipPiece(piece)))),
    ];
    
    // Try all positions on board
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        for (const variation of variations) {
          if (isValidPlacement(board, variation, { row, col }, player, isFirstMove)) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

// Calculate score (remaining squares)
export function calculateScore(pieces: PlayerPieces): number {
  let totalSquares = 0;
  for (const pieceId of pieces.available) {
    const piece = getPieceById(pieceId);
    if (piece) {
      totalSquares += piece.size;
    }
  }
  return totalSquares;
}

// Check game over condition
export function checkGameOver(gameState: GameState): {
  isOver: boolean;
  winner: 1 | 2 | 'draw' | null;
} {
  const player1HasMoves = hasValidMoves(
    gameState.board,
    gameState.player1Pieces.available,
    1,
    gameState.firstMove.player1
  );
  
  const player2HasMoves = hasValidMoves(
    gameState.board,
    gameState.player2Pieces.available,
    2,
    gameState.firstMove.player2
  );
  
  if (!player1HasMoves && !player2HasMoves) {
    const score1 = calculateScore(gameState.player1Pieces);
    const score2 = calculateScore(gameState.player2Pieces);
    
    return {
      isOver: true,
      winner: score1 < score2 ? 1 : score2 < score1 ? 2 : 'draw',
    };
  }
  
  return { isOver: false, winner: null };
}

// Get valid placements for a piece (for UI highlighting)
export function getValidPlacements(
  board: Board,
  piece: PieceShape,
  player: 1 | 2,
  isFirstMove: boolean
): Position[] {
  const validPositions: Position[] = [];
  
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
      if (isValidPlacement(board, piece, { row, col }, player, isFirstMove)) {
        validPositions.push({ row, col });
      }
    }
  }
  
  return validPositions;
}
