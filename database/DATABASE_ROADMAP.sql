-- 30-Day Personalized Roadmap - Database Setup
-- Run this in your Supabase SQL Editor
-- This creates tables for personalized learning roadmaps

-- 1. Create roadmaps table (stores user's roadmap metadata)
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 30,
  completed_days INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'regenerated')),
  performance_snapshot JSONB, -- Stores user's performance data at generation time
  weak_areas JSONB, -- Array of focus areas: ['fluency', 'grammar', 'vocabulary']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, start_date)
);

-- 2. Create roadmap_days table (stores each day's tasks)
CREATE TABLE IF NOT EXISTS roadmap_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  task_type TEXT NOT NULL CHECK (task_type IN ('speaking', 'grammar', 'vocabulary', 'listening', 'challenge', 'review', 'mixed')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_minutes INTEGER DEFAULT 10,
  target_feature TEXT, -- e.g., 'grammar-quiz', 'record', 'word-of-day', 'daily-challenge'
  focus_area TEXT, -- e.g., 'fluency', 'grammar', 'vocabulary', 'confidence', 'pronunciation'
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_reward INTEGER DEFAULT 0,
  motivational_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(roadmap_id, day_number)
);

-- 3. Create roadmap_milestones table (tracks 7, 15, 30 day achievements)
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_day INTEGER NOT NULL CHECK (milestone_day IN (7, 15, 30)),
  reached BOOLEAN DEFAULT false,
  reached_at TIMESTAMP WITH TIME ZONE,
  celebration_shown BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(roadmap_id, milestone_day)
);

