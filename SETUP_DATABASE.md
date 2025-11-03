# Database Setup Guide

Your Supabase credentials are now configured! ✅

However, you need to create the database tables manually through the Supabase dashboard.

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Log in to your account
3. Select your **VocabArena** project (ID: `bgotjqweuzcdcvspbcxb`)

### 2. Open SQL Editor
1. In the left sidebar, click on **SQL Editor** (icon looks like `</>`)
2. Click **"New query"** button

### 3. Copy the Migration SQL
Open the file `supabase/migrations/002_vocabulary_management.sql` in this project and copy ALL of its contents.

Or copy this SQL directly:

```sql
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
```

### 4. Run the SQL
1. Paste the SQL into the SQL Editor
2. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
3. Wait for it to complete (should take just a few seconds)
4. You should see "Success. No rows returned" message

### 5. Verify Tables Were Created
1. In the left sidebar, click on **Table Editor**
2. You should now see three new tables:
   - `vocabulary_lists`
   - `vocabulary_cards`
   - `game_links`

### 6. Test the Connection
1. Go back to your app at `/teacher/test-db`
2. Click "Run Tests Again"
3. All three checks should show green checkmarks ✅

## What These Tables Do

- **vocabulary_lists**: Stores collections of vocabulary words (e.g., "Spanish Verbs", "German Animals")
- **vocabulary_cards**: Individual vocabulary items with term, definition, and optional German translation
- **game_links**: Shareable game links that teachers create for students to join games

## Troubleshooting

### If you see "relation already exists" errors
This is fine! It means some tables were already created. The SQL uses `IF NOT EXISTS` so it won't break anything.

### If you see permission errors
Make sure you're logged into the correct Supabase account and have selected the right project.

### If tables don't appear
1. Refresh the Table Editor page
2. Check the SQL Editor for any error messages
3. Make sure the SQL ran completely without errors

## Next Steps

Once the tables are created and the test page shows all green checkmarks:
1. You can start creating vocabulary lists
2. Generate game links for students
3. Students can join games using the links

---

**Need help?** Check the test page at `/teacher/test-db` for detailed status and error messages.
