'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { useGameVocabulary } from '@/hooks/use-game-vocabulary';
import { useGameStore } from '@/lib/store/gameStore';
import { generateWordSearchGrid, type GridCell, type PlacedWord } from '@/lib/utils/wordSearchGenerator';

export default function WordSearchAnswersPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { vocabulary, loading, error } = useGameVocabulary();
  const { session } = useGameStore();
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);

  useEffect(() => {
    if (vocabulary && vocabulary.length > 0) {
      // Generate the same grid as the game
      const maxWordLength = 10;
      const fittableWords = vocabulary.filter(v => {
        const word = (v.germanTerm || v.term).toUpperCase();
        return word.length >= 3 && word.length <= maxWordLength;
      });

      // Get word count from settings (same as the game)
      const wordCount = session?.settings?.wordSearchWordCount || 10;
      
      // Use first N words (not random, so teachers can see consistent answer key)
      const selectedVocab = fittableWords.slice(0, Math.min(wordCount, fittableWords.length));

      const words = selectedVocab.map(v => {
        const wordToFind = v.germanTerm || v.term;
        return {
          word: wordToFind,
          translation: wordToFind
        };
      });

      // Detect if using German words
      const isGerman = selectedVocab.some(v => v.germanTerm);
      const gridLanguage: 'german' | 'english' = isGerman ? 'german' : 'english';

      const { grid: newGrid, placedWords: newPlacedWords } = generateWordSearchGrid(words, 10, gridLanguage);
      setGrid(newGrid);
      setPlacedWords(newPlacedWords);
    }
  }, [vocabulary, session]);

  const handlePrint = () => {
    window.print();
  };

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const isPartOfWord = (row: number, col: number) => {
    return placedWords.some(word => 
      word.cells.some(cell => cell.row === row && cell.col === col)
    );
  };

  const getWordColor = (row: number, col: number) => {
    const wordIndex = placedWords.findIndex(word =>
      word.cells.some(cell => cell.row === row && cell.col === col)
    );
    
    const colors = [
      'bg-red-200',
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-purple-200',
      'bg-pink-200',
      'bg-indigo-200',
      'bg-orange-200',
      'bg-teal-200',
      'bg-cyan-200',
    ];
    
    return wordIndex >= 0 ? colors[wordIndex % colors.length] : 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading answer key...</p>
        </div>
      </div>
    );
  }

  if (error || !vocabulary || vocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || 'No vocabulary found'}</p>
          <Button onClick={() => router.push('/teacher')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 print:bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header - Hidden when printing */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button
            variant="ghost"
            onClick={() => router.push('/teacher')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Answer Key
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Word Search - Answer Key</h1>
          <p className="text-gray-600">Game Code: {code}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Word List */}
          <Card className="p-6 lg:col-span-1 print:break-inside-avoid">
            <h3 className="font-bold text-lg mb-4">Words to Find</h3>
            <div className="space-y-2">
              {placedWords.map((word, index) => {
                const colors = [
                  'bg-red-200',
                  'bg-blue-200',
                  'bg-green-200',
                  'bg-yellow-200',
                  'bg-purple-200',
                  'bg-pink-200',
                  'bg-indigo-200',
                  'bg-orange-200',
                  'bg-teal-200',
                  'bg-cyan-200',
                ];
                
                return (
                  <div
                    key={word.word}
                    className={`p-2 rounded text-center ${colors[index % colors.length]}`}
                  >
                    <div className="font-bold text-lg text-gray-900">{word.word}</div>
                    <div className="text-xs text-gray-700 mt-1">
                      {word.direction.replace('-', ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Grid with Answer Key */}
          <div className="lg:col-span-3">
            <Card className="p-6 print:break-inside-avoid">
              <h3 className="font-bold text-lg mb-4 text-center">
                Answer Grid (Words Highlighted)
              </h3>
              
              <div className="inline-block mx-auto">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(10, minmax(0, 1fr))` }}>
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={getCellKey(rowIndex, colIndex)}
                        className={`
                          w-8 h-8 md:w-12 md:h-12 flex items-center justify-center
                          font-bold text-sm md:text-base rounded
                          ${isPartOfWord(rowIndex, colIndex)
                            ? `${getWordColor(rowIndex, colIndex)} text-gray-900`
                            : 'bg-gray-100 text-gray-500'
                          }
                          print:border print:border-gray-300
                        `}
                      >
                        {cell.letter}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg print:bg-gray-50">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Each word is highlighted in a different color. 
                  Words can appear horizontally, vertically, or diagonally in any direction.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
