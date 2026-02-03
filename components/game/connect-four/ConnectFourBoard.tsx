"use client";

import { Board, ROWS, COLS } from '@/lib/utils/connectFourHelpers';
import { motion } from 'framer-motion';

interface ConnectFourBoardProps {
  board: Board;
  onColumnClick: (col: number) => void;
  validColumns: number[];
  disabled: boolean;
}

export function ConnectFourBoard({
  board,
  onColumnClick,
  validColumns,
  disabled
}: ConnectFourBoardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Board */}
      <div className="bg-blue-600 p-4 rounded-lg shadow-2xl">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
              >
                {/* Cell background (hole) */}
                <div className="absolute inset-0 bg-white rounded-full shadow-inner" />
                
                {/* Disc */}
                {cell !== 0 && (
                  <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`absolute inset-1 rounded-full shadow-lg ${
                      cell === 1
                        ? 'bg-gradient-to-br from-red-400 to-red-600'
                        : 'bg-gradient-to-br from-yellow-300 to-yellow-500'
                    }`}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column buttons */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: COLS }).map((_, col) => {
          const isValid = validColumns.includes(col);
          return (
            <button
              key={col}
              onClick={() => onColumnClick(col)}
              disabled={disabled || !isValid}
              className={`w-12 h-10 sm:w-14 sm:h-12 md:w-16 md:h-12 rounded-lg font-bold text-lg transition-all ${
                disabled || !isValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              ↓
            </button>
          );
        })}
      </div>
    </div>
  );
}
