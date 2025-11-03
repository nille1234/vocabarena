"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { useGameStore } from "@/lib/store/gameStore";
import confetti from "canvas-confetti";

type CellOwner = "empty" | "red" | "blue";

interface HexCell {
  row: number;
  col: number;
  owner: CellOwner;
}

interface TranslationPrompt {
  word: string;
  correctAnswer: string;
}

const BOARD_SIZE = 11;

export default function HexGamePage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useGameStore();

  const [board, setBoard] = useState<HexCell[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"red" | "blue">("red");
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<TranslationPrompt | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [pendingMove, setPendingMove] = useState<{ row: number; col: number } | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"red" | "blue" | null>(null);
  const [winningPath, setWinningPath] = useState<Set<string>>(new Set());
  const [wordDeck, setWordDeck] = useState<any[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    initializeBoard();
    initializeWordDeck();
  }, []);

  const initializeWordDeck = () => {
    if (session?.cards && session.cards.length > 0) {
      // Create a shuffled copy of all cards
      const shuffled = [...session.cards].sort(() => Math.random() - 0.5);
      setWordDeck(shuffled);
      setCurrentWordIndex(0);
    }
  };

  const initializeBoard = () => {
    const newBoard: HexCell[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        newBoard[row][col] = { row, col, owner: "empty" };
      }
    }
    setBoard(newBoard);
    setGameOver(false);
    setWinner(null);
    setWinningPath(new Set());
  };

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].owner !== "empty" || showPrompt || gameOver) return;

    // Show translation prompt using word deck system
    if (wordDeck.length > 0) {
      // Get the next word from the deck
      const currentCard = wordDeck[currentWordIndex];
      
      setCurrentPrompt({
        word: currentCard.term,
        correctAnswer: currentCard.definition.toLowerCase().trim(),
      });
      setPendingMove({ row, col });
      setShowPrompt(true);
      setUserAnswer("");
      setFeedback(null);
      
      // Move to next word, reshuffle if we've used all words
      const nextIndex = currentWordIndex + 1;
      if (nextIndex >= wordDeck.length) {
        // Reshuffle the deck when we've used all words
        const reshuffled = [...wordDeck].sort(() => Math.random() - 0.5);
        setWordDeck(reshuffled);
        setCurrentWordIndex(0);
      } else {
        setCurrentWordIndex(nextIndex);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentPrompt || !pendingMove) return;

    // Split by comma to handle multiple acceptable answers (synonyms)
    const acceptableAnswers = currentPrompt.correctAnswer
      .split(',')
      .map(answer => answer.toLowerCase().trim());
    const isCorrect = acceptableAnswers.includes(userAnswer.toLowerCase().trim());

    setFeedback(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      if (isCorrect) {
        // Make the move
        makeMove(pendingMove.row, pendingMove.col);
      } else {
        // Skip turn
        setCurrentPlayer(currentPlayer === "red" ? "blue" : "red");
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
    newBoard[row][col].owner = currentPlayer;
    setBoard(newBoard);

    // Check for win
    if (checkWin(newBoard, currentPlayer)) {
      setGameOver(true);
      setWinner(currentPlayer);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setCurrentPlayer(currentPlayer === "red" ? "blue" : "red");
    }
  };

  const checkWin = (board: HexCell[][], player: "red" | "blue"): boolean => {
    // Red connects top to bottom, Blue connects left to right
    const visited = new Set<string>();
    const path: string[] = [];

    if (player === "red") {
      // Check from top row
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[0][col].owner === player) {
          if (dfs(board, 0, col, player, visited, path, "vertical")) {
            setWinningPath(new Set(path));
            return true;
          }
        }
      }
    } else {
      // Check from left column
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (board[row][0].owner === player) {
          if (dfs(board, row, 0, player, visited, path, "horizontal")) {
            setWinningPath(new Set(path));
            return true;
          }
        }
      }
    }

    return false;
  };

  const dfs = (
    board: HexCell[][],
    row: number,
    col: number,
    player: "red" | "blue",
    visited: Set<string>,
    path: string[],
    direction: "vertical" | "horizontal"
  ): boolean => {
    const key = `${row}-${col}`;
    if (visited.has(key)) return false;

    visited.add(key);
    path.push(key);

    // Check if reached the goal
    if (direction === "vertical" && row === BOARD_SIZE - 1) return true;
    if (direction === "horizontal" && col === BOARD_SIZE - 1) return true;

    // Check all 6 neighbors in hex grid
    const neighbors = [
      [row - 1, col],
      [row - 1, col + 1],
      [row, col - 1],
      [row, col + 1],
      [row + 1, col - 1],
      [row + 1, col],
    ];

    for (const [r, c] of neighbors) {
      if (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c].owner === player
      ) {
        if (dfs(board, r, c, player, visited, path, direction)) {
          return true;
        }
      }
    }

    path.pop();
    return false;
  };

  const handleNewGame = () => {
    initializeBoard();
    initializeWordDeck(); // Reset and reshuffle the word deck
    setCurrentPlayer("red");
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
            Urban Life Hex
          </h1>
          <Button variant="outline" onClick={handleNewGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        {/* Player Display */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className={currentPlayer === "red" ? "border-red-500" : ""}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-6 w-6 bg-red-500 rounded-full" />
                  <p className="text-sm font-medium">Team Red</p>
                </div>
                <p className="text-xs text-muted-foreground">Subway Surfers</p>
                <p className="text-xs text-muted-foreground mt-1">Connect Top ↔ Bottom</p>
                {currentPlayer === "red" && !gameOver && (
                  <p className="text-xs text-red-500 mt-2 font-bold">Current Turn</p>
                )}
              </CardContent>
            </Card>
            <Card className={currentPlayer === "blue" ? "border-blue-500" : ""}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-6 w-6 bg-blue-500 rounded-full" />
                  <p className="text-sm font-medium">Team Blue</p>
                </div>
                <p className="text-xs text-muted-foreground">Skyline Dreamers</p>
                <p className="text-xs text-muted-foreground mt-1">Connect Left ↔ Right</p>
                {currentPlayer === "blue" && !gameOver && (
                  <p className="text-xs text-blue-500 mt-2 font-bold">Current Turn</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Board */}
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <div className="inline-block min-w-full">
            {board.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex justify-center"
                style={{ marginLeft: `${rowIndex * 15}px` }}
              >
                {row.map((cell, colIndex) => {
                  const isWinning = winningPath.has(`${rowIndex}-${colIndex}`);
                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      whileHover={cell.owner === "empty" && !gameOver ? { scale: 1.1 } : {}}
                      whileTap={cell.owner === "empty" && !gameOver ? { scale: 0.9 } : {}}
                      className="m-0.5"
                    >
                      <div
                        className={`
                          w-8 h-8 md:w-10 md:h-10 cursor-pointer
                          flex items-center justify-center
                          transition-all duration-200
                          ${
                            cell.owner === "empty"
                              ? "bg-gray-700/40 hover:bg-gray-600/60"
                              : cell.owner === "red"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }
                          ${isWinning ? "ring-4 ring-yellow-400 animate-pulse" : ""}
                        `}
                        style={{
                          clipPath:
                            "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
                        }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500" />
                  <span>Red: Connect top to bottom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500" />
                  <span>Blue: Connect left to right</span>
                </div>
              </div>
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
          {gameOver && winner && (
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
                    {winner === "red" ? "Team Red Wins!" : "Team Blue Wins!"}
                  </h2>
                  <p className="text-muted-foreground">
                    {winner === "red"
                      ? "Subway Surfers connected top to bottom!"
                      : "Skyline Dreamers connected left to right!"}
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
