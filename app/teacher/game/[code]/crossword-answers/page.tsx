"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CrosswordAnswerKey } from "@/components/teacher/CrosswordAnswerKey";
import { generateCrossword, CrosswordGrid } from "@/lib/utils/crosswordGenerator";
import { getGameLinkByCode } from "@/lib/supabase/vocabularyManagement";
import { VocabCard } from "@/types/game";

export default function CrosswordAnswersPage() {
  const params = useParams();
  const router = useRouter();
  const [crossword, setCrossword] = useState<CrosswordGrid | null>(null);
  const [language, setLanguage] = useState<'english' | 'german' | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCrosswordAnswers();
  }, [params.code]);

  const loadCrosswordAnswers = async () => {
    try {
      setLoading(true);
      setError(null);

      const code = params.code as string;
      const gameLink = await getGameLinkByCode(code);

      if (!gameLink) {
        setError("Game link not found");
        return;
      }

      if (!gameLink.vocabularyList) {
        setError("No vocabulary list found for this game");
        return;
      }

      const vocabCards: VocabCard[] = gameLink.vocabularyList.cards || [];
      const wordCount = gameLink.crosswordWordCount || 10;
      const lang = gameLink.vocabularyList.language;

      setLanguage(lang);

      // Generate the crossword with the same settings
      const generated = generateCrossword(vocabCards, wordCount, lang);
      setCrossword(generated);
    } catch (err) {
      console.error("Error loading crossword answers:", err);
      setError("Failed to load crossword answers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
        <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading answer key...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !crossword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
        <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error || "Failed to load crossword"}</p>
            <Button onClick={() => router.push("/teacher")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/teacher")}
            className="hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Crossword Answer Key
          </h1>
          <p className="text-muted-foreground text-lg">
            Game Code: <span className="font-mono font-bold">{params.code}</span>
          </p>
        </div>

        {/* Answer Key */}
        <CrosswordAnswerKey crossword={crossword} language={language} />
      </div>
    </div>
  );
}
