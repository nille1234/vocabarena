import { motion } from "framer-motion";
import { Circle } from "lucide-react";

type CellState = "empty" | "black" | "white";
type BoardState = CellState[][];

interface OthelloBoardProps {
  board: BoardState;
  validMoves: Set<string>;
  onCellClick: (row: number, col: number) => void;
  showPrompt: boolean;
}

export function OthelloBoard({ board, validMoves, onCellClick, showPrompt }: OthelloBoardProps) {
  return (
    <div className="bg-green-800/20 p-4 rounded-lg border-2 border-green-800/40">
      <div className="grid grid-cols-8 gap-1">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isValid = validMoves.has(`${rowIndex}-${colIndex}`);
            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                whileHover={isValid ? { scale: 1.05 } : {}}
                whileTap={isValid ? { scale: 0.95 } : {}}
              >
                <div
                  className={`
                    aspect-square bg-green-700/40 border border-green-800/60 rounded-sm
                    flex items-center justify-center cursor-pointer
                    ${isValid ? "hover:bg-green-600/40" : ""}
                  `}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                >
                  {cell !== "empty" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Circle
                        className={`h-8 w-8 md:h-10 md:w-10 ${
                          cell === "black"
                            ? "fill-black text-black"
                            : "fill-white text-white"
                        }`}
                      />
                    </motion.div>
                  )}
                  {isValid && cell === "empty" && (
                    <div className="h-2 w-2 rounded-full bg-yellow-400/50" />
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
