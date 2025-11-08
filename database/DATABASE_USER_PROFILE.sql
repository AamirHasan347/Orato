-- User Profile & Settings - Database Setup
-- Run this in your Supabase SQL Editor
-- This creates tables for user profiles, preferences, and settings

-- 1. Create user_profiles table (extends auth.users with profile data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  display_name TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  date_of_birth DATE,
  country TEXT,
  native_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create user_preferences table (learning preferences and settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Learning preferences
  target_accent TEXT DEFAULT 'american' CHECK (target_accent IN ('american', 'british', 'australian', 'neutral')),
  learning_focus TEXT DEFAULT 'balanced' CHECK (learning_focus IN ('fluency', 'grammar', 'vocabulary', 'pronunciation', 'balanced')),
  difficulty_preference TEXT DEFAULT 'adaptive' CHECK (difficulty_preference IN ('easy', 'medium', 'hard', 'adaptive')),
  daily_goal_minutes INTEGER DEFAULT 15 CHECK (daily_goal_minutes >= 5 AND daily_goal_minutes <= 180),
  -- UI preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar')),
  timezone TEXT DEFAULT 'UTC',
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  daily_reminder BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00:00',
  weekly_report BOOLEAN DEFAULT true,
  -- Privacy preferences
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
  show_progress BOOLEAN DEFAULT true,
  allow_leaderboard BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create cefr_levels table (CEFR level tracking over time)
CREATE TABLE IF NOT EXISTS cefr_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  overall_score DECIMAL(5,2) NOT NULL,
  fluency_score DECIMAL(5,2),
  grammar_score DECIMAL(5,2),
  vocabulary_score DECIMAL(5,2),
  listening_score DECIMAL(5,2),
  confidence_score DECIMAL(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  is_current BOOLEAN DEFAULT true
);

-- 4. Create profile_activity_log (track profile changes for audit)
CREATE TABLE IF NOT EXISTS profile_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('profile_update', 'photo_upload', 'preferences_change', 'theme_change', 'report_download')),
  activity_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_cefr_levels_user_id ON cefr_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_cefr_levels_current ON cefr_levels(user_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_profile_activity_log_user_id ON profile_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_activity_log_created ON profile_activity_log(created_at);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cefr_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = user_profiles.user_id
      AND user_preferences.profile_visibility = 'public'
    )
  );

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for cefr_levels
CREATE POLICY "Users can view their own CEFR levels" ON cefr_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CEFR levels" ON cefr_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for profile_activity_log
CREATE POLICY "Users can view their own activity log" ON profile_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON profile_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to calculate CEFR level from performance scores
CREATE OR REPLACE FUNCTION calculate_cefr_level(
  p_fluency DECIMAL,
  p_grammar DECIMAL,
  p_vocabulary DECIMAL,
  p_confidence DECIMAL
)
RETURNS TEXT AS $$
DECLARE
  v_overall_score DECIMAL;
  v_level TEXT;
BEGIN
  -- Calculate weighted average
  v_overall_score := (
    (COALESCE(p_fluency, 0) * 0.3) +
    (COALESCE(p_grammar, 0) * 0.3) +
    (COALESCE(p_vocabulary, 0) * 0.25) +
    (COALESCE(p_confidence, 0) * 0.15)
  );

  -- Determine CEFR level
  IF v_overall_score < 30 THEN
    v_level := 'A1';
  ELSIF v_overall_score >= 30 AND v_overall_score < 45 THEN
    v_level := 'A2';
  ELSIF v_overall_score >= 45 AND v_overall_score < 60 THEN
    v_level := 'B1';
  ELSIF v_overall_score >= 60 AND v_overall_score < 75 THEN
    v_level := 'B2';
  ELSIF v_overall_score >= 75 AND v_overall_score < 90 THEN
    v_level := 'C1';
  ELSE
    v_level := 'C2';
  END IF;

  RETURN v_level;
END;
$$ LANGUAGE plpgsql;

-- Function to update CEFR level
CREATE OR REPLACE FUNCTION update_cefr_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_performance RECORD;
  v_new_level TEXT;
  v_overall_score DECIMAL;
