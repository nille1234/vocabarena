"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Settings, BookOpen, Info } from "lucide-react";
import { toast } from "sonner";
import {
  updateGameLink,
  getVocabularyListById,
  addVocabularyCard,
  updateVocabularyCard,
  deleteVocabularyCard,
} from "@/lib/supabase/vocabularyManagement";
import { GameLink, GameMode, VocabCard } from "@/types/game";
import { WordListEditor } from "./WordListEditor";
import { GameSelectionStep } from "./dialog-steps/GameSelectionStep";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

interface EditGameLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameLink: GameLink | null;
  onSuccess: () => void;
}

export function EditGameLinkDialog({
  open,
  onOpenChange,
  gameLink,
  onSuccess,
}: EditGameLinkDialogProps) {
  const [selectedGames, setSelectedGames] = useState<GameMode[]>([]);
  const [crosswordWordCount, setCrosswordWordCount] = useState<number>(10);
  const [wordSearchWordCount, setWordSearchWordCount] = useState<number>(10);
  const [wordSearchShowList, setWordSearchShowList] = useState<boolean>(true);
  const [othelloAnswerMode, setOthelloAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [ticTacToeAnswerMode, setTicTacToeAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [connectFourAnswerMode, setConnectFourAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [jeopardyAnswerMode, setJeopardyAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [jeopardyTimeLimit, setJeopardyTimeLimit] = useState<number>(30);
  const [blokusAnswerMode, setBlokusAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [blokusTimeLimit, setBlokusTimeLimit] = useState<number | null>(null);
  const [gapFillGapCount, setGapFillGapCount] = useState<number>(15);
  const [gapFillSummaryLength, setGapFillSummaryLength] = useState<number>(250);
  const [requirePrerequisiteGames, setRequirePrerequisiteGames] = useState<boolean>(false);
  const [allowWordListDownload, setAllowWordListDownload] = useState<boolean>(false);
  const [vocabularyCards, setVocabularyCards] = useState<VocabCard[]>([]);
  const [originalCards, setOriginalCards] = useState<VocabCard[]>([]);
  const [vocabularyListName, setVocabularyListName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load vocabulary list when dialog opens
  useEffect(() => {
    if (gameLink && open) {
      setSelectedGames(gameLink.enabledGames);
      setCrosswordWordCount(gameLink.crosswordWordCount || 10);
      setWordSearchWordCount(gameLink.wordSearchWordCount || 10);
      setWordSearchShowList(gameLink.wordSearchShowList !== undefined ? gameLink.wordSearchShowList : true);
      setOthelloAnswerMode(gameLink.othelloAnswerMode || 'text-input');
      setTicTacToeAnswerMode(gameLink.ticTacToeAnswerMode || 'text-input');
      setConnectFourAnswerMode(gameLink.connectFourAnswerMode || 'text-input');
      setJeopardyAnswerMode(gameLink.jeopardyAnswerMode || 'text-input');
      setJeopardyTimeLimit(gameLink.jeopardyTimeLimit || 30);
      setBlokusAnswerMode(gameLink.blokusAnswerMode || 'text-input');
      setBlokusTimeLimit(gameLink.blokusTimeLimit || null);
      setGapFillGapCount(gameLink.gapFillGapCount || 15);
      setGapFillSummaryLength(gameLink.gapFillSummaryLength || 250);
      setRequirePrerequisiteGames(gameLink.requirePrerequisiteGames || false);
      setAllowWordListDownload(gameLink.allowWordListDownload || false);
      loadVocabularyList();
    }
  }, [gameLink, open]);

  // Track unsaved changes
  useEffect(() => {
    if (vocabularyCards.length > 0 && originalCards.length > 0) {
      const hasChanges = JSON.stringify(vocabularyCards) !== JSON.stringify(originalCards);
      setHasUnsavedChanges(hasChanges);
    }
  }, [vocabularyCards, originalCards]);

  const loadVocabularyList = async () => {
    if (!gameLink?.listId) return;

    setLoading(true);
    try {
      const list = await getVocabularyListById(gameLink.listId);
      if (list) {
        setVocabularyCards(list.cards);
        setOriginalCards(list.cards);
        setVocabularyListName(list.name);
      }
    } catch (error) {
      console.error("Error loading vocabulary list:", error);
      toast.error("Failed to load vocabulary list");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!gameLink) return;

    if (selectedGames.length === 0) {
      toast.error("Please select at least one game");
      return;
    }

    // Validate crossword word count
    if (selectedGames.includes('crossword')) {
      if (crosswordWordCount < 5 || crosswordWordCount > 20) {
        toast.error("Crossword word count must be between 5 and 20");
        return;
      }
    }

    // Validate minimum word count
    if (vocabularyCards.length < 20) {
      toast.error("Vocabulary list must have at least 20 words");
      return;
    }

    setSaving(true);
    try {
      // Save vocabulary changes if any
      if (hasUnsavedChanges) {
        await saveVocabularyChanges();
      }

      // Update game link settings
      const result = await updateGameLink(gameLink.id, {
        enabledGames: selectedGames,
        crosswordWordCount: selectedGames.includes('crossword') ? crosswordWordCount : undefined,
        wordSearchWordCount: selectedGames.includes('word-search') ? wordSearchWordCount : undefined,
        wordSearchShowList: selectedGames.includes('word-search') ? wordSearchShowList : undefined,
        othelloAnswerMode: selectedGames.includes('othello') ? othelloAnswerMode : undefined,
        ticTacToeAnswerMode: selectedGames.includes('tic-tac-toe') ? ticTacToeAnswerMode : undefined,
        connectFourAnswerMode: selectedGames.includes('connect-four') ? connectFourAnswerMode : undefined,
        jeopardyAnswerMode: selectedGames.includes('jeopardy') ? jeopardyAnswerMode : undefined,
        jeopardyTimeLimit: selectedGames.includes('jeopardy') ? jeopardyTimeLimit : undefined,
        blokusAnswerMode: selectedGames.includes('blokus') ? blokusAnswerMode : undefined,
        blokusTimeLimit: selectedGames.includes('blokus') ? blokusTimeLimit : undefined,
        gapFillGapCount: selectedGames.includes('gap-fill') ? gapFillGapCount : undefined,
        gapFillSummaryLength: selectedGames.includes('gap-fill') ? gapFillSummaryLength : undefined,
        requirePrerequisiteGames: requirePrerequisiteGames,
        allowWordListDownload: allowWordListDownload,
      });

      if (result.success) {
        toast.success("Game link updated successfully!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update game link");
      }
    } catch (error) {
      console.error("Error updating game link:", error);
      toast.error("Failed to update game link");
    } finally {
      setSaving(false);
    }
  };

  const saveVocabularyChanges = async () => {
    if (!gameLink?.listId) return;

    // Find cards to add, update, or delete
    const originalCardIds = new Set(originalCards.map(c => c.id));
    const currentCardIds = new Set(vocabularyCards.map(c => c.id));

    // Cards to add (have temp IDs)
    const cardsToAdd = vocabularyCards.filter(c => c.id.startsWith('temp-'));
    
    // Cards to update (exist in both but may have changed)
    const cardsToUpdate = vocabularyCards.filter(c => 
      !c.id.startsWith('temp-') && originalCardIds.has(c.id)
    );

    // Cards to delete (in original but not in current)
    const cardsToDelete = originalCards.filter(c => !currentCardIds.has(c.id));

    // Execute operations
    for (const card of cardsToAdd) {
      await addVocabularyCard(gameLink.listId, {
        term: card.term,
        definition: card.definition,
        germanTerm: card.germanTerm,
      });
    }

    for (const card of cardsToUpdate) {
      const original = originalCards.find(c => c.id === card.id);
      if (original && (
        original.term !== card.term ||
        original.definition !== card.definition ||
        original.germanTerm !== card.germanTerm
      )) {
        await updateVocabularyCard(card.id, {
          term: card.term,
          definition: card.definition,
          germanTerm: card.germanTerm,
        });
      }
    }

    for (const card of cardsToDelete) {
      await deleteVocabularyCard(card.id, gameLink.listId);
    }
  };

  if (!gameLink) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">
            Edit "{gameLink.name}"
          </DialogTitle>
          <DialogDescription>
            Configure game settings and edit vocabulary words
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="games" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="games">
              <Settings className="h-4 w-4 mr-2" />
              Game Settings
            </TabsTrigger>
            <TabsTrigger value="words">
              <BookOpen className="h-4 w-4 mr-2" />
              Edit Words
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  •
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            {/* Game Link Info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Code:</span>
                    <Badge variant="secondary" className="font-mono">
                      {gameLink.code}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Vocabulary List:
                    </span>
                    <span className="font-medium">
                      {gameLink.vocabularyList?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Word Count:
                    </span>
                    <span className="font-medium">
                      {gameLink.vocabularyList?.cards.length || 0} words
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Selection with Settings */}
            <GameSelectionStep
              selectedGames={selectedGames}
              onSelectedGamesChange={setSelectedGames}
              crosswordWordCount={crosswordWordCount}
              onCrosswordWordCountChange={setCrosswordWordCount}
              wordSearchWordCount={wordSearchWordCount}
              onWordSearchWordCountChange={setWordSearchWordCount}
              wordSearchShowList={wordSearchShowList}
              onWordSearchShowListChange={setWordSearchShowList}
              othelloAnswerMode={othelloAnswerMode}
              onOthelloAnswerModeChange={setOthelloAnswerMode}
              ticTacToeAnswerMode={ticTacToeAnswerMode}
              onTicTacToeAnswerModeChange={setTicTacToeAnswerMode}
              connectFourAnswerMode={connectFourAnswerMode}
              onConnectFourAnswerModeChange={setConnectFourAnswerMode}
              jeopardyAnswerMode={jeopardyAnswerMode}
              onJeopardyAnswerModeChange={setJeopardyAnswerMode}
              jeopardyTimeLimit={jeopardyTimeLimit}
              onJeopardyTimeLimitChange={setJeopardyTimeLimit}
              blokusAnswerMode={blokusAnswerMode}
              onBlokusAnswerModeChange={setBlokusAnswerMode}
              blokusTimeLimit={blokusTimeLimit}
              onBlokusTimeLimitChange={setBlokusTimeLimit}
              gapFillGapCount={gapFillGapCount}
              onGapFillGapCountChange={setGapFillGapCount}
              gapFillSummaryLength={gapFillSummaryLength}
              onGapFillSummaryLengthChange={setGapFillSummaryLength}
              requirePrerequisiteGames={requirePrerequisiteGames}
              onRequirePrerequisiteGamesChange={setRequirePrerequisiteGames}
            />

            {/* Word List Download Option */}
            <div className="flex items-start space-x-2 rounded-lg border border-border/50 bg-muted/30 p-4">
              <Checkbox
                id="allowWordListDownload"
                checked={allowWordListDownload}
                onCheckedChange={(checked) => setAllowWordListDownload(checked as boolean)}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="allowWordListDownload"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Allow students to download word list
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Students can download a Word document with the vocabulary list (German-Danish or English-Danish format)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provides a downloadable vocabulary reference for homework practice
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="words" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">
                  Loading vocabulary list...
                </p>
              </div>
            ) : (
              <WordListEditor
                cards={vocabularyCards}
                listId={gameLink?.listId || ""}
                listName={vocabularyListName}
                onCardsChange={setVocabularyCards}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || selectedGames.length === 0}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
