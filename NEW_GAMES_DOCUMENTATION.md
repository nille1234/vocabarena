# New Games Documentation

This document describes the two new games added to VocabArena: **Word Scramble** and **Word Search**.

## 🎮 Games Added

### 1. Word Scramble (Anagrammer)
**Location:** `app/game/[code]/word-scramble/page.tsx`

**Description:** Students unscramble mixed-up letters to find the correct word.

**Features:**
- **Three difficulty levels:**
  - Easy: First and last letters stay in place
  - Medium: All letters scrambled
  - Hard: Full scramble with possible reversal
- **3 attempts per word**
- **Optional 10-second timer**
- **Scoring system:**
  - 10 points for correct answer on first attempt
  - 5 points for second attempt
  - 2 points for third attempt
  - +5 bonus points for answers under 5 seconds (with timer enabled)
- **Immediate feedback** with visual indicators (green/red)
- **Shows correct answer and translation** after 3 failed attempts
- **Progress tracking** with progress bar
- **Sound effects** for correct/incorrect answers

**Learning Goals:**
- Spelling practice
- Quick word recall
- Pattern recognition
- Focus under time pressure

---

### 2. Word Search (Ordjagt)
**Location:** `app/game/[code]/word-search/page.tsx`

**Description:** Students find vocabulary words hidden in a 10x10 letter grid.

**Features:**
- **10x10 grid** with words hidden in 8 directions:
  - Horizontal (forward/backward)
  - Vertical (up/down)
  - Diagonal (4 directions)
- **Interactive selection:**
  - Drag mouse/finger over letters to select
  - Works on desktop and mobile
  - Visual feedback with color highlighting
- **Word list sidebar** showing:
  - All words to find
  - Translations
  - Strikethrough for found words
  - Progress counter
- **Scoring system:**
  - 15 points per found word
  - 50 bonus points for finding all words
- **Optional timer** for competitive play
- **Sound effects** for found words and completion
- **Responsive design** adapts to screen size

**Learning Goals:**
- Word recognition
- Spelling pattern awareness
- Visual attention and focus
- Vocabulary reinforcement

---

## 🛠️ Technical Implementation

### Utility Functions Created

#### `lib/utils/wordScrambler.ts`
- `scrambleWord(word)` - Basic word scrambling
- `isValidScramble(original, scrambled)` - Validation
- `scrambleWordWithDifficulty(word, difficulty)` - Difficulty-based scrambling

#### `lib/utils/wordSearchGenerator.ts`
- `generateWordSearchGrid(words, size)` - Creates the grid
- `checkWordMatch(selectedCells, placedWords)` - Validates selections
- Helper functions for word placement and direction handling

### Type Definitions

Added to `types/game.ts`:
```typescript
'word-scramble' | 'word-search'
```

### Game Modes

Added to `lib/constants/gameModes.ts`:
```typescript
{
  id: 'word-scramble',
  name: 'Word Scramble',
  icon: '🔤',
  description: 'Unscramble the letters',
  color: 'from-lime-500/20 to-lime-600/20'
},
{
  id: 'word-search',
  name: 'Word Search',
  icon: '🔍',
  description: 'Find words in the grid',
  color: 'from-blue-500/20 to-blue-600/20'
}
```

### Translations

Added to `lib/i18n/translations.ts`:
- Complete Danish and English translations for both games
- UI labels, instructions, feedback messages
- Difficulty levels, button text, etc.

---

## 🎯 User Experience

### Word Scramble Flow
1. Select difficulty level (Easy/Medium/Hard)
2. Optionally enable timer
3. Start game
4. See scrambled word
5. Type answer
6. Get immediate feedback
7. Continue to next word or see correct answer after 3 attempts
8. View final score

### Word Search Flow
1. Optionally enable timer
2. Start game
3. See grid and word list
4. Drag over letters to select words
5. Get feedback when word is found
6. Continue until all words are found
7. Receive completion bonus
8. View final score

---

## 📱 Responsive Design

Both games are fully responsive:
- **Mobile:** Touch-friendly controls, optimized grid sizes
- **Tablet:** Balanced layout with good visibility
- **Desktop:** Full-featured experience with mouse controls

---

## 🔊 Audio Feedback

Both games use the existing `audioManager`:
- Success sounds for correct answers
- Error sounds for incorrect answers
- Celebration sound for game completion

---

## 🎨 Visual Design

Consistent with existing VocabArena design:
- Tailwind CSS styling
- shadcn/ui components
- Gradient backgrounds
- Smooth animations
- Clear visual feedback

---

## 🚀 How to Use

### For Teachers
1. Create a game link with vocabulary list
2. Enable Word Scramble and/or Word Search
3. Share game code with students
4. Students can choose difficulty (Word Scramble) and timer settings

### For Students
1. Enter game code
2. Select Word Scramble or Word Search
3. Configure settings (difficulty, timer)
4. Play and learn!

---

## ✅ Testing Checklist

- [x] Word Scramble: All difficulty levels work
- [x] Word Scramble: Timer functions correctly
- [x] Word Scramble: Scoring system accurate
- [x] Word Scramble: Feedback displays properly
- [x] Word Search: Grid generation works
- [x] Word Search: Word selection (mouse/touch)
- [x] Word Search: All 8 directions supported
- [x] Word Search: Found words marked correctly
- [x] Word Search: Completion detection
- [x] Both games: Responsive on all devices
- [x] Both games: Sound effects work
- [x] Both games: Translations (DA/EN)
- [x] Both games: Integration with vocabulary system

---

## 🔄 Future Enhancements (Optional)

### Word Scramble
- Hint system (reveal one letter)
- Leaderboard for fastest times
- Multiplayer mode

### Word Search
- Variable grid sizes (8x8, 12x12, etc.)
- Hint system (highlight first letter)
- Custom themes/colors
- Print-friendly version

---

## 📝 Notes

- Both games use the existing `useGameVocabulary` hook
- No database changes required
- Games work with any vocabulary list
- Teacher can enable/disable games per game link
- No highscores stored (as per requirements)
