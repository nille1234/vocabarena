"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Printer } from "lucide-react";
import { VocabCard } from "@/types/game";
import { generateSummaryWithGapsAI, Gap } from "@/lib/utils/gapFillHelpers";

interface GapFillAnswerKeyProps {
  vocabulary: VocabCard[];
  gapCount: number;
  summaryLength: number;
}

export function GapFillAnswerKey({
  vocabulary,
  gapCount,
  summaryLength,
}: GapFillAnswerKeyProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [regenerating, setRegenerating] = useState(false);

  const generateContent = async () => {
    setLoading(true);
    try {
      const data = await generateSummaryWithGapsAI(vocabulary, gapCount, summaryLength);
      setSummary(data.summary);
      setGaps(data.gaps);
    } catch (error) {
      console.error("Error generating gap fill content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateContent();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await generateContent();
    setRegenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Create text with gaps highlighted
  const renderTextWithAnswers = () => {
    if (!summary || gaps.length === 0) return null;

    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    // Sort gaps by position
    const sortedGaps = [...gaps].sort((a, b) => a.position - b.position);

    sortedGaps.forEach((gap, index) => {
      // Add text before the gap
      if (gap.position > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {summary.substring(lastIndex, gap.position)}
          </span>
        );
      }

      // Add the gap with answer highlighted
      parts.push(
        <span
          key={`gap-${index}`}
          className="bg-yellow-200 dark:bg-yellow-900 px-1 py-0.5 rounded font-semibold border-2 border-yellow-400 dark:border-yellow-600"
        >
          {gap.correctAnswer}
        </span>
      );

      lastIndex = gap.position;
    });

    // Add remaining text
    if (lastIndex < summary.length) {
      parts.push(
        <span key="text-end">{summary.substring(lastIndex)}</span>
      );
    }

    return parts;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-2">
            Generating answer key...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Gap Text Answer Key</h2>
          <p className="text-sm text-muted-foreground">
            Gaps: {gapCount} | Summary Length: ~{summaryLength} words
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Text with answers */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Text with Answers</CardTitle>
          <p className="text-sm text-muted-foreground">
            Highlighted words are the gaps that students need to fill
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none text-base leading-relaxed">
            {renderTextWithAnswers()}
          </div>
        </CardContent>
      </Card>

      {/* Answer list */}
      <Card>
        <CardHeader>
          <CardTitle>Gap Answers ({gaps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {gaps.map((gap, index) => (
              <div
                key={gap.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted"
              >
                <Badge variant="secondary" className="shrink-0">
                  {index + 1}
                </Badge>
                <span className="font-medium truncate">{gap.correctAnswer}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary used */}
      <Card className="print:break-before-page">
        <CardHeader>
          <CardTitle>Vocabulary Words Used</CardTitle>
          <p className="text-sm text-muted-foreground">
            All vocabulary words from the list
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vocabulary.map((card) => (
              <div
                key={card.id}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="font-semibold text-lg">{card.term}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {card.definition}
                </div>
                {card.germanTerm && (
                  <div className="text-sm text-muted-foreground mt-1 italic">
                    German: {card.germanTerm}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-before-page {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}
