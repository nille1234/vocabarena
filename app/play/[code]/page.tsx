"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Sparkles, Play, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getGameLinkByCode } from "@/lib/supabase/vocabularyManagement";
import { GameLink, GameMode } from "@/types/game";
import { useGameStore } from "@/lib/store/gameStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ALL_GAME_MODES } from "@/lib/constants/gameModes";

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { setSession } = useGameStore();
  
  const [gameLink, setGameLink] = useState<GameLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGameLink() {
      try {
        setLoading(true);
        const link = await getGameLinkByCode(code);
        
        if (!link) {
          setError('Game link not found. Please check the code and try again.');
          return;
        }

        if (!link.isActive) {
          setError('This game link is no longer active.');
          return;
        }

        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
          setError('This game link has expired.');
          return;
        }

        if (!link.vocabularyList) {
          setError('Vocabulary list not found for this game.');
          return;
        }

        setGameLink(link);
        
        // Store the vocabulary in the game store for use in games
        // Include the vocabulary list and crossword settings
        const session: any = {
          id: `session-${code}`,
          code: code,
          name: link.name,
          mode: 'flashcards', // Default mode
          status: 'waiting',
          cards: link.vocabularyList.cards,
          vocabularyList: link.vocabularyList, // Include full vocabulary list with language
          settings: {
            cardCount: link.vocabularyList.cards.length,
            crosswordWordCount: (link as any).crosswordWordCount || 10, // Include crossword settings
            allowHints: true,
            playMusic: true,
            playSFX: true,
          },
        };
        
        setSession(session);
      } catch (err) {
        console.error('Error loading game link:', err);
        setError('Failed to load game. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadGameLink();
  }, [code, setSession]);

  const handleSelectMode = (modeId: string) => {
    router.push(`/game/${code}/${modeId}`);
  };

  // Filter game modes to only show enabled ones
  const enabledGameModes = gameLink 
    ? ALL_GAME_MODES.filter(mode => gameLink.enabledGames.includes(mode.id as GameMode))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!gameLink) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-8"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

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
            {gameLink.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a game to start learning
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
                        {gameLink.vocabularyList?.name}
                      </h3>
                      {gameLink.vocabularyList?.description && (
                        <p className="text-sm text-muted-foreground">
                          {gameLink.vocabularyList.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {gameLink.vocabularyList?.cards.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Words</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {enabledGameModes.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Games</p>
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
            {enabledGameModes.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">
                    No games are currently available for this session.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enabledGameModes.map((mode, index) => (
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
            )}
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
