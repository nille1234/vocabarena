-- Fix RLS policies for vocabulary_cards to resolve 409 error
-- The issue is likely that cards can't be inserted due to strict RLS policies

-- Drop all existing policies on vocabulary_cards
DROP POLICY IF EXISTS "Users can read own vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Super admins can read all vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Users can create own vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Users can update own vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Users can delete own vocabulary cards" ON vocabulary_cards;

-- Create simplified policies for vocabulary_cards

-- SELECT: Users can read cards from their own lists
CREATE POLICY "Enable read for users on own cards" ON vocabulary_cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- SELECT: Super admins can read all cards
CREATE POLICY "Enable read for super admins on all cards" ON vocabulary_cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- INSERT: Users can insert cards into their own lists
CREATE POLICY "Enable insert for users on own cards" ON vocabulary_cards
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update cards in their own lists
CREATE POLICY "Enable update for users on own cards" ON vocabulary_cards
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete cards from their own lists
CREATE POLICY "Enable delete for users on own cards" ON vocabulary_cards
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );
