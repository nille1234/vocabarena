'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'single' | 'two-player';

interface WordScrambleSetupProps {
  onStartGame: (config: GameConfig) => void;
  onBack: () => void;
  translations: {
    title: string;
    instruction: string;
    difficulty: string;
    easy: string;
    medium: string;
    hard: string;
    enableTimer: string;
    timerDuration: string;
    startGame: string;
    playerName: string;
    enterName: string;
    oneAttempt: string;
  };
}

export interface GameConfig {
  gameMode: GameMode;
  difficulty: Difficulty;
  timerEnabled: boolean;
  timerDuration: number;
  player1Name: string;
  player2Name: string;
}

export function WordScrambleSetup({ onStartGame, onBack, translations }: WordScrambleSetupProps) {
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(15);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handleStartGame = () => {
    // Validate player names
    const p1Name = player1Name.trim() || (gameMode === 'single' ? 'Player' : 'Player 1');
    const p2Name = player2Name.trim() || 'Player 2';

    onStartGame({
      gameMode,
      difficulty,
      timerEnabled,
      timerDuration,
      player1Name: p1Name,
      player2Name: p2Name,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-center mb-2">
            {translations.title}
          </h1>
          <p className="text-center text-gray-600">
            {translations.instruction}
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-sm font-medium text-blue-800">
              ⚡ {translations.oneAttempt}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Game Mode Selection */}
          <div>
            <Label className="text-lg font-semibold mb-2 block">
              Game Mode
            </Label>
            <Select value={gameMode} onValueChange={(value) => setGameMode(value as GameMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Player</SelectItem>
                <SelectItem value="two-player">Two Players</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Player Names */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label htmlFor="player1" className="text-gray-900 font-semibold">
                {gameMode === 'single' ? translations.playerName : 'Player 1 Name'}
              </Label>
              <Input
                id="player1"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder={translations.enterName}
                className="mt-1 bg-white text-gray-900"
              />
            </div>
            {gameMode === 'two-player' && (
              <div>
                <Label htmlFor="player2" className="text-gray-900 font-semibold">Player 2 Name</Label>
                <Input
                  id="player2"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder={translations.enterName}
                  className="mt-1 bg-white text-gray-900"
                />
              </div>
            )}
          </div>

          {/* Difficulty Selection */}
          <div>
            <Label className="text-lg font-semibold mb-2 block">
              {translations.difficulty}
            </Label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">{translations.easy}</SelectItem>
                <SelectItem value="medium">{translations.medium}</SelectItem>
                <SelectItem value="hard">{translations.hard}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timer Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timer"
                checked={timerEnabled}
                onCheckedChange={(checked) => setTimerEnabled(checked as boolean)}
              />
              <Label htmlFor="timer" className="cursor-pointer">
                {translations.enableTimer}
              </Label>
            </div>

            {timerEnabled && (
              <div>
                <Label htmlFor="timerDuration" className="text-sm font-medium mb-2 block">
                  {translations.timerDuration}
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    id="timerDuration"
                    min="5"
                    max="60"
                    step="5"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {timerDuration}s
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleStartGame}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {translations.startGame}
          </Button>
        </div>
      </Card>
    </div>
  );
}
