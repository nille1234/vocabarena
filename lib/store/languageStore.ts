"use client";

// Helper function to get the question term (German if available, otherwise English)
export function getQuestionTerm(card: { term: string; germanTerm?: string }): string {
  return card.germanTerm || card.term;
}

// Helper function to check if a card is German
export function isGermanCard(card: { germanTerm?: string }): boolean {
  return !!card.germanTerm;
}
