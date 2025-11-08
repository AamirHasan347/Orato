-- Coach's Corner Feature - Database Setup
-- Run this in your Supabase SQL Editor
-- This creates tables for YouTube video playlist, saved videos, and weekly recommendations

-- 1. Create coach_videos table (stores your mother's YouTube videos)
CREATE TABLE IF NOT EXISTS coach_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL,
  category TEXT, -- e.g., "Prepositions", "Storytelling", "Grammar"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create saved_videos table (stores user's saved videos)
CREATE TABLE IF NOT EXISTS saved_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, video_id)
);

-- 3. Create weekly_recommendations table (stores weekly featured videos)
CREATE TABLE IF NOT EXISTS weekly_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  focus_topic TEXT NOT NULL, -- e.g., "This week's focus: Prepositions"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(week_start_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coach_videos_order ON coach_videos(order_index);
CREATE INDEX IF NOT EXISTS idx_coach_videos_category ON coach_videos(category);
CREATE INDEX IF NOT EXISTS idx_saved_videos_user_id ON saved_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_videos_created_at ON saved_videos(created_at);
CREATE INDEX IF NOT EXISTS idx_weekly_recommendations_dates ON weekly_recommendations(week_start_date, week_end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_recommendations_active ON weekly_recommendations(is_active);

-- Enable Row Level Security
ALTER TABLE coach_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for coach_videos (public read access)
CREATE POLICY "Anyone can view coach videos" ON coach_videos
  FOR SELECT USING (true);

-- Policies for saved_videos
CREATE POLICY "Users can view their own saved videos" ON saved_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save videos" ON saved_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their videos" ON saved_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for weekly_recommendations (public read access)
CREATE POLICY "Anyone can view weekly recommendations" ON weekly_recommendations
  FOR SELECT USING (true);

-- Insert some initial videos (you can add your mother's actual videos)
INSERT INTO coach_videos (video_id, title, description, thumbnail_url, order_index, category) VALUES
('OLYSBScArl4', 'Master the Art of Storytelling in English', 'Learn techniques to make your conversations more engaging and natural.', 'https://img.youtube.com/vi/OLYSBScArl4/maxresdefault.jpg', 1, 'Storytelling'),
-- Add more videos here as needed
('PLACEHOLDER_1', 'Understanding Prepositions', 'A comprehensive guide to mastering English prepositions.', 'https://img.youtube.com/vi/default/maxresdefault.jpg', 2, 'Grammar'),
('PLACEHOLDER_2', 'Common Pronunciation Mistakes', 'Learn to avoid common pronunciation errors in English.', 'https://img.youtube.com/vi/default/maxresdefault.jpg', 3, 'Pronunciation')
ON CONFLICT (video_id) DO NOTHING;

-- Insert current week's recommendation
INSERT INTO weekly_recommendations (video_id, week_start_date, week_end_date, focus_topic, description, is_active) VALUES
('OLYSBScArl4', CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER, CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6, 'This week''s focus: Storytelling', 'Master the art of storytelling and make your conversations more engaging!', true)
ON CONFLICT (week_start_date) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Coach''s Corner database tables created successfully!';
  RAISE NOTICE 'Tables created: coach_videos, saved_videos, weekly_recommendations';
  RAISE NOTICE 'You can now use the enhanced Coach''s Corner feature in Orato.';
END $$;
