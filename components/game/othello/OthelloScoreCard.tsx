import { Card, CardContent } from "@/components/ui/card";
import { Circle } from "lucide-react";

interface OthelloScoreCardProps {
  player: "black" | "white";
  score: number;
  isCurrentPlayer: boolean;
  isGameOver: boolean;
}

export function OthelloScoreCard({ player, score, isCurrentPlayer, isGameOver }: OthelloScoreCardProps) {
  return (
    <Card className={isCurrentPlayer && !isGameOver ? "border-primary" : ""}>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Circle className={`h-6 w-6 ${player === "black" ? "fill-black text-black" : "fill-white text-white"}`} />
          <p className="text-sm font-medium capitalize">{player}</p>
        </div>
        <p className="text-3xl font-bold">{score}</p>
        {isCurrentPlayer && !isGameOver && (
          <p className="text-xs text-primary mt-1">Current Turn</p>
        )}
      </CardContent>
    </Card>
  );
}
