"use client";

// Simplified language store - English only
// Helper function to get the question term (always uses English term)
export function getQuestionTerm(card: { term: string; germanTerm?: string }): string {
  return card.term;
}
