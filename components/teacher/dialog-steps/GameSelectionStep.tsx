"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2 } from "lucide-react";
import { GameMode } from "@/types/game";
import { ALL_GAME_MODES } from "@/lib/constants/gameModes";

interface GameSelectionStepProps {
  selectedGames: GameMode[];
  onSelectedGamesChange: (games: GameMode[]) => void;
  crosswordWordCount: number;
  onCrosswordWordCountChange: (count: number) => void;
  wordSearchWordCount: number;
  onWordSearchWordCountChange: (count: number) => void;
  wordSearchShowList: boolean;
  onWordSearchShowListChange: (show: boolean) => void;
  othelloAnswerMode: 'text-input' | 'multiple-choice';
  onOthelloAnswerModeChange: (mode: 'text-input' | 'multiple-choice') => void;
  ticTacToeAnswerMode: 'text-input' | 'multiple-choice';
  onTicTacToeAnswerModeChange: (mode: 'text-input' | 'multiple-choice') => void;
}

export function GameSelectionStep({
  selectedGames,
  onSelectedGamesChange,
  crosswordWordCount,
  onCrosswordWordCountChange,
  wordSearchWordCount,
  onWordSearchWordCountChange,
  wordSearchShowList,
  onWordSearchShowListChange,
  othelloAnswerMode,
  onOthelloAnswerModeChange,
  ticTacToeAnswerMode,
  onTicTacToeAnswerModeChange,
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
  const isWordSearchSelected = selectedGames.includes('word-search');
  const isOthelloSelected = selectedGames.includes('othello');
  const isTicTacToeSelected = selectedGames.includes('tic-tac-toe');

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

      <ScrollArea className="h-[450px] pr-4">
        <div className="space-y-4">
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

          {/* Game-specific Settings */}
          <div className="space-y-3 mt-4">
            {/* Crossword Settings */}
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

            {/* Word Search Settings */}
            {isWordSearchSelected && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="wordSearchWordCount" className="text-base font-semibold">
                        Word Search Settings
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure options for the word search game
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="wordSearchWordCount">Number of Words</Label>
                        <span className="text-sm font-semibold text-primary">
                          {wordSearchWordCount} words
                        </span>
                      </div>
                      <Slider
                        id="wordSearchWordCount"
                        min={5}
                        max={20}
                        step={1}
                        value={[wordSearchWordCount]}
                        onValueChange={(value) => onWordSearchWordCountChange(value[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose how many words will appear in the word search grid (5-20)
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="wordSearchShowList">Show Word List</Label>
                          <p className="text-xs text-muted-foreground">
                            Display words with Danish translations above the grid
                          </p>
                        </div>
                        <Checkbox
                          id="wordSearchShowList"
                          checked={wordSearchShowList}
                          onCheckedChange={onWordSearchShowListChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Othello Settings */}
            {isOthelloSelected && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Othello Answer Mode
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose how students will answer vocabulary questions
                      </p>
                    </div>
                    
                    <RadioGroup value={othelloAnswerMode} onValueChange={onOthelloAnswerModeChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text-input" id="othello-text" />
                        <Label htmlFor="othello-text" className="font-normal cursor-pointer">
                          Text Input - Students type their answers
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple-choice" id="othello-mc" />
                        <Label htmlFor="othello-mc" className="font-normal cursor-pointer">
                          Multiple Choice - Students choose from 4 options
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Five-in-a-Row Settings */}
            {isTicTacToeSelected && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Five-in-a-Row Answer Mode
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose how students will answer vocabulary questions
                      </p>
                    </div>
                    
                    <RadioGroup value={ticTacToeAnswerMode} onValueChange={onTicTacToeAnswerModeChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text-input" id="tictactoe-text" />
                        <Label htmlFor="tictactoe-text" className="font-normal cursor-pointer">
                          Text Input - Students type their answers
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple-choice" id="tictactoe-mc" />
                        <Label htmlFor="tictactoe-mc" className="font-normal cursor-pointer">
                          Multiple Choice - Students choose from 4 options
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>

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
