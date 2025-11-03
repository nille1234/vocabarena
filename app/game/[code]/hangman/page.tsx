"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, Lightbulb } from "lucide-react";
import { getAudioManager } from "@/lib/utils/audioManager";
import { getRevealedWord, checkLetter } from "@/lib/utils/questionGenerator";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import { getQuestionTerm } from "@/lib/store/languageStore";
import confetti from "canvas-confetti";

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ'.split('');

export default function HangmanPage() {
  const router = useRouter();
  const params = useParams();

  const { vocabulary, loading, error } = useGameVocabulary();
  
  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  const [currentCard, setCurrentCard] = useState<any>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const audioManager = getAudioManager();
  const MAX_WRONG_GUESSES = 6;

  // Check if word is complete
  const revealedWord = getRevealedWord(currentCard.term, guessedLetters);
  const isWordComplete = !revealedWord.includes('_');

  // Calculate score for correct letters
  const correctLettersCount = guessedLetters.filter(letter => 
    checkLetter(currentCard.term, letter)
  ).length;

  // Start new round
  const startNewRound = useCallback(() => {
    if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) return;
    
    const availableCards = vocabulary.filter(
      card => !usedCards.has(card.id)
    );

    if (availableCards.length === 0) {
      setUsedCards(new Set());
      return startNewRound();
    }

    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    setCurrentCard(randomCard);
    setUsedCards(prev => new Set(Array.from(prev).concat(randomCard.id)));
    setGuessedLetters([]);
    setWrongGuesses(0);
    setIsRoundComplete(false);
    setHintUsed(false);
    setShowHint(false);
  }, [usedCards, vocabulary]);

  // Handle hint button
  const handleHint = () => {
    if (hintUsed || isRoundComplete) return;
    
    setHintUsed(true);
    setShowHint(true);
    setWrongGuesses(prev => prev + 1); // Costs 1 life
    if (!isMuted) audioManager.playTick();
  };

  // Handle letter guess
  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.includes(letter.toLowerCase()) || isRoundComplete) return;

    const newGuessedLetters = [...guessedLetters, letter.toLowerCase()];
    setGuessedLetters(newGuessedLetters);

    if (checkLetter(currentCard.term, letter)) {
      // Correct guess - add points per letter revealed
      const letterCount = currentCard.term.toLowerCase().split('').filter(
        (c: string) => c === letter.toLowerCase()
      ).length;
      setScore(prev => prev + (10 * letterCount));
      if (!isMuted) audioManager.playSuccess();
      
      // Check if word is now complete
      const newRevealed = getRevealedWord(currentCard.term, newGuessedLetters);
      if (!newRevealed.includes('_')) {
        setIsRoundComplete(true);
        setScore(prev => prev + 50); // Bonus for completing word
        setCorrectRounds(prev => prev + 1);
        setRoundsPlayed(prev => prev + 1);
        if (!isMuted) audioManager.playCelebration();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } else {
      // Wrong guess
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      if (!isMuted) audioManager.playError();

      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setIsRoundComplete(true);
        setRoundsPlayed(prev => prev + 1);
      }
    }
  };

  // Handle next round
  const handleNextRound = () => {
    if (roundsPlayed >= 10) {
      setIsGameOver(true);
    } else {
      startNewRound();
    }
  };

  // Initialize first round
  useEffect(() => {
    if (vocabulary && Array.isArray(vocabulary) && vocabulary.length > 0) {
      startNewRound();
    }
  }, [vocabulary, startNewRound]);

  // Handle play again
  const handlePlayAgain = () => {
    setScore(0);
    setRoundsPlayed(0);
    setCorrectRounds(0);
    setUsedCards(new Set());
    setIsGameOver(false);
    startNewRound();
  };

  const accuracy = roundsPlayed > 0 ? correctRounds / roundsPlayed : 0;

  // Show loading state while redirecting or loading vocabulary
  if (!vocabulary || !currentCard) {
    return null;
  }

  if (isGameOver) {
    return (
      <GameEndScreen
        title="Hangman Complete!"
        score={score}
        accuracy={accuracy}
        message={`You solved ${correctRounds} out of ${roundsPlayed} words!`}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={() => router.push(`/game/${params.code}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/game/${params.code}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>

          <div className="flex items-center gap-4">
            <ScoreDisplay score={score} />
            <Badge variant="secondary" className="px-4 py-2">
              Round {roundsPlayed + 1} / 10
            </Badge>
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">🎯 Hangman</h1>
          <p className="text-muted-foreground">
            Guess the English word letter by letter
          </p>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-8 pb-6">
              {/* Lives indicator - Modern icons */}
              <div className="text-center mb-8">
                <div className="flex justify-center gap-2 mb-4">
                  {Array.from({ length: MAX_WRONG_GUESSES }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1 }}
                      animate={{ scale: i < wrongGuesses ? 0.8 : 1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        i < wrongGuesses
                          ? 'bg-red-500/20 border-red-500'
                          : 'bg-blue-500/20 border-blue-500'
                      }`}
                    >
                      <Lightbulb className={`h-5 w-5 ${
                        i < wrongGuesses ? 'text-red-500' : 'text-blue-500'
                      }`} />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {MAX_WRONG_GUESSES - wrongGuesses} lives remaining
                </p>
              </div>

              {/* Clue */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Danish word (clue):
                </p>
                <h2 className="text-2xl font-bold mb-2">"{currentCard.definition}"</h2>
                
                {/* Hint button and display */}
                {!isRoundComplete && (
                  <div className="mt-4">
                    {!hintUsed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleHint}
                        className="gap-2"
                      >
                        <Lightbulb className="h-4 w-4" />
                        Use Hint (Costs 1 life)
                      </Button>
                    ) : showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-blue-500 font-medium"
                      >
                        💡 First letter: {currentCard.term[0].toUpperCase()}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Revealed Word */}
              <div className="text-center mb-8">
                <div className="flex justify-center gap-2 flex-wrap">
                  {revealedWord.split('').map((char, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        w-12 h-16 flex items-center justify-center text-2xl font-bold
                        border-2 rounded-lg
                        ${char === '_' ? 'border-border bg-background' : 'border-primary bg-primary/10'}
                        ${char === ' ' || char === '-' ? 'border-transparent' : ''}
                      `}
                    >
                      {char === '_' ? '' : char.toUpperCase()}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Alphabet */}
              {!isRoundComplete && (
                <div className="grid grid-cols-9 gap-2 mb-6">
                  {ALPHABET.map((letter) => {
                    const isGuessed = guessedLetters.includes(letter.toLowerCase());
                    const isCorrect = isGuessed && checkLetter(currentCard.term, letter);
                    const isWrong = isGuessed && !checkLetter(currentCard.term, letter);

                    return (
                      <Button
                        key={letter}
                        variant="outline"
                        size="sm"
                        onClick={() => handleLetterGuess(letter)}
                        disabled={isGuessed}
                        className={`
                          ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300' : ''}
                          ${isWrong ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300 opacity-50' : ''}
                        `}
                      >
                        {letter}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Round Complete */}
              {isRoundComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  {isWordComplete ? (
                    <>
                      <p className="text-2xl font-bold text-green-500 mb-4">
                        ✓ Correct!
                      </p>
                      <div className="bg-background/50 rounded-lg p-4 mb-4">
                        <p className="text-muted-foreground mb-2">
                          <span className="font-bold">{currentCard.definition}</span> (Danish) = <span className="font-bold">{getQuestionTerm(currentCard)}</span> (English)
                        </p>
                        <p className="text-sm text-muted-foreground italic">
                          Example: "She experienced {getQuestionTerm(currentCard).toLowerCase()} before the exam."
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">
                        +{correctLettersCount * 10} points (letters) + 50 points (completion) = {correctLettersCount * 10 + 50} total
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-red-500 mb-4">
                        Out of Lives!
                      </p>
                      <div className="bg-background/50 rounded-lg p-4 mb-4">
                        <p className="text-muted-foreground mb-2">
                          The answer was: <span className="font-bold">{getQuestionTerm(currentCard)}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-bold">{currentCard.definition}</span> (Danish) = <span className="font-bold">{getQuestionTerm(currentCard)}</span> (English)
                        </p>
                        <p className="text-sm text-muted-foreground italic mt-2">
                          Example: "She experienced {getQuestionTerm(currentCard).toLowerCase()} before the exam."
                        </p>
                      </div>
                    </>
                  )}
                  
                  <Button onClick={handleNextRound} size="lg">
                    {roundsPlayed >= 9 ? 'View Results' : 'Next Word'}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
