# Jeopardy Game Documentation

## Overview
The Jeopardy game is a quiz-style vocabulary game where players answer questions organized into themed categories. Players select questions from a 5x5 grid, with point values ranging from $100 to $500 based on difficulty.

## Features

### Game Board
- **5 Categories × 5 Questions** = 25 total questions
- Point values: $100, $200, $300, $400, $500
- Questions are sorted by difficulty within each category
- Visual feedback when questions are answered (checkmark replaces dollar amount)

### Category System
The game supports two types of categories:

#### 1. AI-Generated Categories (Recommended)
- Teachers can use ChatGPT to organize vocabulary words into thematic categories
- Categories are stored in the `jeopardy_category` field of vocabulary cards
- Examples: "Thinking & Understanding", "Expression & Communication", "Art & Literature"
- Requires at least 5 words per category

#### 2. Automatic Categories (Fallback)
If no AI categories are available, the system automatically generates categories based on:
- **Short Words**: ≤5 letters
- **Medium Words**: 6-8 letters
- **Long Words**: 9+ letters
- **Challenge Zone**: Words with longest definitions
- **Mixed Bag**: Random selection of remaining words

### Answer Modes
- **Text Input**: Players type their answer
- **Multiple Choice**: Players select from 4 options (uses word classifier for similar words)

### Scoring System
- **Base Points**: Question value ($100-$500)
- **Time Bonus**: Up to 50% extra for fast answers
- **Formula**: `score = questionValue + (questionValue × 0.5 × timeRatio)`

### Game Flow
1. Player selects a question from the board
2. Question modal displays the definition (clue)
3. 30-second timer counts down
4. Player submits answer
5. Result modal shows if correct/incorrect with points earned
6. Question is marked as answered on the board
7. Game continues until all 25 questions are answered

## Database Schema

### New Fields Added

#### `vocabulary_cards` table
```sql
jeopardy_category TEXT  -- Optional category name for Jeopardy game
```

#### `game_links` table
```sql
jeopardy_answer_mode TEXT CHECK (jeopardy_answer_mode IN ('text-input', 'multiple-choice'))
```

## File Structure

### Components
- `components/game/jeopardy/JeopardyBoard.tsx` - Main game board with category grid
- `components/game/jeopardy/JeopardyQuestionModal.tsx` - Question display and answer input
- `components/game/jeopardy/JeopardyResultModal.tsx` - Shows correct/incorrect feedback
- `components/game/jeopardy/JeopardyScoreCard.tsx` - Displays score and progress

### Game Logic
- `lib/utils/jeopardyHelpers.ts` - Core game logic
  - `generateJeopardyCategories()` - Creates categories from vocabulary
  - `createJeopardyBoard()` - Builds the 5x5 game board
  - `checkJeopardyAnswer()` - Validates player answers
  - `calculateJeopardyScore()` - Computes points with time bonus

### Page
- `app/game/[code]/jeopardy/page.tsx` - Main game page (client component)

## Requirements
- Minimum 25 vocabulary words to create a full board
- Categories need at least 5 words each to be valid
- Works with existing vocabulary management system

## Teacher Workflow

### Option 1: Using AI Categories (Recommended)
1. Copy vocabulary list from VocabArena
2. Paste into ChatGPT with prompt:
   ```
   "Organize these vocabulary words into 5 thematic categories. 
   Format: Category name, then list the words under it."
   ```
3. Future: Click "Auto-Categorize for Jeopardy" button (requires OpenAI API integration)
4. Categories are automatically assigned to words

### Option 2: No Categories
1. Simply create a game link with Jeopardy enabled
2. System automatically generates categories based on word characteristics
3. Game works perfectly without manual categorization

## Integration Points

### Types (`types/game.ts`)
- Added `'jeopardy'` to `GameMode` type
- Added `jeopardyCategory?: string` to `VocabCard` interface
- Added `jeopardyAnswerMode` to `GameSettings` and `GameLink` interfaces

### Game Modes (`lib/constants/gameModes.ts`)
- Added Jeopardy to `ALL_GAME_MODES` array with icon 💰

### Access Control
- Updated `lib/supabase/gameAccess.server.ts` to include `jeopardyAnswerMode`
- Updated `lib/supabase/gameAccess.client.ts` to include `jeopardyAnswerMode`
- Uses existing `GameAccessGuard` component

## Future Enhancements

### Planned Features
1. **AI Auto-Categorization Button**
   - One-click categorization using OpenAI API
   - Automatically assigns categories to all words
   - Saves time for teachers

2. **Daily Double**
   - Random questions worth double points
   - Player can wager points before seeing question

3. **Final Jeopardy**
   - One final question after board is cleared
   - All players wager points
   - Highest score wins

4. **Multiplayer Mode**
   - 2-4 players take turns
   - Buzzer system for competitive play
   - Team-based gameplay option

5. **Custom Categories**
   - Teachers can manually create and name categories
   - Drag-and-drop words into categories
   - Save category templates for reuse

## Technical Notes

### Performance
- Categories are generated once when board initializes
- Questions are sorted by difficulty (term + definition length)
- Efficient answer checking with normalized string comparison

### Accessibility
- High contrast colors for readability
- Clear visual feedback for answered questions
- Timer with color-coded progress bar
- Keyboard support for text input mode

### Responsive Design
- Grid layout adapts to screen size
- Touch-friendly on mobile devices
- Modals are centered and scrollable

## Testing Checklist
- [ ] Game loads with 25+ words
- [ ] Categories display correctly
- [ ] Questions can be selected
- [ ] Timer counts down properly
- [ ] Answers are validated correctly
- [ ] Score updates with time bonus
- [ ] All 25 questions can be answered
- [ ] Game completion screen shows
- [ ] Restart functionality works
- [ ] Both answer modes work (text-input and multiple-choice)
- [ ] Game works without AI categories (automatic fallback)
