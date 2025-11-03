"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, Trophy, Sparkles, BookOpen, GraduationCap, Link as LinkIcon, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation Header */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-heading font-bold">VocabArena</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-block">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-primary/10 border border-primary/20 rounded-full px-6 py-2 mb-6"
            >
              <span className="text-primary font-medium text-sm">
                🎮 Interactive Vocabulary Learning
              </span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              VocabArena
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Create engaging vocabulary games for your students. Share game links and let them learn through play!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6"
          >
            <Link href="/teacher">
              <Button size="lg" className="text-lg px-8 h-14">
                <Sparkles className="mr-2 h-5 w-5" />
                Go to Teacher Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to get your students learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">1</div>
                <CardTitle className="font-heading text-xl">Create Game Links</CardTitle>
                <CardDescription className="text-base">
                  Choose vocabulary sets and game modes in the teacher dashboard
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/50 bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mx-auto mb-4">
                  <LinkIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="text-4xl font-bold text-accent mb-2">2</div>
                <CardTitle className="font-heading text-xl">Share Links</CardTitle>
                <CardDescription className="text-base">
                  Copy and share game links with your students via email, LMS, or messaging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/50 bg-gradient-to-br from-secondary/10 to-primary/10 backdrop-blur">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-secondary" />
                </div>
                <div className="text-4xl font-bold text-secondary mb-2">3</div>
                <CardTitle className="font-heading text-xl">Students Play</CardTitle>
                <CardDescription className="text-base">
                  Students click the link and start learning - no login or code entry required!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              18 Engaging Game Modes
            </h2>
            <p className="text-muted-foreground text-lg">
              From flashcards to strategy games, find the perfect way to teach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-heading text-xl">Study Modes</CardTitle>
                <CardDescription>
                  Flashcards, Learn, and Test modes for focused vocabulary practice
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-heading text-xl">Action Games</CardTitle>
                <CardDescription>
                  Speed Challenge, Falling Words, Gravity, and more fast-paced games
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mx-auto mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="font-heading text-xl">Strategy Games</CardTitle>
                <CardDescription>
                  Tic-Tac-Toe, Hex, Othello - students compete while learning
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>

        {/* Teacher Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-24"
        >
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 backdrop-blur">
            <CardHeader className="text-center space-y-6 py-12">
              <CardTitle className="text-3xl md:text-4xl font-heading font-bold">
                Teacher Features
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Everything you need to create engaging vocabulary learning experiences
              </CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 max-w-3xl mx-auto text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Custom Vocabulary Sets</p>
                    <p className="text-sm text-muted-foreground">Create and manage your own word lists</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Choose Game Modes</p>
                    <p className="text-sm text-muted-foreground">Select which games students can access</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Shareable Links</p>
                    <p className="text-sm text-muted-foreground">Generate unique links for each game session</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">No Student Login</p>
                    <p className="text-sm text-muted-foreground">Students access games directly via links</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/teacher">
                  <Button size="lg" className="text-lg px-8 h-14">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>VocabArena - Interactive Vocabulary Learning Platform</p>
          <p className="text-sm mt-2">Built with Next.js, Tailwind CSS, and shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}
