-- Fix recordings table schema
-- Run this in your Supabase SQL Editor

-- Check if audio_url column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recordings' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE recordings ADD COLUMN audio_url TEXT;
    RAISE NOTICE 'Added audio_url column to recordings table';
  ELSE
    RAISE NOTICE 'audio_url column already exists';
  END IF;
END $$;

-- Verify the recordings table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'recordings'
ORDER BY ordinal_position;

-- If the recordings table doesn't exist at all, create it
CREATE TABLE IF NOT EXISTS recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT,
  audio_url TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Policy for SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recordings' AND policyname = 'Users can view their own recordings'
  ) THEN
    CREATE POLICY "Users can view their own recordings" ON recordings
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Policy for INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recordings' AND policyname = 'Users can insert their own recordings'
  ) THEN
    CREATE POLICY "Users can insert their own recordings" ON recordings
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recordings' AND policyname = 'Users can update their own recordings'
  ) THEN
    CREATE POLICY "Users can update their own recordings" ON recordings
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Policy for DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recordings' AND policyname = 'Users can delete their own recordings'
  ) THEN
    CREATE POLICY "Users can delete their own recordings" ON recordings
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);

-- Display final table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'recordings'
ORDER BY ordinal_position;

-- Success message
SELECT 'Recordings table is now properly configured!' as status;
