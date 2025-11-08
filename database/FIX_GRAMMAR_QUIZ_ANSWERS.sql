-- Fix Grammar Quiz Correct Answers
-- This script converts text-based correct answers to letter format (A, B, C, D)

-- Step 1: Check current state
SELECT
  id,
  question_text,
  correct_answer,
  option_a,
  option_b,
  option_c,
  option_d,
  CASE
    WHEN correct_answer = option_a THEN 'A'
    WHEN correct_answer = option_b THEN 'B'
    WHEN correct_answer = option_c THEN 'C'
    WHEN correct_answer = option_d THEN 'D'
    ELSE correct_answer
  END as should_be
FROM grammar_quiz_questions
WHERE correct_answer NOT IN ('A', 'B', 'C', 'D')
LIMIT 20;

-- Step 2: Update incorrect answers to letter format
UPDATE grammar_quiz_questions
SET correct_answer = CASE
  WHEN LOWER(TRIM(correct_answer)) = LOWER(TRIM(option_a)) THEN 'A'
  WHEN LOWER(TRIM(correct_answer)) = LOWER(TRIM(option_b)) THEN 'B'
  WHEN LOWER(TRIM(correct_answer)) = LOWER(TRIM(option_c)) THEN 'C'
  WHEN LOWER(TRIM(correct_answer)) = LOWER(TRIM(option_d)) THEN 'D'
  ELSE correct_answer
END
WHERE correct_answer NOT IN ('A', 'B', 'C', 'D');

-- Step 3: Verify the fix
SELECT
  COUNT(*) as total_questions,
  COUNT(CASE WHEN correct_answer IN ('A', 'B', 'C', 'D') THEN 1 END) as correct_format,
  COUNT(CASE WHEN correct_answer NOT IN ('A', 'B', 'C', 'D') THEN 1 END) as needs_manual_fix
FROM grammar_quiz_questions;

-- Step 4: Show any remaining issues
SELECT
  id,
  question_text,
  correct_answer,
  option_a,
  option_b,
  option_c,
  option_d
FROM grammar_quiz_questions
WHERE correct_answer NOT IN ('A', 'B', 'C', 'D');
