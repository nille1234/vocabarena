-- Fix infinite recursion in RLS policies by removing circular dependencies
-- The issue: policies that check user_profiles to determine super admin status
-- create infinite loops when querying user_profiles itself

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Super admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can read all vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Super admins can read all vocabulary cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Super admins can read all game links" ON game_links;

-- User Profiles Policies (simplified, no recursion)
-- Users can read their own profile
-- Note: Super admin access to all profiles will be handled via API with service role key

-- Vocabulary Lists Policies (keep user isolation)
-- Users can already read their own lists via existing policy
-- Super admin read access will be handled at application level

-- Vocabulary Cards Policies (keep user isolation)
-- Users can already read cards from their own lists via existing policy
-- Super admin read access will be handled at application level

-- Game Links Policies (keep user isolation)
-- Users can already read their own game links via existing policy
-- Public can read active game links (for students)
-- Super admin read access will be handled at application level

-- Note: The following policies remain active and work correctly:
-- - "Users can read own profile" ON user_profiles
-- - "Users can update own password flag" ON user_profiles
-- - "Users can read own vocabulary lists" ON vocabulary_lists
-- - "Users can create own vocabulary lists" ON vocabulary_lists
-- - "Users can update own vocabulary lists" ON vocabulary_lists
-- - "Users can delete own vocabulary lists" ON vocabulary_lists
-- - "Users can read own vocabulary cards" ON vocabulary_cards
-- - "Users can create own vocabulary cards" ON vocabulary_cards
-- - "Users can update own vocabulary cards" ON vocabulary_cards
-- - "Users can delete own vocabulary cards" ON vocabulary_cards
-- - "Public can read active game links" ON game_links
-- - "Users can read own game links" ON game_links
-- - "Users can create own game links" ON game_links
-- - "Users can update own game links" ON game_links
-- - "Users can delete own game links" ON game_links
