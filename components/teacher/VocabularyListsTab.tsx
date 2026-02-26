"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Download,
  Copy,
  FileEdit,
  GraduationCap,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { getAllClasses } from "@/lib/supabase/classManagement";
import { Class } from "@/types/game";
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
import { EditVocabularyListDialog } from "./EditVocabularyListDialog";
import {
  generateWordDocument,
  generateGermanEnglishWordDocument,
  downloadWordDocument,
  copyGermanEnglishWords,
} from "@/lib/utils/wordListExport";

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

  // Edit words dialog
  const [editWordsDialog, setEditWordsDialog] = useState<VocabularyList | null>(null);

  // Loading states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingDeEnId, setDownloadingDeEnId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [assigningClassId, setAssigningClassId] = useState<string | null>(null);

  // Classes for displaying names
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const allClasses = await getAllClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const getClassName = (classId: string | undefined) => {
    if (!classId) return null;
    const cls = classes.find(c => c.id === classId);
    return cls?.name || 'Unknown Class';
  };

  const getDifficultyColor = (level: string | undefined) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return '';
    }
  };

  const formatDifficulty = (level: string | undefined) => {
    if (!level) return null;
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

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

  const handleDownloadWord = async (list: VocabularyList) => {
    setDownloadingId(list.id);
    try {
      const blob = await generateWordDocument(list);
      downloadWordDocument(blob, list.name);
      toast.success('Word document downloaded');
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast.error('Failed to generate Word document');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadGermanEnglish = async (list: VocabularyList) => {
    setDownloadingDeEnId(list.id);
    try {
      const blob = await generateGermanEnglishWordDocument(list);
      downloadWordDocument(blob, `${list.name}_DE-EN`);
      toast.success('German/English document downloaded');
    } catch (error) {
      console.error('Error generating German/English document:', error);
      toast.error('Failed to generate document');
    } finally {
      setDownloadingDeEnId(null);
    }
  };

  const handleCopyGermanEnglish = async (list: VocabularyList) => {
    setCopyingId(list.id);
    try {
      await copyGermanEnglishWords(list.cards);
      // Check if list has German terms to show appropriate message
      const hasGermanTerms = list.cards.some(card => card.germanTerm && card.germanTerm.trim() !== "");
      if (hasGermanTerms) {
        toast.success('German words copied to clipboard');
      } else {
        toast.success('English words copied to clipboard');
      }
    } catch (error) {
      console.error('Error copying words:', error);
      toast.error('Failed to copy words');
    } finally {
      setCopyingId(null);
    }
  };

  const handleClassAssignment = async (listId: string, classId: string) => {
    setAssigningClassId(listId);
    try {
      const result = await updateVocabularyList(listId, {
        classId: classId === 'none' ? null : classId
      });
      
      if (result.success) {
        toast.success(classId === 'none' ? 'Class assignment removed' : 'Assigned to class');
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to assign class');
      }
    } catch (error) {
      console.error('Error assigning class:', error);
      toast.error('Failed to assign class');
    } finally {
      setAssigningClassId(null);
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
                  
                  {/* Badges for class and difficulty */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {list.classId && (
                      <Badge variant="secondary" className="text-xs">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {getClassName(list.classId)}
                      </Badge>
                    )}
                    {list.difficultyLevel && (
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(list.difficultyLevel)}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {formatDifficulty(list.difficultyLevel)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span>{list.cards.length} words</span>
                    <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(list.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadWord(list)}
                  disabled={downloadingId === list.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingId === list.id ? 'Downloading...' : 'Download Full'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadGermanEnglish(list)}
                  disabled={downloadingDeEnId === list.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingDeEnId === list.id ? 'Downloading...' : 'Download DE/EN'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyGermanEnglish(list)}
                  disabled={copyingId === list.id}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copyingId === list.id ? 'Copying...' : 'Copy DE/EN'}
                </Button>
                
                {/* Assign to Class Dropdown */}
                <Select
                  value={list.classId || 'none'}
                  onValueChange={(value) => handleClassAssignment(list.id, value)}
                  disabled={assigningClassId === list.id}
                >
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Assign to Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {list.classId ? 'Remove Class' : 'No Class'}
                    </SelectItem>
                    {classes.length > 0 && (
                      <>
                        <div className="h-px bg-border my-1" />
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-3 w-3" />
                              {cls.name}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditWordsDialog(list)}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit Words
                </Button>
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

      {/* Edit Words Dialog */}
      {editWordsDialog && (
        <EditVocabularyListDialog
          list={editWordsDialog}
          open={!!editWordsDialog}
          onOpenChange={(open) => !open && setEditWordsDialog(null)}
          onSuccess={() => {
            setEditWordsDialog(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
