"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type GridCell, type PlacedWord } from "@/lib/utils/wordSearchGenerator";
import { getWordColor } from "@/lib/utils/wordSearchColors";
import { motion } from "framer-motion";

interface WordFinderAnswerKeyProps {
  grid: GridCell[][];
  placedWords: PlacedWord[];
  gridSize: number;
}

export function WordFinderAnswerKey({ grid, placedWords, gridSize }: WordFinderAnswerKeyProps) {
  const getCellColor = (row: number, col: number): string => {
    // Find which word this cell belongs to
    for (let i = 0; i < placedWords.length; i++) {
      const word = placedWords[i];
      if (word.cells.some(c => c.row === row && c.col === col)) {
        return getWordColor(i);
      }
    }
    return '';
  };

  const cellSize = gridSize === 10 ? 'w-8 h-8 text-xs' : 
                   gridSize === 12 ? 'w-7 h-7 text-[10px]' : 
                   'w-6 h-6 text-[9px]';

  return (
    <div className="space-y-6">
      {/* Grid with All Words Highlighted */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Answer Key - All Words Highlighted</span>
            <Badge variant="secondary">{placedWords.length} words</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div
              className="grid gap-0.5 border-2 border-gray-300"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const cellColor = getCellColor(rowIndex, colIndex);
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        ${cellSize} flex items-center justify-center
                        font-bold border border-gray-200
                        ${cellColor ? `${cellColor} text-gray-900` : 'bg-gray-100 text-gray-600'}
                      `}
                    >
                      {cell.letter}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word List with Locations */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Word List with Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {placedWords.map((word, index) => {
              const colorClass = getWordColor(index);
              const directionLabel =
                word.direction === 'horizontal' ? '→ Horizontal' :
                word.direction === 'horizontal-reverse' ? '← Horizontal (Rev)' :
                word.direction === 'vertical' ? '↓ Vertical' :
                word.direction === 'vertical-reverse' ? '↑ Vertical (Rev)' :
                word.direction === 'diagonal-down' ? '↘ Diagonal Down' :
                word.direction === 'diagonal-down-reverse' ? '↖ Diagonal Down (Rev)' :
                word.direction === 'diagonal-up' ? '↗ Diagonal Up' :
                '↙ Diagonal Up (Rev)';

              return (
                <motion.div
                  key={word.word}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${colorClass} text-gray-900`}
                >
                  <div className="font-bold text-lg mb-1">{word.word}</div>
                  <div className="text-xs opacity-75">
                    {directionLabel}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    Start: ({word.startRow + 1}, {word.startCol + 1})
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
