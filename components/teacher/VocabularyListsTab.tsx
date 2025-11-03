"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Edit2, 
  Check, 
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteVocabularyList,
  updateVocabularyList,
} from "@/lib/supabase/vocabularyManagement";
import { VocabularyList } from "@/types/game";
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

interface VocabularyListsTabProps {
  vocabularyLists: VocabularyList[];
  onRefresh: () => void;
}

export function VocabularyListsTab({ vocabularyLists, onRefresh }: VocabularyListsTabProps) {
  // Edit states
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleStartEditList = (list: VocabularyList) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const handleSaveEditList = async (listId: string) => {
    if (!editingListName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const result = await updateVocabularyList(listId, { name: editingListName.trim() });
      if (result.success) {
        toast.success('Vocabulary list updated');
        setEditingListId(null);
        setEditingListName("");
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to update list');
      }
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      const result = await deleteVocabularyList(deleteConfirm.id);
      if (result.success) {
        toast.success('Vocabulary list deleted');
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to delete list');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (vocabularyLists.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No vocabulary lists yet. Create one when making a game link!</p>
      </div>
    );
  }

  return (
    <>
      {vocabularyLists.map((list) => (
        <Card key={list.id} className="border-border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingListId === list.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingListName}
                        onChange={(e) => setEditingListName(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditList(list.id);
                          if (e.key === 'Escape') setEditingListId(null);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEditList(list.id)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingListId(null)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{list.name}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEditList(list)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {list.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {list.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span>{list.cards.length} words</span>
                    <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(list.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm({ id: list.id, name: list.name })}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vocabulary list "{deleteConfirm?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
