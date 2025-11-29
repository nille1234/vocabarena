"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { validateTimerDuration, formatTime } from "@/lib/utils/hangmanHelpers";

interface HangmanModeSelectProps {
  onSelectMode: (mode: "single" | "two-player", timerDuration?: number) => void;
}

export function HangmanModeSelect({ onSelectMode }: HangmanModeSelectProps) {
  const [showTimerConfig, setShowTimerConfig] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);

  const handleTimerChange = (value: number[]) => {
    setTimerDuration(value[0]);
  };

  const handleStartTwoPlayer = () => {
    if (validateTimerDuration(timerDuration)) {
      onSelectMode("two-player", timerDuration);
    }
  };

  if (showTimerConfig) {
    return (
      <div className="max-w-2xl mx-auto mt-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">⏱️ Timer Settings</h1>
          <p className="text-muted-foreground text-lg">
            Configure the time limit for each player's turn
          </p>
        </div>

        <Card>
          <CardContent className="pt-8 pb-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{formatTime(timerDuration)}</div>
                <p className="text-sm text-muted-foreground">per turn</p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="timer-slider">Time Limit (seconds)</Label>
                <Slider
                  id="timer-slider"
                  min={10}
                  max={300}
                  step={5}
                  value={[timerDuration]}
                  onValueChange={handleTimerChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10s</span>
                  <span>60s</span>
                  <span>120s</span>
                  <span>180s</span>
                  <span>300s</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timer-input">Or enter exact time (10-300 seconds)</Label>
                <Input
                  id="timer-input"
                  type="number"
                  min={10}
                  max={300}
                  value={timerDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setTimerDuration(Math.max(10, Math.min(300, value)));
                    }
                  }}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  ⚠️ When time runs out, the player loses their turn and the other player gets to play.
                  No lives are lost for running out of time.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTimerConfig(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleStartTwoPlayer} className="flex-1">
                  Start Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold mb-4">🎯 Hangman</h1>
        <p className="text-muted-foreground text-lg">Choose your game mode</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:border-primary transition-all hover:scale-105"
          onClick={() => onSelectMode("single")}
        >
          <CardContent className="pt-8 pb-6 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-2">Single Player</h2>
            <p className="text-muted-foreground">
              Play solo and try to get the highest score
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-all hover:scale-105"
          onClick={() => setShowTimerConfig(true)}
        >
          <CardContent className="pt-8 pb-6 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold mb-2">Two Players</h2>
            <p className="text-muted-foreground">
              Take turns and compete for the highest score
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
