"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2 } from "lucide-react";
import { GameMode } from "@/types/game";
import { ALL_GAME_MODES } from "@/lib/constants/gameModes";

interface GameSelectionStepProps {
  selectedGames: GameMode[];
  onSelectedGamesChange: (games: GameMode[]) => void;
  crosswordWordCount: number;
  onCrosswordWordCountChange: (count: number) => void;
}

export function GameSelectionStep({
  selectedGames,
  onSelectedGamesChange,
  crosswordWordCount,
  onCrosswordWordCountChange,
}: GameSelectionStepProps) {
  const handleToggleGame = (gameId: GameMode) => {
    onSelectedGamesChange(
      selectedGames.includes(gameId)
        ? selectedGames.filter(id => id !== gameId)
        : [...selectedGames, gameId]
    );
  };

  const handleSelectAllGames = () => {
    if (selectedGames.length === ALL_GAME_MODES.length) {
      onSelectedGamesChange([]);
    } else {
      onSelectedGamesChange(ALL_GAME_MODES.map(g => g.id));
    }
  };

  const isCrosswordSelected = selectedGames.includes('crossword');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select Games for Students</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAllGames}
        >
          {selectedGames.length === ALL_GAME_MODES.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <ScrollArea className="h-[350px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALL_GAME_MODES.map((game) => (
            <Card
              key={game.id}
              className={`cursor-pointer transition-all ${
                selectedGames.includes(game.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
              onClick={() => handleToggleGame(game.id)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedGames.includes(game.id)}
                    onCheckedChange={() => handleToggleGame(game.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{game.icon}</span>
                      <h4 className="font-semibold">{game.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {game.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Crossword Settings - Now outside ScrollArea for better visibility */}
      {isCrosswordSelected && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="crosswordWordCount" className="text-base font-semibold">
                  Crossword Settings
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure options for the crossword game
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="crosswordWordCount">Number of Words</Label>
                  <span className="text-sm font-semibold text-primary">
                    {crosswordWordCount} words
                  </span>
                </div>
                <Slider
                  id="crosswordWordCount"
                  min={5}
                  max={25}
                  step={1}
                  value={[crosswordWordCount]}
                  onValueChange={(value) => onCrosswordWordCountChange(value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Choose how many words will appear in the crossword puzzle (5-25)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedGames.length > 0 && (
        <Alert className="border-primary/50 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription>
            {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''} selected
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
