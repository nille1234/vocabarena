"use client";

import { Card } from "@/components/ui/card";
import { GapDropZone } from "./GapDropZone";
import { Gap } from "@/lib/utils/gapFillHelpers";

interface SummaryTextProps {
  gappedText: string;
  gaps: Gap[];
  showResult: boolean;
  onDrop: (gapId: number, word: string) => void;
  onRemove: (gapId: number) => void;
}

export function SummaryText({
  gappedText,
  gaps,
  showResult,
  onDrop,
  onRemove,
}: SummaryTextProps) {
  // Split text by gap markers and render with drop zones
  const renderTextWithGaps = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Find all gap markers in the text
    const gapRegex = /___(\d+)___/g;
    let match;
    
    while ((match = gapRegex.exec(gappedText)) !== null) {
      const gapId = parseInt(match[1]);
      const gap = gaps.find(g => g.id === gapId);
      
      // Add text before the gap
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {gappedText.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add the gap drop zone
      if (gap) {
        parts.push(
          <GapDropZone
            key={`gap-${gapId}`}
            gapId={gapId}
            filledWord={gap.filledAnswer}
            isCorrect={gap.filledAnswer ? gap.filledAnswer.toLowerCase() === gap.correctAnswer.toLowerCase() : undefined}
            showResult={showResult}
            onDrop={onDrop}
            onRemove={onRemove}
          />
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last gap
    if (lastIndex < gappedText.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {gappedText.substring(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };

  return (
    <Card className="p-3 bg-white dark:bg-gray-900">
      <div className="prose dark:prose-invert max-w-none">
        <div className="text-sm leading-snug text-gray-800 dark:text-gray-200">
          {renderTextWithGaps()}
        </div>
      </div>
      
      {!showResult && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Drag words from the word bank above to fill in the gaps
        </p>
      )}
    </Card>
  );
}
