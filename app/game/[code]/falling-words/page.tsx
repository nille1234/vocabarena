"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { getRandomCards } from "@/lib/utils/gameLogic";
import { getAudioManager } from "@/lib/utils/audioManager";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import confetti from "canvas-confetti";

type FallingWord = {
  id: string;
  term: string;
  definition: string;
  position: number; // 0-100 percentage from top
  speed: number;
  lane: number; // 0-2 for three lanes
};

export default function FallingWordsPage() {
  const router = useRouter();
  const params = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { vocabulary, loading, error } = useGameVocabulary();

  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');

  const audioManager = getAudioManager();
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Spawn a new falling word
  const spawnWord = useCallback(() => {
    if (isGameOver || !vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) return;

    const randomCard = vocabulary[
      Math.floor(Math.random() * vocabulary.length)
    ];

    const baseSpeed = gameSpeed === 'slow' ? 0.3 : gameSpeed === 'medium' ? 0.5 : 0.7;
    const newWord: FallingWord = {
      id: `${randomCard.id}-${Date.now()}`,
      term: randomCard.term,
      definition: randomCard.definition,
      position: 0,
      speed: baseSpeed + (level * 0.1), // Speed increases with level
      lane: Math.floor(Math.random() * 3),
    };

    setFallingWords(prev => [...prev, newWord]);
    setTotalWords(prev => prev + 1);
  }, [level, isGameOver, vocabulary]);

  // Game loop - move words down
  useEffect(() => {
    if (isGameOver) return;

    gameLoopRef.current = setInterval(() => {
      setFallingWords(prev => {
        const updated = prev.map(word => ({
          ...word,
          position: word.position + word.speed,
        }));

        // Check for words that reached the bottom
        const reachedBottom = updated.filter(w => w.position >= 100);
        if (reachedBottom.length > 0) {
          setLives(current => {
            const newLives = current - reachedBottom.length;
            if (newLives <= 0) {
              setIsGameOver(true);
            }
            return Math.max(0, newLives);
          });
          if (!isMuted) audioManager.playFall();
        }

        // Remove words that reached bottom
        return updated.filter(w => w.position < 100);
      });
    }, 50);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isGameOver, isMuted, audioManager]);

  // Spawn words periodically
  useEffect(() => {
    if (isGameOver) return;

    const spawnInterval = Math.max(2000 - (level * 200), 1000); // Faster spawning at higher levels
    spawnTimerRef.current = setInterval(spawnWord, spawnInterval);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [spawnWord, level, isGameOver]);

  // Initial spawn
  useEffect(() => {
    if (vocabulary && Array.isArray(vocabulary) && vocabulary.length > 0) {
      spawnWord();
    }
  }, [vocabulary, spawnWord]);

  // Level up every 10 correct answers
  useEffect(() => {
    const newLevel = Math.floor(correctAnswers / 10) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      if (!isMuted) audioManager.playCelebration();
    }
  }, [correctAnswers, level, isMuted, audioManager]);

  // Handle answer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const answer = userInput.trim().toLowerCase();
    
    // Check if answer matches any falling word
    const matchedWord = fallingWords.find(
      word => 
        word.definition.toLowerCase() === answer ||
        word.term.toLowerCase() === answer
    );

    if (matchedWord) {
      // Correct answer!
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setFallingWords(prev => prev.filter(w => w.id !== matchedWord.id));
      if (!isMuted) audioManager.playSuccess();
      
      confetti({
        particleCount: 15,
        spread: 30,
        origin: { y: 0.7 },
        colors: ['#34D399'],
      });
    } else {
      if (!isMuted) audioManager.playError();
    }

    setUserInput("");
    inputRef.current?.focus();
  };

  // Handle play again
  const handlePlayAgain = () => {
    setFallingWords([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setCorrectAnswers(0);
    setTotalWords(0);
    setIsGameOver(false);
    setUserInput("");
    spawnWord();
  };

  const accuracy = totalWords > 0 ? correctAnswers / totalWords : 0;

  // Redirect if no vocabulary available
  if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No vocabulary available for this game.</p>
            <Button onClick={() => router.push(`/game/${params.code}`)}>
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameEndScreen
        title="Game Over!"
        score={score}
        accuracy={accuracy}
        streak={correctAnswers}
        message={`You reached level ${level} and caught ${correctAnswers} words!`}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={() => router.push(`/game/${params.code}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/game/${params.code}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>

          <div className="flex items-center gap-4">
            <ScoreDisplay score={score} lives={lives} />
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
              <span className="text-sm font-bold text-blue-500">Level {level}</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
              <span className="text-xs text-purple-500">Speed:</span>
              <select
                value={gameSpeed}
                onChange={(e) => setGameSpeed(e.target.value as 'slow' | 'medium' | 'fast')}
                className="bg-transparent text-xs font-bold text-purple-500 border-none outline-none cursor-pointer"
              >
                <option value="slow">🐢 Slow</option>
                <option value="medium">🚶 Medium</option>
                <option value="fast">🏃 Fast</option>
              </select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMuted(!isMuted);
                audioManager.toggleMute();
              }}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-heading font-bold mb-2">🪂 Falling Words</h1>
          <p className="text-muted-foreground">
            Type the translation before words hit the bottom!
          </p>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {/* Falling words container */}
          <div className="relative h-[400px] bg-gradient-to-b from-sky-500/10 to-background border-2 border-primary/20 rounded-lg mb-6 overflow-hidden">
            <AnimatePresence>
              {fallingWords.map((word) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    top: `${word.position}%`,
                    left: `${word.lane * 33.33 + 16.66}%`,
                    transform: 'translateX(-50%)',
                  }}
                  className="pointer-events-none"
                >
                  <Card className="bg-primary/90 border-primary text-primary-foreground shadow-lg">
                    <CardContent className="p-3">
                      <p className="text-sm font-bold whitespace-nowrap">
                        {word.term}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Lane dividers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-full w-px bg-border/30 absolute left-1/3" />
              <div className="h-full w-px bg-border/30 absolute left-2/3" />
            </div>

            {/* Bottom danger zone */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-500/20 to-transparent pointer-events-none" />
          </div>

          {/* Input Area */}
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Type the Danish translation:
                  </label>
                  <Input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type here..."
                    className="text-lg"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Submit Answer
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Correct answers: {correctAnswers} | Speed increases every 10 correct!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
