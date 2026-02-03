"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, XCircle, Clock } from "lucide-react";
import { FlashCardProgress as ProgressType } from "@/lib/utils/flashcardHelpers";

interface FlashCardProgressProps {
  progress: ProgressType;
  totalCards: number;
  currentCardIndex: number;
  timeElapsed: number;
}

export function FlashCardProgress({
  progress,
  totalCards,
  currentCardIndex,
  timeElapsed,
}: FlashCardProgressProps) {
  const progressPercentage = totalCards > 0 
    ? Math.round((progress.knownWords.length / totalCards) * 100) 
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isReviewPhase = progress.unseenWords.length === 0 && progress.reviewWords.length > 0;

  return (
    <div className="space-y-3">
      {/* Phase Indicator & Progress Bar */}
      <Card className={isReviewPhase ? "bg-orange-500/10 border-orange-500/30" : "bg-primary/5 border-primary/20"}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">
                {isReviewPhase ? "Review Phase" : "Learning New Words"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Card {currentCardIndex} of {totalCards}
            </span>
          </div>
          <Progress value={(currentCardIndex / totalCards) * 100} className="h-2 mb-3" />
          
          {/* Compact Stats Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span className="font-semibold">{progress.knownWords.length}</span>
              <span className="text-muted-foreground">Known</span>
            </div>
            <div className="flex items-center gap-1 text-orange-600">
              <XCircle className="h-3 w-3" />
              <span className="font-semibold">{progress.reviewWords.length}</span>
              <span className="text-muted-foreground">Review</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <BookOpen className="h-3 w-3" />
              <span className="font-semibold">{progress.unseenWords.length}</span>
              <span className="text-muted-foreground">New</span>
            </div>
            <div className="flex items-center gap-1 text-purple-600">
              <Clock className="h-3 w-3" />
              <span className="font-semibold">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
