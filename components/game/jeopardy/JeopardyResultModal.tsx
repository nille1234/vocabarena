'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JeopardyResultModalProps {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  pointsEarned: number;
  currentPlayerName?: string;
  onContinue: () => void;
}

export function JeopardyResultModal({
  isCorrect,
  correctAnswer,
  userAnswer,
  pointsEarned,
  currentPlayerName,
  onContinue,
}: JeopardyResultModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className={cn(
        "w-full max-w-md p-8 text-center",
        isCorrect 
          ? "bg-gradient-to-br from-green-500 to-green-700 border-4 border-green-300"
          : "bg-gradient-to-br from-red-500 to-red-700 border-4 border-red-300"
      )}>
        {/* Icon */}
        <div className="mb-6">
          {isCorrect ? (
            <CheckCircle2 className="w-20 h-20 text-white mx-auto animate-bounce" />
          ) : (
            <XCircle className="w-20 h-20 text-white mx-auto animate-shake" />
          )}
        </div>

        {/* Result Text */}
        <h2 className="text-3xl font-bold text-white mb-4">
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </h2>
        
        {currentPlayerName && (
          <p className="text-white/80 mb-4">
            {currentPlayerName}
          </p>
        )}

        {/* Points */}
        {isCorrect && (
          <div className="text-5xl font-bold text-yellow-300 mb-6">
            +${pointsEarned}
          </div>
        )}

        {/* Answer Details */}
        <div className="bg-white/20 rounded-lg p-4 mb-6 text-white">
          {!isCorrect && userAnswer && (
            <div className="mb-3">
              <div className="text-sm opacity-80 mb-1">Your Answer:</div>
              <div className="font-semibold line-through">{userAnswer}</div>
            </div>
          )}
          <div>
            <div className="text-sm opacity-80 mb-1">Correct Answer:</div>
            <div className="font-bold text-lg">{correctAnswer}</div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className="w-full bg-white text-gray-900 hover:bg-gray-100 text-lg py-6"
        >
          Continue
        </Button>
      </Card>
    </div>
  );
}
