-- Grammar Quiz Feature - Database Setup (FIXED VERSION)
-- Run this in your Supabase SQL Editor
-- This version has correct_answer as letter options (A, B, C, D)

-- 1. Create grammar_quiz_questions table
CREATE TABLE IF NOT EXISTS grammar_quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_blank', 'sentence_correction')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL, -- Letter option: A, B, C, or D
  explanation TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON grammar_quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON grammar_quiz_questions(category);

-- Enable Row Level Security
ALTER TABLE grammar_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view questions
CREATE POLICY "Authenticated users can view quiz questions" ON grammar_quiz_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Create grammar_quiz_attempts table
CREATE TABLE IF NOT EXISTS grammar_quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER,
  questions_data JSONB,
  difficulty TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON grammar_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON grammar_quiz_attempts(completed_at);

-- Enable Row Level Security
ALTER TABLE grammar_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own attempts
CREATE POLICY "Users can view their own quiz attempts" ON grammar_quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert their own quiz attempts" ON grammar_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Insert sample grammar quiz questions (FIXED with correct letter answers)

-- EASY Questions
INSERT INTO grammar_quiz_questions (question_text, question_type, difficulty, option_a, option_b, option_c, option_d, correct_answer, explanation, category) VALUES
  ('She ___ to school every day.', 'multiple_choice', 'easy', 'go', 'goes', 'going', 'gone', 'B', 'Use "goes" with singular subjects (he, she, it) in present simple tense.', 'tenses'),

  ('___ apple a day keeps the doctor away.', 'multiple_choice', 'easy', 'A', 'An', 'The', 'Some', 'B', 'Use "an" before words starting with vowel sounds (a, e, i, o, u).', 'articles'),

  ('They ___ playing football yesterday.', 'multiple_choice', 'easy', 'is', 'was', 'were', 'are', 'C', 'Use "were" with plural subjects (they, we) in past continuous tense.', 'tenses'),

  ('I live ___ New York.', 'multiple_choice', 'easy', 'at', 'on', 'in', 'by', 'C', 'Use "in" for cities, countries, and large places.', 'prepositions'),

  ('He is ___ than his brother.', 'multiple_choice', 'easy', 'tall', 'taller', 'tallest', 'more tall', 'B', 'Add "-er" to short adjectives for comparisons (tall → taller).', 'comparatives');

-- MEDIUM Questions
INSERT INTO grammar_quiz_questions (question_text, question_type, difficulty, option_a, option_b, option_c, option_d, correct_answer, explanation, category) VALUES
  ('If I ___ you, I would accept the job offer.', 'multiple_choice', 'medium', 'am', 'was', 'were', 'be', 'C', 'Use "were" (not "was") in hypothetical conditional sentences (Type 2).', 'conditionals'),

  ('The book ___ by millions of readers.', 'multiple_choice', 'medium', 'read', 'reads', 'was read', 'has read', 'C', 'Use passive voice "was read" when the subject receives the action.', 'passive-voice'),

  ('She has been working here ___ 2020.', 'multiple_choice', 'medium', 'for', 'since', 'from', 'at', 'B', 'Use "since" with a specific point in time (year, date).', 'prepositions'),

  ('Either the students or the teacher ___ responsible.', 'multiple_choice', 'medium', 'are', 'is', 'were', 'be', 'B', 'When using "either...or," the verb agrees with the nearest subject (teacher = singular).', 'subject-verb-agreement'),

  ('I wish I ___ speak French fluently.', 'multiple_choice', 'medium', 'can', 'could', 'will', 'would', 'B', 'Use "could" (past modal) after "wish" to express unreal present situations.', 'modals');

