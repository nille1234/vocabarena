-- Simplify RLS policy for vocabulary_lists to fix persistent 409 error
-- Remove the user_profiles check that might be causing issues

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vocabulary_lists;

-- Create a simpler INSERT policy that only checks user_id match
CREATE POLICY "Enable insert for authenticated users" ON vocabulary_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