-- 4. Create user_performance_summary table (aggregates performance data)
CREATE TABLE IF NOT EXISTS user_performance_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Speech/Fluency metrics
  avg_fluency_score DECIMAL(5,2) DEFAULT 0,
  avg_confidence_score DECIMAL(5,2) DEFAULT 0,
  avg_pronunciation_score DECIMAL(5,2) DEFAULT 0,
  total_recordings INTEGER DEFAULT 0,
  -- Grammar metrics
  avg_grammar_score DECIMAL(5,2) DEFAULT 0,
  total_grammar_quizzes INTEGER DEFAULT 0,
  grammar_weak_topics JSONB, -- Array of weak grammar topics
  -- Vocabulary metrics
  vocabulary_size INTEGER DEFAULT 0,
  words_learned_last_week INTEGER DEFAULT 0,
  avg_vocabulary_quiz_score DECIMAL(5,2) DEFAULT 0,
  -- Challenge metrics
  total_challenges_completed INTEGER DEFAULT 0,
  avg_challenge_score DECIMAL(5,2) DEFAULT 0,
  -- Overall metrics
  total_practice_days INTEGER DEFAULT 0,
  last_active_date DATE,
  overall_level TEXT DEFAULT 'beginner' CHECK (overall_level IN ('beginner', 'intermediate', 'advanced')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON roadmaps(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_days_roadmap_id ON roadmap_days(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_days_user_id ON roadmap_days(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_days_completed ON roadmap_days(completed);
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_roadmap_id ON roadmap_milestones(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_user_id ON user_performance_summary(user_id);

-- Enable Row Level Security
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance_summary ENABLE ROW LEVEL SECURITY;

-- Policies for roadmaps
CREATE POLICY "Users can view their own roadmaps" ON roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps" ON roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" ON roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps" ON roadmaps
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for roadmap_days
CREATE POLICY "Users can view their own roadmap days" ON roadmap_days
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmap days" ON roadmap_days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmap days" ON roadmap_days
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for roadmap_milestones
CREATE POLICY "Users can view their own milestones" ON roadmap_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones" ON roadmap_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" ON roadmap_milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_performance_summary
CREATE POLICY "Users can view their own performance" ON user_performance_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance" ON user_performance_summary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance" ON user_performance_summary
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update roadmap progress
CREATE OR REPLACE FUNCTION update_roadmap_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update roadmap when a day is completed
  IF NEW.completed = true AND OLD.completed = false THEN
    UPDATE roadmaps
    SET
      completed_days = (
        SELECT COUNT(*)
        FROM roadmap_days
        WHERE roadmap_id = NEW.roadmap_id AND completed = true
      ),
      completion_rate = (
        SELECT (COUNT(*) FILTER (WHERE completed = true) * 100.0 / COUNT(*))::DECIMAL(5,2)
        FROM roadmap_days
        WHERE roadmap_id = NEW.roadmap_id
      ),
      current_day = LEAST(
        (SELECT MAX(day_number) + 1 FROM roadmap_days WHERE roadmap_id = NEW.roadmap_id AND completed = true),
        30
      ),
      updated_at = NOW()
    WHERE id = NEW.roadmap_id;

    -- Check for milestones
    UPDATE roadmap_milestones
    SET
      reached = true,
      reached_at = NOW()
    WHERE roadmap_id = NEW.roadmap_id
      AND milestone_day <= (SELECT completed_days FROM roadmaps WHERE id = NEW.roadmap_id)
      AND reached = false;

    -- Check if roadmap is completed
    UPDATE roadmaps
    SET status = 'completed'
    WHERE id = NEW.roadmap_id
      AND completed_days >= total_days;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update roadmap progress
DROP TRIGGER IF EXISTS trigger_update_roadmap_progress ON roadmap_days;
CREATE TRIGGER trigger_update_roadmap_progress
  AFTER UPDATE OF completed ON roadmap_days
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_progress();

-- Function to initialize milestones when roadmap is created
CREATE OR REPLACE FUNCTION initialize_roadmap_milestones()
RETURNS TRIGGER AS $$
BEGIN
  -- Create milestone entries for day 7, 15, and 30
  INSERT INTO roadmap_milestones (roadmap_id, user_id, milestone_day)
  VALUES
    (NEW.id, NEW.user_id, 7),
    (NEW.id, NEW.user_id, 15),
    (NEW.id, NEW.user_id, 30);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize milestones
DROP TRIGGER IF EXISTS trigger_initialize_milestones ON roadmaps;
CREATE TRIGGER trigger_initialize_milestones
  AFTER INSERT ON roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION initialize_roadmap_milestones();

-- Function to calculate user's overall level
CREATE OR REPLACE FUNCTION calculate_user_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_avg_score DECIMAL;
  v_level TEXT;
BEGIN
  SELECT
    (COALESCE(avg_fluency_score, 0) +
     COALESCE(avg_grammar_score, 0) +
     COALESCE(avg_vocabulary_quiz_score, 0)) / 3
  INTO v_avg_score
  FROM user_performance_summary
  WHERE user_id = p_user_id;

  IF v_avg_score IS NULL OR v_avg_score < 50 THEN
    v_level := 'beginner';
  ELSIF v_avg_score >= 50 AND v_avg_score < 75 THEN
    v_level := 'intermediate';
  ELSE
    v_level := 'advanced';
  END IF;

  RETURN v_level;
END;
$$ LANGUAGE plpgsql;

-- Insert motivational tips
CREATE TABLE IF NOT EXISTS motivational_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'fluency', 'grammar', 'vocabulary', 'confidence')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

INSERT INTO motivational_tips (tip_text, category) VALUES
('Practice makes progress! Every small step counts.', 'general'),
('Consistency is more important than perfection.', 'general'),
('Celebrate your wins, no matter how small!', 'general'),
('Speaking aloud helps build muscle memory for pronunciation.', 'fluency'),
('Record yourself and listen back to track improvement.', 'fluency'),
('Don''t fear mistakes - they''re proof you''re trying!', 'confidence'),
('Pause and breathe. Confident speakers take their time.', 'confidence'),
('Grammar rules become natural with repeated practice.', 'grammar'),
('Learn grammar in context, not just as isolated rules.', 'grammar'),
('Use new words in 3 different sentences to remember them.', 'vocabulary'),
('Read your vocabulary words out loud to hear how they sound.', 'vocabulary'),
('Review yesterday''s lesson before starting today''s.', 'general'),
('Connect with other learners to practice together.', 'general'),
('Watch English content with subtitles to learn naturally.', 'general'),
('Set small, achievable goals each day.', 'general')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '30-Day Roadmap system created successfully!';
  RAISE NOTICE 'Tables created: roadmaps, roadmap_days, roadmap_milestones, user_performance_summary, motivational_tips';
  RAISE NOTICE 'Triggers created: auto-update progress, auto-initialize milestones';
  RAISE NOTICE 'Ready to generate personalized learning roadmaps!';
END $$;
