"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { CreateGameLinkDialog } from "@/components/teacher/CreateGameLinkDialog";
import { EditGameLinkDialog } from "@/components/teacher/EditGameLinkDialog";
import { toast } from "sonner";
import {
  getAllVocabularyLists,
  getAllGameLinks,
} from "@/lib/supabase/vocabularyManagement";
import { VocabularyList, GameLink } from "@/types/game";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Link as LinkIcon } from "lucide-react";
import { VocabularyListsTab } from "./VocabularyListsTab";
import { GameLinksTab } from "./GameLinksTab";
import { LogoutButton } from "@/components/logout-button";

export function TeacherDashboard() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGameLink, setEditingGameLink] = useState<GameLink | null>(null);
  
  // Data
  const [vocabularyLists, setVocabularyLists] = useState<VocabularyList[]>([]);
  const [gameLinks, setGameLinks] = useState<GameLink[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lists, links] = await Promise.all([
        getAllVocabularyLists(),
        getAllGameLinks()
      ]);
      setVocabularyLists(lists);
      setGameLinks(links);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <LogoutButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage vocabulary lists and create game links for students
          </p>
        </motion.div>

        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 backdrop-blur">
            <CardContent className="pt-6">
              <Button
                size="lg"
                className="w-full h-16 text-xl"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-6 w-6" />
                Create New Game Link
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="links" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="links">
                <LinkIcon className="h-4 w-4 mr-2" />
                Game Links
              </TabsTrigger>
              <TabsTrigger value="vocabulary">
                <BookOpen className="h-4 w-4 mr-2" />
                Vocabulary Lists
              </TabsTrigger>
            </TabsList>

            {/* Game Links Tab */}
            <TabsContent value="links" className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-2xl">Game Links</CardTitle>
                    <Badge variant="secondary">
                      {gameLinks.filter(l => l.isActive).length} Active
                    </Badge>
                  </div>
                  <CardDescription>
                    Shareable links for students with selected games
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : (
                    <GameLinksTab 
                      gameLinks={gameLinks}
                      onEdit={setEditingGameLink}
                      onRefresh={loadData}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vocabulary Lists Tab */}
            <TabsContent value="vocabulary" className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Vocabulary Lists</CardTitle>
                  <CardDescription>
                    Saved vocabulary lists that can be reused
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : (
                    <VocabularyListsTab 
                      vocabularyLists={vocabularyLists}
                      onRefresh={loadData}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Create Game Link Dialog */}
      <CreateGameLinkDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadData}
      />

      {/* Edit Game Link Dialog */}
      <EditGameLinkDialog
        open={!!editingGameLink}
        onOpenChange={(open) => !open && setEditingGameLink(null)}
        gameLink={editingGameLink}
        onSuccess={loadData}
      />
    </div>
  );
}
