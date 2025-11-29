-- Add word_search_word_count column to game_links table
ALTER TABLE game_links
ADD COLUMN IF NOT EXISTS word_search_word_count INTEGER DEFAULT 10;

-- Add comment to describe the column
COMMENT ON COLUMN game_links.word_search_word_count IS 'Number of words to display in word search grid (5-20)';
