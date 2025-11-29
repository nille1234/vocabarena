# Game Updates Progress

## Completed Changes

### 1. ✅ Utility Function Created
- Created `lib/utils/definitionParser.ts` with `getFirstDefinition()` function
- Extracts only the first word/phrase from definitions (splits on comma, semicolon, "or", "/")

### 2. ✅ Game Mode Changes
- Removed 'flashcards' from GameMode type
- Renamed 'learn' game to display as "Flashcards" in UI
- Deleted `app/game/[code]/flashcards/` directory
- Renamed 'test' to display as "Multiple Choice" in UI

### 3. ✅ Crossword Updates
- Updated crossword generator to use only first definition as clue
- Imported and integrated `getFirstDefinition()` function

## Remaining Changes Needed

### 4. ⏳ Match Game
- Update to show only first Danish word (not all synonyms)
- File: `app/game/[code]/match/page.tsx`

### 5. ⏳ Gravity Game  
- Add customizable speed control
- Use only first Danish word
- File: `app/game/[code]/gravity/page.tsx`

### 6. ⏳ Test/Multiple Choice Game
- Use ALL words in wordlist (not just subset)
- Show only first Danish word in choices
- File: `app/game/[code]/test/page.tsx`

### 7. ⏳ Hangman Game
- Use only first Danish word
- File: `app/game/[code]/hangman/page.tsx`

### 8. ⏳ Falling Words Game
- Make speed MUCH slower
- File: `app/game/[code]/falling-words/page.tsx`

### 9. ⏳ Mystery Word Game
- Use only first Danish word
- File: `app/game/[code]/mystery-word/page.tsx`

### 10. ⏳ Word Ladder Game
- Use only first Danish word
- File: `app/game/[code]/word-ladder/page.tsx`

### 11. ⏳ Word Maze Game
- Use only first Danish word
- File: `app/game/[code]/word-maze/page.tsx`

### 12. ⏳ Speed Challenge Game
- Use only first Danish word
- File: `app/game/[code]/speed-challenge/page.tsx`

### 13. ⏳ Survival Game
- Use only first Danish word
- File: `app/game/[code]/survival/page.tsx`

## Implementation Strategy

For each remaining game, the pattern will be:
1. Import `getFirstDefinition` from `@/lib/utils/definitionParser`
2. Replace all instances of `card.definition` with `getFirstDefinition(card.definition)`
3. For specific games, add additional features (speed control, use all words, etc.)
