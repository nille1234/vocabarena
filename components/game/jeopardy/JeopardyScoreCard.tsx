'use client';

import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface JeopardyScoreCardProps {
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  correctAnswers: number;
}

export function JeopardyScoreCard({
  score,
  questionsAnswered,
  totalQuestions,
  correctAnswers,
}: JeopardyScoreCardProps) {
  const accuracy = questionsAnswered > 0 
    ? Math.round((correctAnswers / questionsAnswered) * 100) 
    : 0;

  return (
    <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Score
        </h2>
        <div className="text-4xl font-bold text-yellow-500">
          ${score.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{questionsAnswered}</div>
          <div className="text-sm text-muted-foreground">Answered</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">{correctAnswers}</div>
          <div className="text-sm text-muted-foreground">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-500">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">
            {questionsAnswered} / {totalQuestions}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
            style={{ width: `${(questionsAnswered / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
