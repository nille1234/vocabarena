"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCw, Volume2, Flame, Trophy, X, Check, Loader2, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { shuffleArray } from "@/lib/utils/gameLogic";
import confetti from "canvas-confetti";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  
  const [cards, setCards] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<string[]>([]);
  const [learningCards, setLearningCards] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  // Initialize cards when vocabulary is loaded
  useEffect(() => {
    if (vocabulary && !isInitialized) {
      setCards(shuffleArray(vocabulary));
      setIsInitialized(true);
    }
  }, [vocabulary, isInitialized]);

  // Show loading state
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

  // Show error state
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

  // Show loading while cards are being initialized
  if (!vocabulary || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing flashcards...</p>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isLastCard = currentIndex === cards.length - 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnow = () => {
    setKnownCards([...knownCards, currentCard.id]);
    setStreak(streak + 1);
    setScore(score + 10);
    
    // Streak milestone celebration
    if ((streak + 1) % 5 === 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#60A5FA', '#34D399'],
      });
    }
    
    nextCard();
  };

  const handleLearning = () => {
    setLearningCards([...learningCards, currentCard.id]);
    setStreak(0);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (isLastCard) {
      // Game complete
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#A78BFA', '#34D399'],
      });
      setTimeout(() => {
        router.push(`/play/${gameCode}`);
      }, 2000);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentCard.term);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/play/${gameCode}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
          
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2"
              >
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-orange-500">{streak}</span>
              </motion.div>
            )}
            
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
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="perspective-1000">
                <motion.div
                  className="relative w-full cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  onClick={handleFlip}
                >
                  {/* Front of card */}
                  <Card
                    className="absolute inset-0 backface-hidden border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-12">
                      <Badge variant="secondary" className="mb-6">
                        Term
                      </Badge>
                      <h2 className="text-5xl md:text-6xl font-heading font-bold text-center mb-8">
                        {currentCard.term}
                      </h2>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord();
                        }}
                        className="gap-2"
                      >
                        <Volume2 className="h-5 w-5" />
                        Pronounce
                      </Button>
                      <p className="text-muted-foreground text-sm mt-8">
                        Click to reveal definition
                      </p>
                    </CardContent>
                  </Card>

                  {/* Back of card */}
                  <Card
                    className="backface-hidden border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 to-accent/10 backdrop-blur"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-12">
                      <Badge variant="secondary" className="mb-6">
                        Definition
                      </Badge>
                      <h2 className="text-5xl md:text-6xl font-heading font-bold text-center mb-8">
                        {currentCard.definition}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-8">
                        Click to flip back
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Action Buttons */}
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4 mt-8"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-16 text-lg border-destructive/50 hover:bg-destructive/10"
                    onClick={handleLearning}
                  >
                    <X className="mr-2 h-6 w-6" />
                    Still Learning
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700"
                    onClick={handleKnow}
                  >
                    <Check className="mr-2 h-6 w-6" />
                    I Know This
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

                <Button variant="ghost" onClick={handleFlip}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Flip Card
                </Button>

                <Button
                  variant="ghost"
                  onClick={nextCard}
                  disabled={!isFlipped}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mt-8"
          >
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">
                  {knownCards.length}
                </div>
                <p className="text-sm text-muted-foreground">Known</p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">
                  {learningCards.length}
                </div>
                <p className="text-sm text-muted-foreground">Learning</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
