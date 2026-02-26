"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  GraduationCap,
  BookOpen,
  Link as LinkIcon,
  TrendingUp,
  FileEdit
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Class, VocabularyList, GameLink } from "@/types/game";
import { getClassById } from "@/lib/supabase/classManagement";
import { getVocabularyListsByClass } from "@/lib/supabase/classManagement";
import { getGameLinksByClass } from "@/lib/supabase/classManagement";
import { updateVocabularyList } from "@/lib/supabase/vocabularyManagement";
import { CreateGameLinkDialog } from "./CreateGameLinkDialog";
import { EditVocabularyListDialog } from "./EditVocabularyListDialog";

interface ClassDetailViewProps {
  classId: string;
  userId: string;
}

export function ClassDetailView({ classId, userId }: ClassDetailViewProps) {
  const router = useRouter();
  const [classData, setClassData] = useState<Class | null>(null);
  const [vocabularyLists, setVocabularyLists] = useState<VocabularyList[]>([]);
  const [gameLinks, setGameLinks] = useState<any[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<VocabularyList | null>(null);

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    setLoading(true);
    try {
      const [cls, lists, links] = await Promise.all([
        getClassById(classId),
        getVocabularyListsByClass(classId),
        getGameLinksByClass(classId)
      ]);

      if (!cls) {
        toast.error("Class not found");
        router.push("/teacher");
        return;
      }

      setClassData(cls);
      setVocabularyLists(lists as VocabularyList[]);
      setGameLinks(links);
    } catch (error) {
      console.error("Error loading class data:", error);
      toast.error("Failed to load class data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectList = (listId: string, checked: boolean) => {
    const newSelected = new Set(selectedListIds);
    if (checked) {
      newSelected.add(listId);
    } else {
      newSelected.delete(listId);
    }
    setSelectedListIds(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedListIds(new Set(vocabularyLists.map(l => l.id)));
  };

  const handleDeselectAll = () => {
    setSelectedListIds(new Set());
  };

  const handleRemoveFromClass = async (listId: string) => {
    try {
      const result = await updateVocabularyList(listId, { classId: null });
      if (result.success) {
        toast.success("Removed from class");
        loadClassData();
      } else {
        toast.error(result.error || "Failed to remove from class");
      }
    } catch (error) {
      console.error("Error removing from class:", error);
      toast.error("Failed to remove from class");
    }
  };

  const handleCopyGameLink = (code: string) => {
    const url = `${window.location.origin}/play/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Game link copied to clipboard");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/teacher">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Classes
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2 flex items-center gap-3">
                  <GraduationCap className="h-10 w-10 text-primary" />
                  {classData.name}
                </h1>
                {classData.description && (
                  <p className="text-muted-foreground text-lg mb-3">
                    {classData.description}
                  </p>
                )}
                <div className="flex gap-3">
                  {classData.gradeLevel && (
                    <Badge variant="secondary">{classData.gradeLevel}</Badge>
                  )}
                  {classData.subject && (
                    <Badge variant="outline">{classData.subject}</Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
            <CardContent className="pt-6">
              <div className="flex gap-3 flex-wrap">
                <Button
                  size="lg"
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={selectedListIds.size === 0}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Game Link
                  {selectedListIds.size > 0 && ` (${selectedListIds.size} selected)`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vocabulary Lists Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Vocabulary Lists ({vocabularyLists.length})
                  </CardTitle>
                  <CardDescription>
                    Select lists to create a game link
                  </CardDescription>
                </div>
                {vocabularyLists.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      Deselect All
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {vocabularyLists.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No vocabulary lists assigned to this class yet.</p>
                  <p className="text-sm mt-2">
                    Assign lists from the Vocabulary Lists tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vocabularyLists.map((list) => (
                    <Card key={list.id} className="border-border">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedListIds.has(list.id)}
                            onCheckedChange={(checked) =>
                              handleSelectList(list.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold">{list.name}</h3>
                            {list.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {list.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {list.cards.length} words
                              </Badge>
                              {list.difficultyLevel && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getDifficultyColor(list.difficultyLevel)}`}
                                >
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {formatDifficulty(list.difficultyLevel)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingList(list)}
                              >
                                <FileEdit className="h-3 w-3 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFromClass(list.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Remove from Class
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Game Links ({gameLinks.length})
              </CardTitle>
              <CardDescription>
                Active game links for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gameLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No game links created for this class yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gameLinks.map((link) => (
                    <Card key={link.id} className="border-border">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold">{link.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Code: <span className="font-mono font-bold">{link.code}</span>
                            </p>
                          </div>
                          {link.vocabulary_lists && (
                            <div>
                              <p className="text-sm font-medium mb-1">Using:</p>
                              <Badge variant="secondary">
                                {link.vocabulary_lists.name}
                              </Badge>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyGameLink(link.code)}
                            >
                              <Copy className="h-3 w-3 mr-2" />
                              Copy Link
                            </Button>
                            <Link href={`/play/${link.code}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                Open
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create Game Link Dialog */}
      <CreateGameLinkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadClassData}
        defaultClassId={classId}
        filterToListIds={vocabularyLists.map(l => l.id)}
        preSelectedListIds={Array.from(selectedListIds)}
      />

      {/* Edit Vocabulary List Dialog */}
      {editingList && (
        <EditVocabularyListDialog
          list={editingList}
          open={!!editingList}
          onOpenChange={(open) => !open && setEditingList(null)}
          onSuccess={() => {
            setEditingList(null);
            loadClassData();
          }}
        />
      )}
    </div>
  );
}
