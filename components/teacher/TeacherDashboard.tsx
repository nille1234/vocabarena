"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Loader2, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { CreateGameLinkDialog } from "@/components/teacher/CreateGameLinkDialog";
import { EditGameLinkDialog } from "@/components/teacher/EditGameLinkDialog";
import { InviteTeacherDialog } from "@/components/teacher/InviteTeacherDialog";
import { ChangePasswordDialog } from "@/components/teacher/ChangePasswordDialog";
import { toast } from "sonner";
import {
  getAllVocabularyLists,
  getAllGameLinks,
} from "@/lib/supabase/vocabularyManagement";
import { getCurrentUserProfile, getAllUsers, UserProfile } from "@/lib/supabase/userManagement";
import { VocabularyList, GameLink } from "@/types/game";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Link as LinkIcon } from "lucide-react";
import { VocabularyListsTab } from "./VocabularyListsTab";
import { GameLinksTab } from "./GameLinksTab";
import { UserManagementTab } from "./UserManagementTab";
import { LogoutButton } from "@/components/logout-button";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface TeacherDashboardProps {
  userId: string;
  userEmail: string;
}

export function TeacherDashboard({ userId, userEmail }: TeacherDashboardProps) {
  const router = useRouter();
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGameLink, setEditingGameLink] = useState<GameLink | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  
  // Data
  const [vocabularyLists, setVocabularyLists] = useState<VocabularyList[]>([]);
  const [gameLinks, setGameLinks] = useState<GameLink[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);

  // Client-side authentication verification with periodic checks
  useEffect(() => {
    let isSubscribed = true;
    let intervalId: NodeJS.Timeout;

    const verifyAuth = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // If component unmounted, don't update state
      if (!isSubscribed) return;
      
      // If no user or error, redirect to login
      if (!user || error || user.id !== userId) {
        console.error('Authentication verification failed:', error);
        toast.error('Session expired. Please log in again.');
        router.push('/auth/login?redirectTo=/teacher');
        return;
      }
      
      setAuthVerified(true);
    };
    
    // Initial verification
    verifyAuth();

    // Set up periodic session validation (every 30 seconds)
    intervalId = setInterval(() => {
      verifyAuth();
    }, 30000);

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        toast.error('Session expired. Please log in again.');
        router.push('/auth/login?redirectTo=/teacher');
      }
    });

    // Cleanup
    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, [userId, router]);

  useEffect(() => {
    if (authVerified) {
      loadData();
    }
  }, [authVerified]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading teacher dashboard data...');
      const [lists, links, profile, allUsers] = await Promise.all([
        getAllVocabularyLists(),
        getAllGameLinks(),
        getCurrentUserProfile(),
        getAllUsers()
      ]);
      console.log('Loaded data:', { 
        listsCount: lists.length, 
        linksCount: links.length, 
        profile, 
        usersCount: allUsers.length 
      });
      console.log('Current user profile details:', {
        id: profile?.id,
        role: profile?.role,
        email: profile?.email,
        isSuperAdmin: profile?.role === 'super_admin'
      });
      setVocabularyLists(lists);
      setGameLinks(links);
      setCurrentUserProfile(profile);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while verifying authentication
  if (!authVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Verifying Authentication</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your credentials...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsChangePasswordDialogOpen(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <LogoutButton />
          </div>
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
            <TabsList className={`grid w-full ${currentUserProfile?.role === 'super_admin' ? 'grid-cols-3' : 'grid-cols-2'} max-w-2xl`}>
              <TabsTrigger value="links">
                <LinkIcon className="h-4 w-4 mr-2" />
                Game Links
              </TabsTrigger>
              <TabsTrigger value="vocabulary">
                <BookOpen className="h-4 w-4 mr-2" />
                Vocabulary Lists
              </TabsTrigger>
              {currentUserProfile?.role === 'super_admin' && (
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </TabsTrigger>
              )}
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

            {/* User Management Tab (Super Admin Only) */}
            {currentUserProfile?.role === 'super_admin' && (
              <TabsContent value="users" className="space-y-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl">User Management</CardTitle>
                    <CardDescription>
                      Manage teacher accounts and invitations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      </div>
                    ) : (
                      <UserManagementTab 
                        users={users}
                        currentUserId={currentUserProfile?.id || ''}
                        onInviteTeacher={() => setIsInviteDialogOpen(true)}
                        onUserDeleted={loadData}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
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

      {/* Invite Teacher Dialog */}
      <InviteTeacherDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSuccess={loadData}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
    </div>
  );
}
