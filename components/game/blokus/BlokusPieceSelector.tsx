"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieceShape, getPieceById, rotatePiece, flipPiece } from "@/lib/utils/blokusHelpers";
import { RotateCw, FlipHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface BlokusPieceSelectorProps {
  availablePieces: string[];
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string) => void;
  currentPiece: PieceShape | null;
  onRotate: () => void;
  onFlip: () => void;
  player: 1 | 2;
}

export function BlokusPieceSelector({
  availablePieces,
  selectedPieceId,
  onSelectPiece,
  currentPiece,
  onRotate,
  onFlip,
  player,
}: BlokusPieceSelectorProps) {
  const playerColor = player === 1 ? 'bg-blue-500' : 'bg-red-500';
  const playerBorder = player === 1 ? 'border-blue-500' : 'border-red-500';

  const renderPiecePreview = (piece: PieceShape, isSelected: boolean) => {
    const maxRow = Math.max(...piece.cells.map(c => c.row));
    const maxCol = Math.max(...piece.cells.map(c => c.col));
    const gridSize = Math.max(maxRow, maxCol) + 1;
    const cellSize = gridSize <= 3 ? 8 : gridSize === 4 ? 6 : 5;

    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="grid gap-0.5 p-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
            const row = Math.floor(idx / gridSize);
            const col = idx % gridSize;
            const isFilled = piece.cells.some(c => c.row === row && c.col === col);

            return (
              <div
                key={idx}
                className={`rounded-sm ${
                  isFilled
                    ? isSelected
                      ? playerColor
                      : `${playerColor} opacity-70`
                    : 'bg-muted/30'
                }`}
              />
            );
          })}
        </div>
        <span className="text-[10px] text-muted-foreground">{piece.size}</span>
      </div>
    );
  };

  return (
    <Card className={`border-2 ${playerBorder}`}>
      <CardContent className="pt-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Your Pieces ({availablePieces.length})</h3>
            {currentPiece && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRotate}
                  className="h-7 w-7 p-0"
                  title="Rotate piece"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFlip}
                  className="h-7 w-7 p-0"
                  title="Flip piece"
                >
                  <FlipHorizontal className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-7 gap-2">
              {availablePieces.map((pieceId) => {
                const piece = getPieceById(pieceId);
                if (!piece) return null;

                const isSelected = selectedPieceId === pieceId;

                return (
                  <motion.button
                    key={pieceId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectPiece(pieceId)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? `${playerBorder} bg-primary/10`
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    {renderPiecePreview(piece, isSelected)}
                  </motion.button>
                );
              })}
            </div>
          </ScrollArea>

          {currentPiece && (
            <div className="text-center text-xs text-muted-foreground">
              Selected: {currentPiece.name} • Use rotate/flip buttons or click board to place
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
