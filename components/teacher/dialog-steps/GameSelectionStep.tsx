"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Info } from "lucide-react";
import { GameMode } from "@/types/game";
import { ALL_GAME_MODES } from "@/lib/constants/gameModes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  connectFourAnswerMode: 'text-input' | 'multiple-choice';
  onConnectFourAnswerModeChange: (mode: 'text-input' | 'multiple-choice') => void;
  jeopardyAnswerMode: 'text-input' | 'multiple-choice';
  onJeopardyAnswerModeChange: (mode: 'text-input' | 'multiple-choice') => void;
  jeopardyTimeLimit: number;
  onJeopardyTimeLimitChange: (limit: number) => void;
  blokusAnswerMode: 'text-input' | 'multiple-choice';
  onBlokusAnswerModeChange: (mode: 'text-input' | 'multiple-choice') => void;
  blokusTimeLimit: number | null;
  onBlokusTimeLimitChange: (limit: number | null) => void;
  gapFillGapCount: number;
  onGapFillGapCountChange: (count: number) => void;
  gapFillSummaryLength: number;
  onGapFillSummaryLengthChange: (length: number) => void;
  requirePrerequisiteGames?: boolean;
  onRequirePrerequisiteGamesChange?: (value: boolean) => void;
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
  connectFourAnswerMode,
  onConnectFourAnswerModeChange,
  jeopardyAnswerMode,
  onJeopardyAnswerModeChange,
  jeopardyTimeLimit,
  onJeopardyTimeLimitChange,
  blokusAnswerMode,
  onBlokusAnswerModeChange,
  blokusTimeLimit,
  onBlokusTimeLimitChange,
  gapFillGapCount,
  onGapFillGapCountChange,
  gapFillSummaryLength,
  onGapFillSummaryLengthChange,
  requirePrerequisiteGames,
  onRequirePrerequisiteGamesChange,
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
  const isConnectFourSelected = selectedGames.includes('connect-four');
  const isJeopardySelected = selectedGames.includes('jeopardy');
  const isBlokusSelected = selectedGames.includes('blokus');
  const isGapFillSelected = selectedGames.includes('gap-fill');

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

            {/* Connect Four Settings */}
            {isConnectFourSelected && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Connect Four Answer Mode
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose how students will answer vocabulary questions
                      </p>
                    </div>
                    
                    <RadioGroup value={connectFourAnswerMode} onValueChange={onConnectFourAnswerModeChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text-input" id="connectfour-text" />
                        <Label htmlFor="connectfour-text" className="font-normal cursor-pointer">
                          Text Input - Students type their answers
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple-choice" id="connectfour-mc" />
                        <Label htmlFor="connectfour-mc" className="font-normal cursor-pointer">
                          Multiple Choice - Students choose from 4 options
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Jeopardy Settings */}
            {isJeopardySelected && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Jeopardy Settings
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure answer mode and time limit for Jeopardy
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Answer Mode</Label>
                      <RadioGroup value={jeopardyAnswerMode} onValueChange={onJeopardyAnswerModeChange}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="text-input" id="jeopardy-text" />
                          <Label htmlFor="jeopardy-text" className="font-normal cursor-pointer">
                            Text Input - Students type their answers
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiple-choice" id="jeopardy-mc" />
                          <Label htmlFor="jeopardy-mc" className="font-normal cursor-pointer">
                            Multiple Choice - Students choose from 4 options
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="jeopardyTimeLimit">Time Limit per Question</Label>
                        <span className="text-sm font-semibold text-primary">
                          {jeopardyTimeLimit} seconds
                        </span>
                      </div>
                      <RadioGroup 
                        value={jeopardyTimeLimit.toString()} 
                        onValueChange={(value) => onJeopardyTimeLimitChange(parseInt(value))}
                      >
                        <div className="grid grid-cols-3 gap-2">
                          {[10, 20, 30, 40, 50, 60].map((seconds) => (
                            <div key={seconds} className="flex items-center space-x-2">
                              <RadioGroupItem value={seconds.toString()} id={`time-${seconds}`} />
                              <Label htmlFor={`time-${seconds}`} className="font-normal cursor-pointer">
                                {seconds}s
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground">
                        Choose how long students have to answer each question
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blokus Settings */}
            {isBlokusSelected && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Blokus Settings
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure answer mode and time limit for Blokus
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Answer Mode</Label>
                      <RadioGroup value={blokusAnswerMode} onValueChange={onBlokusAnswerModeChange}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="text-input" id="blokus-text" />
                          <Label htmlFor="blokus-text" className="font-normal cursor-pointer">
                            Text Input - Students type their answers
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiple-choice" id="blokus-mc" />
                          <Label htmlFor="blokus-mc" className="font-normal cursor-pointer">
                            Multiple Choice - Students choose from 4 options
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="blokusTimeLimit">Time Limit per Question</Label>
                        <span className="text-sm font-semibold text-primary">
                          {blokusTimeLimit ? `${blokusTimeLimit} seconds` : 'No limit'}
                        </span>
                      </div>
                      <RadioGroup 
                        value={blokusTimeLimit?.toString() || 'none'} 
                        onValueChange={(value) => onBlokusTimeLimitChange(value === 'none' ? null : parseInt(value))}
                      >
                        <div className="grid grid-cols-4 gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="none" id="blokus-time-none" />
                            <Label htmlFor="blokus-time-none" className="font-normal cursor-pointer">
                              None
                            </Label>
                          </div>
                          {[10, 20, 30, 40, 50, 60].map((seconds) => (
                            <div key={seconds} className="flex items-center space-x-2">
                              <RadioGroupItem value={seconds.toString()} id={`blokus-time-${seconds}`} />
                              <Label htmlFor={`blokus-time-${seconds}`} className="font-normal cursor-pointer">
                                {seconds}s
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground">
                        Choose how long students have to answer each question, or select "None" for no time limit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gap-Fill Settings */}
            {isGapFillSelected && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Gap-Fill Summary Settings
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure options for the gap-fill summary activity
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="gapFillGapCount">Number of Gaps</Label>
                        <span className="text-sm font-semibold text-primary">
                          {gapFillGapCount} gaps
                        </span>
                      </div>
                      <Slider
                        id="gapFillGapCount"
                        min={1}
                        max={30}
                        step={1}
                        value={[gapFillGapCount]}
                        onValueChange={(value) => onGapFillGapCountChange(value[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose how many words will be missing from the summary (1-30)
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="gapFillSummaryLength">Summary Length (words)</Label>
                        <span className="text-sm font-semibold text-primary">
                          {gapFillSummaryLength} words
                        </span>
                      </div>
                      <Slider
                        id="gapFillSummaryLength"
                        min={100}
                        max={400}
                        step={25}
                        value={[gapFillSummaryLength]}
                        onValueChange={(value) => onGapFillSummaryLengthChange(value[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose the target length for the generated summary (100-400 words)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </ScrollArea>

      {/* Prerequisite Games Setting */}
      {onRequirePrerequisiteGamesChange && (
        <div className="flex items-start space-x-2 rounded-lg border border-border/50 bg-muted/30 p-4">
          <Checkbox
            id="requirePrerequisites"
            checked={requirePrerequisiteGames}
            onCheckedChange={(checked) => onRequirePrerequisiteGamesChange(checked as boolean)}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="requirePrerequisites"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Require Match and Flashcards completion first
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Students must complete Match (once) and Flashcards (twice) before accessing other games. Progress is tracked in their browser.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">
              Other games will be locked until students complete both prerequisite games
            </p>
          </div>
        </div>
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
