"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Users, User, Trophy } from "lucide-react";
import { useGameStore } from "@/lib/store/gameStore";
import confetti from "canvas-confetti";

interface MemoryCard {
  id: string;
  word: string;
  translation: string;
  type: "word" | "translation";
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { session } = useGameStore();

  const [gameMode, setGameMode] = useState<"1-player" | "2-player" | null>(null);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [moves, setMoves] = useState(0);

  // Initialize game with vocabulary
  useEffect(() => {
    if (session?.cards && gameMode) {
      initializeGame();
    }
  }, [session, gameMode]);

  const initializeGame = () => {
    if (!session?.cards) return;

    // Select 12 random word pairs for 24 cards (6x4 grid)
    const selectedWords = [...session.cards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);

    // Create card pairs
    const cardPairs: MemoryCard[] = [];
    selectedWords.forEach((vocab, index) => {
      cardPairs.push({
        id: `word-${index}`,
        word: vocab.term,
        translation: vocab.definition,
        type: "word",
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: `translation-${index}`,
        word: vocab.term,
        translation: vocab.definition,
        type: "translation",
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setScores({ player1: 0, player2: 0 });
    setCurrentPlayer(1);
    setGameComplete(false);
    setMoves(0);
  };

  const handleCardClick = (cardId: string) => {
    if (isChecking || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(
      cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (flippedIds: string[]) => {
    const [card1, card2] = flippedIds.map((id) =>
      cards.find((c) => c.id === id)
    );

    if (!card1 || !card2) return;

    const isMatch = card1.word === card2.word && card1.type !== card2.type;

    setTimeout(() => {
      if (isMatch) {
        // Match found!
        playSound("correct");
        setCards(
          cards.map((c) =>
            flippedIds.includes(c.id) ? { ...c, isMatched: true } : c
          )
        );

        // Update score
        if (gameMode === "2-player") {
          setScores((prev) => ({
            ...prev,
            [`player${currentPlayer}`]: prev[`player${currentPlayer}` as keyof typeof prev] + 1,
          }));
        } else {
          setScores((prev) => ({ ...prev, player1: prev.player1 + 1 }));
        }

        // Check if game is complete
        const allMatched = cards.every(
          (c) => c.isMatched || flippedIds.includes(c.id)
        );
        if (allMatched) {
          setGameComplete(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        // No match
        playSound("wrong");
        setCards(
          cards.map((c) =>
            flippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
          )
        );

        // Switch player in 2-player mode
        if (gameMode === "2-player") {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }
      }

      setFlippedCards([]);
      setIsChecking(false);
    }, 1000);
  };

  const playSound = (type: "correct" | "wrong" | "flip") => {
    // Placeholder for sound effects
    // Will be implemented with actual audio files
  };

  const handleNewGame = () => {
    initializeGame();
  };

  const handleModeSelect = (mode: "1-player" | "2-player") => {
    setGameMode(mode);
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Memory Match
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose your game mode
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer hover:scale-105 transition-transform border-2 hover:border-primary"
                onClick={() => handleModeSelect("1-player")}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <User className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-2xl font-heading font-bold">Solo Practice</h2>
                  <p className="text-muted-foreground">
                    Practice matching vocabulary cards at your own pace
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:scale-105 transition-transform border-2 hover:border-secondary"
                onClick={() => handleModeSelect("2-player")}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <Users className="h-16 w-16 mx-auto text-secondary" />
                  <h2 className="text-2xl font-heading font-bold">2-Player</h2>
                  <p className="text-muted-foreground">
                    Compete with a friend to find the most matches
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
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
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={handleNewGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        {/* Score Display */}
        <div className="max-w-4xl mx-auto mb-8">
          {gameMode === "2-player" ? (
            <div className="grid grid-cols-2 gap-4">
              <Card className={currentPlayer === 1 ? "border-primary" : ""}>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">{player1Name}</p>
                  <p className="text-3xl font-bold">{scores.player1}</p>
                  {currentPlayer === 1 && (
                    <p className="text-xs text-primary mt-1">Current Turn</p>
                  )}
                </CardContent>
              </Card>
              <Card className={currentPlayer === 2 ? "border-secondary" : ""}>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">{player2Name}</p>
                  <p className="text-3xl font-bold">{scores.player2}</p>
                  {currentPlayer === 2 && (
                    <p className="text-xs text-secondary mt-1">Current Turn</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Matches Found</p>
                <p className="text-3xl font-bold">{scores.player1} / 12</p>
                <p className="text-xs text-muted-foreground mt-1">Moves: {moves}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Game Board */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
              >
                <Card
                  className={`
                    aspect-square cursor-pointer transition-all
                    ${card.isMatched ? "opacity-50 border-green-500" : ""}
                    ${card.isFlipped || card.isMatched ? "bg-primary/10" : "bg-card"}
                  `}
                  onClick={() => handleCardClick(card.id)}
                >
                  <CardContent className="p-2 h-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {card.isFlipped || card.isMatched ? (
                        <motion.div
                          key="front"
                          initial={{ rotateY: 90 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: 90 }}
                          transition={{ duration: 0.2 }}
                          className="text-center"
                        >
                          <p className="text-xs md:text-sm font-medium break-words">
                            {card.type === "word" ? card.word : card.translation}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="back"
                          initial={{ rotateY: 90 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: 90 }}
                          transition={{ duration: 0.2 }}
                          className="text-4xl"
                        >
                          ?
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Complete Modal */}
        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setGameComplete(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center space-y-4">
                  <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
                  <h2 className="text-3xl font-heading font-bold">
                    {gameMode === "2-player"
                      ? scores.player1 > scores.player2
                        ? `${player1Name} Wins!`
                        : scores.player2 > scores.player1
                        ? `${player2Name} Wins!`
                        : "It's a Tie!"
                      : "Congratulations!"}
                  </h2>
                  <p className="text-muted-foreground">
                    {gameMode === "2-player"
                      ? `Final Score: ${scores.player1} - ${scores.player2}`
                      : `You completed the game in ${moves} moves!`}
                  </p>
                  <div className="flex gap-4 justify-center pt-4">
                    <Button onClick={handleNewGame}>Play Again</Button>
                    <Button variant="outline" onClick={() => router.back()}>
                      Exit
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
