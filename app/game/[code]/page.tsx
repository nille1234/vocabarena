"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Sparkles, Play } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/gameStore";

export default function GameSelectorPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  
  const { session, getSessionByCode } = useGameStore();
  
  // Get session from store by code
  const currentSession = session?.code === gameCode ? session : getSessionByCode(gameCode);
  
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
      id: 'learn', 
      name: 'Learn', 
      icon: '📚',
      description: 'Learn vocabulary step by step',
      color: 'from-green-500/20 to-green-600/20'
    },
    { 
      id: 'spell', 
      name: 'Spell', 
      icon: '✍️',
      description: 'Practice spelling vocabulary words',
      color: 'from-yellow-500/20 to-yellow-600/20'
    },
    { 
      id: 'test', 
      name: 'Test', 
      icon: '📝',
      description: 'Test your knowledge with questions',
      color: 'from-red-500/20 to-red-600/20'
    },
    { 
      id: 'hangman', 
      name: 'Hangman', 
      icon: '🎮',
      description: 'Guess the word letter by letter',
      color: 'from-indigo-500/20 to-indigo-600/20'
    },
    { 
      id: 'falling-words', 
      name: 'Falling Words', 
      icon: '⬇️',
      description: 'Catch falling words quickly',
      color: 'from-cyan-500/20 to-cyan-600/20'
    },
    { 
      id: 'mystery-word', 
      name: 'Mystery Word', 
      icon: '🔍',
      description: 'Reveal the hidden word',
      color: 'from-orange-500/20 to-orange-600/20'
    },
    { 
      id: 'word-ladder', 
      name: 'Word Ladder', 
      icon: '🪜',
      description: 'Climb the ladder of words',
      color: 'from-teal-500/20 to-teal-600/20'
    },
    { 
      id: 'word-maze', 
      name: 'Word Maze', 
      icon: '🌀',
      description: 'Navigate through a word maze',
      color: 'from-violet-500/20 to-violet-600/20'
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
      id: 'sentence-builder', 
      name: 'Sentence Builder', 
      icon: '🔨',
      description: 'Build sentences with vocabulary',
      color: 'from-lime-500/20 to-lime-600/20'
    },
  ];

  // Show loading if no session is available
  if (!currentSession) {
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

  const handleSelectMode = (modeId: string) => {
    router.push(`/game/${gameCode}/${modeId}`);
  };

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
                        {gameModes.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Modes</p>
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
              {gameModes.map((mode, index) => (
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
