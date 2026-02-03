-- Add Blokus game settings to game_links table
ALTER TABLE game_links
ADD COLUMN IF NOT EXISTS blokus_answer_mode TEXT CHECK (blokus_answer_mode IN ('text-input', 'multiple-choice')) DEFAULT 'text-input',
ADD COLUMN IF NOT EXISTS blokus_time_limit INTEGER CHECK (blokus_time_limit IN (10, 20, 30, 40, 50, 60) OR blokus_time_limit IS NULL);

-- Add comment for documentation
COMMENT ON COLUMN game_links.blokus_answer_mode IS 'Answer mode for Blokus game: text-input or multiple-choice';
COMMENT ON COLUMN game_links.blokus_time_limit IS 'Time limit per question in Blokus (10, 20, 30, 40, 50, 60 seconds, or NULL for no limit)';
