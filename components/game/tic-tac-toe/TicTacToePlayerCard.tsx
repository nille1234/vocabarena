import { Card, CardContent } from "@/components/ui/card";
import { X as XIcon, Circle } from "lucide-react";

interface TicTacToePlayerCardProps {
  player: "X" | "O";
  isCurrentPlayer: boolean;
  gameOver: boolean;
}

export function TicTacToePlayerCard({ player, isCurrentPlayer, gameOver }: TicTacToePlayerCardProps) {
  return (
    <Card className={isCurrentPlayer && !gameOver ? (player === "X" ? "border-primary" : "border-secondary") : ""}>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {player === "X" ? (
            <XIcon className="h-6 w-6 text-primary" />
          ) : (
            <Circle className="h-6 w-6 text-secondary" />
          )}
          <p className="text-sm font-medium">Player {player}</p>
        </div>
        {isCurrentPlayer && !gameOver && (
          <p className={`text-xs mt-1 font-bold ${player === "X" ? "text-primary" : "text-secondary"}`}>
            Current Turn
          </p>
        )}
      </CardContent>
    </Card>
  );
}
