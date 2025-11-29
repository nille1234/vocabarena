'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameVocabulary } from '@/hooks/use-game-vocabulary';
import { generateWordSearchGrid, checkWordMatch, type GridCell, type PlacedWord } from '@/lib/utils/wordSearchGenerator';
import { shuffleArray } from '@/lib/utils/vocabularyShuffle';
import { getAudioManager } from '@/lib/utils/audioManager';
import { WordFinderAnswerKey } from '@/components/teacher/WordFinderAnswerKey';
import { ArrowLeft, Trophy, Timer, Users, Key } from 'lucide-react';
import confetti from 'canvas-confetti';

const audioManager = getAudioManager();

type Difficulty = 'easy' | 'medium' | 'hard';
type PlayerColor = 'blue' | 'red';

interface PlayerState {
  id: 1 | 2;
  name: string;
  color: PlayerColor;
  foundWords: Set<string>;
  score: number;
}

export default function WordFinderPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { vocabulary, loading, error } = useGameVocabulary();
  
  // Game setup state
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [timerDuration, setTimerDuration] = useState<number>(180); // Default 3 minutes
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  
  // Game state
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([
    { id: 1, name: 'Player 1', color: 'blue', foundWords: new Set(), score: 0 },
    { id: 2, name: 'Player 2', color: 'red', foundWords: new Set(), score: 0 }
  ]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [gameEnded, setGameEnded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const getGridSize = (diff: Difficulty): number => {
    switch (diff) {
      case 'easy': return 10;
      case 'medium': return 12;
      case 'hard': return 15;
    }
  };

  const initializeGame = useCallback(() => {
    if (!vocabulary || vocabulary.length === 0) return;

    const gridSize = getGridSize(difficulty);
    
    // Filter words that can fit in the grid
    const fittableWords = vocabulary.filter(v => {
      const word = (v.germanTerm || v.term).toUpperCase();
      return word.length >= 3 && word.length <= gridSize;
    });

    if (fittableWords.length < 20) {
      console.warn('Not enough words for Word Finder. Need at least 20 words.');
      return;
    }

    // Randomly select exactly 20 words using proper shuffle
    const shuffled = shuffleArray(fittableWords);
    const selectedVocab = shuffled.slice(0, 20);

    // Create word list for grid
    const words = selectedVocab.map(v => {
      const wordToFind = v.germanTerm || v.term;
      return {
        word: wordToFind,
        translation: wordToFind
      };
    });

    // Detect language
    const isGerman = selectedVocab.some(v => v.germanTerm);
    const gridLanguage: 'german' | 'english' = isGerman ? 'german' : 'english';

    // Generate grid
    const { grid: newGrid, placedWords: newPlacedWords } = generateWordSearchGrid(
      words, 
      gridSize, 
      gridLanguage
    );
    
    setGrid(newGrid);
    setPlacedWords(newPlacedWords);
    setPlayers([
      { id: 1, name: player1Name, color: 'blue', foundWords: new Set(), score: 0 },
      { id: 2, name: player2Name, color: 'red', foundWords: new Set(), score: 0 }
    ]);
    setSelectedCells([]);
    setTimeRemaining(timerDuration);
    setGameEnded(false);
  }, [vocabulary, difficulty, player1Name, player2Name, timerDuration]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameEnded || timerDuration >= 999999) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, timerDuration]);

  // Check for game end conditions
  useEffect(() => {
    if (!gameStarted) return;

    const totalFoundWords = players[0].foundWords.size + players[1].foundWords.size;
    
    if (totalFoundWords === placedWords.length && placedWords.length > 0) {
      // All words found!
      setGameEnded(true);
      audioManager.playCelebration();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [players, placedWords, gameStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const getCellColor = (row: number, col: number): string => {
    const cell = grid[row]?.[col];
    if (!cell) return '';

    // Check if this cell is part of a found word
    for (const player of players) {
      for (const wordText of Array.from(player.foundWords)) {
        const word = placedWords.find(w => w.word === wordText);
        if (word && word.cells.some(c => c.row === row && c.col === col)) {
          return player.color === 'blue' ? 'bg-blue-200 text-blue-900' : 'bg-red-200 text-red-900';
        }
      }
    }

    return '';
  };

  const isInLine = (start: { row: number; col: number }, last: { row: number; col: number }, row: number, col: number) => {
    const rowDiff1 = last.row - start.row;
    const colDiff1 = last.col - start.col;
    const rowDiff2 = row - start.row;
    const colDiff2 = col - start.col;

    if (rowDiff1 === 0 && rowDiff2 === 0) return true; // Horizontal
    if (colDiff1 === 0 && colDiff2 === 0) return true; // Vertical
    if (Math.abs(rowDiff1) === Math.abs(colDiff1) && Math.abs(rowDiff2) === Math.abs(colDiff2)) {
      const dir1 = { row: Math.sign(rowDiff1), col: Math.sign(colDiff1) };
      const dir2 = { row: Math.sign(rowDiff2), col: Math.sign(colDiff2) };
      return dir1.row === dir2.row && dir1.col === dir2.col;
    }
    return false;
  };

  const handleCellMouseDown = (row: number, col: number) => {
    if (gameEnded) return;
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    setFeedback(null);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting || gameEnded) return;

    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return;

    if (selectedCells.length === 1 || isInLine(selectedCells[0], lastCell, row, col)) {
      if (!isCellSelected(row, col)) {
        setSelectedCells(prev => [...prev, { row, col }]);
      }
    }
  };

  const handleCellMouseUp = () => {
    if (!isSelecting || gameEnded) return;
    setIsSelecting(false);

    if (selectedCells.length < 2) {
      setSelectedCells([]);
      return;
    }

    // Check if selection matches a word
    const matchedWord = checkWordMatch(selectedCells, placedWords);

    if (matchedWord) {
      // Check if word already found
      const alreadyFound = players.some(p => p.foundWords.has(matchedWord.word));
      
      if (alreadyFound) {
        setFeedback('Already found!');
        audioManager.playError();
        setTimeout(() => setFeedback(null), 1000);
      } else {
        // Determine which player found it (alternate or random for now)
        // For simplicity, we'll give it to the player with fewer words
        const playerIndex = players[0].foundWords.size <= players[1].foundWords.size ? 0 : 1;
        const player = players[playerIndex];
        
        // Award word to player
        audioManager.playSuccess();
        setPlayers(prev => prev.map((p, idx) => {
          if (idx === playerIndex) {
            const newFoundWords = new Set(p.foundWords);
            newFoundWords.add(matchedWord.word);
            return {
              ...p,
              foundWords: newFoundWords,
              score: p.score + 1
            };
          }
          return p;
        }));
        
        setFeedback(`${player.name} found: ${matchedWord.word}!`);
        setTimeout(() => setFeedback(null), 2000);
      }
    } else {
      audioManager.playError();
      setFeedback('Not a word!');
      setTimeout(() => setFeedback(null), 1000);
    }

    setSelectedCells([]);
  };

  const handleStartGame = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      alert('Please enter names for both players');
      return;
    }
    initializeGame();
    setGameStarted(true);
  };

  const handleRematch = () => {
    initializeGame();
    setGameStarted(true);
    setGameEnded(false);
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
    setGameEnded(false);
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

  if (error || !vocabulary || vocabulary.length < 20) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">
            {error || 'Not enough vocabulary words. Need at least 20 words for Word Finder.'}
          </p>
          <Button onClick={() => router.push(`/game/${code}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game Selection
          </Button>
        </Card>
      </div>
    );
  }

  // Setup Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-red-50 flex items-center justify-center p-4">
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
            <div className="text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <h1 className="text-4xl font-bold mb-2">Word Finder Battle</h1>
              <p className="text-gray-600">
                Find as many vocabulary words as possible before your opponent does!
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Difficulty Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Difficulty</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={difficulty === 'easy' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('easy')}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl mb-1">😊</span>
                  <span>Easy</span>
                  <span className="text-xs text-muted-foreground">10×10 grid</span>
                </Button>
                <Button
                  variant={difficulty === 'medium' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('medium')}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl mb-1">😐</span>
                  <span>Medium</span>
                  <span className="text-xs text-muted-foreground">12×12 grid</span>
                </Button>
                <Button
                  variant={difficulty === 'hard' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('hard')}
                  className="h-20 flex flex-col"
                >
                  <span className="text-2xl mb-1">😤</span>
                  <span>Hard</span>
                  <span className="text-xs text-muted-foreground">15×15 grid</span>
                </Button>
              </div>
            </div>

            {/* Timer Duration */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Timer Duration</Label>
              <Select value={timerDuration.toString()} onValueChange={(value) => setTimerDuration(parseInt(value))}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="180">3 minutes (default)</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="999999">No limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Player Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1" className="text-base font-semibold mb-2 block">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Player 1
                </Label>
                <Input
                  id="player1"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter name"
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="player2" className="text-base font-semibold mb-2 block">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Player 2
                </Label>
                <Input
                  id="player2"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter name"
                  className="h-12"
                />
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">How to Play:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click and drag to select words in the grid</li>
                <li>• Words can be horizontal, vertical, or diagonal</li>
                <li>• First player to find a word gets the point</li>
                <li>• Game ends after 3 minutes or when all words are found</li>
                <li>• Player with most words wins!</li>
              </ul>
            </div>

            <Button
              onClick={handleStartGame}
              className="w-full h-14 text-lg"
              size="lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Start Battle!
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Game End Screen
  if (gameEnded) {
    const winner = players[0].score > players[1].score ? players[0] : 
                   players[1].score > players[0].score ? players[1] : null;
    
    const allFoundWords = new Set([
      ...Array.from(players[0].foundWords),
      ...Array.from(players[1].foundWords)
    ]);
    const missedWords = placedWords.filter(w => !allFoundWords.has(w.word));

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-red-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-3xl w-full">
          <div className="text-center mb-8">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">
              {winner ? `🏆 ${winner.name} Wins!` : "It's a Tie!"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {winner ? `Great job finding the most words!` : 'Both players found the same number of words!'}
            </p>
          </div>

          {/* Score Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="border-2 border-blue-500">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {players[0].score}
                </div>
                <div className="font-semibold">{players[0].name}</div>
                <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
                  {players[0].foundWords.size} words
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-500">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {players[1].score}
                </div>
                <div className="font-semibold">{players[1].name}</div>
                <Badge variant="secondary" className="mt-2 bg-red-100 text-red-800">
                  {players[1].foundWords.size} words
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Words Found */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2 text-blue-600">
                {players[0].name}'s Words:
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {Array.from(players[0].foundWords).map(word => (
                  <div key={word} className="text-sm bg-blue-50 p-2 rounded">
                    {word}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600">
                {players[1].name}'s Words:
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {Array.from(players[1].foundWords).map(word => (
                  <div key={word} className="text-sm bg-red-50 p-2 rounded">
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missed Words */}
          {missedWords.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-gray-600">Missed Words:</h3>
              <div className="flex flex-wrap gap-2">
                {missedWords.map(word => (
                  <Badge key={word.word} variant="outline">
                    {word.word}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleRematch} className="flex-1 h-12" size="lg">
              Play Again
            </Button>
            <Button 
              onClick={() => router.push(`/game/${code}`)} 
              variant="outline" 
              className="flex-1 h-12"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active Game Screen
  const gridSize = getGridSize(difficulty);
  const cellSize = gridSize === 10 ? 'w-10 h-10 md:w-12 md:h-12' : 
                   gridSize === 12 ? 'w-8 h-8 md:w-10 md:h-10' : 
                   'w-6 h-6 md:w-8 md:h-8';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={handleBackToSetup}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {timerDuration < 999999 && (
            <div className="flex items-center gap-2 bg-white border-2 border-primary rounded-full px-6 py-3">
              <Timer className="h-6 w-6 text-primary" />
              <span className="font-bold text-2xl text-primary">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Player Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-2 border-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Player 1</div>
                  <div className="text-xl font-bold text-blue-600">{players[0].name}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{players[0].score}</div>
                  <div className="text-xs text-muted-foreground">words found</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Player 2</div>
                  <div className="text-xl font-bold text-red-600">{players[1].name}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-600">{players[1].score}</div>
                  <div className="text-xs text-muted-foreground">words found</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Word List - Compact Grid Above Game Grid */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">Words to Find</h3>
            <Badge variant="secondary">
              {players[0].foundWords.size + players[1].foundWords.size} / {placedWords.length} found
            </Badge>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {placedWords.map((word) => {
              const foundByPlayer1 = players[0].foundWords.has(word.word);
              const foundByPlayer2 = players[1].foundWords.has(word.word);
              
              return (
                <div
                  key={word.word}
                  className={`p-2 rounded text-center text-xs font-medium ${
                    foundByPlayer1 ? 'bg-blue-200 text-blue-900 line-through' :
                    foundByPlayer2 ? 'bg-red-200 text-red-900 line-through' :
                    'bg-gray-100 text-gray-900'
                  }`}
                >
                  {word.word}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Grid */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <Card className="p-6">
              {feedback && (
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-center font-medium">
                  {feedback}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4 text-center">
                Click and drag to select words. First player to find a word gets the point!
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
                <div 
                  className="grid gap-1 select-none" 
                  style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const cellColor = getCellColor(rowIndex, colIndex);
                      const isSelected = isCellSelected(rowIndex, colIndex);
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            ${cellSize} flex items-center justify-center
                            font-bold text-xs md:text-sm rounded cursor-pointer
                            transition-colors duration-150
                            ${cellColor || (isSelected ? 'bg-yellow-300 text-yellow-900' : 'bg-gray-100 hover:bg-gray-200 text-gray-900')}
                          `}
                          onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                          onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                          onMouseUp={handleCellMouseUp}
                          onTouchStart={() => handleCellMouseDown(rowIndex, colIndex)}
                          onTouchEnd={handleCellMouseUp}
                        >
                          {cell.letter}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
