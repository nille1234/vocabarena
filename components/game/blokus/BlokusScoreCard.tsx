"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PlayerPieces } from "@/lib/utils/blokusHelpers";
import { motion } from "framer-motion";

interface BlokusScoreCardProps {
  player: 1 | 2;
  isActive: boolean;
  pieces: PlayerPieces;
  remainingSquares: number;
}

export function BlokusScoreCard({
  player,
  isActive,
  pieces,
  remainingSquares,
}: BlokusScoreCardProps) {
  const playerColor = player === 1 ? 'bg-blue-500' : 'bg-red-500';
  const playerBorder = player === 1 ? 'border-blue-500' : 'border-red-500';
  const playerText = player === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.02 : 1,
        opacity: isActive ? 1 : 0.7,
      }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`${isActive ? `border-2 ${playerBorder}` : 'border'}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            {/* Player Indicator */}
            <div className={`w-8 h-8 rounded-full ${playerColor} flex items-center justify-center text-white font-bold`}>
              {player}
            </div>

            {/* Stats */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">Player {player}</span>
                {isActive && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                    Your Turn
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Pieces Left:</span>
                  <span className={`ml-1 font-bold ${playerText}`}>
                    {pieces.available.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Squares:</span>
                  <span className={`ml-1 font-bold ${playerText}`}>
                    {remainingSquares}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
