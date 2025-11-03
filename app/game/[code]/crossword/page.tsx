"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { useGameStore } from "@/lib/store/gameStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Sparkles } from "lucide-react";
import { getAudioManager } from "@/lib/utils/audioManager";
import { generateCrossword, CrosswordGrid, CrosswordWord } from "@/lib/utils/crosswordGenerator";
import confetti from "canvas-confetti";

export default function CrosswordPage() {
  const params = useParams();
  const router = useRouter();
  const { vocabulary: vocabData, loading, error } = useGameVocabulary();
  const { session } = useGameStore();

  const [crossword, setCrossword] = useState<CrosswordGrid | null>(null);
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const audioManager = getAudioManager();
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Get word count from settings or default to 10
  const wordCount = session?.settings?.crosswordWordCount || 10;
  
  // Get language from the game store's vocabulary list
  // The language is stored in the session when the game link is loaded
  const language = (session as any)?.vocabularyList?.language as 'english' | 'german' | undefined;

  // Initialize crossword on mount
  useEffect(() => {
    if (!vocabData?.length) {
      return;
    }

    console.log('Generating crossword with language:', language);
    const generated = generateCrossword(vocabData, wordCount, language);
    setCrossword(generated);
  }, [vocabData, wordCount, language]);

  // Handle cell input
  const handleCellInput = (row: number, col: number, value: string) => {
    if (!crossword) return;

    const key = `${row}-${col}`;
    const newAnswers = new Map(userAnswers);

    if (value === '') {
      newAnswers.delete(key);
    } else {
      const letter = value.slice(-1).toUpperCase();
      newAnswers.set(key, letter);
    }

    setUserAnswers(newAnswers);

    // Check all words for completion
    const newCompletedWords = new Set<number>();
    crossword.words.forEach(word => {
      if (checkWordWithAnswers(word, newAnswers)) {
        newCompletedWords.add(word.number);
        if (!completedWords.has(word.number)) {
          if (!isMuted) audioManager.playSuccess();
        }
      }
    });

    setCompletedWords(newCompletedWords);

    // Check if puzzle is complete
    if (newCompletedWords.size === crossword.words.length && !isComplete) {
      setIsComplete(true);
      if (!isMuted) audioManager.playCelebration();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Auto-advance to next cell
    if (value !== '') {
      moveToNextCell(row, col);
    }
  };

  const checkWordWithAnswers = (word: CrosswordWord, answers: Map<string, string>): boolean => {
    for (let i = 0; i < word.word.length; i++) {
      const key = word.direction === 'across'
        ? `${word.row}-${word.col + i}`
        : `${word.row + i}-${word.col}`;
      const userLetter = answers.get(key) || '';
      if (userLetter.toUpperCase() !== word.word[i]) {
        return false;
      }
    }
    return true;
  };

  const moveToNextCell = (row: number, col: number) => {
    if (!crossword || !selectedWord) return;

    const word = crossword.words.find(w => w.number === selectedWord);
    if (!word) return;

    let currentIndex = -1;
    for (let i = 0; i < word.word.length; i++) {
      const checkRow = word.direction === 'across' ? word.row : word.row + i;
      const checkCol = word.direction === 'across' ? word.col + i : word.col;
      if (checkRow === row && checkCol === col) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex >= 0 && currentIndex < word.word.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextRow = word.direction === 'across' ? word.row : word.row + nextIndex;
      const nextCol = word.direction === 'across' ? word.col + nextIndex : word.col;
      const nextKey = `${nextRow}-${nextCol}`;
      const nextInput = inputRefs.current.get(nextKey);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleWordClick = (wordNumber: number) => {
    setSelectedWord(wordNumber);
    const word = crossword?.words.find(w => w.number === wordNumber);
    if (word) {
      const key = `${word.row}-${word.col}`;
      const input = inputRefs.current.get(key);
      if (input) {
        input.focus();
      }
    }
  };

  const handleReset = () => {
    if (!vocabData) return;
    const generated = generateCrossword(vocabData, wordCount);
    setCrossword(generated);
    setUserAnswers(new Map());
    setCompletedWords(new Set());
    setSelectedWord(null);
    setIsComplete(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
        <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading crossword puzzle...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
        <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vocabData || vocabData.length === 0 || !crossword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
        <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Preparing crossword...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const acrossWords = crossword.words.filter(w => w.direction === 'across');
  const downWords = crossword.words.filter(w => w.direction === 'down');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/game/${params.code}`)}
            className="hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className="px-4 py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 backdrop-blur-sm text-base font-semibold"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {completedWords.size} / {crossword.words.length}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="hover:bg-white/10 backdrop-blur-sm"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMuted(!isMuted);
                audioManager.toggleMute();
              }}
              className="hover:bg-white/10 backdrop-blur-sm"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Crossword Puzzle
          </h1>
          <p className="text-muted-foreground text-lg">
            Fill in the grid using the clues
          </p>
        </div>

        {/* Completion Message */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="mb-6"
            >
              <Card className="border-none shadow-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      🎉 Amazing Work!
                    </p>
                  </motion.div>
                  <p className="text-muted-foreground text-lg">
                    You've completed the crossword puzzle!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Grid and Clues Side by Side */}
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-6 items-start">
          {/* Crossword Grid */}
          <div className="flex justify-center lg:justify-end">
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6">
              <div
                className="grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(${crossword.cols}, minmax(0, 1fr))`,
                }}
              >
                {crossword.grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    const isInSelectedWord = selectedWord !== null && crossword.words.some(w => {
                      if (w.number !== selectedWord) return false;
                      if (w.direction === 'across') {
                        return w.row === rowIndex && colIndex >= w.col && colIndex < w.col + w.word.length;
                      } else {
                        return w.col === colIndex && rowIndex >= w.row && rowIndex < w.row + w.word.length;
                      }
                    });

                    const wordForCell = crossword.words.find(w => {
                      if (w.direction === 'across') {
                        return w.row === rowIndex && colIndex >= w.col && colIndex < w.col + w.word.length;
                      } else {
                        return w.col === colIndex && rowIndex >= w.row && rowIndex < w.row + w.word.length;
                      }
                    });

                    const isCompleted = wordForCell && completedWords.has(wordForCell.number);

                    if (!cell) {
                      return (
                        <div
                          key={key}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800/50 dark:bg-gray-950/50"
                        />
                      );
                    }

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (rowIndex + colIndex) * 0.01 }}
                        className={`relative w-10 h-10 sm:w-12 sm:h-12 border-2 transition-all duration-200 ${
                          isInSelectedWord 
                            ? 'border-violet-500 bg-violet-100 dark:bg-violet-900/40 shadow-lg shadow-violet-500/20' 
                            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
                        } ${
                          isCompleted 
                            ? 'border-green-500 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 shadow-lg shadow-green-500/20' 
                            : ''
                        }`}
                      >
                        {cell.number && (
                          <span className="absolute top-0.5 left-1 text-[9px] font-bold text-violet-600 dark:text-violet-400 z-10">
                            {cell.number}
                          </span>
                        )}
                        <Input
                          ref={(el) => {
                            if (el) inputRefs.current.set(key, el);
                          }}
                          type="text"
                          maxLength={1}
                          value={userAnswers.get(key) || ''}
                          onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
                          className="w-full h-full text-center font-bold uppercase border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-900 dark:text-gray-100"
                          style={{ fontSize: '20px' }}
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Clues - Two Columns */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Across Clues */}
            <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <span className="text-2xl">→</span> Across
                </h3>
                <div className="space-y-0.5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {acrossWords.map((word) => (
                    <motion.button
                      key={word.number}
                      onClick={() => handleWordClick(word.number)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-1.5 rounded-md transition-all duration-200 ${
                        selectedWord === word.number
                          ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-2 border-violet-500/50 shadow-lg'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 border-2 border-transparent'
                      } ${
                        completedWords.has(word.number)
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-sm min-w-[1.5rem] text-violet-600 dark:text-violet-400">
                          {word.number}.
                        </span>
                        <span className="text-sm flex-1 leading-relaxed">{word.clue}</span>
                        {completedWords.has(word.number) && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500 text-lg"
                          >
                            ✓
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Down Clues */}
            <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
                  <span className="text-2xl">↓</span> Down
                </h3>
                <div className="space-y-0.5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {downWords.map((word) => (
                    <motion.button
                      key={word.number}
                      onClick={() => handleWordClick(word.number)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-1.5 rounded-md transition-all duration-200 ${
                        selectedWord === word.number
                          ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border-2 border-purple-500/50 shadow-lg'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 border-2 border-transparent'
                      } ${
                        completedWords.has(word.number)
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-sm min-w-[1.5rem] text-purple-600 dark:text-purple-400">
                          {word.number}.
                        </span>
                        <span className="text-sm flex-1 leading-relaxed">{word.clue}</span>
                        {completedWords.has(word.number) && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500 text-lg"
                          >
                            ✓
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
