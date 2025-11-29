'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Check, X, Timer, Zap, ArrowLeft, RotateCcw } from 'lucide-react';

interface WordState {
  original: string;
  scrambled: string;
  translation: string;
  timeStarted: number;
}

interface WordScrambleGameProps {
  vocabulary: Array<{ term: string; definition: string }>;
  currentWordIndex: number;
  wordState: WordState;
  timerEnabled: boolean;
  timerDuration: number;
  gameMode: 'single' | 'two-player';
  currentPlayer: 1 | 2;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  onSubmitAnswer: (answer: string, timeTaken: number) => void;
  onNextWord: () => void;
  onBack: () => void;
  onNewGame: () => void;
  translations: {
    scrambledWord: string;
    yourAnswer: string;
    submit: string;
    nextWord: string;
    correct: string;
    incorrect: string;
    correctAnswer: string;
    translation: string;
    timeBonus: string;
  };
}

export function WordScrambleGame({
  vocabulary,
  currentWordIndex,
  wordState,
  timerEnabled,
  timerDuration,
  gameMode,
  currentPlayer,
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  onSubmitAnswer,
  onNextWord,
  onBack,
  onNewGame,
  translations,
}: WordScrambleGameProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset state when word changes
  useEffect(() => {
    setUserAnswer('');
    setTimeLeft(timerDuration);
    setFeedback(null);
    setShowAnswer(false);
    setHasSubmitted(false);
  }, [currentWordIndex, timerDuration]);

  // Timer countdown
  useEffect(() => {
    if (!timerEnabled || hasSubmitted || showAnswer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, hasSubmitted, showAnswer]);

  const handleTimeout = () => {
    setShowAnswer(true);
    setFeedback('incorrect');
    setHasSubmitted(true);
    const timeTaken = (Date.now() - wordState.timeStarted) / 1000;
    onSubmitAnswer('', timeTaken);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim() || hasSubmitted) return;

    const timeTaken = (Date.now() - wordState.timeStarted) / 1000;
    const isCorrect = userAnswer.trim().toLowerCase() === wordState.original.toLowerCase();
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);
    setHasSubmitted(true);
    
    onSubmitAnswer(userAnswer, timeTaken);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasSubmitted) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            {gameMode === 'single' ? (
              <div className="flex items-center gap-4">
                <Badge className="text-base px-3 py-1 bg-white text-gray-900 border border-gray-300">
                  {player1Name}
                </Badge>
                <ScoreDisplay score={player1Score} />
              </div>
            ) : (
              <div className="flex gap-4">
                <Card className={`px-4 py-3 bg-white ${currentPlayer === 1 ? 'border-2 border-purple-500 bg-purple-50' : ''}`}>
                  <div className="font-semibold text-base mb-1 text-black">{player1Name}</div>
                  <div className="text-sm text-black">Points: <span className="font-bold text-lg text-purple-600">{player1Score}</span></div>
                </Card>
                <Card className={`px-4 py-3 bg-white ${currentPlayer === 2 ? 'border-2 border-purple-500 bg-purple-50' : ''}`}>
                  <div className="font-semibold text-base mb-1 text-black">{player2Name}</div>
                  <div className="text-sm text-black">Points: <span className="font-bold text-lg text-purple-600">{player2Score}</span></div>
                </Card>
              </div>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Game
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start a New Game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your current progress and scores. Are you sure you want to start a new game?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onNewGame}>Start New Game</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Word {currentWordIndex + 1} of {vocabulary.length}</span>
            <span>{Math.round(((currentWordIndex) / vocabulary.length) * 100)}%</span>
          </div>
          <Progress value={((currentWordIndex) / vocabulary.length) * 100} className="h-2" />
        </div>

        {/* Game Card */}
        <Card className="p-8">
          {gameMode === 'two-player' && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center rounded-md border-2 border-purple-500 bg-purple-600 px-4 py-2 text-lg font-semibold text-white">
                {currentPlayer === 1 ? player1Name : player2Name}'s Turn
              </div>
            </div>
          )}

          {timerEnabled && !showAnswer && (
            <div className="mb-6 flex items-center justify-center gap-2">
              <Timer className="h-5 w-5 text-purple-600" />
              <span className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-purple-600'}`}>
                {timeLeft}s
              </span>
            </div>
          )}

          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-2">{translations.scrambledWord}</p>
            <div className="text-5xl font-bold text-purple-600 tracking-wider mb-4">
              {wordState.scrambled.toUpperCase()}
            </div>
            <Badge variant="outline" className="text-sm">
              One attempt only
            </Badge>
          </div>

          {!showAnswer && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="answer">{translations.yourAnswer}</Label>
                <Input
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer..."
                  className="text-lg h-12"
                  disabled={hasSubmitted}
                  autoFocus
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full h-12 text-lg"
                disabled={!userAnswer.trim() || hasSubmitted}
              >
                {translations.submit}
              </Button>
            </div>
          )}

          {feedback && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              feedback === 'correct' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedback === 'correct' ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                )}
                <span className="text-xl font-bold">
                  {feedback === 'correct' ? translations.correct : translations.incorrect}
                </span>
              </div>
            </div>
          )}

          {showAnswer && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-600 rounded-lg">
                <p className="text-sm text-blue-100 mb-1">{translations.correctAnswer}</p>
                <p className="text-2xl font-bold text-white">{wordState.original}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{translations.translation}</p>
                <p className="text-lg text-gray-800">{wordState.translation}</p>
              </div>
              <Button
                onClick={onNextWord}
                className="w-full h-12 text-lg"
              >
                {currentWordIndex < vocabulary.length - 1 
                  ? translations.nextWord
                  : 'Finish Game'
                }
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
