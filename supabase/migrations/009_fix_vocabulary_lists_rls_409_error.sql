-- Fix RLS policies for vocabulary_lists to resolve 409 conflict errors
-- The issue is that teachers are getting blocked when trying to create vocabulary lists

-- First, drop all existing policies on vocabulary_lists to start fresh
DROP POLICY IF EXISTS "Users can read own vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Super admins can read all vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Users can create own vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Users can update own vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Users can delete own vocabulary lists" ON vocabulary_lists;

-- Create simplified, non-conflicting policies

-- SELECT policies
CREATE POLICY "Enable read for users on own lists" ON vocabulary_lists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable read for super admins on all lists" ON vocabulary_lists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'super_admin'
    )
  );

-- INSERT policy - simplified to avoid conflicts
CREATE POLICY "Enable insert for authenticated users" ON vocabulary_lists
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'super_admin')
    )
  );

-- UPDATE policy
CREATE POLICY "Enable update for users on own lists" ON vocabulary_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Enable delete for users on own lists" ON vocabulary_lists
  FOR DELETE
  USING (auth.uid() = user_id);
