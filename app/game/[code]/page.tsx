"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Sparkles, Play, AlertCircle, LayoutDashboard } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/gameStore";
import { checkGameAccessClient } from "@/lib/supabase/gameAccess.client";
import { GameMode } from "@/types/game";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export default function GameSelectorPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  
  const { session, getSessionByCode } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [enabledGames, setEnabledGames] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  
  // Get session from store by code
  const currentSession = session?.code === gameCode ? session : getSessionByCode(gameCode);
  
  // Check if user is a teacher
  useEffect(() => {
    async function checkTeacherStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsTeacher(profile?.role === 'teacher' || profile?.role === 'super_admin');
      }
    }
    
    checkTeacherStatus();
  }, []);
  
  // Fetch enabled games for this game code
  useEffect(() => {
    async function fetchEnabledGames() {
      setLoading(true);
      setError(null);
      
      const result = await checkGameAccessClient(gameCode);
      
      if (!result.allowed || result.error) {
        setError(result.error || 'Unable to access this game session');
        setEnabledGames([]);
      } else {
        setEnabledGames(result.enabledGames);
      }
      
      setLoading(false);
    }
    
    fetchEnabledGames();
  }, [gameCode]);
  
  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Available game modes with descriptions
  const gameModes = [
    { 
      id: 'flashcards', 
      name: 'Flashcards', 
      icon: '🎴',
      description: 'Study vocabulary with interactive flashcards',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    { 
      id: 'match', 
      name: 'Match', 
      icon: '🎯',
      description: 'Match terms with their definitions',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    { 
      id: 'gravity', 
      name: 'Gravity', 
      icon: '🚀',
      description: 'Type answers before words fall',
      color: 'from-pink-500/20 to-pink-600/20'
    },
    { 
      id: 'hangman', 
      name: 'Hangman', 
      icon: '🎮',
      description: 'Guess the word letter by letter',
      color: 'from-indigo-500/20 to-indigo-600/20'
    },
    { 
      id: 'word-ladder', 
      name: 'Word Ladder', 
      icon: '🪜',
      description: 'Climb the ladder of words',
      color: 'from-teal-500/20 to-teal-600/20'
    },
    { 
      id: 'speed-challenge', 
      name: 'Speed Challenge', 
      icon: '⚡',
      description: 'Answer as fast as you can',
      color: 'from-amber-500/20 to-amber-600/20'
    },
    { 
      id: 'survival', 
      name: 'Survival', 
      icon: '💪',
      description: 'Survive as long as possible',
      color: 'from-rose-500/20 to-rose-600/20'
    },
    { 
      id: 'memory', 
      name: 'Memory', 
      icon: '🧠',
      description: 'Match pairs of cards',
      color: 'from-fuchsia-500/20 to-fuchsia-600/20'
    },
    { 
      id: 'othello', 
      name: 'Othello', 
      icon: '⚫',
      description: 'Strategic board game',
      color: 'from-slate-500/20 to-slate-600/20'
    },
    { 
      id: 'tic-tac-toe', 
      name: 'Five-in-a-Row', 
      icon: '❌',
      description: '10×10 tic-tac-toe',
      color: 'from-emerald-500/20 to-emerald-600/20'
    },
    { 
      id: 'hex', 
      name: 'Hex', 
      icon: '⬡',
      description: 'Connect your sides',
      color: 'from-sky-500/20 to-sky-600/20'
    },
    { 
      id: 'crossword', 
      name: 'Crossword', 
      icon: '📋',
      description: 'Solve the crossword puzzle',
      color: 'from-stone-500/20 to-stone-600/20'
    },
  ];

  // Show loading if not mounted yet or no session is available
  if (!mounted || !currentSession || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-muted-foreground">Loading game session...</p>
          <p className="text-sm text-muted-foreground mt-2">Game code: {gameCode}</p>
        </div>
      </div>
    );
  }

  // Show error if game access validation failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter game modes to only show enabled ones
  const availableGameModes = gameModes.filter(mode => 
    enabledGames.includes(mode.id as GameMode)
  );

  // Show message if no games are enabled
  if (availableGameModes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>No Games Available</CardTitle>
            </div>
            <CardDescription>
              No games have been enabled for this session. Please contact your teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSelectMode = (modeId: string) => {
    router.push(`/game/${gameCode}/${modeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button and Teacher Dashboard Button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {isTeacher && (
            <Button 
              variant="outline"
              onClick={() => router.push('/teacher')}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Teacher Dashboard
            </Button>
          )}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Choose Your Game
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a game mode to start learning
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Vocabulary Set Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {currentSession.name || `Game ${gameCode}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        English to Danish vocabulary
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {currentSession.cards.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Words</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {availableGameModes.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Modes Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableGameModes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                >
                  <Card 
                    className={`
                      border-2 border-border/50 cursor-pointer transition-all duration-300 
                      hover:scale-105 hover:border-primary/50 hover:shadow-lg
                      bg-gradient-to-br ${mode.color}
                    `}
                    onClick={() => handleSelectMode(mode.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-5xl mb-2">{mode.icon}</div>
                        <Badge variant="secondary" className="text-xs">
                          Play
                        </Badge>
                      </div>
                      <CardTitle className="font-heading text-xl">
                        {mode.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {mode.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMode(mode.id);
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Game
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Learning Tips</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Try different game modes to find your favorite learning style</li>
                      <li>• Practice regularly for better retention</li>
                      <li>• Challenge yourself with timed modes for extra practice</li>
                      <li>• Review your mistakes to improve faster</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
