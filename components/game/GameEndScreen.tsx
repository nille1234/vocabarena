"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, RotateCcw, Home, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

interface GameEndScreenProps {
  title: string;
  score: number;
  accuracy?: number;
  streak?: number;
  timeElapsed?: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  message?: string;
}

export function GameEndScreen({
  title,
  score,
  accuracy,
  streak,
  timeElapsed,
  onPlayAgain,
  onBackToMenu,
  message,
}: GameEndScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <Card className="max-w-md w-full border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="pt-8 pb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Trophy className="h-20 w-20 text-primary mx-auto mb-4" />
          </motion.div>

          <h2 className="text-3xl font-heading font-bold mb-2">{title}</h2>
          
          {message && (
            <p className="text-muted-foreground mb-6">{message}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background/50 rounded-lg p-4">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>

            {accuracy !== undefined && (
              <div className="bg-background/50 rounded-lg p-4">
                <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">
                  {Math.round(accuracy * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            )}

            {streak !== undefined && streak > 0 && (
              <div className="bg-background/50 rounded-lg p-4">
                <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-500">{streak}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
            )}

            {timeElapsed !== undefined && (
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-500">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button onClick={onPlayAgain} size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
            <Button
              onClick={onBackToMenu}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
