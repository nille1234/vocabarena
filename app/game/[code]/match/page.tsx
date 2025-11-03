"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Timer, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { shuffleArray, getRandomCards } from "@/lib/utils/gameLogic";
import confetti from "canvas-confetti";

type MatchCard = {
  id: string;
  content: string;
  type: 'term' | 'definition';
  originalId: string;
  matched: boolean;
};

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const vocabulary = useGameVocabulary();
  
  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Create match cards from vocabulary - use 15 random pairs
    const gameCards = getRandomCards(vocabulary || [], 15);
    const matchCards: MatchCard[] = [];
    
    gameCards.forEach(card => {
      matchCards.push({
        id: `${card.id}-term`,
        content: card.term,
        type: 'term',
        originalId: card.id,
        matched: false,
      });
      matchCards.push({
        id: `${card.id}-def`,
        content: card.definition,
        type: 'definition',
        originalId: card.id,
        matched: false,
      });
    });

    setCards(shuffleArray(matchCards));
  }, []);

  useEffect(() => {
    if (!isComplete && cards.length > 0) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isComplete, cards.length]);

  useEffect(() => {
    if (matchedPairs.length === 15 && !isComplete) {
      setIsComplete(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#A78BFA', '#34D399'],
      });
    }
  }, [matchedPairs, isComplete]);

  const handleCardClick = (card: MatchCard) => {
    if (card.matched || selectedCards.find(c => c.id === card.id)) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      
      if (first.originalId === second.originalId && first.type !== second.type) {
        // Match found!
        setMatchedPairs([...matchedPairs, first.originalId]);
        setCards(cards.map(c => 
          c.originalId === first.originalId ? { ...c, matched: true } : c
        ));
        setScore(score + 100);
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#34D399'],
        });
        setSelectedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (matchedPairs.length / 15) * 100;

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
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">{formatTime(timeElapsed)}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2">
              <Trophy className="h-5 w-5 text-secondary" />
              <span className="font-bold text-secondary">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {matchedPairs.length} of 15 pairs matched
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Game Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-3">
            <AnimatePresence>
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <Card
                    className={`
                      cursor-pointer transition-all duration-300 hover:scale-105
                      ${card.matched ? 'opacity-50 border-green-500 bg-green-500/10' : ''}
                      ${selectedCards.find(c => c.id === card.id) ? 'border-primary bg-primary/20 scale-105' : 'border-border'}
                      ${card.type === 'term' ? 'bg-blue-500/5' : 'bg-purple-500/5'}
                    `}
                    onClick={() => handleCardClick(card)}
                  >
                    <CardContent className="p-6 min-h-[120px] flex flex-col items-center justify-center">
                      <Badge variant="secondary" className="mb-3 text-xs">
                        {card.type === 'term' ? 'Term' : 'Definition'}
                      </Badge>
                      <p className="text-center font-medium text-sm">
                        {card.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Completion Message */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-heading font-bold mb-2">
                    Perfect Match!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You completed all matches in {formatTime(timeElapsed)}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => window.location.reload()}>
                      <Zap className="mr-2 h-4 w-4" />
                      Play Again
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/lobby/${gameCode}`)}>
                      Back to Lobby
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
