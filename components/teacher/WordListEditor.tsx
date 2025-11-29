"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Check, X } from "lucide-react";
import { VocabCard } from "@/types/game";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WordListEditorProps {
  cards: VocabCard[];
  listId: string;
  listName: string;
  onCardsChange: (cards: VocabCard[]) => void;
}

export function WordListEditor({ 
  cards, 
  listId, 
  listName,
  onCardsChange
}: WordListEditorProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCard, setNewCard] = useState({
    term: "",
    definition: "",
    germanTerm: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCardChange = (cardId: string, field: 'term' | 'definition' | 'germanTerm', value: string) => {
    const updatedCards = cards.map((card) =>
      card.id === cardId
        ? { ...card, [field]: field === 'germanTerm' ? (value || undefined) : value }
        : card
    );
    onCardsChange(updatedCards);
  };

  const handleAddNew = () => {
    if (!newCard.term.trim() || !newCard.definition.trim()) {
      return;
    }

    const newVocabCard: VocabCard = {
      id: `temp-${Date.now()}`, // Temporary ID
      term: newCard.term.trim(),
      definition: newCard.definition.trim(),
      germanTerm: newCard.germanTerm?.trim() || undefined,
      orderIndex: cards.length,
    };

    onCardsChange([...cards, newVocabCard]);
    setNewCard({ term: "", definition: "", germanTerm: "" });
    setIsAddingNew(false);
  };

  const handleDelete = (cardId: string) => {
    if (cards.length <= 20) {
      return; // Prevent deletion if at minimum
    }
    setDeleteConfirmId(cardId);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;

    const updatedCards = cards
      .filter((card) => card.id !== deleteConfirmId)
      .map((card, index) => ({ ...card, orderIndex: index }));

    onCardsChange(updatedCards);
    setDeleteConfirmId(null);
  };

  const canDelete = cards.length > 20;

  return (
    <div className="space-y-4">
      {/* Word Count Badge */}
      <div className="flex items-center justify-between">
        <Badge
          variant={cards.length < 25 ? "destructive" : "secondary"}
          className="text-base px-4 py-2"
        >
          📚 {cards.length} words {cards.length === 20 && "(minimum reached)"}
        </Badge>
        {!canDelete && (
          <p className="text-sm text-muted-foreground">
            Minimum 20 words required
          </p>
        )}
      </div>

      {/* Word List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            className="border-border hover:border-primary/50 transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <Label htmlFor={`term-${card.id}`} className="text-xs text-muted-foreground">
                      Term *
                    </Label>
                    <Input
                      id={`term-${card.id}`}
                      value={card.term}
                      onChange={(e) => handleCardChange(card.id, 'term', e.target.value)}
                      maxLength={100}
                      className="mt-1 font-semibold"
                      placeholder="Enter term"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`def-${card.id}`} className="text-xs text-muted-foreground">
                      Definition *
                    </Label>
                    <Input
                      id={`def-${card.id}`}
                      value={card.definition}
                      onChange={(e) => handleCardChange(card.id, 'definition', e.target.value)}
                      maxLength={500}
                      className="mt-1"
                      placeholder="Enter definition"
                    />
                  </div>
                </div>
                <div className="pt-6">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(card.id)}
                    disabled={!canDelete}
                    className={!canDelete ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Word Section */}
      {isAddingNew ? (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Add New Word</h4>
              <div>
                <Label htmlFor="new-term" className="text-xs">
                  Term *
                </Label>
                <Input
                  id="new-term"
                  value={newCard.term}
                  onChange={(e) =>
                    setNewCard({ ...newCard, term: e.target.value })
                  }
                  maxLength={100}
                  placeholder="Enter term"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-definition" className="text-xs">
                  Definition *
                </Label>
                <Input
                  id="new-definition"
                  value={newCard.definition}
                  onChange={(e) =>
                    setNewCard({ ...newCard, definition: e.target.value })
                  }
                  maxLength={500}
                  placeholder="Enter definition"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewCard({ term: "", definition: "", germanTerm: "" });
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddNew}
                  disabled={!newCard.term.trim() || !newCard.definition.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Add Word
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAddingNew(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Word
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Word?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this word? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
