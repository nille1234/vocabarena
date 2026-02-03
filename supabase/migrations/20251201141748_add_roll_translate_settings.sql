-- Add roll_translate_answer_mode column to game_links table
ALTER TABLE game_links
ADD COLUMN IF NOT EXISTS roll_translate_answer_mode TEXT DEFAULT 'text-input'
CHECK (roll_translate_answer_mode IN ('text-input', 'multiple-choice'));

-- Add comment
COMMENT ON COLUMN game_links.roll_translate_answer_mode IS 'Answer mode for Roll & Translate game: text-input or multiple-choice';
