"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { getAudioManager } from "@/lib/utils/audioManager";
import { getRevealedWord, checkLetter } from "@/lib/utils/questionGenerator";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import confetti from "canvas-confetti";
import { shuffleArray } from "@/lib/utils/vocabularyShuffle";
import { cleanTerm } from "@/lib/utils/hangmanHelpers";
import { HangmanModeSelect } from "@/components/game/hangman/HangmanModeSelect";
import { HangmanPlayerScores } from "@/components/game/hangman/HangmanPlayerScores";
import { HangmanGameBoard } from "@/components/game/hangman/HangmanGameBoard";
import { HangmanRoundComplete } from "@/components/game/hangman/HangmanRoundComplete";

export default function HangmanPage() {
  const router = useRouter();
  const params = useParams();
  const { vocabulary, loading, error } = useGameVocabulary();

  // Redirect to home if no vocabulary
  useEffect(() => {
    if (!vocabulary) {
      router.push("/");
    }
  }, [vocabulary, router]);

  const [gameMode, setGameMode] = useState<"select" | "single" | "two-player">("select");
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Two-player mode state
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Correct, setPlayer1Correct] = useState(0);
  const [player2Correct, setPlayer2Correct] = useState(0);

  // Timer state
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const audioManager = getAudioManager();
  const MAX_WRONG_GUESSES = 3;

  // Shuffle vocabulary
  const shuffleVocabulary = useCallback(() => {
    if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) return;

    const shuffled = shuffleArray(vocabulary);
    setShuffledVocabulary(shuffled);
    setCurrentIndex(0);
  }, [vocabulary]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        audioManager.playTick();
      } catch (error) {
        console.warn("Audio initialization failed:", error);
      }
    };

    document.addEventListener("click", initAudio, { once: true });

    return () => {
      document.removeEventListener("click", initAudio);
    };
  }, [audioManager]);

  // Timer countdown effect
  useEffect(() => {
    if (gameMode === "two-player" && isTimerActive && timeRemaining > 0 && !isRoundComplete) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return prev;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameMode, isTimerActive, timeRemaining, isRoundComplete]);

  // Handle time expiration
  const handleTimeExpired = useCallback(() => {
    if (!isMuted) audioManager.playError();
    setIsTimerActive(false);
    setIsRoundComplete(true);
    setRoundsPlayed((prev) => prev + 1);
  }, [isMuted, audioManager]);

  // Get cleaned term and check if word is complete
  const cleanedTerm = currentCard ? cleanTerm(currentCard.term) : "";
  const revealedWord = cleanedTerm ? getRevealedWord(cleanedTerm, guessedLetters) : "";
  const isWordComplete = Boolean(revealedWord) && !revealedWord.includes("_");

  // Calculate correct letters count
  const correctLettersCount = cleanedTerm
    ? guessedLetters.filter((letter) => checkLetter(cleanedTerm, letter)).length
    : 0;

  // Start new round
  const startNewRound = useCallback(() => {
    if (shuffledVocabulary.length === 0) return;

    // If we've gone through all cards, reshuffle
    if (currentIndex >= shuffledVocabulary.length) {
      shuffleVocabulary();
      return;
    }

    const nextCard = shuffledVocabulary[currentIndex];
    setCurrentCard(nextCard);
    setCurrentIndex((prev) => prev + 1);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setIsRoundComplete(false);
    setHintUsed(false);
    setShowHint(false);
    setTimeRemaining(timeLimit);
    setIsTimerActive(gameMode === "two-player");
  }, [shuffledVocabulary, currentIndex, shuffleVocabulary, timeLimit, gameMode]);

  // Handle hint
  const handleHint = () => {
    if (hintUsed || isRoundComplete) return;

    setHintUsed(true);
    setShowHint(true);
    setWrongGuesses((prev) => prev + 1);
    if (!isMuted) audioManager.playTick();
  };

  // Handle letter guess
  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.includes(letter.toLowerCase()) || isRoundComplete) return;

    const newGuessedLetters = [...guessedLetters, letter.toLowerCase()];
    setGuessedLetters(newGuessedLetters);

    if (checkLetter(cleanedTerm, letter)) {
      // Correct guess
      const letterCount = cleanedTerm
        .toLowerCase()
        .split("")
        .filter((c: string) => c === letter.toLowerCase()).length;

      if (gameMode === "two-player") {
        if (currentPlayer === 1) {
          setPlayer1Score((prev) => prev + 10 * letterCount);
        } else {
          setPlayer2Score((prev) => prev + 10 * letterCount);
        }
      } else {
        setScore((prev) => prev + 10 * letterCount);
      }

      if (!isMuted) audioManager.playSuccess();

      // Check if word is now complete
      const newRevealed = getRevealedWord(cleanedTerm, newGuessedLetters);
      if (!newRevealed.includes("_")) {
        setIsRoundComplete(true);
        setIsTimerActive(false);

        if (gameMode === "two-player") {
          if (currentPlayer === 1) {
            setPlayer1Score((prev) => prev + 50);
            setPlayer1Correct((prev) => prev + 1);
          } else {
            setPlayer2Score((prev) => prev + 50);
            setPlayer2Correct((prev) => prev + 1);
          }
        } else {
          setScore((prev) => prev + 50);
        }

        setCorrectRounds((prev) => prev + 1);
        setRoundsPlayed((prev) => prev + 1);

        if (!isMuted) {
          audioManager.playCelebration();
          setTimeout(() => audioManager.playSuccess(), 200);
        }
        confetti({
          particleCount: 100,
          spread: 70,
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
        setIsTimerActive(false);
        setRoundsPlayed((prev) => prev + 1);
      }
    }
  };

  // Handle next round
  const handleNextRound = () => {
    if (gameMode === "two-player") {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }

    if (roundsPlayed >= 10) {
      setIsGameOver(true);
    } else {
      startNewRound();
    }
  };

  // Initialize shuffled vocabulary
  useEffect(() => {
    if (
      vocabulary &&
      Array.isArray(vocabulary) &&
      vocabulary.length > 0 &&
      shuffledVocabulary.length === 0
    ) {
      shuffleVocabulary();
    }
  }, [vocabulary, shuffledVocabulary.length, shuffleVocabulary]);

  // Start first round
  useEffect(() => {
    if (shuffledVocabulary.length > 0 && !currentCard && gameMode !== "select") {
      startNewRound();
    }
  }, [shuffledVocabulary, currentCard, startNewRound, gameMode]);

  // Handle play again
  const handlePlayAgain = () => {
    setScore(0);
    setRoundsPlayed(0);
    setCorrectRounds(0);
    setIsGameOver(false);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Correct(0);
    setPlayer2Correct(0);
    setCurrentPlayer(1);
    shuffleVocabulary();
  };

  const handleBackToModeSelect = () => {
    setGameMode("select");
    setScore(0);
    setRoundsPlayed(0);
    setCorrectRounds(0);
    setIsGameOver(false);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Correct(0);
    setPlayer2Correct(0);
    setCurrentPlayer(1);
    setIsTimerActive(false);
  };

  const handleModeSelect = (mode: "single" | "two-player", timerDuration?: number) => {
    setGameMode(mode);
    if (mode === "two-player" && timerDuration) {
      setTimeLimit(timerDuration);
      setTimeRemaining(timerDuration);
    }
    shuffleVocabulary();
  };

  const accuracy = roundsPlayed > 0 ? correctRounds / roundsPlayed : 0;

  // Show loading state
  if (!vocabulary) {
    return null;
  }

  // Mode selection screen
  if (gameMode === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push(`/game/${params.code}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>

          <HangmanModeSelect onSelectMode={handleModeSelect} />
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  // Game over screen
  if (isGameOver) {
    if (gameMode === "two-player") {
      const winner =
        player1Score > player2Score ? "Player 1" : player2Score > player1Score ? "Player 2" : "Tie";
      return (
        <GameEndScreen
          title="Hangman Complete!"
          score={player1Score + player2Score}
          accuracy={accuracy}
          message={
            winner === "Tie"
              ? `It's a tie! Both players scored equally.\nPlayer 1: ${player1Score} points (${player1Correct} correct)\nPlayer 2: ${player2Score} points (${player2Correct} correct)`
              : `${winner} wins!\nPlayer 1: ${player1Score} points (${player1Correct} correct)\nPlayer 2: ${player2Score} points (${player2Correct} correct)`
          }
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToModeSelect}
        />
      );
    }

    return (
      <GameEndScreen
        title="Hangman Complete!"
        score={score}
        accuracy={accuracy}
        message={`You solved ${correctRounds} out of ${roundsPlayed} words!`}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToModeSelect}
      />
    );
  }

  // Main game screen
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
            {gameMode === "two-player" ? (
              <HangmanPlayerScores
                currentPlayer={currentPlayer}
                player1Score={player1Score}
                player2Score={player2Score}
                showTimer={true as boolean}
                timeRemaining={timeRemaining}
                timeLimit={timeLimit}
                isTimerActive={isTimerActive}
                onTimeExpired={handleTimeExpired}
                isMuted={isMuted}
              />
            ) : (
              <ScoreDisplay score={score} />
            )}
            <Badge variant="secondary" className="px-4 py-2">
              Round {roundsPlayed + 1} / 10
            </Badge>
            <Button variant="outline" size="sm" onClick={handlePlayAgain} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              New Game
            </Button>
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
          <h1 className="text-3xl font-heading font-bold mb-2">
            🎯 Hangman {gameMode === "two-player" && `- Player ${currentPlayer}'s Turn`}
          </h1>
          <p className="text-muted-foreground">Guess the German/English word letter by letter</p>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto">
          <HangmanGameBoard
            currentCard={currentCard}
            guessedLetters={guessedLetters}
            wrongGuesses={wrongGuesses}
            maxWrongGuesses={MAX_WRONG_GUESSES}
            hintUsed={hintUsed}
            showHint={showHint}
            isRoundComplete={isRoundComplete}
            onLetterGuess={handleLetterGuess}
            onHint={handleHint}
          />

          {/* Round Complete */}
          {isRoundComplete && (
            <div className="mt-6">
              <HangmanRoundComplete
                isWordComplete={isWordComplete}
                currentCard={currentCard}
                correctLettersCount={correctLettersCount}
                roundsPlayed={roundsPlayed}
                onNextRound={handleNextRound}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
