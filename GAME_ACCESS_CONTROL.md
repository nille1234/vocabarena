# Game Access Control System

## Overview

The game access control system ensures that students can only access the specific games that teachers have enabled for each game link. This prevents students from bypassing the teacher's selections by manually typing URLs.

## How It Works

### 1. Database Level

The `game_links` table contains an `enabled_games` array field that stores which game modes are allowed for each game code:

```sql
CREATE TABLE game_links (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  list_id UUID REFERENCES vocabulary_lists(id),
  enabled_games TEXT[] NOT NULL,  -- Array of allowed game modes
  is_active BOOLEAN DEFAULT TRUE,
  ...
);
```

### 2. Server-Side Validation

**File:** `lib/supabase/gameAccess.ts`

The `validateGameAccess()` function performs server-side validation:

```typescript
export async function validateGameAccess(
  code: string,
  requestedGameMode?: GameMode
): Promise<GameAccessResult>
```

This function:
- Fetches the game link from the database
- Checks if the game link is active
- Verifies if the requested game mode is in the `enabled_games` array
- Returns validation result with error messages if access is denied

### 3. API Route

**File:** `app/api/game-access/route.ts`

Exposes the validation logic via a GET endpoint:
- `GET /api/game-access?code=ABC123&gameMode=word-scramble`
- Returns 403 status if access is denied
- Returns 200 with enabled games list if allowed

### 4. Client-Side Components

#### GameAccessGuard Component

**File:** `components/game/GameAccessGuard.tsx`

A wrapper component that protects individual game pages:

```tsx
<GameAccessGuard gameCode={code} gameMode="word-scramble">
  <YourGameComponent />
</GameAccessGuard>
```

Features:
- Shows loading state while validating
- Displays access denied message if unauthorized
- Provides buttons to view available games or go home
- Only renders children if access is granted

#### Game Selector Page

**File:** `app/game/[code]/page.tsx`

The game selection page:
- Fetches enabled games for the game code
- Filters the game list to only show enabled games
- Shows error if no games are enabled
- Prevents students from seeing unauthorized games

## Protected Game Pages

All game pages are protected with the `GameAccessGuard`:

- ✅ word-scramble
- ✅ word-search  
- ⏳ crossword (needs update)
- ⏳ gravity (needs update)
- ⏳ hangman (needs update)
- ⏳ hex (needs update)
- ⏳ match (needs update)
- ⏳ memory (needs update)
- ⏳ othello (needs update)
- ⏳ tic-tac-toe (needs update)
- ⏳ word-finder (needs update)

## Security Features

### 1. Multi-Layer Protection

- **Database RLS**: Row-level security ensures only authorized data access
- **Server validation**: Server-side checks prevent API manipulation
- **Client validation**: UI prevents accidental unauthorized access
- **URL protection**: Direct URL access is blocked for unauthorized games

### 2. Active Link Validation

Game links can be deactivated by teachers:
- Inactive links return "Game link is not active" error
- Students cannot access any games from inactive links
- Teachers can reactivate links at any time

### 3. Clear User Feedback

Students receive clear messages when access is denied:
- "Access Denied" with specific error message
- Button to view available games
- Button to return home
- No confusion about why access was blocked

## Teacher Workflow

### Creating a Game Link

1. Teacher selects a vocabulary list
2. Teacher chooses which games to enable (checkboxes)
3. System creates game link with `enabled_games` array
4. Students can only access the selected games

### Managing Access

Teachers can:
- Edit game links to add/remove enabled games
- Deactivate links to temporarily block all access
- Reactivate links to restore access
- Delete links to permanently remove access

## Student Experience

### Accessing Games

1. Student enters game code or clicks link
2. System validates the code and shows game selector
3. Student sees only the games teacher enabled
4. Student clicks a game to play

### Blocked Access

If a student tries to access an unauthorized game:
1. GameAccessGuard validates access
2. Shows "Access Denied" message
3. Explains the game is not available
4. Provides button to see available games

## Implementation Guide

### Adding GameAccessGuard to a New Game Page

1. Import the component:
```typescript
import { GameAccessGuard } from '@/components/game/GameAccessGuard';
```

2. Wrap your game component:
```tsx
return (
  <GameAccessGuard gameCode={code} gameMode="your-game-mode">
    <YourGameComponent />
  </GameAccessGuard>
);
```

3. Ensure the game mode matches the value in `types/game.ts`:
```typescript
export type GameMode = 
  | 'match' | 'gravity' | 'hangman'
  | 'memory' | 'othello' | 'tic-tac-toe' 
  | 'hex' | 'crossword'
  | 'word-scramble' | 'word-search' 
  | 'word-finder';
```

### Testing Access Control

1. Create a game link with only one game enabled
2. Try to access an unauthorized game via URL
3. Verify "Access Denied" message appears
4. Verify game selector only shows enabled games
5. Test with inactive link
6. Test with invalid game code

## Troubleshooting

### Students Can Access Unauthorized Games

- Check if GameAccessGuard is properly wrapped around the game component
- Verify the game mode string matches exactly in types/game.ts
- Check database to ensure enabled_games array is correct
- Verify API route is working: `/api/game-access?code=XXX&gameMode=YYY`

### "Access Denied" for Authorized Games

- Check if game link is active (is_active = true)
- Verify game mode is in the enabled_games array
- Check for typos in game mode names
- Verify game code is correct

### Game Selector Shows No Games

- Check if enabled_games array is empty in database
- Verify game link exists and is active
- Check browser console for API errors
- Verify vocabulary list is attached to game link

## Future Enhancements

Potential improvements:
- Time-based access restrictions
- Student-specific game access
- Usage analytics per game mode
- Automatic game recommendations based on performance
- Bulk enable/disable games across multiple links
