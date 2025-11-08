# Daily Speaking Challenges - Database Setup

This file contains the SQL commands needed to set up the database tables for the Daily Speaking Challenges feature.

Run these commands in your Supabase SQL Editor:

## 1. Daily Challenges Table

Stores the daily speaking prompts.

```sql
CREATE TABLE daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  prompt TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster date lookups
CREATE INDEX idx_daily_challenges_date ON daily_challenges(date);

-- Insert some initial daily challenges
INSERT INTO daily_challenges (date, prompt, difficulty) VALUES
  ('2025-01-03', 'Describe your favorite movie and why it resonates with you.', 'easy'),
  ('2025-01-04', 'Tell me about a time you overcame a significant challenge.', 'medium'),
  ('2025-01-05', 'Explain a complex topic you''re passionate about to a beginner.', 'hard'),
  ('2025-01-06', 'Describe your ideal weekend day in detail.', 'easy'),
  ('2025-01-07', 'Share a childhood memory that shaped who you are today.', 'medium'),
  ('2025-01-08', 'Discuss the pros and cons of remote work.', 'medium'),
  ('2025-01-09', 'Describe a person who has had a significant impact on your life.', 'easy'),
  ('2025-01-10', 'Explain how technology has changed your daily routine.', 'medium'),
  ('2025-01-11', 'Tell a funny story from your past.', 'easy'),
  ('2025-01-12', 'Discuss a controversial topic and present both sides.', 'hard'),
  ('2025-01-13', 'Describe your dream vacation destination.', 'easy'),
  ('2025-01-14', 'Talk about a skill you would like to learn and why.', 'medium'),
  ('2025-01-15', 'Explain your morning routine and how it affects your day.', 'easy'),
  ('2025-01-16', 'Discuss the importance of work-life balance.', 'medium'),
  ('2025-01-17', 'Describe a book that changed your perspective on life.', 'medium'),
  ('2025-01-18', 'Talk about your favorite hobby and what you love about it.', 'easy'),
  ('2025-01-19', 'Explain a historical event and its significance.', 'hard'),
  ('2025-01-20', 'Describe what success means to you.', 'medium'),
  ('2025-01-21', 'Tell me about your favorite season and why.', 'easy'),
  ('2025-01-22', 'Discuss how social media has influenced modern communication.', 'hard');
```

## 2. Challenge Attempts Table

Tracks user attempts at daily challenges.

```sql
CREATE TABLE challenge_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcript TEXT,
  feedback JSONB,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_challenge_attempts_user_id ON challenge_attempts(user_id);
CREATE INDEX idx_challenge_attempts_completed_at ON challenge_attempts(completed_at);

-- Enable Row Level Security
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own attempts
CREATE POLICY "Users can view their own challenge attempts" ON challenge_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own attempts
CREATE POLICY "Users can insert their own challenge attempts" ON challenge_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own attempts
CREATE POLICY "Users can update their own challenge attempts" ON challenge_attempts
  FOR UPDATE USING (auth.uid() = user_id);
```

## 3. User Streaks Table

Tracks user completion streaks.

```sql
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_challenges_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own streak
CREATE POLICY "Users can view their own streak" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own streak
CREATE POLICY "Users can insert their own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own streak
CREATE POLICY "Users can update their own streak" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);
```

## 4. Enable RLS on daily_challenges

```sql
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view challenges
CREATE POLICY "Authenticated users can view daily challenges" ON daily_challenges
  FOR SELECT USING (auth.role() = 'authenticated');
```

## Notes

- Make sure to run these commands in order
- The initial challenges inserted are for January 2025 - you may want to add more for future dates
- Row Level Security (RLS) is enabled to ensure users can only access their own data
- Indexes are created for optimal query performance
