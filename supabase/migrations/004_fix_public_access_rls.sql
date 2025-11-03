-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on vocabulary_lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Allow all operations on vocabulary_cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Allow all operations on game_links" ON game_links;

-- Game Links Policies
-- Allow public (anonymous) read access to active game links
CREATE POLICY "Allow public read access to active game links"
  ON game_links
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users full access to their own game links
CREATE POLICY "Allow authenticated users full access to game links"
  ON game_links
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Vocabulary Lists Policies
-- Allow public read access to vocabulary lists that are linked to active game links
CREATE POLICY "Allow public read access to vocabulary lists with active game links"
  ON vocabulary_lists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_links
      WHERE game_links.list_id = vocabulary_lists.id
      AND game_links.is_active = true
    )
  );

-- Allow authenticated users full access to vocabulary lists
CREATE POLICY "Allow authenticated users full access to vocabulary lists"
  ON vocabulary_lists
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Vocabulary Cards Policies
-- Allow public read access to vocabulary cards that belong to lists with active game links
CREATE POLICY "Allow public read access to vocabulary cards with active game links"
  ON vocabulary_cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_links
      WHERE game_links.list_id = vocabulary_cards.list_id
      AND game_links.is_active = true
    )
  );

-- Allow authenticated users full access to vocabulary cards
CREATE POLICY "Allow authenticated users full access to vocabulary cards"
  ON vocabulary_cards
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
