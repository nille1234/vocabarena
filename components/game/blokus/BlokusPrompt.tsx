"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VocabCard } from "@/types/game";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface BlokusPromptProps {
  currentCard: VocabCard;
  answerMode: 'text-input' | 'multiple-choice';
  multipleChoiceOptions: string[];
  onSubmit: (answer: string) => void;
  feedback: 'correct' | 'incorrect' | null;
  disabled: boolean;
  timeLimit: number | null;
  onTimeUp?: () => void;
}

export function BlokusPrompt({
  currentCard,
  answerMode,
  multipleChoiceOptions,
  onSubmit,
  feedback,
  disabled,
  timeLimit,
  onTimeUp,
}: BlokusPromptProps) {
  const [answer, setAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit);

  // Reset timer when card changes
  useEffect(() => {
    setTimeRemaining(timeLimit);
  }, [currentCard.id, timeLimit]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || disabled || feedback) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, disabled, feedback, onTimeUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !disabled) {
      onSubmit(answer.trim());
      setAnswer("");
    }
  };

  const handleMultipleChoice = (option: string) => {
    if (!disabled) {
      onSubmit(option);
    }
  };

  useEffect(() => {
    if (feedback) {
      setAnswer("");
    }
  }, [feedback]);

  const getTimerColor = () => {
    if (timeRemaining === null) return "text-muted-foreground";
    if (timeRemaining <= 5) return "text-red-500";
    if (timeRemaining <= 10) return "text-orange-500";
    return "text-primary";
  };

  return (
    <Card className={`border-2 transition-colors ${
      feedback === 'correct' ? 'border-green-500 bg-green-500/10' :
      feedback === 'incorrect' ? 'border-red-500 bg-red-500/10' :
      'border-primary/30'
    }`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Timer */}
          {timeLimit !== null && (
            <div className="flex items-center justify-center gap-2">
              <Clock className={`h-4 w-4 ${getTimerColor()}`} />
              <span className={`text-lg font-bold ${getTimerColor()}`}>
                {timeRemaining !== null ? timeRemaining : timeLimit}s
              </span>
            </div>
          )}

          {/* Question */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Translate:</p>
            <p className="text-2xl font-bold">{currentCard.term}</p>
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-2"
            >
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    Correct! Place your piece.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    Incorrect. Turn skipped.
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* Answer Input */}
          {!feedback && (
            <>
              {answerMode === 'text-input' ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={disabled}
                    autoFocus
                    className="text-center text-lg"
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!answer.trim() || disabled}
                  >
                    Submit Answer
                  </Button>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {multipleChoiceOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleMultipleChoice(option)}
                      disabled={disabled}
                      className="h-auto py-3 text-left justify-start hover:bg-primary/10"
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