-- HARD Questions
INSERT INTO grammar_quiz_questions (question_text, question_type, difficulty, option_a, option_b, option_c, option_d, correct_answer, explanation, category) VALUES
  ('Hardly ___ finished the exam when the bell rang.', 'multiple_choice', 'hard', 'I have', 'have I', 'had I', 'I had', 'C', 'After negative adverbs (hardly, rarely, seldom), use inverted word order (auxiliary + subject).', 'inversion'),

  ('The committee ___ reached a decision yet.', 'multiple_choice', 'hard', 'hasn''t', 'haven''t', 'isn''t', 'aren''t', 'A', 'Collective nouns (committee, team, family) are usually treated as singular in American English.', 'subject-verb-agreement'),

  ('Not only ___ late, but he also forgot the documents.', 'multiple_choice', 'hard', 'he was', 'was he', 'he is', 'is he', 'B', 'After "not only" at the start of a sentence, use inverted word order (auxiliary + subject).', 'inversion'),

  ('She would rather ___ at home than go to the party.', 'multiple_choice', 'hard', 'stay', 'to stay', 'staying', 'stayed', 'A', 'Use base form of verb (infinitive without "to") after "would rather."', 'modals'),

  ('By this time next year, I ___ my degree.', 'multiple_choice', 'hard', 'will complete', 'will have completed', 'complete', 'have completed', 'B', 'Use future perfect ("will have + past participle") for actions completed before a specific future time.', 'tenses');

-- MORE EASY Questions (for variety)
INSERT INTO grammar_quiz_questions (question_text, question_type, difficulty, option_a, option_b, option_c, option_d, correct_answer, explanation, category) VALUES
  ('My sister and I ___ to the market.', 'multiple_choice', 'easy', 'go', 'goes', 'going', 'gone', 'A', 'Use "go" with plural subjects (my sister and I = we).', 'subject-verb-agreement'),

  ('This is ___ interesting book.', 'multiple_choice', 'easy', 'a', 'an', 'the', 'some', 'B', 'Use "an" before words starting with vowel sounds. "Interesting" starts with "i."', 'articles'),

  ('She doesn''t like ___ .', 'multiple_choice', 'easy', 'swim', 'swims', 'swimming', 'to swimming', 'C', 'Use gerund (verb + -ing) after "like" when referring to general activities.', 'gerunds'),

  ('The cat is ___ the table.', 'multiple_choice', 'easy', 'at', 'on', 'in', 'by', 'B', 'Use "on" for surfaces (on the table, on the floor, on the wall).', 'prepositions'),

  ('I have ___ finished my homework.', 'multiple_choice', 'easy', 'yet', 'already', 'still', 'always', 'B', 'Use "already" in affirmative sentences to show something happened before now.', 'adverbs');

-- MORE MEDIUM Questions
INSERT INTO grammar_quiz_questions (question_text, question_type, difficulty, option_a, option_b, option_c, option_d, correct_answer, explanation, category) VALUES
  ('Neither John nor his friends ___ coming to the party.', 'multiple_choice', 'medium', 'is', 'are', 'was', 'were', 'B', 'With "neither...nor," the verb agrees with the nearest subject (friends = plural).', 'subject-verb-agreement'),

  ('She accused him ___ stealing her phone.', 'multiple_choice', 'medium', 'for', 'of', 'with', 'about', 'B', 'The verb "accuse" is followed by the preposition "of."', 'prepositions'),

  ('The meeting ___ by the time we arrived.', 'multiple_choice', 'medium', 'finished', 'has finished', 'had finished', 'was finishing', 'C', 'Use past perfect "had finished" for an action completed before another past action.', 'tenses'),

  ('I''m not used to ___ up early.', 'multiple_choice', 'medium', 'wake', 'waking', 'woke', 'woken', 'B', 'Use gerund (verb + -ing) after "be used to" (meaning accustomed to).', 'gerunds'),

  ('She speaks English ___ than her brother.', 'multiple_choice', 'medium', 'more fluent', 'more fluently', 'most fluently', 'fluently', 'B', 'Use "more" + adverb for comparisons with long adverbs (fluently → more fluently).', 'comparatives');

-- Display success message
SELECT 'Grammar Quiz tables created successfully! ' || COUNT(*) || ' questions inserted.' as status
FROM grammar_quiz_questions;

-- Show sample of inserted data with FIXED answers
SELECT
  question_text,
  correct_answer,
  difficulty,
  category
FROM grammar_quiz_questions
ORDER BY difficulty, id
LIMIT 10;
