-- Add language column to vocabulary_lists table
ALTER TABLE vocabulary_lists
ADD COLUMN IF NOT EXISTS language TEXT CHECK (language IN ('english', 'german'));

-- Add crossword_word_count column to game_links table
ALTER TABLE game_links
ADD COLUMN IF NOT EXISTS crossword_word_count INTEGER DEFAULT 10 CHECK (crossword_word_count >= 5 AND crossword_word_count <= 25);

-- Add unique constraint to prevent duplicate vocabulary list names
ALTER TABLE vocabulary_lists
ADD CONSTRAINT vocabulary_lists_name_unique UNIQUE (name);

-- Add comment to explain the columns
COMMENT ON COLUMN vocabulary_lists.language IS 'Language for clues in games like crossword (english or german)';
COMMENT ON COLUMN game_links.crossword_word_count IS 'Number of words to include in crossword puzzle (5-25)';
