/**
 * Color palette for word search highlighting
 * Uses solid, opaque colors for maximum visibility
 * Only green, yellow, pink, and red - no transparency
 */
export const WORD_COLORS = [
  'bg-green-500',
  'bg-yellow-400',
  'bg-pink-500',
  'bg-red-500',
  'bg-green-600',
  'bg-yellow-500',
  'bg-pink-600',
  'bg-red-600',
  'bg-green-400',
  'bg-yellow-300',
  'bg-pink-400',
  'bg-red-400',
] as const;

/**
 * Get color class for a word based on its index
 */
export function getWordColor(wordIndex: number): string {
  return WORD_COLORS[wordIndex % WORD_COLORS.length];
}

/**
 * Get all colors used for a set of words
 */
export function getWordColorMap(words: string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  words.forEach((word, index) => {
    colorMap.set(word.toUpperCase(), getWordColor(index));
  });
  return colorMap;
}
