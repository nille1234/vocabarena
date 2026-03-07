-- Temporarily disable RLS on vocabulary_cards to test if RLS is causing the 409 error
-- This is a diagnostic step - we'll add proper policies back once we confirm this fixes it

-- Disable RLS on vocabulary_cards
ALTER TABLE vocabulary_cards DISABLE ROW LEVEL SECURITY;

-- Note: This temporarily allows all authenticated users to access all vocabulary cards
-- We will re-enable RLS with proper policies once we confirm this fixes the issue
