"use client";

import React from "react";
import { Board, PieceShape, Position, isValidPlacement } from "@/lib/utils/blokusHelpers";
import { motion } from "framer-motion";

interface BlokusBoardProps {
  board: Board;
  selectedPiece: PieceShape | null;
  currentPlayer: 1 | 2;
  isFirstMove: boolean;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

export function BlokusBoard({
  board,
  selectedPiece,
  currentPlayer,
  isFirstMove,
  onCellClick,
  disabled,
}: BlokusBoardProps) {
  const [hoveredCell, setHoveredCell] = React.useState<Position | null>(null);

  // Check if placement at hovered position is valid
  const isValidHover = hoveredCell && selectedPiece
    ? isValidPlacement(board, selectedPiece, hoveredCell, currentPlayer, isFirstMove)
    : false;

  // Get cells that would be occupied by piece at hovered position
  const getPreviewCells = (): Position[] => {
    if (!hoveredCell || !selectedPiece) return [];
    return selectedPiece.cells.map(({ row, col }) => ({
      row: hoveredCell.row + row,
      col: hoveredCell.col + col,
    }));
  };

  const previewCells = getPreviewCells();

  const getCellColor = (row: number, col: number) => {
    const cellState = board[row][col];
    
    // Check if this cell is in preview
    const isPreview = previewCells.some(p => p.row === row && p.col === col);
    
    if (isPreview) {
      return isValidHover
        ? currentPlayer === 1
          ? 'bg-blue-400/50 border-blue-500'
          : 'bg-red-400/50 border-red-500'
        : 'bg-red-900/30 border-red-700';
    }
    
    if (cellState === 1) return 'bg-blue-500 border-blue-600';
    if (cellState === 2) return 'bg-red-500 border-red-600';
    
    // Show starting corners
    if ((row === 0 && col === 0) || (row === 19 && col === 19)) {
      return 'bg-muted/40 border-muted-foreground/20';
    }
    
    return 'bg-background border-muted-foreground/10';
  };

  return (
    <div className="inline-block p-2 bg-muted/30 rounded-lg">
      <div
        className="grid gap-[1px] bg-muted-foreground/20"
        style={{
          gridTemplateColumns: 'repeat(20, 1fr)',
          gridTemplateRows: 'repeat(20, 1fr)',
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              whileHover={{ scale: selectedPiece && !disabled ? 1.1 : 1 }}
              onClick={() => !disabled && onCellClick(rowIndex, colIndex)}
              onMouseEnter={() => !disabled && setHoveredCell({ row: rowIndex, col: colIndex })}
              onMouseLeave={() => setHoveredCell(null)}
              disabled={disabled || !selectedPiece}
              className={`w-5 h-5 border transition-colors ${getCellColor(rowIndex, colIndex)} ${
                !disabled && selectedPiece ? 'cursor-pointer' : 'cursor-default'
              }`}
              title={`${rowIndex}, ${colIndex}`}
            />
          ))
        )}
      </div>
      
      {/* Corner indicators */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Player 1 Start ↖</span>
        <span>Player 2 Start ↘</span>
      </div>
    </div>
  );
}
