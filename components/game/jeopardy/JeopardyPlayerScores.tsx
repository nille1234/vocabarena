'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface Player {
  name: string;
  score: number;
}

interface JeopardyPlayerScoresProps {
  players: Player[];
  currentPlayerIndex: number;
}

export function JeopardyPlayerScores({ players, currentPlayerIndex }: JeopardyPlayerScoresProps) {
  const maxScore = Math.max(...players.map(p => p.score), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {players.map((player, index) => {
        const isCurrentPlayer = index === currentPlayerIndex;
        const isLeading = player.score > 0 && player.score === maxScore;

        return (
          <Card
            key={index}
            className={cn(
              "p-4 transition-all",
              isCurrentPlayer
                ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 scale-105"
                : "bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn(
                "font-bold truncate",
                isCurrentPlayer ? "text-yellow-400" : "text-white"
              )}>
                {player.name}
              </h3>
              {isLeading && player.score > 0 && (
                <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
            </div>
            
            <div className={cn(
              "text-3xl font-bold",
              isCurrentPlayer ? "text-yellow-300" : "text-white"
            )}>
              ${player.score.toLocaleString()}
            </div>
            
            {isCurrentPlayer && (
              <div className="mt-2 text-xs text-yellow-300 font-semibold animate-pulse">
                YOUR TURN
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
