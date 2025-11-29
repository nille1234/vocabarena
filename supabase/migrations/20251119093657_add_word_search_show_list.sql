-- Add word_search_show_list column to game_links table
ALTER TABLE game_links
ADD COLUMN IF NOT EXISTS word_search_show_list BOOLEAN DEFAULT true;

-- Add comment to describe the column
COMMENT ON COLUMN game_links.word_search_show_list IS 'Whether to show the word list with Danish translations above the word search grid';
