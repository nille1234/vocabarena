"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, BookOpen, Link as LinkIcon, GraduationCap, BookMarked, ChevronRight } from "lucide-react";
import { Class } from "@/types/game";
import { deleteClass, getClassStats } from "@/lib/supabase/classManagement";
import { toast } from "sonner";
import { CreateClassDialog } from "./CreateClassDialog";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClassesTabProps {
  classes: Class[];
  onRefresh: () => void;
  onCreateClass: () => void;
}

export function ClassesTab({ classes, onRefresh, onCreateClass }: ClassesTabProps) {
  const router = useRouter();
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [classStats, setClassStats] = useState<Record<string, { gameLinksCount: number; vocabListsCount: number }>>({});

  // Load stats for all classes
  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<string, { gameLinksCount: number; vocabListsCount: number }> = {};
      for (const cls of classes) {
        try {
          stats[cls.id] = await getClassStats(cls.id);
        } catch (error) {
          console.error(`Error loading stats for class ${cls.id}:`, error);
          stats[cls.id] = { gameLinksCount: 0, vocabListsCount: 0 };
        }
      }
      setClassStats(stats);
    };

    if (classes.length > 0) {
      loadStats();
    }
  }, [classes]);

  const handleDelete = async () => {
    if (!deletingClass) return;

    try {
      await deleteClass(deletingClass.id);
      toast.success("Class deleted successfully");
      onRefresh();
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    } finally {
      setDeletingClass(null);
    }
  };

  if (classes.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Classes Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first class to organize game links and vocabulary lists
          </p>
          <Button onClick={onCreateClass}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Class
          </Button>
        </div>

        <CreateClassDialog
          open={!!editingClass}
          onOpenChange={(open) => !open && setEditingClass(null)}
          editingClass={editingClass}
          onSuccess={onRefresh}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls, index) => {
          const stats = classStats[cls.id] || { gameLinksCount: 0, vocabListsCount: 0 };
          
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <div onClick={() => router.push(`/teacher/class/${cls.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1 flex items-center gap-2">
                          {cls.name}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardTitle>
                        {cls.description && (
                          <CardDescription className="line-clamp-2">
                            {cls.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {cls.gradeLevel && (
                        <Badge variant="secondary" className="text-xs">
                          {cls.gradeLevel}
                        </Badge>
                      )}
                      {cls.subject && (
                        <Badge variant="outline" className="text-xs">
                          {cls.subject}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {stats.gameLinksCount} {stats.gameLinksCount === 1 ? 'Link' : 'Links'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-secondary" />
                        <span className="text-muted-foreground">
                          {stats.vocabListsCount} {stats.vocabListsCount === 1 ? 'List' : 'Lists'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Actions - prevent click propagation */}
                <CardContent className="pt-0">
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClass(cls);
                      }}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingClass(cls);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <CreateClassDialog
        open={!!editingClass}
        onOpenChange={(open) => !open && setEditingClass(null)}
        editingClass={editingClass}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingClass} onOpenChange={(open) => !open && setDeletingClass(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingClass?.name}"? This will unassign all game links and vocabulary lists from this class, but won't delete them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
