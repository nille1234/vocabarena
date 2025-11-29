/**
 * Extracts the first word/phrase from a definition string.
 * Splits on common separators like tabs, commas, semicolons, "or", "/", and hyphens
 */
export function getFirstDefinition(definition: string): string {
  if (!definition) return '';
  
  // Split on common separators: tab, comma, semicolon, " or ", " / ", " - " (hyphen with spaces)
  // Try tab first (most common in imported data), then hyphen with spaces, then other separators
  const separators = /\t|\s+-\s+|\s+-|-\s+|[,;]|\s+or\s+|\s*\/\s*/i;
  const parts = definition.split(separators);
  
  // Return the first part, trimmed
  return parts[0].trim();
}

/**
 * Gets the first definition for display in games
 */
export function getGameDefinition(card: { definition: string }): string {
  return getFirstDefinition(card.definition);
}
