'use client';

import { useState, useEffect } from 'react';
import { JeopardyQuestion } from '@/lib/utils/jeopardyHelpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { generateMultipleChoiceOptions } from '@/lib/utils/wordClassifier';

interface JeopardyQuestionModalProps {
  question: JeopardyQuestion | null;
  allDefinitions: string[];
  answerMode: 'text-input' | 'multiple-choice';
  timeLimit: number;
  onAnswer: (answer: string, timeTaken: number) => void;
  onClose: () => void;
}

export function JeopardyQuestionModal({
  question,
  allDefinitions,
  answerMode,
  timeLimit,
  onAnswer,
  onClose,
}: JeopardyQuestionModalProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!question) return;

    // Reset state
    setUserAnswer('');
    setTimeRemaining(timeLimit);

    // Generate multiple choice options if needed (using Danish definitions)
    if (answerMode === 'multiple-choice') {
      // Get the correct answer (Danish definition)
      const correctAnswer = question.card.definition;
      
      // Get 3 random wrong answers from other definitions
      const wrongAnswers = allDefinitions
        .filter(def => def !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Combine and shuffle all 4 options
      const allOptions = [correctAnswer, ...wrongAnswers]
        .sort(() => Math.random() - 0.5);
      
      setMultipleChoiceOptions(allOptions);
    }

    // Start timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        handleSubmit('', timeLimit * 1000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [question, timeLimit, answerMode, allDefinitions]);

  const handleSubmit = (answer: string, timeTaken: number) => {
    onAnswer(answer, timeTaken);
  };

  const handleAnswerSubmit = () => {
    const timeTaken = (timeLimit - timeRemaining) * 1000;
    handleSubmit(userAnswer, timeTaken);
  };

  const handleMultipleChoiceSelect = (option: string) => {
    const timeTaken = (timeLimit - timeRemaining) * 1000;
    handleSubmit(option, timeTaken);
  };

  if (!question) return null;

  const progressPercentage = (timeRemaining / timeLimit) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-blue-900 to-blue-950 border-4 border-yellow-500 p-8">
        {/* Category and Value */}
        <div className="text-center mb-6">
          <h2 className="text-yellow-400 text-xl font-bold mb-2">
            {question.categoryName}
          </h2>
          <div className="text-white text-3xl font-bold">
            ${question.value}
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white mb-2">
            <span>Time Remaining</span>
            <span className={cn(
              "font-bold",
              timeRemaining <= 5 && "text-red-400 animate-pulse"
            )}>
              {timeRemaining}s
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-100",
                progressPercentage > 50 ? "bg-green-500" :
                progressPercentage > 25 ? "bg-yellow-500" :
                "bg-red-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question (Term - the English/German word to translate) */}
        <Card className="bg-white/10 p-6 mb-6">
          <p className="text-white text-3xl font-bold text-center leading-relaxed">
            {question.card.term}
          </p>
          {question.card.germanTerm && (
            <p className="text-blue-300 text-center mt-3 text-lg">
              ({question.card.germanTerm})
            </p>
          )}
        </Card>

        {/* Answer Input */}
        {answerMode === 'text-input' ? (
          <div className="space-y-4">
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userAnswer.trim()) {
                  handleAnswerSubmit();
                }
              }}
              placeholder="What is...?"
              className="text-lg p-6 bg-white/90 text-black"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={handleAnswerSubmit}
                disabled={!userAnswer.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              >
                Submit Answer
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-red-600 hover:bg-red-700 text-white border-red-500"
              >
                Skip
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {multipleChoiceOptions.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleMultipleChoiceSelect(option)}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-lg py-6 justify-start"
              >
                <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full bg-red-600 hover:bg-red-700 text-white border-red-500 mt-4"
            >
              Skip Question
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
