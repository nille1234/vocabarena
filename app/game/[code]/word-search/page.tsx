'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { GameEndScreen } from '@/components/game/GameEndScreen';
import { GameAccessGuard } from '@/components/game/GameAccessGuard';
import { useGameVocabulary } from '@/hooks/use-game-vocabulary';
import { useGameStore } from '@/lib/store/gameStore';
import { generateWordSearchGrid, checkWordMatch, type GridCell, type PlacedWord } from '@/lib/utils/wordSearchGenerator';
import { getAudioManager } from '@/lib/utils/audioManager';
import { translations } from '@/lib/i18n/translations';
import { getWordColor } from '@/lib/utils/wordSearchColors';
import { ArrowLeft, Check } from 'lucide-react';

const audioManager = getAudioManager();

export default function WordSearchPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { vocabulary, loading, error } = useGameVocabulary();
  const { session } = useGameStore();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [language, setLanguage] = useState<'da' | 'en'>('da');
  const [feedback, setFeedback] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Detect language from browser
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    setLanguage(browserLang.startsWith('da') ? 'da' : 'en');
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'object' && value !== null ? value[language] : value || key;
  };

  const initializeGame = useCallback(() => {
    if (!vocabulary || vocabulary.length === 0) return;

    // Filter words that can fit in a 10x10 grid (max length 10)
    const maxWordLength = 10;
    const fittableWords = vocabulary.filter(v => {
      const word = (v.germanTerm || v.term).toUpperCase();
      return word.length >= 3 && word.length <= maxWordLength;
    });

    // Get word count from settings or default to 10
    const wordCount = session?.settings?.wordSearchWordCount || 10;
    
    // Shuffle and select words based on setting
    const shuffled = [...fittableWords].sort(() => Math.random() - 0.5);
    const selectedVocab = shuffled.slice(0, Math.min(wordCount, shuffled.length));

    // Traditional word search: English/German words in both grid and sidebar
    const words = selectedVocab.map(v => {
      // Use German term if available, otherwise English term
      const wordToFind = v.germanTerm || v.term;
      return {
        word: wordToFind,
        translation: wordToFind // Show the same word in sidebar
      };
    });

    // Detect if using German words (check if any selected vocab has germanTerm)
    const isGerman = selectedVocab.some(v => v.germanTerm);
    const gridLanguage: 'german' | 'english' = isGerman ? 'german' : 'english';

    // Use 10x10 grid
    const { grid: newGrid, placedWords: newPlacedWords } = generateWordSearchGrid(words, 10, gridLanguage);
    
    console.log('Word Search Debug:', {
      totalVocabulary: vocabulary.length,
      fittableWords: fittableWords.length,
      selectedWords: words.length,
      placedWords: newPlacedWords.length,
      words: words.map(w => w.word)
    });

    setGrid(newGrid);
    setPlacedWords(newPlacedWords);
    setFoundWords(new Set());
    setScore(0);
    setSelectedCells([]);
  }, [vocabulary]);

  useEffect(() => {
    if (gameStarted && vocabulary && vocabulary.length > 0) {
      initializeGame();
    }
  }, [gameStarted, vocabulary, initializeGame]);

  useEffect(() => {
    if (foundWords.size === placedWords.length && placedWords.length > 0 && gameStarted) {
      // All words found!
      audioManager.playCelebration();
      setScore(prev => prev + 50); // Completion bonus
      setTimeout(() => {
        setGameEnded(true);
      }, 1500);
    }
  }, [foundWords, placedWords, gameStarted]);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row: number, col: number) => {
    // Check if this cell is marked as found in the grid
    return grid[row]?.[col]?.isFound || false;
  };

  const getCellFoundColor = (row: number, col: number) => {
    // Find which word this cell belongs to
    const cell = grid[row]?.[col];
    if (!cell?.isFound) return '';
    
    // Find the word index for this cell
    for (let i = 0; i < placedWords.length; i++) {
      const word = placedWords[i];
      if (word.cells.some(c => c.row === row && c.col === col)) {
        return getWordColor(i);
      }
    }
    return 'bg-green-200/50'; // Fallback color
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    setFeedback(null);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return;

    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return;

    // Check if the new cell is adjacent or in line with the selection
    const rowDiff = row - selectedCells[0].row;
    const colDiff = col - selectedCells[0].col;

    // Allow horizontal, vertical, or diagonal lines
    if (selectedCells.length === 1 || isInLine(selectedCells[0], lastCell, row, col)) {
      // Check if cell is already in selection
      if (!isCellSelected(row, col)) {
        setSelectedCells(prev => [...prev, { row, col }]);
      }
    }
  };

  const isInLine = (start: { row: number; col: number }, last: { row: number; col: number }, row: number, col: number) => {
    const rowDiff1 = last.row - start.row;
    const colDiff1 = last.col - start.col;
    const rowDiff2 = row - start.row;
    const colDiff2 = col - start.col;

    // Check if on same line (horizontal, vertical, or diagonal)
    if (rowDiff1 === 0 && rowDiff2 === 0) return true; // Horizontal
    if (colDiff1 === 0 && colDiff2 === 0) return true; // Vertical
    if (Math.abs(rowDiff1) === Math.abs(colDiff1) && Math.abs(rowDiff2) === Math.abs(colDiff2)) {
      // Diagonal - check if same direction
      const dir1 = { row: Math.sign(rowDiff1), col: Math.sign(colDiff1) };
      const dir2 = { row: Math.sign(rowDiff2), col: Math.sign(colDiff2) };
      return dir1.row === dir2.row && dir1.col === dir2.col;
    }
    return false;
  };

  const handleCellMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    if (selectedCells.length < 2) {
      setSelectedCells([]);
      return;
    }

    // Check if selection matches a word
    const matchedWord = checkWordMatch(selectedCells, placedWords);

    if (matchedWord && !foundWords.has(matchedWord.word)) {
      // Word found!
      audioManager.playSuccess();
      setFoundWords(prev => new Set([...Array.from(prev), matchedWord.word]));
      setScore(prev => prev + 15);
      setFeedback(t('wordSearch.wordFound'));
      
      // Mark cells as found in grid
      const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
      matchedWord.cells.forEach(({ row, col }) => {
        newGrid[row][col].isFound = true;
      });
      setGrid(newGrid);

      setTimeout(() => setFeedback(null), 1500);
    } else if (matchedWord && foundWords.has(matchedWord.word)) {
      // Already found
      setFeedback('Already found!');
      setTimeout(() => setFeedback(null), 1000);
    } else {
      // Not a word
      audioManager.playError();
      setFeedback(t('wordSearch.notAWord'));
      setTimeout(() => setFeedback(null), 1000);
    }

    setSelectedCells([]);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setGameEnded(false);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameEnded(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  if (error || !vocabulary || vocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || 'No vocabulary found'}</p>
          <Button onClick={() => router.push(`/game/${code}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game Selection
          </Button>
        </Card>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <GameEndScreen
        title="All Words Found!"
        score={score}
        onPlayAgain={handleRestart}
        onBackToMenu={() => router.push(`/game/${code}`)}
        message={t('wordSearch.allWordsFound')}
      />
    );
  }

  if (!gameStarted) {
    return (
      <GameAccessGuard gameCode={code} gameMode="word-search">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-2xl w-full">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/game/${code}`)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-center mb-2">
              {t('wordSearch.title')}
            </h1>
            <p className="text-center text-gray-600">
              {t('wordSearch.instruction')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timer"
                checked={timerEnabled}
                onCheckedChange={(checked) => setTimerEnabled(checked as boolean)}
              />
              <Label htmlFor="timer" className="cursor-pointer">
                {t('wordSearch.enableTimer')}
              </Label>
            </div>

            <Button
              onClick={handleStartGame}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {t('wordSearch.startGame')}
            </Button>
          </div>
        </Card>
      </div>
      </GameAccessGuard>
    );
  }

  return (
    <GameAccessGuard gameCode={code} gameMode="word-search">
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/game/${code}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <ScoreDisplay score={score} />
        </div>

        <div className={`grid grid-cols-1 gap-6 ${session?.settings?.wordSearchShowList !== false ? 'lg:grid-cols-4' : ''}`}>
          {/* Word List Sidebar - Only show if setting is enabled */}
          {session?.settings?.wordSearchShowList !== false && (
            <Card className="p-6 lg:col-span-1">
              <h3 className="font-bold text-lg mb-4">{t('wordSearch.wordsToFind')}</h3>
              <div className="space-y-2">
                {placedWords.map((word) => (
                  <div
                    key={word.word}
                    className={`p-2 rounded text-center ${
                      foundWords.has(word.word)
                        ? 'bg-green-100 text-green-800 line-through'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="font-bold text-lg">{word.word}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {t('wordSearch.wordsFound')} {foundWords.size} / {placedWords.length}
                </div>
              </div>
            </Card>
          )}

          {/* Grid */}
          <div className={session?.settings?.wordSearchShowList !== false ? 'lg:col-span-3' : ''}>
            <Card className="p-6">
              {feedback && (
                <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-center font-medium">
                  {feedback}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4 text-center">
                {t('wordSearch.selectCells')}
              </p>

              <div
                ref={gridRef}
                className="inline-block mx-auto"
                onMouseLeave={() => {
                  if (isSelecting) {
                    handleCellMouseUp();
                  }
                }}
              >
                <div className="grid gap-1 select-none" style={{ gridTemplateColumns: `repeat(10, minmax(0, 1fr))` }}>
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={getCellKey(rowIndex, colIndex)}
                        className={`
                          w-8 h-8 md:w-12 md:h-12 flex items-center justify-center
                          font-black text-sm md:text-lg rounded cursor-pointer
                          transition-all duration-150
                          ${isCellFound(rowIndex, colIndex)
                            ? `${getCellFoundColor(rowIndex, colIndex)} text-white ring-4 ring-white/50 shadow-lg`
                            : isCellSelected(rowIndex, colIndex)
                            ? 'bg-purple-500 text-white ring-4 ring-purple-700'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }
                        `}
                        style={isCellFound(rowIndex, colIndex) ? {
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)'
                        } : undefined}
                        onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                        onMouseUp={handleCellMouseUp}
                        onTouchStart={() => handleCellMouseDown(rowIndex, colIndex)}
                        onTouchEnd={handleCellMouseUp}
                      >
                        {cell.letter}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {foundWords.size === placedWords.length && (
                <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-center">
                  <Check className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold text-lg">{t('wordSearch.allWordsFound')}</p>
                  <p className="text-sm">{t('wordSearch.completionBonus')}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
    </GameAccessGuard>
  );
}
