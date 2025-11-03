"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Volume2, Star, Trophy, CheckCircle2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  
  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  const [cards] = useState(() => vocabulary || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [studyingCards, setStudyingCards] = useState<string[]>([]);
  const [showDefinition, setShowDefinition] = useState(false);

  // Show loading state while redirecting
  if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isLastCard = currentIndex === cards.length - 1;

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentCard.term);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMastered = () => {
    if (!masteredCards.includes(currentCard.id)) {
      setMasteredCards([...masteredCards, currentCard.id]);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#34D399'],
      });
    }
    nextCard();
  };

  const handleStudying = () => {
    if (!studyingCards.includes(currentCard.id)) {
      setStudyingCards([...studyingCards, currentCard.id]);
    }
    nextCard();
  };

  const nextCard = () => {
    setShowDefinition(false);
    if (isLastCard) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#A78BFA', '#34D399'],
      });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setShowDefinition(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLastCard && showDefinition && masteredCards.includes(currentCard.id)) {
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
                  Learning Complete!
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  You've reviewed all {cards.length} vocabulary words
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl font-bold text-green-500 mb-2">
                        {masteredCards.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Mastered</p>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl font-bold text-orange-500 mb-2">
                        {studyingCards.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Still Studying</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button size="lg" onClick={() => window.location.reload()}>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Study Again
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
              <Star className="h-5 w-5 text-green-500" />
              <span className="font-bold text-green-500">{masteredCards.length}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Learning Card */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Term Section */}
                    <div>
                      <Badge variant="secondary" className="mb-4">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Term
                      </Badge>
                      <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                        {currentCard.term}
                      </h2>
                      <Button
                        variant="outline"
                        onClick={speakWord}
                        className="gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        Pronounce
                      </Button>
                    </div>

                    {/* Definition Section */}
                    <div className="pt-6 border-t border-border">
                      <Badge variant="secondary" className="mb-4">
                        Definition
                      </Badge>
                      <AnimatePresence mode="wait">
                        {!showDefinition ? (
                          <motion.div
                            key="hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => setShowDefinition(true)}
                              className="w-full h-20 text-lg"
                            >
                              Click to reveal definition
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="shown"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <p className="text-2xl md:text-3xl leading-relaxed">
                              {currentCard.definition}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {showDefinition && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4 mt-6"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-16 text-lg"
                    onClick={handleStudying}
                  >
                    <BookOpen className="mr-2 h-6 w-6" />
                    Still Learning
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700"
                    onClick={handleMastered}
                  >
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    I've Got This!
                  </Button>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="ghost"
                  onClick={previousCard}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowDefinition(!showDefinition)}
                >
                  {showDefinition ? 'Hide' : 'Show'} Definition
                </Button>

                <Button
                  variant="ghost"
                  onClick={nextCard}
                  disabled={!showDefinition}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mt-8"
          >
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">
                  {masteredCards.length}
                </div>
                <p className="text-sm text-muted-foreground">Mastered</p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">
                  {studyingCards.length}
                </div>
                <p className="text-sm text-muted-foreground">Studying</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
