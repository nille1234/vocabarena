"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy, X as XIcon, Circle } from "lucide-react";
import { useGameStore } from "@/lib/store/gameStore";
import confetti from "canvas-confetti";

type CellState = "empty" | "X" | "O";

interface GridCell {
  row: number;
  col: number;
  state: CellState;
  word: string;
  translation: string;
}

interface TranslationPrompt {
  word: string;
  correctAnswer: string;
}

const BOARD_SIZE = 10;

export default function TicTacToeGamePage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useGameStore();

  const [board, setBoard] = useState<GridCell[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<TranslationPrompt | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [pendingMove, setPendingMove] = useState<{ row: number; col: number } | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<string[]>([]);

  useEffect(() => {
    if (session?.cards) {
      initializeBoard();
    }
  }, [session]);

  const initializeBoard = () => {
    if (!session?.cards) return;

    const newBoard: GridCell[][] = [];
    const shuffledWords = [...session.cards].sort(() => Math.random() - 0.5);

    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        const wordIndex = (row * BOARD_SIZE + col) % shuffledWords.length;
        const vocab = shuffledWords[wordIndex];
        newBoard[row][col] = {
          row,
          col,
          state: "empty",
          word: vocab.term,
          translation: vocab.definition,
        };
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setWinner(null);
    setWinningLine([]);
  };

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].state !== "empty" || showPrompt || gameOver) return;

    const cell = board[row][col];
    setCurrentPrompt({
      word: cell.word,
      correctAnswer: cell.translation.toLowerCase().trim(),
    });
    setPendingMove({ row, col });
    setShowPrompt(true);
    setUserAnswer("");
    setFeedback(null);
  };

  const handleSubmitAnswer = () => {
    if (!currentPrompt || !pendingMove) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentPrompt.correctAnswer;

    setFeedback(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      if (isCorrect) {
        makeMove(pendingMove.row, pendingMove.col);
      } else {
        // Turn passes to other player
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }

      setShowPrompt(false);
      setCurrentPrompt(null);
      setPendingMove(null);
      setUserAnswer("");
      setFeedback(null);
    }, 1500);
  };

  const makeMove = (row: number, col: number) => {
    const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
    newBoard[row][col].state = currentPlayer;
    setBoard(newBoard);

    // Check for win
    if (checkWin(newBoard, row, col, currentPlayer)) {
      setGameOver(true);
      setWinner(currentPlayer);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else if (checkDraw(newBoard)) {
      setGameOver(true);
      setWinner("draw");
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const checkWin = (
    board: GridCell[][],
    row: number,
    col: number,
    player: "X" | "O"
  ): boolean => {
    // Check all 4 directions: horizontal, vertical, diagonal-right, diagonal-left
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal right
      [1, -1],  // diagonal left
    ];

    for (const [dx, dy] of directions) {
      const line: string[] = [];
      let count = 1;

      // Check forward
      let r = row + dx;
      let c = col + dy;
      while (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c].state === player
      ) {
        line.push(`${r}-${c}`);
        count++;
        r += dx;
        c += dy;
      }

      // Check backward
      r = row - dx;
      c = col - dy;
      while (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c].state === player
      ) {
        line.unshift(`${r}-${c}`);
        count++;
        r -= dx;
        c -= dy;
      }

      if (count >= 5) {
        line.splice(Math.floor(line.length / 2), 0, `${row}-${col}`);
        setWinningLine(line);
        return true;
      }
    }

    return false;
  };

  const checkDraw = (board: GridCell[][]): boolean => {
    return board.every((row) => row.every((cell) => cell.state !== "empty"));
  };

  const handleNewGame = () => {
    initializeBoard();
    setCurrentPlayer("X");
    setShowPrompt(false);
    setCurrentPrompt(null);
    setPendingMove(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Five-in-a-Row
          </h1>
          <Button variant="outline" onClick={handleNewGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        {/* Player Display */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className={currentPlayer === "X" ? "border-primary" : ""}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XIcon className="h-6 w-6 text-primary" />
                  <p className="text-sm font-medium">Player X</p>
                </div>
                {currentPlayer === "X" && !gameOver && (
                  <p className="text-xs text-primary mt-1 font-bold">Current Turn</p>
                )}
              </CardContent>
            </Card>
            <Card className={currentPlayer === "O" ? "border-secondary" : ""}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Circle className="h-6 w-6 text-secondary" />
                  <p className="text-sm font-medium">Player O</p>
                </div>
                {currentPlayer === "O" && !gameOver && (
                  <p className="text-xs text-secondary mt-1 font-bold">Current Turn</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Board */}
        <div className="max-w-4xl mx-auto overflow-x-auto">
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
                        onClick={() => handleCellClick(rowIndex, colIndex)}
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
        </div>

        {/* Instructions */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Click a square to reveal a word. Translate it correctly to claim the square.
                Get 5 in a row (horizontal, vertical, or diagonal) to win!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Translation Prompt Modal */}
        <AnimatePresence>
          {showPrompt && currentPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-4 w-full"
              >
                <div className="space-y-4">
                  <h2 className="text-2xl font-heading font-bold text-center">
                    Translate to Danish
                  </h2>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-4">
                      {currentPrompt.word}
                    </p>
                  </div>
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                    placeholder="Type your answer..."
                    className="text-lg"
                    autoFocus
                    disabled={feedback !== null}
                  />
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center p-4 rounded-lg ${
                        feedback === "correct"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      <p className="font-bold">
                        {feedback === "correct" ? "✓ Correct!" : "✗ Incorrect"}
                      </p>
                      {feedback === "incorrect" && (
                        <p className="text-sm mt-1">
                          Correct answer: {currentPrompt.correctAnswer}
                        </p>
                      )}
                    </motion.div>
                  )}
                  {!feedback && (
                    <Button onClick={handleSubmitAnswer} className="w-full">
                      Check Answer
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-4"
              >
                <div className="text-center space-y-4">
                  <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
                  <h2 className="text-3xl font-heading font-bold">
                    {winner === "draw"
                      ? "It's a Draw!"
                      : `Player ${winner} Wins!`}
                  </h2>
                  <p className="text-muted-foreground">
                    {winner === "draw"
                      ? "The board is full with no winner!"
                      : `${winner} got 5 in a row!`}
                  </p>
                  <div className="flex gap-4 justify-center pt-4">
                    <Button onClick={handleNewGame}>Play Again</Button>
                    <Button variant="outline" onClick={() => router.back()}>
                      Exit
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
