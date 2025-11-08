# Daily Speaking Challenges - Setup Guide

## Overview

The Daily Speaking Challenges feature has been successfully implemented! This feature allows users to:
- Get one unique speaking prompt every day
- Record their voice response (up to 3 minutes)
- Receive AI-powered feedback on their speaking
- Track completion streaks to stay motivated
- View their progress over time

## What Was Implemented

### 1. Database Structure
**Location:** `DATABASE_SETUP_CHALLENGES.md`

Three new tables have been defined:
- `daily_challenges` - Stores daily prompts with difficulty levels
- `challenge_attempts` - Tracks user completions with audio and feedback
- `user_streaks` - Manages user streak data (current, longest, total completed)

### 2. API Routes

**GET `/api/daily-challenge`** (`src/app/api/daily-challenge/route.ts`)
- Fetches today's challenge based on current date
- Returns challenge details, completion status, and user streak data
- Authenticates users via Supabase

**POST `/api/save-challenge`** (`src/app/api/save-challenge/route.ts`)
- Saves user's challenge attempt to database
- Uploads audio to Supabase Storage
- Automatically calculates and updates streak data
- Streak logic:
  - Continues streak if last completion was yesterday
  - Resets streak if there's a gap of more than 1 day
  - Updates longest streak if current streak exceeds it

### 3. Daily Challenge Page

**Location:** `src/app/challenges/page.tsx`

Features:
- Clean, responsive UI matching Orato's design theme
- Displays streak statistics (current, longest, total completed)
- Shows today's challenge prompt with difficulty badge
- Recording functionality (3-minute timer, browser MediaRecorder API)
- Real-time transcription using Groq Whisper API
- AI-powered feedback using OpenRouter DeepSeek R1
- Displays structured feedback with scores and advice
- Prevents duplicate completions (one per day per user)
- "Already completed" state for returning users

### 4. Dashboard Integration

**Location:** `src/app/page.tsx`

Added a new "Daily Speaking Challenges" button with:
- Orange color scheme to match the streak/challenge theme
- Positioned between "Start SpeakFlow" and "View My Recordings"
- Direct navigation to `/challenges`

## Setup Instructions

### Step 1: Database Setup

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open `DATABASE_SETUP_CHALLENGES.md` in this repository
4. Copy and run each SQL block in order:
   - Create `daily_challenges` table
   - Create `challenge_attempts` table
   - Create `user_streaks` table
   - Enable Row Level Security policies

**Important:** The SQL includes 20 pre-populated challenges for January 2025. You can:
- Use these as-is for testing
- Modify the prompts to better fit your needs
- Add more challenges for future dates

### Step 2: Verify Tables

After running the SQL, verify the tables exist:

```sql
-- Check tables
SELECT * FROM daily_challenges LIMIT 5;
SELECT * FROM challenge_attempts LIMIT 5;
SELECT * FROM user_streaks LIMIT 5;
```

### Step 3: Test the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard at `http://localhost:3000`

3. Click "Daily Speaking Challenges"

4. You should see:
   - Today's challenge prompt (if one exists for today's date)
   - Streak counters (all zeros for first-time users)
   - "Start Recording" button

5. Test the flow:
   - Click "Start Recording" and grant microphone permissions
   - Speak for at least 10-15 seconds
   - Click "Stop Recording"
   - Wait for processing (transcription + feedback + save)
   - Verify feedback appears and streak increments to 1

### Step 4: Add More Challenges (Optional)

To add challenges for future dates, run SQL like this:

```sql
INSERT INTO daily_challenges (date, prompt, difficulty) VALUES
  ('2025-01-23', 'Your custom prompt here', 'medium'),
  ('2025-01-24', 'Another prompt', 'easy'),
  ('2025-01-25', 'Yet another prompt', 'hard');
```

**Pro Tip:** Create challenges in bulk for the next month to ensure users always have fresh content.

## Feature Behavior

### Daily Reset
- Challenges are tied to calendar dates (UTC timezone)
- A new challenge becomes available at midnight UTC
- Users can only complete one challenge per day

### Streak Calculation
- **Day 1:** User completes challenge → Streak = 1
- **Day 2:** User completes challenge → Streak = 2
- **Day 3:** User skips → Streak maintained at 2 (grace period)
- **Day 4:** User completes → Streak = 3
- **Day 5+:** User skips multiple days → Streak resets to 1 on next completion

### Audio Storage
- Audio files are stored in the existing Supabase `recordings` bucket
- Path format: `{user_id}/{timestamp}.webm`
- Files are publicly accessible via Supabase Storage URLs

## Design Consistency

The Daily Challenges page follows Orato's existing design:
- **Colors:**
  - Orange (#FDB241) for streak highlights
  - Blue (#0088FF) for primary actions
  - Green, yellow, red badges for difficulty levels
- **Layout:**
  - Neutral gray background (`bg-neutral-50`)
  - White cards with rounded corners and shadows
  - Responsive design with max-width containers
- **Typography:**
  - Bold headings for emphasis
  - Clear hierarchy with text sizes
  - Consistent spacing

## Troubleshooting

### Issue: "No challenge available for today"

**Cause:** No row in `daily_challenges` table for today's date

**Fix:** Add a challenge for today:
```sql
INSERT INTO daily_challenges (date, prompt, difficulty) VALUES
  (CURRENT_DATE, 'Your prompt here', 'medium');
```

### Issue: Microphone permission denied

**Cause:** Browser blocked microphone access

**Fix:**
1. Check browser address bar for microphone icon
2. Grant permission and reload page
3. Ensure you're using HTTPS (required for production)

### Issue: Streak not updating

**Cause:** RLS policies may not be configured correctly

**Fix:** Verify policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_streaks';
```

### Issue: Duplicate completion error

**Cause:** UNIQUE constraint on `(user_id, challenge_id)`

**Expected:** This is by design - users can only complete each challenge once

## Future Enhancements

Potential features to add:
1. **Leaderboard** - Show top users by streak or total completions
2. **Achievements** - Badges for milestones (7-day streak, 30-day streak, etc.)
3. **Challenge Categories** - Filter by difficulty or topic type
4. **Social Sharing** - Share streak achievements on social media
5. **Streak Recovery** - Allow users to "freeze" streaks with tokens
6. **Custom Challenges** - Let users submit their own prompts
7. **Practice Mode** - Retry previous challenges without affecting streak

## Questions?

If you encounter any issues during setup:
1. Check Supabase logs for database errors
2. Check browser console for API errors
3. Verify environment variables are set correctly
4. Ensure Row Level Security policies are enabled

Enjoy building speaking skills with Daily Challenges!
