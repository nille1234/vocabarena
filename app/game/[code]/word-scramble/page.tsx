'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEndScreen } from '@/components/game/GameEndScreen';
import { WordScrambleSetup, GameConfig } from '@/components/game/word-scramble/WordScrambleSetup';
import { WordScrambleGame } from '@/components/game/word-scramble/WordScrambleGame';
import { TwoPlayerEndScreen } from '@/components/game/word-scramble/TwoPlayerEndScreen';
import { GameAccessGuard } from '@/components/game/GameAccessGuard';
import { useGameVocabulary } from '@/hooks/use-game-vocabulary';
import { scrambleWordWithDifficulty } from '@/lib/utils/wordScrambler';
import { calculateScore, validateAnswer, cleanGermanWord } from '@/lib/utils/wordScrambleLogic';
import { getAudioManager } from '@/lib/utils/audioManager';
import { translations } from '@/lib/i18n/translations';
import { ArrowLeft } from 'lucide-react';
import { shuffleArray } from '@/lib/utils/vocabularyShuffle';

const audioManager = getAudioManager();

type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'single' | 'two-player';

interface WordState {
  original: string;
  scrambled: string;
  translation: string;
  timeStarted: number;
}

export default function WordScramblePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { vocabulary, loading, error } = useGameVocabulary();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<Array<{ term: string; definition: string }>>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordState, setWordState] = useState<WordState | null>(null);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [language, setLanguage] = useState<'da' | 'en'>('da');
  
  // Two-player state
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Correct, setPlayer1Correct] = useState(0);
  const [player2Correct, setPlayer2Correct] = useState(0);

  // Detect language from browser
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    setLanguage(browserLang.startsWith('da') ? 'da' : 'en');
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'object' && value !== null ? value[language] : value || key;
  };

  const initializeWord = useCallback(() => {
    const vocabToUse = shuffledVocabulary.length > 0 ? shuffledVocabulary : vocabulary;
    
    if (!vocabToUse || currentWordIndex >= vocabToUse.length) {
      setGameEnded(true);
      return;
    }

    const word = vocabToUse[currentWordIndex];
    const cleanedWord = cleanGermanWord(word.term);
    const scrambled = scrambleWordWithDifficulty(cleanedWord, gameConfig?.difficulty || 'medium');
    
    setWordState({
      original: cleanedWord,
      scrambled,
      translation: word.definition,
      timeStarted: Date.now(),
    });
  }, [shuffledVocabulary, vocabulary, currentWordIndex, gameConfig?.difficulty]);

  useEffect(() => {
    if (gameStarted && shuffledVocabulary.length > 0) {
      initializeWord();
    }
  }, [gameStarted, shuffledVocabulary, initializeWord]);

  const handleStartGame = (config: GameConfig) => {
    // Shuffle vocabulary for random word order
    if (vocabulary && vocabulary.length > 0) {
      setShuffledVocabulary(shuffleArray(vocabulary));
    }
    
    setGameConfig(config);
    setGameStarted(true);
    setScore(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Correct(0);
    setPlayer2Correct(0);
    setCurrentPlayer(1);
    setCurrentWordIndex(0);
    setGameEnded(false);
  };

  const handleSubmitAnswer = (answer: string, timeTaken: number) => {
    if (!wordState || !gameConfig) return;

    const isCorrect = validateAnswer(answer, wordState.original);
    
    if (isCorrect) {
      audioManager.playSuccess();
      
      const { points } = calculateScore(
        timeTaken,
        gameConfig.timerEnabled,
        gameConfig.timerDuration
      );
      
      // Update scores based on game mode
      if (gameConfig.gameMode === 'two-player') {
        if (currentPlayer === 1) {
          setPlayer1Score(prev => prev + points);
          setPlayer1Correct(prev => prev + 1);
        } else {
          setPlayer2Score(prev => prev + points);
          setPlayer2Correct(prev => prev + 1);
        }
      } else {
        setScore(prev => prev + points);
      }
    } else {
      audioManager.playError();
    }
  };

  const handleNextWord = () => {
    const vocabToUse = shuffledVocabulary.length > 0 ? shuffledVocabulary : vocabulary;
    if (!vocabToUse || !gameConfig) return;

    if (currentWordIndex < vocabToUse.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      // Switch players in two-player mode
      if (gameConfig.gameMode === 'two-player') {
        setCurrentPlayer(prev => prev === 1 ? 2 : 1);
      }
    } else {
      setGameEnded(true);
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameConfig(null);
    setShuffledVocabulary([]);
    setScore(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Correct(0);
    setPlayer2Correct(0);
    setCurrentPlayer(1);
    setCurrentWordIndex(0);
    setGameEnded(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  if (error || !vocabulary || vocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || 'No vocabulary found'}</p>
          <Button onClick={() => router.push(`/game/${code}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game Selection
          </Button>
        </Card>
      </div>
    );
  }

  if (gameEnded && gameConfig) {
    if (gameConfig.gameMode === 'two-player') {
      return (
        <TwoPlayerEndScreen
          player1Name={gameConfig.player1Name}
          player2Name={gameConfig.player2Name}
          player1Score={player1Score}
          player2Score={player2Score}
          player1Correct={player1Correct}
          player2Correct={player2Correct}
          onPlayAgain={handleRestart}
          onBackToMenu={() => router.push(`/game/${code}`)}
        />
      );
    }
    
    return (
      <GameEndScreen
        title={`${gameConfig.player1Name} - Game Complete!`}
        score={score}
        onPlayAgain={handleRestart}
        onBackToMenu={() => router.push(`/game/${code}`)}
      />
    );
  }

  if (!gameStarted) {
    return (
      <WordScrambleSetup
        onStartGame={handleStartGame}
        onBack={() => router.push(`/game/${code}`)}
        translations={{
          title: t('wordScramble.title'),
          instruction: t('wordScramble.instruction'),
          difficulty: t('wordScramble.difficulty'),
          easy: t('wordScramble.easy'),
          medium: t('wordScramble.medium'),
          hard: t('wordScramble.hard'),
          enableTimer: t('wordScramble.enableTimer'),
          timerDuration: t('wordScramble.timerDuration'),
          startGame: t('wordScramble.startGame'),
          playerName: t('wordScramble.playerName'),
          enterName: t('wordScramble.enterName'),
          oneAttempt: t('wordScramble.oneAttempt'),
        }}
      />
    );
  }

  if (!wordState || !gameConfig) {
    return null;
  }

  const vocabToUse = shuffledVocabulary.length > 0 ? shuffledVocabulary : vocabulary;

  return (
    <GameAccessGuard gameCode={code} gameMode="word-scramble">
      <WordScrambleGame
      vocabulary={vocabToUse}
      currentWordIndex={currentWordIndex}
      wordState={wordState}
      timerEnabled={gameConfig.timerEnabled}
      timerDuration={gameConfig.timerDuration}
      gameMode={gameConfig.gameMode}
      currentPlayer={currentPlayer}
      player1Name={gameConfig.player1Name}
      player2Name={gameConfig.player2Name}
      player1Score={player1Score}
      player2Score={player2Score}
      onSubmitAnswer={handleSubmitAnswer}
      onNextWord={handleNextWord}
      onBack={() => router.push(`/game/${code}`)}
      onNewGame={handleRestart}
      translations={{
        scrambledWord: t('wordScramble.scrambledWord'),
        yourAnswer: t('wordScramble.yourAnswer'),
        submit: t('wordScramble.submit'),
        nextWord: t('wordScramble.nextWord'),
        correct: t('wordScramble.correct'),
        incorrect: t('wordScramble.incorrect'),
        correctAnswer: t('wordScramble.correctAnswer'),
        translation: t('wordScramble.translation'),
        timeBonus: t('wordScramble.timeBonus'),
      }}
    />
    </GameAccessGuard>
  );
}
