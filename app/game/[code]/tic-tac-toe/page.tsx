"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { useGameStore } from "@/lib/store/gameStore";
import { checkGameAccessClient } from "@/lib/supabase/gameAccess.client";
import { generateMultipleChoiceOptions } from "@/lib/utils/wordClassifier";
import { TicTacToeBoard } from "@/components/game/tic-tac-toe/TicTacToeBoard";
import { TicTacToePlayerCard } from "@/components/game/tic-tac-toe/TicTacToePlayerCard";
import { OthelloPrompt } from "@/components/game/othello/OthelloPrompt";
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
  choices?: string[];
}

const BOARD_SIZE = 10;

export default function TicTacToeGamePage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useGameStore();
  const gameCode = params.code as string;

  const [gameMode, setGameMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<GridCell[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<TranslationPrompt | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ row: number; col: number } | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<string[]>([]);

  // Fetch game mode setting from teacher
  useEffect(() => {
    async function fetchGameMode() {
      const result = await checkGameAccessClient(gameCode);
      if (result.gameLink?.ticTacToeAnswerMode) {
        setGameMode(result.gameLink.ticTacToeAnswerMode);
      }
      setLoading(false);
    }
    fetchGameMode();
  }, [gameCode]);

  useEffect(() => {
    if (session?.cards && !loading) {
      initializeBoard();
    }
  }, [session, loading]);

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
    const parts = cell.word.split(/\s*–\s*/);
    
    let wordToTranslate = '';
    let acceptableAnswers = '';
    
    if (parts.length >= 2) {
      const englishPart = parts[0].trim();
      const englishWords = englishPart.split(/[,\s]+/);
      wordToTranslate = englishWords[0];
      acceptableAnswers = parts.slice(1).join(',').trim();
    } else {
      const termWords = cell.word.split(/\s+/);
      wordToTranslate = termWords[0];
      acceptableAnswers = termWords.slice(1).join(' ');
    }
    
    const allAnswers = [acceptableAnswers, cell.translation]
      .filter(s => s && s.trim().length > 0)
      .join(',');
    
    const prompt: TranslationPrompt = {
      word: wordToTranslate,
      correctAnswer: allAnswers.toLowerCase().trim(),
    };
    
    if (gameMode === "multiple-choice" && session?.cards) {
      // Split by commas/semicolons to get complete translation phrases
      const translationOptions = allAnswers.split(/[,;]+/).map(s => s.trim()).filter(s => s.length > 0);
      const correctChoice = translationOptions[0]; // Use first complete phrase (e.g., "at spise" not just "at")
      
      // Get all possible Danish answers from all cards as complete phrases
      const allDanishPhrases = session.cards.flatMap((card: any) => {
        const cardParts = card.term.split(/\s*–\s*/);
        if (cardParts.length >= 2) {
          const danishPart = cardParts.slice(1).join(',').trim();
          // Split by commas to get complete phrases, not individual words
          return danishPart.split(/[,;]+/).map((phrase: string) => phrase.trim()).filter((p: string) => p.length > 0);
        }
        const words = card.term.split(/\s+/);
        if (words.length > 1) {
          return [words.slice(1).join(' ')];
        }
        // Split definition by commas to get complete phrases
        return card.definition.split(/[,;]+/).map((phrase: string) => phrase.trim()).filter((p: string) => p.length > 0);
      });
      
      // Filter out the correct answer from wrong options pool
      const wrongOptions = allDanishPhrases.filter(phrase => 
        phrase.toLowerCase() !== correctChoice.toLowerCase()
      );
      
      // Generate 4 choices (1 correct + 3 wrong) using word classifier
      const allChoices = generateMultipleChoiceOptions(correctChoice, wrongOptions, 4);
      
      // Shuffle using Fisher-Yates to randomize position
      for (let i = allChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
      }
      
      prompt.choices = allChoices;
      // Store the correct choice for validation
      prompt.correctAnswer = correctChoice.toLowerCase().trim();
    }
    
    setCurrentPrompt(prompt);
    setPendingMove({ row, col });
    setShowPrompt(true);
    setUserAnswer("");
    setSelectedChoice(null);
    setFeedback(null);
  };

  const handleSubmitAnswer = () => {
    if (!currentPrompt || !pendingMove) return;

    let isCorrect = false;
    
    if (gameMode === "multiple-choice") {
      // In multiple-choice mode, only accept the exact displayed choice
      isCorrect = selectedChoice?.toLowerCase().trim() === currentPrompt.correctAnswer.toLowerCase().trim();
    } else {
      // In text-input mode, accept any of the correct variations
      const correctWords = currentPrompt.correctAnswer
        .split(/[\s,;]+/)
        .filter(word => word.length > 0)
        .map(word => word.toLowerCase());
      const userAnswerLower = userAnswer.toLowerCase().trim();
      isCorrect = correctWords.some(word => userAnswerLower === word);
    }

    setFeedback(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      if (isCorrect) {
        makeMove(pendingMove.row, pendingMove.col);
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }

      setShowPrompt(false);
      setCurrentPrompt(null);
      setPendingMove(null);
      setUserAnswer("");
      setSelectedChoice(null);
      setFeedback(null);
    }, 1500);
  };

  const makeMove = (row: number, col: number) => {
    const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
    newBoard[row][col].state = currentPlayer;
    setBoard(newBoard);

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
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal right
      [1, -1],  // diagonal left
    ];

    for (const [dx, dy] of directions) {
      const line: string[] = [];
      let count = 1;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
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

        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <TicTacToePlayerCard
              player="X"
              isCurrentPlayer={currentPlayer === "X"}
              gameOver={gameOver}
            />
            <TicTacToePlayerCard
              player="O"
              isCurrentPlayer={currentPlayer === "O"}
              gameOver={gameOver}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <TicTacToeBoard
            board={board}
            winningLine={winningLine}
            gameOver={gameOver}
            onCellClick={handleCellClick}
          />
        </div>

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

        <OthelloPrompt
          show={showPrompt}
          prompt={currentPrompt}
          gameMode={gameMode}
          userAnswer={userAnswer}
          selectedChoice={selectedChoice}
          feedback={feedback}
          onAnswerChange={setUserAnswer}
          onChoiceSelect={setSelectedChoice}
          onSubmit={handleSubmitAnswer}
        />

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
                      Back to Games
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
