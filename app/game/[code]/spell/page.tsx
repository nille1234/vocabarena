"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, Trophy, CheckCircle2, XCircle, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { shuffleArray } from "@/lib/utils/gameLogic";
import confetti from "canvas-confetti";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";

export default function SpellPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get vocabulary from game store (set by /play/[code])
  const { vocabulary, loading, error } = useGameVocabulary();

  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  const [cards] = useState(() => vocabulary ? shuffleArray(vocabulary) : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [score, setScore] = useState(0);

  // Show loading state while redirecting
  if (!vocabulary || cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isLastCard = currentIndex === cards.length - 1;

  useEffect(() => {
    // Auto-play pronunciation when card loads
    speakWord();
  }, [currentIndex]);

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentCard.term);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || showResult) return;

    const correct = userInput.trim().toLowerCase() === currentCard.term.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setCorrectCount(correctCount + 1);
      setScore(score + 100);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#34D399'],
      });
    } else {
      setIncorrectCount(incorrectCount + 1);
    }
  };

  const handleNext = () => {
    if (isLastCard) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#A78BFA', '#34D399'],
      });
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  if (isLastCard && showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="pt-12 pb-12">
                <Trophy className="h-20 w-20 text-primary mx-auto mb-6" />
                <h2 className="text-4xl font-heading font-bold mb-4">
                  Spelling Complete!
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  You've practiced all {cards.length} words
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {score}
                      </div>
                      <p className="text-sm text-muted-foreground">Score</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl font-bold text-green-500 mb-2">
                        {correctCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl font-bold text-red-500 mb-2">
                        {incorrectCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button size="lg" onClick={() => window.location.reload()}>
                    <Zap className="mr-2 h-5 w-5" />
                    Practice Again
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => router.push(`/lobby/${gameCode}`)}>
                    Back to Lobby
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/lobby/${gameCode}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lobby
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-bold text-green-500">{correctCount}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-bold text-red-500">{incorrectCount}</span>
            </div>

            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Word {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Spelling Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <Badge variant="secondary" className="mb-4">
                      Listen & Spell
                    </Badge>

                    {/* Audio Button */}
                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={speakWord}
                        className="h-24 w-24 rounded-full"
                      >
                        <Volume2 className="h-12 w-12" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground">
                      Listen to the word and type what you hear
                    </p>

                    {/* Definition Hint */}
                    <Card className="border-border/50 bg-muted/20">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-2">Definition:</p>
                        <p className="text-lg">{currentCard.definition}</p>
                      </CardContent>
                    </Card>

                    {/* Input Form */}
                    {!showResult ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          ref={inputRef}
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Type the word here..."
                          className="text-2xl h-16 text-center"
                          autoFocus
                          disabled={showResult}
                        />
                        <Button type="submit" size="lg" className="w-full h-14 text-lg">
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Check Spelling
                        </Button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        {/* Result */}
                        <Card className={`border-2 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                                  <span className="text-2xl font-bold text-green-500">Correct!</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-8 w-8 text-red-500" />
                                  <span className="text-2xl font-bold text-red-500">Incorrect</span>
                                </>
                              )}
                            </div>
                            
                            {!isCorrect && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">You wrote:</p>
                                <p className="text-xl line-through text-red-500">{userInput}</p>
                                <p className="text-sm text-muted-foreground mt-4">Correct spelling:</p>
                                <p className="text-3xl font-bold text-green-500">{currentCard.term}</p>
                              </div>
                            )}
                            
                            {isCorrect && (
                              <p className="text-3xl font-bold text-green-500">{currentCard.term}</p>
                            )}
                          </CardContent>
                        </Card>

                        <Button
                          size="lg"
                          className="w-full h-14 text-lg"
                          onClick={handleNext}
                        >
                          {isLastCard ? 'View Results' : 'Next Word'}
                          <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
