# Flash Cards Game Documentation

## Overview
The Flash Cards game is an interactive vocabulary learning tool that uses spaced repetition to help students master vocabulary words. Students flip cards to see definitions and mark whether they know each word, with unknown words appearing more frequently until mastered.

## Features

### Core Functionality
- **Interactive Card Flipping**: Click cards to flip between term (front) and definition (back)
- **Smart Learning Algorithm**: Uses spaced repetition - review words appear 60% more frequently
- **Progress Tracking**: Persistent localStorage tracking across sessions
- **Three Word Categories**:
  - **Unseen Words**: Not yet studied
  - **Known Words**: Marked as "I know this"
  - **Review Words**: Marked as "I don't know" (need practice)

### User Interface
- **3D Flip Animation**: Smooth CSS3 transform animation
- **Progress Indicators**:
  - Current card number (e.g., "Card 7 of 25")
  - Overall progress bar
  - Stats breakdown (Known/Review/Remaining)
  - Time elapsed
- **Color-Coded Cards**:
  - Front (Term): Cyan gradient
  - Back (Definition): Purple gradient
- **Action Buttons**:
  - Green "I know this" button
  - Orange "I don't know this" button

### Sound Effects
- **Flip Sound**: Soft whoosh (440Hz) when flipping card
- **Known Sound**: Cheerful ascending tones (523→659→784Hz)
- **Review Sound**: Neutral tone (350Hz)
- **Victory Sound**: Full fanfare when all words mastered
- **Mute Toggle**: Available in header

### Additional Features
- **Shuffle**: Randomize order of unseen words
- **Reset Progress**: Clear all progress and start fresh
- **Completion Screen**: Shows stats and celebration when all words mastered
- **Auto-save**: Progress automatically saved to localStorage

## File Structure

```
app/game/[code]/flashcards/
  └── page.tsx                          # Main game page

components/game/flashcards/
  ├── FlashCard.tsx                     # Card component with flip animation
  ├── FlashCardControls.tsx             # "I know" / "I don't know" buttons
  ├── FlashCardProgress.tsx             # Progress indicators and stats
  └── FlashCardStats.tsx                # Completion screen

lib/utils/
  └── flashcardHelpers.ts               # Learning algorithm and utilities

hooks/
  └── use-sound-effects.ts              # Extended with flashcard sounds
```

## Learning Algorithm

### Card Selection Logic
```typescript
1. If review words exist AND random < 0.6:
   - Show random review word (60% chance)
2. Else if unseen words exist:
   - Show next unseen word in order
3. Else if review words exist:
   - Show random review word
4. Else:
   - All words mastered! Show completion screen
```

### Progress Updates
- **Mark as Known**: 
  - Remove from unseen/review lists
  - Add to known list
  - Show success confetti
- **Mark for Review**:
  - Remove from unseen/known lists
  - Add to review list
  - Will appear more frequently

## Data Persistence

### localStorage Structure
```typescript
{
  "flashcards-progress-{gameCode}": {
    unseenWords: string[],      // Card IDs not yet studied
    knownWords: string[],        // Card IDs marked as known
    reviewWords: string[],       // Card IDs needing review
    sessionStats: {
      cardsStudied: number,      // Total cards studied
      timeSpent: number,         // Time in seconds
      lastStudied: number        // Timestamp
    }
  }
}
```

### Progress Validation
- On load, validates saved IDs against current vocabulary
- If vocabulary changes, invalid progress is discarded
- Ensures data integrity across sessions

## Usage

### For Students
1. Navigate to game lobby via game code
2. Select "Flash Cards" from available games
3. Click card to flip and see definition
4. After flipping, choose:
   - "I know this" if you know the word
   - "I don't know this" if you need more practice
5. Continue until all words are mastered
6. Use shuffle to randomize order
7. Use reset to start over

### For Teachers
- Flash Cards is automatically available when enabled in game link settings
- Students' progress is stored locally (not tracked server-side)
- Ideal for self-paced vocabulary review
- Works offline after initial load

## Technical Details

### Dependencies
- **Framer Motion**: Card flip animations and transitions
- **canvas-confetti**: Celebration effects
- **Web Audio API**: Sound effects generation
- **localStorage**: Progress persistence

### Browser Compatibility
- Modern browsers with CSS3 transform support
- Web Audio API for sound effects
- localStorage for progress tracking

### Performance
- Lightweight: ~900 lines total across all files
- No server calls during gameplay
- Efficient localStorage usage
- Smooth 60fps animations

## Future Enhancements (Optional)
- Audio pronunciation for terms
- Keyboard shortcuts (Space to flip, 1/2 for buttons)
- Study mode (auto-flip after delay)
- Export progress as CSV
- Spaced repetition intervals (1 day, 3 days, 7 days)
- Statistics dashboard (accuracy, time per card)
