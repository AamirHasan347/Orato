-- Achievements & Rewards System - Database Setup
-- Run this in your Supabase SQL Editor
-- This creates tables for badges, XP, levels, and achievements

-- 1. Create achievements table (defines all available achievements)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_key TEXT NOT NULL UNIQUE, -- e.g., "streak_7", "fluency_80"
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL, -- Icon name or emoji
  badge_color TEXT NOT NULL, -- e.g., "gold", "silver", "bronze"
  category TEXT NOT NULL, -- e.g., "streak", "fluency", "practice", "social"
  requirement_type TEXT NOT NULL, -- e.g., "streak_days", "fluency_score", "total_sessions"
  requirement_value INTEGER NOT NULL, -- The threshold to unlock
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create user_achievements table (tracks which achievements users have earned)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  is_new BOOLEAN DEFAULT true, -- For showing "NEW!" badge
  shared_at TIMESTAMP WITH TIME ZONE, -- Track if/when achievement was shared
  UNIQUE(user_id, achievement_id)
);

-- 3. Create user_progress table (tracks XP, level, streaks)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_sessions INTEGER DEFAULT 0,
  total_words_learned INTEGER DEFAULT 0,
  best_fluency_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Create achievement_history table (logs when achievements are earned for analytics)
CREATE TABLE IF NOT EXISTS achievement_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  user_level_at_unlock INTEGER,
  user_xp_at_unlock INTEGER
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievement_history_user_id ON achievement_history(user_id);

-- Enable Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_history ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (public read access)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for achievement_history
CREATE POLICY "Users can view their own achievement history" ON achievement_history
  FOR SELECT USING (auth.uid() = user_id);

-- Insert predefined achievements
INSERT INTO achievements (achievement_key, title, description, badge_icon, badge_color, category, requirement_type, requirement_value, xp_reward) VALUES
-- Streak Achievements
('streak_3', '3-Day Streak', 'Practice for 3 days in a row', '🔥', 'bronze', 'streak', 'streak_days', 3, 50),
('streak_7', '7-Day Warrior', 'Achieve a 7-day practice streak', '⚡', 'silver', 'streak', 'streak_days', 7, 150),
('streak_14', '2-Week Champion', 'Maintain a 14-day streak', '💪', 'gold', 'streak', 'streak_days', 14, 300),
('streak_30', 'Monthly Master', 'Complete 30 days in a row!', '👑', 'platinum', 'streak', 'streak_days', 30, 750),

-- Fluency Achievements
('fluency_50', 'Half-Way There', 'Reach 50% fluency score', '🎯', 'bronze', 'fluency', 'fluency_score', 50, 100),
('fluency_70', 'Conversationalist', 'Achieve 70% fluency', '🗣️', 'silver', 'fluency', 'fluency_score', 70, 200),
('fluency_80', 'Near Native', 'Reach 80% fluency score', '🌟', 'gold', 'fluency', 'fluency_score', 80, 400),
('fluency_90', 'Fluent Speaker', 'Master 90% fluency!', '🚀', 'platinum', 'fluency', 'fluency_score', 90, 1000),

-- Practice Achievements
('sessions_5', 'Getting Started', 'Complete 5 practice sessions', '📚', 'bronze', 'practice', 'total_sessions', 5, 50),
('sessions_25', 'Committed Learner', 'Finish 25 practice sessions', '📖', 'silver', 'practice', 'total_sessions', 25, 150),
('sessions_50', 'Dedicated Student', 'Complete 50 sessions!', '🎓', 'gold', 'practice', 'total_sessions', 50, 300),
('sessions_100', 'Century Club', 'Achieve 100 practice sessions', '💯', 'platinum', 'practice', 'total_sessions', 100, 750),

-- Vocabulary Achievements
('words_50', 'Word Explorer', 'Learn 50 new words', '📝', 'bronze', 'vocabulary', 'words_learned', 50, 75),
('words_100', 'Vocabulary Builder', 'Master 100 words', '📚', 'silver', 'vocabulary', 'words_learned', 100, 200),
('words_250', 'Wordsmith', 'Learn 250 words!', '✍️', 'gold', 'vocabulary', 'words_learned', 250, 500),
('words_500', 'Lexicon Master', 'Conquer 500 words!', '📖', 'platinum', 'vocabulary', 'words_learned', 500, 1200),

-- Level Achievements
('level_5', 'Novice Graduate', 'Reach Level 5', '🥉', 'bronze', 'level', 'current_level', 5, 100),
('level_10', 'Intermediate Learner', 'Reach Level 10', '🥈', 'silver', 'level', 'current_level', 10, 250),
('level_20', 'Advanced Speaker', 'Reach Level 20', '🥇', 'gold', 'level', 'current_level', 20, 500),
('level_50', 'Orato Legend', 'Reach Level 50!', '🏆', 'platinum', 'level', 'current_level', 50, 2000),

-- Special Achievements
('first_quiz', 'Quiz Taker', 'Complete your first quiz', '✅', 'bronze', 'special', 'custom', 1, 25),
('perfect_quiz', 'Perfect Score', 'Get 100% on a quiz', '💯', 'gold', 'special', 'custom', 1, 200),
('social_share', 'Show Off', 'Share an achievement', '📱', 'silver', 'social', 'custom', 1, 50),
('early_bird', 'Early Bird', 'Practice before 8 AM', '🌅', 'bronze', 'special', 'custom', 1, 50),
('night_owl', 'Night Owl', 'Practice after 10 PM', '🦉', 'bronze', 'special', 'custom', 1, 50)

ON CONFLICT (achievement_key) DO NOTHING;

-- Function to calculate XP required for next level (exponential scaling)
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level 1->2: 100 XP, Level 2->3: 150 XP, Level 3->4: 225 XP, etc.
  -- Formula: 100 * (1.5 ^ (level - 1))
  RETURN FLOOR(100 * POWER(1.5, level - 1));
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current level based on total XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  level INTEGER := 1;
  xp_needed INTEGER := 0;
  cumulative_xp INTEGER := 0;
BEGIN
  WHILE cumulative_xp <= total_xp LOOP
    xp_needed := calculate_xp_for_level(level);
    cumulative_xp := cumulative_xp + xp_needed;
    IF cumulative_xp <= total_xp THEN
      level := level + 1;
    END IF;
  END LOOP;
  RETURN level;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak (call this daily)
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  last_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT last_activity_date INTO last_date
  FROM user_progress
  WHERE user_id = p_user_id;

  IF last_date IS NULL THEN
    -- First activity ever
    UPDATE user_progress
    SET current_streak = 1,
        longest_streak = 1,
        last_activity_date = today,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF last_date = today THEN
    -- Already logged today, no change
    RETURN;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE user_progress
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = today,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken
    UPDATE user_progress
    SET current_streak = 1,
        last_activity_date = today,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Achievements & Rewards system created successfully!';
  RAISE NOTICE 'Tables created: achievements, user_achievements, user_progress, achievement_history';
  RAISE NOTICE 'Total achievements defined: 25';
  RAISE NOTICE 'Helper functions created: calculate_xp_for_level, calculate_level_from_xp, update_user_streak';
END $$;
