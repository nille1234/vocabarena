'use client';

import { JeopardyQuestion } from '@/lib/utils/jeopardyHelpers';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface JeopardyBoardProps {
  categories: string[];
  questions: JeopardyQuestion[][];
  onQuestionSelect: (categoryIndex: number, questionIndex: number) => void;
}

export function JeopardyBoard({ categories, questions, onQuestionSelect }: JeopardyBoardProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with category names */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {categories.map((category, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 text-center"
          >
            <h3 className="text-white font-bold text-sm md:text-base lg:text-lg leading-tight">
              {category}
            </h3>
          </Card>
        ))}
      </div>

      {/* Question grid */}
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((questionIndex) => (
          categories.map((_, categoryIndex) => {
            const question = questions[categoryIndex]?.[questionIndex];
            
            if (!question) return null;

            return (
              <Card
                key={`${categoryIndex}-${questionIndex}`}
                className={cn(
                  "aspect-square flex items-center justify-center cursor-pointer transition-all",
                  question.answered
                    ? "bg-gradient-to-br from-gray-700 to-gray-900 opacity-50 cursor-not-allowed"
                    : "bg-gradient-to-br from-yellow-500 to-orange-600 hover:scale-105 hover:shadow-lg"
                )}
                onClick={() => {
                  if (!question.answered) {
                    onQuestionSelect(categoryIndex, questionIndex);
                  }
                }}
              >
                <span className={cn(
                  "font-bold text-2xl md:text-3xl lg:text-4xl",
                  question.answered ? "text-gray-500" : "text-white"
                )}>
                  {question.answered ? '✓' : `$${question.value}`}
                </span>
              </Card>
            );
          })
        ))}
      </div>
    </div>
  );
}
