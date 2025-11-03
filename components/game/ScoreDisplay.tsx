"use client";

import { Trophy, Zap, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScoreDisplayProps {
  score: number;
  streak?: number;
  accuracy?: number;
  lives?: number;
  className?: string;
}

export function ScoreDisplay({
  score,
  streak,
  accuracy,
  lives,
  className = "",
}: ScoreDisplayProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Score */}
      <Badge
        variant="secondary"
        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-primary/20"
      >
        <Trophy className="h-5 w-5 text-primary" />
        <span className="font-bold text-primary">{score}</span>
      </Badge>

      {/* Streak */}
      {streak !== undefined && streak > 0 && (
        <Badge
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border-orange-500/20"
        >
          <Zap className="h-5 w-5 text-orange-500" />
          <span className="font-bold text-orange-500">{streak}</span>
        </Badge>
      )}

      {/* Accuracy */}
      {accuracy !== undefined && (
        <Badge
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border-green-500/20"
        >
          <Target className="h-5 w-5 text-green-500" />
          <span className="font-bold text-green-500">
            {Math.round(accuracy * 100)}%
          </span>
        </Badge>
      )}

      {/* Lives */}
      {lives !== undefined && (
        <Badge
          variant="secondary"
          className={`
            flex items-center gap-2 px-4 py-2
            ${lives <= 1 ? 'bg-red-500/10 border-red-500/20 animate-pulse' : 'bg-pink-500/10 border-pink-500/20'}
          `}
        >
          <span className={`text-2xl ${lives <= 1 ? 'text-red-500' : 'text-pink-500'}`}>
            {'❤️'.repeat(lives)}
          </span>
        </Badge>
      )}
    </div>
  );
}
