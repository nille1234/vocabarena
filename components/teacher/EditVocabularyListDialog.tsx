"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WordListEditor } from "./WordListEditor";
import { JeopardyCategorizeDialog } from "./JeopardyCategorizeDialog";
import { VocabularyList, VocabCard, Class, DifficultyLevel } from "@/types/game";
import { updateVocabularyList } from "@/lib/supabase/vocabularyManagement";
import { getAllClasses } from "@/lib/supabase/classManagement";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface EditVocabularyListDialogProps {
  list: VocabularyList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditVocabularyListDialog({
  list,
  open,
  onOpenChange,
  onSuccess,
}: EditVocabularyListDialogProps) {
  const [cards, setCards] = useState<VocabCard[]>(list.cards);
  const [classId, setClassId] = useState<string | null>(list.classId || null);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | null>(list.difficultyLevel || null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategorizeDialog, setShowCategorizeDialog] = useState(false);

  // Load classes when dialog opens
  useEffect(() => {
    if (open) {
      loadClasses();
    }
  }, [open]);

  const loadClasses = async () => {
    try {
      const allClasses = await getAllClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleSave = async () => {
    // Validate that all cards have required fields
    const invalidCards = cards.filter(
      (card) => !card.term.trim() || !card.definition.trim()
    );

    if (invalidCards.length > 0) {
      toast.error("All words must have a term and definition");
      return;
    }

    if (cards.length < 20) {
      toast.error("Vocabulary list must have at least 20 words");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateVocabularyList(list.id, { 
        cards,
        classId: classId || null,
        difficultyLevel: difficultyLevel || null
      });
      
      if (result.success) {
        toast.success("Vocabulary list updated successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update vocabulary list");
      }
    } catch (error) {
      console.error("Error updating vocabulary list:", error);
      toast.error("Failed to update vocabulary list");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original state
    setCards(list.cards);
    setClassId(list.classId || null);
    setDifficultyLevel(list.difficultyLevel || null);
    onOpenChange(false);
  };

  const handleApplyCategories = (assignments: { [term: string]: string }) => {
    // Update cards with category assignments
    const updatedCards = cards.map(card => ({
      ...card,
      jeopardyCategory: assignments[card.term] || card.jeopardyCategory,
    }));
    setCards(updatedCards);
  };

  const handleClearCategories = () => {
    const updatedCards = cards.map(card => ({
      ...card,
      jeopardyCategory: undefined,
    }));
    setCards(updatedCards);
    toast.success('Categories cleared');
  };

  const categorizedCount = cards.filter(c => c.jeopardyCategory).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vocabulary List</DialogTitle>
          <DialogDescription>
            Add, edit, or remove words from "{list.name}". Minimum 20 words required.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Class and Difficulty Selection */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="class">Assign to Class (Optional)</Label>
              <Select
                value={classId || "none"}
                onValueChange={(value) => setClassId(value === "none" ? null : value)}
                disabled={isSaving}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="No class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No class</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Organize this list by class while keeping it visible in all lists
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level (Optional)</Label>
              <Select
                value={difficultyLevel || "none"}
                onValueChange={(value) => setDifficultyLevel(value === "none" ? null : value as DifficultyLevel)}
                disabled={isSaving}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="No difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No difficulty</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tag for differentiated instruction
              </p>
            </div>
          </div>

          {/* Jeopardy Categorization Section */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Jeopardy Categories
                </h3>
                <p className="text-sm text-muted-foreground">
                  {categorizedCount > 0 
                    ? `${categorizedCount} of ${cards.length} words categorized`
                    : 'Add thematic categories for better Jeopardy gameplay'}
                </p>
              </div>
              <div className="flex gap-2">
                {categorizedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCategories}
                    disabled={isSaving}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowCategorizeDialog(true)}
                  disabled={isSaving || cards.length < 25}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Categorize
                </Button>
              </div>
            </div>
            {cards.length < 25 && (
              <p className="text-xs text-muted-foreground">
                Need at least 25 words to categorize (currently have {cards.length})
              </p>
            )}
          </div>

          <WordListEditor
            cards={cards}
            listId={list.id}
            listName={list.name}
            onCardsChange={setCards}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <JeopardyCategorizeDialog
        open={showCategorizeDialog}
        onOpenChange={setShowCategorizeDialog}
        cards={cards}
        onApply={handleApplyCategories}
      />
    </Dialog>
  );
}
