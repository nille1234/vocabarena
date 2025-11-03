"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Heart, Zap, Settings, Rocket, Flame } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { shuffleArray } from "@/lib/utils/gameLogic";
import confetti from "canvas-confetti";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";

type FallingWord = {
  id: string;
  term: string;
  definition: string;
  y: number;
  speed: number;
  lane: number;
};

export default function GravityPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  const inputRef = useRef<HTMLInputElement>(null);

  const vocabularyData = useGameVocabulary();
  
  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabularyData) {
      router.push('/');
    }
  }, [vocabularyData, router]);

  const [gameStarted, setGameStarted] = useState(false);
  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [baseSpeed, setBaseSpeed] = useState(0.8);
  const [vocabulary] = useState(() => vocabularyData ? shuffleArray(vocabularyData) : []);

  // Show loading state while redirecting
  if (!vocabularyData || vocabulary.length === 0) {
    return null;
  }
  
  // Sound effects using Web Audio API
  const playSound = (frequency: number, duration: number = 100) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      // Silently fail if audio context not available
    }
  };

  useEffect(() => {
    if (!gameStarted || gameOver || lives <= 0) return;

    // Spawn new words
    const spawnInterval = setInterval(() => {
      if (words.length < 6) {
        const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        const newWord: FallingWord = {
          id: `${randomWord.id}-${Date.now()}-${Math.random()}`,
          term: randomWord.term,
          definition: randomWord.definition,
          y: -10,
          speed: baseSpeed + (Math.random() * 0.3),
          lane: Math.floor(Math.random() * 3), // 3 lanes
        };
        setWords(prev => [...prev, newWord]);
      }
    }, 2500);

    return () => clearInterval(spawnInterval);
  }, [words.length, gameStarted, gameOver, lives, vocabulary, baseSpeed]);

  useEffect(() => {
    if (!gameStarted || gameOver || lives <= 0) return;

    // Animate falling words
    const animationInterval = setInterval(() => {
      setWords(prev => {
        const updated = prev.map(word => ({
          ...word,
          y: word.y + word.speed,
        }));

        // Check for words that reached the bottom
        const reachedBottom = updated.filter(w => w.y > 100);
        if (reachedBottom.length > 0) {
          setLives(l => Math.max(0, l - reachedBottom.length));
          setCombo(0); // Reset combo on miss
          playSound(200, 200); // Low error sound
        }

        return updated.filter(w => w.y <= 100);
      });
    }, 16);

    return () => clearInterval(animationInterval);
  }, [gameStarted, gameOver, lives]);

  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
    }
  }, [lives, gameOver]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const input = currentInput.toLowerCase().trim();
    const matchedWord = words.find(w => 
      w.term.toLowerCase() === input
    );

    if (matchedWord) {
      // Correct answer!
      const newCombo = combo + 1;
      setCombo(newCombo);
      setWords(words.filter(w => w.id !== matchedWord.id));
      
      // Score with combo multiplier
      const points = 100 + (newCombo * 50);
      setScore(score + points);
      setWordsDestroyed(wordsDestroyed + 1);
      
      // Sound effects - higher pitch for combos
      playSound(400 + (newCombo * 100), 150);
      
      // Visual feedback
      confetti({
        particleCount: 10 + (newCombo * 5),
        spread: 40 + (newCombo * 10),
        origin: { y: 0.7 },
        colors: ['#34D399', '#60A5FA', '#A78BFA'],
        startVelocity: 20 + (newCombo * 5),
      });
    } else {
      // Wrong answer - reset combo
      if (currentInput.trim()) {
        setCombo(0);
        playSound(150, 100); // Low buzz sound
      }
    }

    setCurrentInput("");
    inputRef.current?.focus();
  };

  const restartGame = () => {
    setWords([]);
    setScore(0);
    setLives(3);
    setCombo(0);
    setWordsDestroyed(0);
    setGameOver(false);
    setGameStarted(false);
    setCurrentInput("");
  };

  const startGame = () => {
    setGameStarted(true);
    playSound(600, 200);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/lobby/${gameCode}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lobby
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`}
                />
              ))}
            </div>

            {combo > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2"
              >
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-orange-500">{combo}x Combo!</span>
              </motion.div>
            )}
            
            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2">
              <Trophy className="h-5 w-5 text-secondary" />
              <span className="font-bold text-secondary">{score}</span>
            </div>
          </div>
        </div>

        {!gameStarted && !gameOver ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-heading font-bold mb-2">
                    Gravity Challenge
                  </h2>
                  <p className="text-muted-foreground">
                    Type the English words before they fall off the screen!
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Falling Speed
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {baseSpeed === 0.5 ? 'Slow' : baseSpeed === 0.8 ? 'Medium' : baseSpeed === 1.2 ? 'Fast' : 'Extreme'}
                      </span>
                    </div>
                    <Slider
                      value={[baseSpeed]}
                      onValueChange={(value) => setBaseSpeed(value[0])}
                      min={0.5}
                      max={1.8}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slow</span>
                      <span>Medium</span>
                      <span>Fast</span>
                      <span>Extreme</span>
                    </div>
                  </div>

                  <Button onClick={startGame} size="lg" className="w-full">
                    <Rocket className="mr-2 h-5 w-5" />
                    Start Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : !gameOver ? (
          <>
            {/* Game Area */}
            <div className="max-w-5xl mx-auto mb-8 relative h-[500px] border-2 border-border rounded-lg bg-gradient-to-b from-muted/20 to-muted/40 overflow-hidden">
              {/* Lane dividers */}
              <div className="absolute inset-0 grid grid-cols-3">
                <div className="border-r border-border/30" />
                <div className="border-r border-border/30" />
                <div />
              </div>

              <AnimatePresence>
                {words.map((word) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      top: `${word.y}%`,
                      rotate: word.y > 80 ? [0, -5, 5, -5, 0] : 0
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 1.5,
                      rotate: 360,
                      transition: { duration: 0.3 }
                    }}
                    className="absolute"
                    style={{ 
                      top: `${word.y}%`,
                      left: `${16.66 + (word.lane * 33.33)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <Card className={`
                      border-2 backdrop-blur transition-all
                      ${word.y > 80 ? 'border-red-500/70 bg-gradient-to-br from-red-500/30 to-orange-500/30 animate-pulse' : 
                        'border-primary/50 bg-gradient-to-br from-primary/20 to-accent/20'}
                    `}>
                      <CardContent className="p-3 px-4">
                        <p className="font-bold text-xl whitespace-nowrap text-center">
                          {word.term}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Danger zone indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-red-500/20 to-transparent pointer-events-none" />
              
              {/* Ground line */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
            </div>

            {/* Input Area */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Card className="border-primary/50 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-center text-muted-foreground">
                        Type the English word to destroy it!
                      </p>
                      <Input
                        ref={inputRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Type here..."
                        className="text-xl h-14 text-center"
                        autoFocus
                      />
                      <Button type="submit" size="lg" className="w-full">
                        <Zap className="mr-2 h-5 w-5" />
                        Destroy Word
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {wordsDestroyed}
                    </div>
                    <p className="text-sm text-muted-foreground">Destroyed</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-1">
                      {combo}x
                    </div>
                    <p className="text-sm text-muted-foreground">Best Combo</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-heading font-bold mb-2">
                  Game Over!
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="text-2xl font-bold text-primary">
                    Final Score: {score}
                  </p>
                  <p className="text-muted-foreground">
                    Words Destroyed: {wordsDestroyed}
                  </p>
                  <p className="text-muted-foreground">
                    Best Combo: {combo}x
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={restartGame}>
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
  );
}
