"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Volume2, VolumeX, Clock, RotateCcw } from "lucide-react";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { useGameStore } from "@/lib/store/gameStore";
import { GameAccessGuard } from "@/components/game/GameAccessGuard";
import { WordBank } from "@/components/game/gap-fill/WordBank";
import { SummaryText } from "@/components/game/gap-fill/SummaryText";
import { GapFillResults } from "@/components/game/gap-fill/GapFillResults";
import {
  generateSummaryWithGapsAI,
  createGappedText,
  calculateScore,
  formatTime,
  Gap,
  GapFillData,
} from "@/lib/utils/gapFillHelpers";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

export default function GapFillPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  const { playKnown, playMiss, playVictory, isMuted, toggleMute } = useSoundEffects();
  const { session, setSession } = useGameStore();

  const [gapFillData, setGapFillData] = useState<GapFillData | null>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [gameKey, setGameKey] = useState<string>('');

  // Get settings from game link or use defaults
  const gapCount = session?.settings?.gapFillGapCount || 15;
  const summaryLength = session?.settings?.gapFillSummaryLength || 250;

  // Debug logging
  useEffect(() => {
    console.table({
      'Session Exists': !!session,
      'Settings Exists': !!session?.settings,
      'Gap Count Setting': session?.settings?.gapFillGapCount,
      'Summary Length Setting': session?.settings?.gapFillSummaryLength,
      'Final Gap Count Used': gapCount,
      'Final Summary Length Used': summaryLength,
    });
    if (session?.settings) {
      console.log('Full settings object:', JSON.stringify(session.settings, null, 2));
    }
  }, [session, gapCount, summaryLength]);

  // Load settings from game link to ensure we have the latest
  useEffect(() => {
    async function loadSettings() {
      if (!gameCode || settingsLoaded) return;
      
      try {
        const { getGameLinkByCode } = await import('@/lib/supabase/vocabularyManagement');
        const gameLink = await getGameLinkByCode(gameCode);
        
        if (gameLink && session) {
          // Update session with latest settings from game link
          const updatedSession = {
            ...session,
            settings: {
              ...session.settings,
              gapFillGapCount: gameLink.gapFillGapCount || 15,
              gapFillSummaryLength: gameLink.gapFillSummaryLength || 250,
            },
          };
          setSession(updatedSession);
          setSettingsLoaded(true);
          console.log('Updated session with game link settings:', {
            gapFillGapCount: gameLink.gapFillGapCount,
            gapFillSummaryLength: gameLink.gapFillSummaryLength,
          });
        }
      } catch (error) {
        console.error('Error loading game link settings:', error);
        setSettingsLoaded(true); // Continue anyway
      }
    }
    
    if (session && !settingsLoaded) {
      loadSettings();
    }
  }, [gameCode, session, setSession, settingsLoaded]);

  // Redirect to home if no vocabulary
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  // Clear game data when component unmounts to force regeneration on return
  useEffect(() => {
    return () => {
      // Reset state when leaving the page
      setGapFillData(null);
      setSettingsLoaded(false);
    };
  }, []);

  // Initialize game data with AI - WAIT for session AND settings to load first
  useEffect(() => {
    // Don't generate until we have vocabulary, session loaded, AND settings loaded
    if (vocabulary && vocabulary.length > 0 && session && settingsLoaded && !gapFillData && !isGenerating) {
      console.log('Generating game with settings:', { gapCount, summaryLength });
      setIsGenerating(true);
      generateSummaryWithGapsAI(vocabulary, gapCount, summaryLength)
        .then(data => {
          setGapFillData(data);
          setGaps(data.gaps);
          setWordBank(data.wordBank);
          setStartTime(Date.now());
        })
        .catch(error => {
          console.error('Error generating gap fill data:', error);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [vocabulary, session, settingsLoaded, gapFillData, gapCount, summaryLength, isGenerating]);

  // Timer
  useEffect(() => {
    if (!showResult && gapFillData) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResult, gapFillData, startTime]);

  const handleDrop = (gapId: number, word: string) => {
    // Update gaps with the filled word
    setGaps(prevGaps =>
      prevGaps.map(gap => {
        if (gap.id === gapId) {
          // If this gap already has a word, return it to the bank
          if (gap.filledAnswer) {
            setUsedWords(prev => {
              const newSet = new Set(prev);
              newSet.delete(gap.filledAnswer!);
              return newSet;
            });
          }
          return { ...gap, filledAnswer: word };
        }
        return gap;
      })
    );

    // Mark word as used
    setUsedWords(prev => new Set(prev).add(word));
  };

  const handleRemove = (gapId: number) => {
    setGaps(prevGaps =>
      prevGaps.map(gap => {
        if (gap.id === gapId && gap.filledAnswer) {
          // Return word to bank
          setUsedWords(prev => {
            const newSet = new Set(prev);
            newSet.delete(gap.filledAnswer!);
            return newSet;
          });
          return { ...gap, filledAnswer: undefined };
        }
        return gap;
      })
    );
  };

  const handleShuffle = () => {
    // Shuffle the word bank
    const shuffled = [...wordBank].sort(() => Math.random() - 0.5);
    setWordBank(shuffled);
  };

  const handleCheckAnswers = () => {
    const results = calculateScore(gaps);
    
    setShowResult(true);

    if (results.percentage === 100) {
      playVictory();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6'],
      });
    } else if (results.percentage >= 70) {
      playKnown();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      playMiss();
    }
  };

  const handleRestart = async () => {
    if (vocabulary) {
      setIsGenerating(true);
      setShowResult(false);
      setUsedWords(new Set());
      setTimeElapsed(0);
      
      try {
        const data = await generateSummaryWithGapsAI(vocabulary, gapCount, summaryLength);
        setGapFillData(data);
        setGaps(data.gaps);
        setWordBank(data.wordBank);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error regenerating gap fill data:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleBackToLobby = () => {
    router.push(`/game/${gameCode}`);
  };

  const allGapsFilled = gaps.every(gap => gap.filledAnswer);

  if (loading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-muted-foreground">
              {loading ? 'Loading vocabulary...' : 'Generating AI summary...'}
            </p>
            {isGenerating && (
              <p className="text-sm text-muted-foreground">
                This may take a few moments
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !vocabulary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Failed to load vocabulary"}</p>
            <Button onClick={handleBackToLobby} className="mt-4">
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gapFillData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to generate gap fill exercise</p>
            <Button onClick={handleBackToLobby} className="mt-4">
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gappedText = createGappedText(gapFillData.summary, gaps);
  const results = showResult ? calculateScore(gaps) : null;

  return (
    <GameAccessGuard gameCode={gameCode} gameMode="gap-fill">
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-1">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-1">
          <Button variant="ghost" size="sm" onClick={handleBackToLobby}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {!showResult && (
              <>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono">{formatTime(timeElapsed)}</span>
                </div>
                <div className="text-xs font-medium">
                  {gaps.filter(g => g.filledAnswer).length}/{gaps.length}
                </div>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Main Content - Compact Single Column */}
        <div className="max-w-5xl mx-auto space-y-1">
          {/* Compact Word Bank - only show when not showing results */}
          {!showResult && gapFillData && (
            <WordBank
              words={wordBank}
              usedWords={usedWords}
              onShuffle={handleShuffle}
            />
          )}

          {/* Summary Text with Gaps - always visible */}
          {gapFillData && (
            <SummaryText
              gappedText={gappedText}
              gaps={gaps}
              showResult={showResult}
              onDrop={handleDrop}
              onRemove={handleRemove}
            />
          )}

          {/* Check Answers Button or Results Summary */}
          {!showResult ? (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleCheckAnswers}
                disabled={!allGapsFilled}
                size="lg"
                className="min-w-[200px]"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Check Answers
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {results?.correct} / {results?.total} correct ({results?.percentage}%)
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRestart} variant="default">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleBackToLobby} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Lobby
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </GameAccessGuard>
  );
}
