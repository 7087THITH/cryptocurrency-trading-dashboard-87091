-- Security fix: Add NOT NULL constraints to user_id columns
-- This prevents orphaned records and ensures RLS policies work correctly

-- First, ensure no NULL values exist (clean up any orphaned records)
DELETE FROM alert_rules WHERE user_id IS NULL;
DELETE FROM notifications WHERE user_id IS NULL;
DELETE FROM user_preferences WHERE user_id IS NULL;
DELETE FROM watchlist WHERE user_id IS NULL;

-- Add NOT NULL constraints
ALTER TABLE alert_rules ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_preferences ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE watchlist ALTER COLUMN user_id SET NOT NULL;