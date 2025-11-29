"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { checkGameAccessClient } from "@/lib/supabase/gameAccess.client";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { generateMultipleChoiceOptions } from "@/lib/utils/wordClassifier";
import { OthelloBoard } from "@/components/game/othello/OthelloBoard";
import { OthelloScoreCard } from "@/components/game/othello/OthelloScoreCard";
import { OthelloPrompt } from "@/components/game/othello/OthelloPrompt";
import confetti from "canvas-confetti";

type CellState = "empty" | "black" | "white";
type BoardState = CellState[][];

interface TranslationPrompt {
  word: string;
  correctAnswer: string;
  choices?: string[];
}

export default function OthelloGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  
  const { vocabulary, loading: vocabLoading, error: vocabError } = useGameVocabulary();

  const [gameMode, setGameMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<BoardState>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"black" | "white">("black");
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<TranslationPrompt | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ row: number; col: number } | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [validMoves, setValidMoves] = useState<Set<string>>(new Set());

  // Fetch game mode setting from teacher
  useEffect(() => {
    async function fetchGameMode() {
      const result = await checkGameAccessClient(gameCode);
      console.log('Game access result:', result);
      console.log('Othello answer mode from API:', result.gameLink?.othelloAnswerMode);
      
      // Always set the game mode from the API result, or use default
      const mode = result.gameLink?.othelloAnswerMode || 'text-input';
      setGameMode(mode);
      console.log('Set game mode to:', mode);
      
      setLoading(false);
    }
    fetchGameMode();
  }, [gameCode]);

  useEffect(() => {
    if (!loading) {
      initializeBoard();
    }
  }, [loading]);

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

    if (vocabulary && vocabulary.length > 0) {
      const randomCard = vocabulary[Math.floor(Math.random() * vocabulary.length)];
      
      const parts = randomCard.term.split(/\s*–\s*/);
      
      let wordToTranslate = '';
      let acceptableAnswers = '';
      
      if (parts.length >= 2) {
        const englishPart = parts[0].trim();
        const englishWords = englishPart.split(/[,\s]+/);
        wordToTranslate = englishWords[0];
        acceptableAnswers = parts.slice(1).join(',').trim();
      } else {
        const termWords = randomCard.term.split(/\s+/);
        wordToTranslate = termWords[0];
        acceptableAnswers = termWords.slice(1).join(' ');
      }
      
      const allAnswers = [acceptableAnswers, randomCard.definition]
        .filter(s => s && s.trim().length > 0)
        .join(',');
      
      const prompt: TranslationPrompt = {
        word: wordToTranslate,
        correctAnswer: allAnswers.toLowerCase().trim(),
      };
      
      if (gameMode === "multiple-choice") {
        // Split by commas/semicolons to get complete translation phrases
        const translationOptions = allAnswers.split(/[,;]+/).map(s => s.trim()).filter(s => s.length > 0);
        const correctChoice = translationOptions[0]; // Use first complete phrase (e.g., "at spise" not just "at")
        
        // Get all possible Danish answers from all cards as complete phrases
        const allDanishPhrases = vocabulary.flatMap((card: any) => {
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
    }
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
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length > 0);
      const userAnswerLower = userAnswer.toLowerCase().trim();
      isCorrect = correctWords.some(word => userAnswerLower === word);
    }

    setFeedback(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      if (isCorrect) {
        makeMove(pendingMove.row, pendingMove.col);
      } else {
        setCurrentPlayer(currentPlayer === "black" ? "white" : "black");
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
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = currentPlayer;

    const opponent = currentPlayer === "black" ? "white" : "black";
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];

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

  if (loading || vocabLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (vocabError || !vocabulary || vocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{vocabError || 'No vocabulary found'}</p>
          <Button onClick={() => router.push(`/game/${gameCode}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game Selection
          </Button>
        </div>
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
            Othello Vocab Challenge
          </h1>
          <Button variant="outline" onClick={handleNewGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <OthelloScoreCard
              player="black"
              score={scores.black}
              isCurrentPlayer={currentPlayer === "black"}
              isGameOver={gameOver}
            />
            <OthelloScoreCard
              player="white"
              score={scores.white}
              isCurrentPlayer={currentPlayer === "white"}
              isGameOver={gameOver}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <OthelloBoard
            board={board}
            validMoves={validMoves}
            onCellClick={handleCellClick}
            showPrompt={showPrompt}
          />
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