BEGIN
  -- Get user's performance data
  SELECT
    avg_fluency_score,
    avg_grammar_score,
    avg_vocabulary_quiz_score,
    avg_confidence_score
  INTO v_performance
  FROM user_performance_summary
  WHERE user_id = p_user_id;

  IF v_performance IS NULL THEN
    RETURN 'A1'; -- Default for new users
  END IF;

  -- Calculate overall score
  v_overall_score := (
    (COALESCE(v_performance.avg_fluency_score, 0) * 0.3) +
    (COALESCE(v_performance.avg_grammar_score, 0) * 0.3) +
    (COALESCE(v_performance.avg_vocabulary_quiz_score, 0) * 0.25) +
    (COALESCE(v_performance.avg_confidence_score, 0) * 0.15)
  );

  -- Calculate CEFR level
  v_new_level := calculate_cefr_level(
    v_performance.avg_fluency_score,
    v_performance.avg_grammar_score,
    v_performance.avg_vocabulary_quiz_score,
    v_performance.avg_confidence_score
  );

  -- Mark previous levels as not current
  UPDATE cefr_levels
  SET is_current = false
  WHERE user_id = p_user_id AND is_current = true;

  -- Insert new level
  INSERT INTO cefr_levels (
    user_id,
    level,
    overall_score,
    fluency_score,
    grammar_score,
    vocabulary_score,
    confidence_score,
    is_current
  ) VALUES (
    p_user_id,
    v_new_level,
    v_overall_score,
    v_performance.avg_fluency_score,
    v_performance.avg_grammar_score,
    v_performance.avg_vocabulary_quiz_score,
    v_performance.avg_confidence_score,
    true
  );

  RETURN v_new_level;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user profile and preferences
CREATE OR REPLACE FUNCTION initialize_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default profile
  INSERT INTO user_profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  -- Create default preferences
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);

  -- Create initial CEFR level
  INSERT INTO cefr_levels (user_id, level, overall_score, is_current)
  VALUES (NEW.id, 'A1', 0, true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize profile when user signs up
DROP TRIGGER IF EXISTS trigger_initialize_user_profile ON auth.users;
CREATE TRIGGER trigger_initialize_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_profile();

-- Function to log profile activity
CREATE OR REPLACE FUNCTION log_profile_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_activity_log (user_id, activity_type, activity_details)
  VALUES (
    NEW.user_id,
    TG_ARGV[0]::TEXT,
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity logging
DROP TRIGGER IF EXISTS trigger_log_profile_update ON user_profiles;
CREATE TRIGGER trigger_log_profile_update
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_activity('profile_update');

DROP TRIGGER IF EXISTS trigger_log_preferences_update ON user_preferences;
CREATE TRIGGER trigger_log_preferences_update
  AFTER UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_activity('preferences_change');

-- CEFR Level descriptions
CREATE TABLE IF NOT EXISTS cefr_descriptions (
  level TEXT PRIMARY KEY CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  can_do TEXT[] NOT NULL
);

INSERT INTO cefr_descriptions (level, title, description, can_do) VALUES
('A1', 'Beginner', 'Can understand and use familiar everyday expressions and very basic phrases.', ARRAY[
  'Introduce yourself and others',
  'Ask and answer simple questions',
  'Interact in a simple way'
]),
('A2', 'Elementary', 'Can understand sentences and frequently used expressions related to areas of most immediate relevance.', ARRAY[
  'Describe your background',
  'Communicate in simple tasks',
  'Describe matters of immediate need'
]),
('B1', 'Intermediate', 'Can understand the main points of clear standard input on familiar matters regularly encountered.', ARRAY[
  'Deal with most travel situations',
  'Produce simple connected text',
  'Describe experiences and events'
]),
('B2', 'Upper Intermediate', 'Can understand the main ideas of complex text on both concrete and abstract topics.', ARRAY[
  'Interact with native speakers fluently',
  'Produce detailed text on subjects',
  'Explain viewpoints on topical issues'
]),
('C1', 'Advanced', 'Can understand a wide range of demanding, longer texts, and recognize implicit meaning.', ARRAY[
  'Express ideas fluently and spontaneously',
  'Use language flexibly for social purposes',
  'Produce well-structured, detailed text'
]),
('C2', 'Proficient', 'Can understand with ease virtually everything heard or read.', ARRAY[
  'Express yourself spontaneously and precisely',
  'Summarize information from different sources',
  'Reconstruct arguments and accounts coherently'
])
ON CONFLICT (level) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User Profile & Settings system created successfully!';
  RAISE NOTICE 'Tables created: user_profiles, user_preferences, cefr_levels, profile_activity_log, cefr_descriptions';
  RAISE NOTICE 'Functions created: calculate_cefr_level, update_cefr_level, initialize_user_profile';
  RAISE NOTICE 'Triggers created: auto-initialize profiles, activity logging';
  RAISE NOTICE 'Storage bucket for profile photos should be created manually in Supabase Storage';
END $$;
