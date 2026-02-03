"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw, ArrowLeft, Clock, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface FlashCardStatsProps {
  totalCards: number;
  timeElapsed: number;
  onRestart: () => void;
  onBackToLobby: () => void;
  requirePrerequisiteGames?: boolean;
  prerequisitesComplete?: boolean;
  matchCompleted?: boolean;
  flashcardsCompleted?: boolean;
  onGoToMatch?: () => void;
}

export function FlashCardStats({
  totalCards,
  timeElapsed,
  onRestart,
  onBackToLobby,
  requirePrerequisiteGames = false,
  prerequisitesComplete = false,
  matchCompleted = false,
  flashcardsCompleted = false,
  onGoToMatch,
}: FlashCardStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="pt-8 text-center">
          <Trophy className="h-20 w-20 text-primary mx-auto mb-4" />
          <h2 className="text-4xl font-heading font-bold mb-2">
            🎉 Congratulations!
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            You've mastered all {totalCards} words!
          </p>

          {/* Prerequisite Progress Messages */}
          {requirePrerequisiteGames && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              {prerequisitesComplete ? (
                <Card className="border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="h-6 w-6 text-green-600" />
                      <h3 className="text-2xl font-bold text-green-600">
                        All Games Unlocked!
                      </h3>
                      <Sparkles className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-muted-foreground">
                      You've completed both prerequisite games. You can now play any game in the lobby!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-purple-500/10">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-bold text-primary">
                        One More Game to Unlock All!
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      Complete the {!matchCompleted ? 'Match' : 'Flashcards'} game to unlock all games in the lobby.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {flashcardsCompleted ? (
                          <Badge variant="default" className="bg-green-600">✓ Flashcards</Badge>
                        ) : (
                          <Badge variant="outline">Flashcards</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {matchCompleted ? (
                          <Badge variant="default" className="bg-green-600">✓ Match</Badge>
                        ) : (
                          <Badge variant="outline">Match</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Stats Display */}
          <div className="bg-muted/50 rounded-lg p-6 mb-6 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <div className="text-3xl font-bold text-green-600">
                    {totalCards}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Words Mastered
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div className="text-3xl font-bold text-purple-600">
                    {formatTime(timeElapsed)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Time
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={onRestart} size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Study Again
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={(requirePrerequisiteGames && !prerequisitesComplete && onGoToMatch) ? onGoToMatch : onBackToLobby}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {requirePrerequisiteGames && !prerequisitesComplete ? "Go to Match" : 
               requirePrerequisiteGames && prerequisitesComplete ? "Explore All Games" : 
               "Back to Lobby"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
