"use client";

import { useState } from 'react';
import { VocabCard } from '@/types/game';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ConnectFourPromptProps {
  currentCard: VocabCard;
  answerMode: 'text-input' | 'multiple-choice';
  multipleChoiceOptions?: string[];
  onSubmit: (answer: string) => void;
  feedback: 'correct' | 'incorrect' | null;
  disabled: boolean;
}

export function ConnectFourPrompt({
  currentCard,
  answerMode,
  multipleChoiceOptions,
  onSubmit,
  feedback,
  disabled
}: ConnectFourPromptProps) {
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (answerMode === 'text-input') {
      if (textAnswer.trim()) {
        onSubmit(textAnswer.trim());
        setTextAnswer('');
      }
    } else {
      if (selectedOption) {
        onSubmit(selectedOption);
        setSelectedOption(null);
      }
    }
  };

  const handleOptionClick = (option: string) => {
    if (disabled) return;
    setSelectedOption(option);
    onSubmit(option);
    setTimeout(() => setSelectedOption(null), 500);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="pt-3 pb-3">
        <div className="space-y-2">
          {/* Question */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Translate:</p>
            <h2 className="text-xl font-bold text-primary">{currentCard.term}</h2>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`flex items-center justify-center gap-2 p-2 rounded-lg ${
                feedback === 'correct'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Correct! Choose a column to drop your disc.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Incorrect. The answer was: {currentCard.definition}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Answer Input */}
          {answerMode === 'text-input' ? (
            <form onSubmit={handleSubmit} className="space-y-1.5">
              <Input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={disabled}
                className="text-base h-9"
                autoFocus
              />
              <Button
                type="submit"
                disabled={disabled || !textAnswer.trim()}
                className="w-full h-9 text-sm"
              >
                Submit
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {multipleChoiceOptions?.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={disabled}
                  variant={selectedOption === option ? 'default' : 'outline'}
                  className="h-auto py-2 text-left justify-start text-xs"
                >
                  <span className="font-semibold mr-1.5">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
