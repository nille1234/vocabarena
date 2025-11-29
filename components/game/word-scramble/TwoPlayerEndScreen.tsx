'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TwoPlayerEndScreenProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  player1Correct: number;
  player2Correct: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function TwoPlayerEndScreen({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  player1Correct,
  player2Correct,
  onPlayAgain,
  onBackToMenu,
}: TwoPlayerEndScreenProps) {
  const winner = player1Score > player2Score ? player1Name : player2Score > player1Score ? player2Name : 'Tie';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Game Complete!</h1>
          {winner !== 'Tie' ? (
            <p className="text-2xl text-purple-600 font-semibold">🏆 {winner} Wins!</p>
          ) : (
            <p className="text-2xl text-purple-600 font-semibold">🤝 It's a Tie!</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className={`p-6 ${player1Score >= player2Score ? 'border-2 border-purple-500 bg-purple-50' : ''}`}>
            <h3 className="font-bold text-lg mb-4">{player1Name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-bold text-xl">{player1Score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correct:</span>
                <span className="font-semibold">{player1Correct}</span>
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${player2Score >= player1Score ? 'border-2 border-purple-500 bg-purple-50' : ''}`}>
            <h3 className="font-bold text-lg mb-4">{player2Name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-bold text-xl">{player2Score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correct:</span>
                <span className="font-semibold">{player2Correct}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button onClick={onPlayAgain} className="flex-1 h-12" size="lg">
            Play Again
          </Button>
          <Button onClick={onBackToMenu} variant="outline" className="flex-1 h-12" size="lg">
            Back to Menu
          </Button>
        </div>
      </Card>
    </div>
  );
}
