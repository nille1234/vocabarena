# RLS Fix for Public Game Access

## Problem
Game links created through the teacher dashboard (e.g., `/play/9VYGTB`) were not accessible on the deployed Netlify site. Students visiting these links would see errors or blank pages.

## Root Cause
The Supabase Row Level Security (RLS) policies were overly permissive but required authentication. The policies used `USING (true)` which allows all operations, but only for authenticated users. Anonymous/public users (students) couldn't access the game data.

## Solution Applied
Created migration `004_fix_public_access_rls.sql` that:

1. **Dropped old policies** that required authentication for all operations
2. **Created new public read policies** that allow anonymous users to:
   - Read active game links from `game_links` table
   - Read vocabulary lists that are linked to active game links
   - Read vocabulary cards that belong to those lists

3. **Maintained security** by:
   - Only exposing data for active game links (`is_active = true`)
   - Giving authenticated users (teachers) full access to manage their data
   - Using EXISTS clauses to ensure vocabulary data is only accessible when linked to an active game

## Security Model

### For Anonymous Users (Students)
- **Can read**: Active game links and their associated vocabulary
- **Cannot**: Create, update, or delete any data
- **Cannot access**: Inactive game links or vocabulary not linked to active games

### For Authenticated Users (Teachers)
- **Full access**: Can create, read, update, and delete all game links and vocabulary

## Testing
After applying this migration, students can now:
1. Visit `/play/[CODE]` links without authentication
2. See the game selection page with available games
3. Play games using the vocabulary from the linked list

Teachers can still:
1. Create and manage vocabulary lists
2. Create and manage game links
3. Control which games are enabled for each link
4. Activate/deactivate links as needed

## Migration Applied
The migration was successfully applied to the Supabase database on 2025-11-02.
