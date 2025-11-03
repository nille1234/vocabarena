-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'teacher')),
  password_change_required BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id column to vocabulary_lists if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vocabulary_lists' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE vocabulary_lists ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id column to game_links if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_links' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE game_links ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lists_user_id ON vocabulary_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_game_links_user_id ON game_links(user_id);

-- Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on vocabulary_lists" ON vocabulary_lists;
DROP POLICY IF EXISTS "Allow all operations on vocabulary_cards" ON vocabulary_cards;
DROP POLICY IF EXISTS "Allow all operations on game_links" ON game_links;

-- User Profiles Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Super admins can read all profiles
CREATE POLICY "Super admins can read all profiles" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admins can create new profiles
CREATE POLICY "Super admins can create profiles" ON user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admins can update profiles
CREATE POLICY "Super admins can update profiles" ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can update their own password_change_required flag
CREATE POLICY "Users can update own password flag" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Vocabulary Lists Policies
-- Users can read their own lists
CREATE POLICY "Users can read own vocabulary lists" ON vocabulary_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can read all lists
CREATE POLICY "Super admins can read all vocabulary lists" ON vocabulary_lists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can create their own lists
CREATE POLICY "Users can create own vocabulary lists" ON vocabulary_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lists
CREATE POLICY "Users can update own vocabulary lists" ON vocabulary_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own lists
CREATE POLICY "Users can delete own vocabulary lists" ON vocabulary_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Vocabulary Cards Policies
-- Users can read cards from their own lists
CREATE POLICY "Users can read own vocabulary cards" ON vocabulary_cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- Super admins can read all cards
CREATE POLICY "Super admins can read all vocabulary cards" ON vocabulary_cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can create cards in their own lists
CREATE POLICY "Users can create own vocabulary cards" ON vocabulary_cards
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- Users can update cards in their own lists
CREATE POLICY "Users can update own vocabulary cards" ON vocabulary_cards
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

-- Users can delete cards from their own lists
CREATE POLICY "Users can delete own vocabulary cards" ON vocabulary_cards
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vocabulary_lists
      WHERE vocabulary_lists.id = vocabulary_cards.list_id
      AND vocabulary_lists.user_id = auth.uid()
    )
  );

-- Game Links Policies
-- Public read access for active game links (students need this)
CREATE POLICY "Public can read active game links" ON game_links
  FOR SELECT
  USING (is_active = true);

-- Users can read their own game links (including inactive ones)
CREATE POLICY "Users can read own game links" ON game_links
  FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can read all game links
CREATE POLICY "Super admins can read all game links" ON game_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can create their own game links
CREATE POLICY "Users can create own game links" ON game_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own game links
CREATE POLICY "Users can update own game links" ON game_links
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own game links
CREATE POLICY "Users can delete own game links" ON game_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
