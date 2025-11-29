import { motion } from "framer-motion";
import { X as XIcon, Circle } from "lucide-react";

type CellState = "empty" | "X" | "O";

interface GridCell {
  row: number;
  col: number;
  state: CellState;
  word: string;
  translation: string;
}

interface TicTacToeBoardProps {
  board: GridCell[][];
  winningLine: string[];
  gameOver: boolean;
  onCellClick: (row: number, col: number) => void;
}

const BOARD_SIZE = 10;

export function TicTacToeBoard({ board, winningLine, gameOver, onCellClick }: TicTacToeBoardProps) {
  return (
    <div className="inline-block min-w-full">
      <div className="grid grid-cols-10 gap-1 bg-border p-2 rounded-lg">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isWinning = winningLine.includes(`${rowIndex}-${colIndex}`);
            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                whileHover={cell.state === "empty" && !gameOver ? { scale: 1.05 } : {}}
                whileTap={cell.state === "empty" && !gameOver ? { scale: 0.95 } : {}}
              >
                <div
                  className={`
                    aspect-square bg-card border-2 rounded cursor-pointer
                    flex items-center justify-center
                    transition-all duration-200
                    ${cell.state === "empty" ? "hover:bg-muted" : ""}
                    ${isWinning ? "ring-4 ring-yellow-400 animate-pulse" : ""}
                    ${cell.state === "empty" ? "border-border" : ""}
                    ${cell.state === "X" ? "border-primary" : ""}
                    ${cell.state === "O" ? "border-secondary" : ""}
                  `}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                >
                  {cell.state === "X" && (
                    <XIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  )}
                  {cell.state === "O" && (
                    <Circle className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
