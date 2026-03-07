-- Complete RLS reset and fix for vocabulary tables
-- This migration starts fresh with simple, working policies

-- Step 1: Re-enable RLS on both tables
ALTER TABLE vocabulary_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_cards ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Super admins can read all vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Users can create own vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Users can update own vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Users can delete own vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Enable read for users on own lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Enable read for super admins on all lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vocabulary_lists;
DROP POLICY IF EXISTS "Enable update for users on own lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Enable delete for users on own lists" ON vocabulary_lists;

DROP POLICY IF EXISTS "Users can read own vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Super admins can read all vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Users can create own vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Users can update own vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Users can delete own vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Enable read for users on own cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Enable read for super admins on all cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Enable insert for users on own cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Enable update for users on own cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Enable delete for users on own cards" ON vocabulary_cards;

-- Step 3: Create simple, working policies for vocabulary_lists

-- Allow authenticated users to read their own lists
CREATE POLICY "vocabulary_lists_select_own" ON vocabulary_lists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated users to insert their own lists
CREATE POLICY "vocabulary_lists_insert_own" ON vocabulary_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to update their own lists
CREATE POLICY "vocabulary_lists_update_own" ON vocabulary_lists
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to delete their own lists
CREATE POLICY "vocabulary_lists_delete_own" ON vocabulary_lists
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 4: Create simple, working policies for vocabulary_cards

-- Allow authenticated users to read cards from their own lists
CREATE POLICY "vocabulary_cards_select_own" ON vocabulary_cards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- Allow authenticated users to insert cards into their own lists
CREATE POLICY "vocabulary_cards_insert_own" ON vocabulary_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- Allow authenticated users to update cards in their own lists
CREATE POLICY "vocabulary_cards_update_own" ON vocabulary_cards
  FOR UPDATE
  TO authenticated
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

-- Allow authenticated users to delete cards from their own lists
CREATE POLICY "vocabulary_cards_delete_own" ON vocabulary_cards
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );
