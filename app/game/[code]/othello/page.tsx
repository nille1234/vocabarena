"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy, Circle } from "lucide-react";
import { useGameStore } from "@/lib/store/gameStore";
import confetti from "canvas-confetti";

type CellState = "empty" | "black" | "white";
type BoardState = CellState[][];

interface TranslationPrompt {
  word: string;
  correctAnswer: string;
}

export default function OthelloGamePage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useGameStore();

  const [board, setBoard] = useState<BoardState>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"black" | "white">("black");
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<TranslationPrompt | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [pendingMove, setPendingMove] = useState<{ row: number; col: number } | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [validMoves, setValidMoves] = useState<Set<string>>(new Set());

  useEffect(() => {
    initializeBoard();
  }, []);

  useEffect(() => {
    if (board.length > 0) {
      updateValidMoves();
      updateScores();
      checkGameOver();
    }
  }, [board, currentPlayer]);

  const initializeBoard = () => {
    const newBoard: BoardState = Array(8)
      .fill(null)
      .map(() => Array(8).fill("empty"));

    // Set initial pieces
    newBoard[3][3] = "white";
    newBoard[3][4] = "black";
    newBoard[4][3] = "black";
    newBoard[4][4] = "white";

    setBoard(newBoard);
  };

  const updateValidMoves = () => {
    const moves = new Set<string>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(row, col, currentPlayer)) {
          moves.add(`${row}-${col}`);
        }
      }
    }
    setValidMoves(moves);
  };

  const isValidMove = (row: number, col: number, player: "black" | "white"): boolean => {
    if (board[row]?.[col] !== "empty") return false;

    const opponent = player === "black" ? "white" : "black";
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];

    for (const [dx, dy] of directions) {
      let r = row + dx;
      let c = col + dy;
      let hasOpponent = false;

      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board[r][c] === "empty") break;
        if (board[r][c] === opponent) {
          hasOpponent = true;
        } else if (board[r][c] === player && hasOpponent) {
          return true;
        } else {
          break;
        }
        r += dx;
        c += dy;
      }
    }

    return false;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!validMoves.has(`${row}-${col}`) || showPrompt) return;

    // Show translation prompt
    if (session?.cards && session.cards.length > 0) {
      const randomCard = session.cards[Math.floor(Math.random() * session.cards.length)];
      setCurrentPrompt({
        word: randomCard.term,
        correctAnswer: randomCard.definition.toLowerCase().trim(),
      });
      setPendingMove({ row, col });
      setShowPrompt(true);
      setUserAnswer("");
      setFeedback(null);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentPrompt || !pendingMove) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentPrompt.correctAnswer;

    setFeedback(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      if (isCorrect) {
        // Make the move
        makeMove(pendingMove.row, pendingMove.col);
      } else {
        // Skip turn
        setCurrentPlayer(currentPlayer === "black" ? "white" : "black");
      }

      setShowPrompt(false);
      setCurrentPrompt(null);
      setPendingMove(null);
      setUserAnswer("");
      setFeedback(null);
    }, 1500);
  };

  const makeMove = (row: number, col: number) => {
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = currentPlayer;

    const opponent = currentPlayer === "black" ? "white" : "black";
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];

    // Flip pieces
    for (const [dx, dy] of directions) {
      const toFlip: [number, number][] = [];
      let r = row + dx;
      let c = col + dy;

      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (newBoard[r][c] === "empty") break;
        if (newBoard[r][c] === opponent) {
          toFlip.push([r, c]);
        } else if (newBoard[r][c] === currentPlayer) {
          toFlip.forEach(([fr, fc]) => {
            newBoard[fr][fc] = currentPlayer;
          });
          break;
        } else {
          break;
        }
        r += dx;
        c += dy;
      }
    }

    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "black" ? "white" : "black");
  };

  const updateScores = () => {
    let blackCount = 0;
    let whiteCount = 0;

    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell === "black") blackCount++;
        if (cell === "white") whiteCount++;
      });
    });

    setScores({ black: blackCount, white: whiteCount });
  };

  const checkGameOver = () => {
    // Game is over if no valid moves for both players
    const hasBlackMoves = Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => isValidMove(r, c, "black"))
    ).flat().some(Boolean);

    const hasWhiteMoves = Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => isValidMove(r, c, "white"))
    ).flat().some(Boolean);

    if (!hasBlackMoves && !hasWhiteMoves) {
      setGameOver(true);
      if (scores.black > scores.white || scores.white > scores.black) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleNewGame = () => {
    initializeBoard();
    setCurrentPlayer("black");
    setGameOver(false);
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
            Othello Vocab Challenge
          </h1>
          <Button variant="outline" onClick={handleNewGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        {/* Score Display */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className={currentPlayer === "black" ? "border-primary" : ""}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Circle className="h-6 w-6 fill-black text-black" />
                  <p className="text-sm font-medium">Black</p>
                </div>
                <p className="text-3xl font-bold">{scores.black}</p>
                {currentPlayer === "black" && !gameOver && (
                  <p className="text-xs text-primary mt-1">Current Turn</p>
                )}
              </CardContent>
            </Card>
            <Card className={currentPlayer === "white" ? "border-secondary" : ""}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Circle className="h-6 w-6 fill-white text-white" />
                  <p className="text-sm font-medium">White</p>
                </div>
                <p className="text-3xl font-bold">{scores.white}</p>
                {currentPlayer === "white" && !gameOver && (
                  <p className="text-xs text-secondary mt-1">Current Turn</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Board */}
        <div className="max-w-2xl mx-auto">
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
                        onClick={() => handleCellClick(rowIndex, colIndex)}
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
                    {scores.black > scores.white
                      ? "Black Wins!"
                      : scores.white > scores.black
                      ? "White Wins!"
                      : "It's a Tie!"}
                  </h2>
                  <p className="text-muted-foreground">
                    Final Score: Black {scores.black} - White {scores.white}
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
