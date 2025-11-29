"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HangmanTimer } from "./HangmanTimer";

interface HangmanPlayerScoresProps {
  currentPlayer: 1 | 2;
  player1Score: number;
  player2Score: number;
  showTimer?: boolean;
  timeRemaining?: number;
  timeLimit?: number;
  isTimerActive?: boolean;
  onTimeExpired?: () => void;
  isMuted?: boolean;
}

export function HangmanPlayerScores({
  currentPlayer,
  player1Score,
  player2Score,
  showTimer = false,
  timeRemaining = 60,
  timeLimit = 60,
  isTimerActive = false,
  onTimeExpired = () => {},
  isMuted = false,
}: HangmanPlayerScoresProps) {
  return (
    <div className="flex items-center gap-4">
      <Card className={currentPlayer === 1 ? "border-primary" : ""}>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Player 1</p>
            <p className="text-xl font-bold">{player1Score}</p>
          </div>
        </CardContent>
      </Card>
      
      {showTimer && (
        <HangmanTimer
          timeRemaining={timeRemaining}
          timeLimit={timeLimit}
          isActive={isTimerActive}
          onTimeExpired={onTimeExpired}
          isMuted={isMuted}
        />
      )}
      
      <Card className={currentPlayer === 2 ? "border-primary" : ""}>
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Player 2</p>
            <p className="text-xl font-bold">{player2Score}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
