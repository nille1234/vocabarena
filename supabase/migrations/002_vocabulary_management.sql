-- Create vocabulary_lists table
CREATE TABLE IF NOT EXISTS vocabulary_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocabulary_cards table
CREATE TABLE IF NOT EXISTS vocabulary_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES vocabulary_lists(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  german_term TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_links table
CREATE TABLE IF NOT EXISTS game_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  list_id UUID NOT NULL REFERENCES vocabulary_lists(id) ON DELETE CASCADE,
  enabled_games TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_cards_list_id ON vocabulary_cards(list_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_cards_order ON vocabulary_cards(list_id, order_index);
CREATE INDEX IF NOT EXISTS idx_game_links_code ON game_links(code);
CREATE INDEX IF NOT EXISTS idx_game_links_list_id ON game_links(list_id);
CREATE INDEX IF NOT EXISTS idx_game_links_active ON game_links(is_active);

-- Enable Row Level Security
ALTER TABLE vocabulary_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_links ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations since password-protected at app level)
CREATE POLICY "Allow all operations on vocabulary_lists" ON vocabulary_lists
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on vocabulary_cards" ON vocabulary_cards
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on game_links" ON game_links
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vocabulary_lists
CREATE TRIGGER update_vocabulary_lists_updated_at
  BEFORE UPDATE ON vocabulary_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
