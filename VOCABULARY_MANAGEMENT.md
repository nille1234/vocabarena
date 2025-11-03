# Vocabulary Management System

This document describes the teacher-managed vocabulary lists and game links feature.

## Overview

Teachers can now:
- Upload and permanently save vocabulary lists to the database
- Create shareable game links with specific vocabulary and selected games
- Manage (view, edit, delete) vocabulary lists and game links
- Students access games via custom links showing only teacher-selected games

## Architecture

### Database Tables

#### `vocabulary_lists`
Stores reusable vocabulary lists.
- `id` (UUID) - Primary key
- `name` (TEXT) - List name (e.g., "Medical Vocabulary - Week 5")
- `description` (TEXT) - Optional description
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

#### `vocabulary_cards`
Stores individual vocabulary cards for each list.
- `id` (UUID) - Primary key
- `list_id` (UUID) - Foreign key to vocabulary_lists
- `term` (TEXT) - The vocabulary term
- `definition` (TEXT) - The definition/translation
- `german_term` (TEXT) - Optional German translation
- `order_index` (INTEGER) - Display order
- `created_at` (TIMESTAMP) - Creation timestamp

#### `game_links`
Stores shareable game links with configuration.
- `id` (UUID) - Primary key
- `code` (TEXT) - Unique game code for the URL
- `name` (TEXT) - Link name for teacher reference
- `list_id` (UUID) - Foreign key to vocabulary_lists
- `enabled_games` (TEXT[]) - Array of enabled game mode IDs
- `created_at` (TIMESTAMP) - Creation timestamp
- `expires_at` (TIMESTAMP) - Optional expiration date
- `is_active` (BOOLEAN) - Whether the link is currently active

### API Functions

Located in `lib/supabase/vocabularyManagement.ts`:

**Vocabulary Lists:**
- `createVocabularyList(name, cards, description?)` - Create new list
- `getAllVocabularyLists()` - Get all lists with cards
- `getVocabularyListById(listId)` - Get specific list
- `updateVocabularyList(listId, updates)` - Update list metadata
- `deleteVocabularyList(listId)` - Delete list (checks for active links)

**Game Links:**
- `createGameLink(name, code, listId, enabledGames)` - Create new link
- `getAllGameLinks()` - Get all links with vocabulary info
- `getGameLinkByCode(code)` - Get link by code (for students)
- `updateGameLink(linkId, updates)` - Update link configuration
- `deleteGameLink(linkId)` - Delete link

## User Flows

### Teacher: Create Game Link

1. Navigate to `/teacher` (password: 260879)
2. Click "Create New Game Link"
3. **Step 1: Vocabulary**
   - Option A: Upload new vocabulary (CSV, JSON, or DOCX) or paste text
     - Provide list name and optional description
     - Vocabulary is saved to database for reuse
   - Option B: Select from existing saved vocabulary lists
4. **Step 2: Games**
   - Select which games students can access (checkboxes)
   - Can select all 18 available games or specific ones
5. **Step 3: Link**
   - Provide a name for the game link
   - Review summary
   - Generate link
   - Copy shareable URL

### Teacher: Manage Resources

**Vocabulary Lists Tab:**
- View all saved vocabulary lists
- Edit list names
- Delete lists (prevented if used by active links)
- See word count and creation dates

**Game Links Tab:**
- View all created game links
- Copy shareable URLs
- Preview links (see student view)
- Activate/deactivate links
- Edit link names
- Delete links
- See which vocabulary and games are included

### Student: Access Games

1. Receive link from teacher (e.g., `yourdomain.com/play/ABC123`)
2. Click link to open game lobby
3. See only the games enabled by teacher
4. Click any game to start playing
5. All games use the vocabulary from the teacher's selected list

## Available Games

All 18 game modes can be enabled/disabled:
1. Flashcards
2. Match
3. Gravity
4. Learn
5. Spell
6. Test
7. Hangman
8. Falling Words
9. Mystery Word
10. Word Ladder
11. Word Maze
12. Speed Challenge
13. Survival
14. Sentence Builder
15. Memory
16. Othello
17. Tic-Tac-Toe (Five-in-a-Row)
18. Hex

## File Structure

```
app/
├── teacher/page.tsx              # Teacher dashboard
├── play/[code]/page.tsx          # Student game lobby (filtered games)
└── game/[code]/[mode]/page.tsx   # Individual game pages

components/
└── teacher/
    └── CreateGameLinkDialog.tsx  # Multi-step dialog for creating links

lib/
└── supabase/
    └── vocabularyManagement.ts   # API functions for CRUD operations

supabase/
└── migrations/
    └── 002_vocabulary_management.sql  # Database schema

types/
└── game.ts                       # TypeScript types (VocabularyList, GameLink)
```

## Supported Vocabulary Formats

### CSV Format
```csv
term,definition,germanTerm
house,hus,Haus
cat,kat,Katze
```

### JSON Format
```json
[
  {
    "term": "house",
    "definition": "hus",
    "germanTerm": "Haus"
  }
]
```

### DOCX Format
One pair per line with separator:
```
house - hus
cat - kat
dog - hund
```

### Pasted Text Format
Supports multiple separators: `-`, `→`, `->`, `=>`, `:`, `|`, tab
```
house - hus
cat - kat
dog - hund
```

## Security

- Teacher access protected by password (260879)
- Row Level Security (RLS) enabled on all tables
- Policies allow all operations (password protection at app level)
- Cannot delete vocabulary lists with active game links
- Links can be deactivated without deletion

## Migration

Run the database migration:
```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase dashboard
# Execute: supabase/migrations/002_vocabulary_management.sql
```

## Future Enhancements

Potential improvements:
- Link expiration dates (already in schema)
- Usage analytics per link
- Bulk operations on vocabulary lists
- Import from Quizlet/other platforms
- Student progress tracking per link
- Link access statistics
- Vocabulary list sharing between teachers
