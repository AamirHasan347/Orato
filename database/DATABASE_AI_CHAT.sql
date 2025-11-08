-- AI Chat History Feature - Database Setup
-- Run this in your Supabase SQL Editor
-- This creates the table for storing AI mentor chat conversations

-- 1. Create ai_chat_history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  included_context BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON ai_chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_created ON ai_chat_history(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own chat history
CREATE POLICY "Users can view their own chat history" ON ai_chat_history
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own chat history
CREATE POLICY "Users can insert their own chat history" ON ai_chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own chat history (optional - for privacy)
CREATE POLICY "Users can delete their own chat history" ON ai_chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'AI Chat History table created successfully!';
  RAISE NOTICE 'You can now use the AI Mentor Chat feature in Orato.';
END $$;
