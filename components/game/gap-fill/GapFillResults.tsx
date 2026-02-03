"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Target, RotateCcw, ArrowLeft } from "lucide-react";
import { formatTime, Gap } from "@/lib/utils/gapFillHelpers";

interface GapFillResultsProps {
  correct: number;
  total: number;
  percentage: number;
  score: number;
  timeElapsed: number;
  onRestart: () => void;
  onBackToLobby: () => void;
  gaps?: Gap[];
  summaryText?: string;
}

export function GapFillResults({
  correct,
  total,
  percentage,
  score,
  timeElapsed,
  onRestart,
  onBackToLobby,
  gaps,
  summaryText,
}: GapFillResultsProps) {
  const isPerfect = correct === total;

  // Render the summary text with gaps showing correct/incorrect answers
  const renderReviewText = () => {
    if (!gaps || !summaryText) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Find all gap markers in the text
    const gapRegex = /___(\d+)___/g;
    let match;
    
    while ((match = gapRegex.exec(summaryText)) !== null) {
      const gapId = parseInt(match[1]);
      const gap = gaps.find(g => g.id === gapId);
      
      // Add text before the gap
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {summaryText.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add the gap with answer
      if (gap) {
        const isCorrect = gap.filledAnswer?.toLowerCase() === gap.correctAnswer.toLowerCase();
        parts.push(
          <span
            key={`gap-${gapId}`}
            className={`inline-flex items-center gap-1 px-3 py-1 mx-1 rounded-md border-2 font-medium ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-100'
                : 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-100'
            }`}
          >
            {gap.filledAnswer || '___'}
            {!isCorrect && (
              <span className="text-xs">
                {' '}→ <span className="text-green-600 dark:text-green-400 font-bold">{gap.correctAnswer}</span>
              </span>
            )}
          </span>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last gap
    if (lastIndex < summaryText.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {summaryText.substring(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Results Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4"
          >
            <div className={`text-6xl ${isPerfect ? 'animate-bounce' : ''}`}>
              {isPerfect ? '🎉' : '📝'}
            </div>
          </motion.div>
          <CardTitle className="text-3xl font-bold">
            {isPerfect ? 'Perfect Score!' : 'Activity Complete!'}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {isPerfect 
              ? 'Excellent work! You got all the answers correct!'
              : 'Great effort! Review the results below.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {score}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    Points
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {percentage}%
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Accuracy
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatTime(timeElapsed)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Time
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                    {correct}/{total}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">
                    Correct
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              onClick={onRestart}
              className="flex-1"
              size="lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
            <Button
              onClick={onBackToLobby}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Lobby
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Review Text with Answers */}
      {gaps && summaryText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Answer Review</CardTitle>
              <p className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 mr-3">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded"></span>
                  Correct
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded"></span>
                  Incorrect (correct answer shown)
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                  {renderReviewText()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
