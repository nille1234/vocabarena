-- Drop the problematic authenticated user policies
DROP POLICY IF EXISTS "Allow authenticated users full access to game links" ON game_links;
DROP POLICY IF EXISTS "Allow authenticated users full access to vocabulary lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Allow authenticated users full access to vocabulary cards" ON vocabulary_cards;

-- Game Links Policies
-- Allow authenticated users (teachers) full access to game links
CREATE POLICY "Allow authenticated users full access to game links"
  ON game_links
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Vocabulary Lists Policies
-- Allow authenticated users (teachers) full access to vocabulary lists
CREATE POLICY "Allow authenticated users full access to vocabulary lists"
  ON vocabulary_lists
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Vocabulary Cards Policies
-- Allow authenticated users (teachers) full access to vocabulary cards
CREATE POLICY "Allow authenticated users full access to vocabulary cards"
  ON vocabulary_cards
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
