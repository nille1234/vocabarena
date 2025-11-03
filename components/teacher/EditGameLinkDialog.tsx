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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateGameLink } from "@/lib/supabase/vocabularyManagement";
import { GameLink, GameMode } from "@/types/game";
import { ALL_GAME_MODES } from "@/lib/constants/gameModes";

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
  const [saving, setSaving] = useState(false);

  // Initialize selected games when dialog opens or gameLink changes
  useEffect(() => {
    if (gameLink) {
      setSelectedGames(gameLink.enabledGames);
    }
  }, [gameLink]);

  const handleToggleGame = (gameId: GameMode) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAll = () => {
    setSelectedGames(ALL_GAME_MODES.map((game) => game.id));
  };

  const handleDeselectAll = () => {
    setSelectedGames([]);
  };

  const handleSave = async () => {
    if (!gameLink) return;

    if (selectedGames.length === 0) {
      toast.error("Please select at least one game");
      return;
    }

    setSaving(true);
    try {
      const result = await updateGameLink(gameLink.id, {
        enabledGames: selectedGames,
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

  if (!gameLink) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">
            Edit Games for "{gameLink.name}"
          </DialogTitle>
          <DialogDescription>
            Select which games students can access with this link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedGames.length} of {ALL_GAME_MODES.length} games selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={selectedGames.length === ALL_GAME_MODES.length}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedGames.length === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>

          {/* Game Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_GAME_MODES.map((game) => {
              const isSelected = selectedGames.includes(game.id);
              return (
                <Card
                  key={game.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleToggleGame(game.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`game-${game.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleGame(game.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`game-${game.id}`}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{game.icon}</span>
                            <span className="font-semibold">{game.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {game.description}
                          </p>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

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
