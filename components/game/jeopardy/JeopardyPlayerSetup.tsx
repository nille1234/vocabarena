'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

interface JeopardyPlayerSetupProps {
  onStart: (playerNames: string[], timeLimit: number) => void;
}

export function JeopardyPlayerSetup({ onStart }: JeopardyPlayerSetupProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '']);
  const [timeLimit, setTimeLimit] = useState(30);

  const handleStart = () => {
    if (!playerCount) return;
    
    const names = playerNames.slice(0, playerCount).map((name, index) => 
      name.trim() || `Player ${index + 1}`
    );
    
    onStart(names, timeLimit);
  };

  const canStart = playerCount !== null && 
    playerNames.slice(0, playerCount).some(name => name.trim().length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-2 border-yellow-500/50 p-8">
        <div className="text-center mb-8">
          <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
            Jeopardy Setup
          </h2>
          <p className="text-white/80">
            Select number of players and enter names
          </p>
        </div>

        {/* Player Count Selection */}
        {playerCount === null ? (
          <div className="space-y-4">
            <Label className="text-white text-lg">How many players?</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setPlayerCount(2)}
                size="lg"
                className="h-24 text-xl bg-blue-600 hover:bg-blue-700"
              >
                2 Players
              </Button>
              <Button
                onClick={() => setPlayerCount(3)}
                size="lg"
                className="h-24 text-xl bg-blue-600 hover:bg-blue-700"
              >
                3 Players
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-white text-lg">
                {playerCount} Players
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlayerCount(null)}
                className="text-white/60 hover:text-white"
              >
                Change
              </Button>
            </div>

            {/* Player Name Inputs */}
            <div className="space-y-4">
              {Array.from({ length: playerCount }).map((_, index) => (
                <div key={index}>
                  <Label className="text-white mb-2 block">
                    Player {index + 1} Name
                  </Label>
                  <Input
                    value={playerNames[index]}
                    onChange={(e) => {
                      const newNames = [...playerNames];
                      newNames[index] = e.target.value;
                      setPlayerNames(newNames);
                    }}
                    placeholder={`Player ${index + 1}`}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    maxLength={20}
                  />
                </div>
              ))}
            </div>

            {/* Time Limit Selection */}
            <div>
              <Label className="text-white mb-2 block">
                Time per Question
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 20, 30, 45].map((seconds) => (
                  <Button
                    key={seconds}
                    onClick={() => setTimeLimit(seconds)}
                    variant={timeLimit === seconds ? "default" : "outline"}
                    className={
                      timeLimit === seconds
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                    }
                  >
                    {seconds}s
                  </Button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStart}
              disabled={!canStart}
              size="lg"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg"
            >
              Start Game
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
