-- Add gap-fill game settings to game_links table
ALTER TABLE game_links 
ADD COLUMN IF NOT EXISTS gap_fill_gap_count INTEGER,
ADD COLUMN IF NOT EXISTS gap_fill_summary_length INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN game_links.gap_fill_gap_count IS 'Number of gaps in gap-fill summary (10, 15, 20, 25)';
COMMENT ON COLUMN game_links.gap_fill_summary_length IS 'Word count for gap-fill summary text';
