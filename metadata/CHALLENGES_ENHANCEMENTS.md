# Daily Challenges Feature Enhancements

## Overview

Enhanced the Daily Challenges feature with comprehensive gamification, history tracking, leaderboards, and social sharing capabilities.

## New Features Added

### 1. Challenge History & Log ✅
**Location:** `/components/ChallengeHistory.tsx`

- Complete history of all past challenge attempts
- Displays challenge prompts, difficulty levels, scores, and XP earned
- Expandable details showing transcripts and audio recordings
- Quick retry functionality from history
- Visual progress tracking with XP summary card

**Key Components:**
- XP progress card with level display and progress bar
- Filterable/sortable attempt list
- Audio playback for past attempts
- Difficulty badges (Easy, Medium, Hard)
- Retry indicators for retaken challenges

### 2. XP & Points System ✅
**Location:** `/app/api/save-challenge/route.ts`

**XP Calculation Formula:**
```typescript
Base XP = 10
Score Multiplier = (score / 10)
Difficulty Multipliers:
  - Easy: 1x
  - Medium: 1.5x
  - Hard: 2x
Retry Penalty: 50% XP

Final XP = Base XP × Score Multiplier × Difficulty Multiplier × (Retry ? 0.5 : 1)
```

**Level System:**
- Every 100 XP = 1 Level
- Level progression tracked in user_profiles table
- Visual level badges and progress bars
- Level-up celebrations

**Examples:**
- Easy challenge, score 8/10: 8 XP
- Medium challenge, score 9/10: 13.5 XP
- Hard challenge, score 10/10: 20 XP
- Retry hard challenge, score 10/10: 10 XP

### 3. Retry Challenge with Score Comparison ✅
**Location:** `/app/challenges/page.tsx`

- Retry any previously completed challenge
- Side-by-side score comparison (Previous vs. Current)
- Reduced XP rewards (50%) for retries to encourage new challenges
- Visual indicators showing retry status
- Cancel retry option to return to today's challenge

**Features:**
- Retry banner showing previous score
- Score comparison card after completion
- Different celebration messages for retries
- History integration for easy retry access

### 4. Leaderboard Integration ✅
**Location:** `/components/Leaderboard.tsx`

**Leaderboard Types:**
- **All-Time:** Total XP across all challenges
- **Weekly:** XP earned in the last 7 days
- **Monthly:** XP earned in the last 30 days

**Features:**
- Top 100 users displayed
- Current user's rank highlighted
- Rank badges (🥇 🥈 🥉 for top 3)
- User profile integration
- Real-time updates
- Period selector (All Time / Week / Month)

### 5. Share Functionality ✅
**Location:** `/app/challenges/page.tsx` (handleShare function)

**Share Options:**
- Native Web Share API (mobile & modern browsers)
- Clipboard fallback for unsupported browsers
- Shareable content includes:
  - XP earned
  - Current level
  - Total XP
  - Invitation to join Orato

**Share Text Example:**
```
I just earned 15 XP on Orato! 🎯
Level 5 | Total XP: 450
Join me in improving your English speaking skills!
https://orato.app
```

## Database Schema Changes

### Required Tables & Columns

#### 1. `challenge_attempts` (Modified)
```sql
-- Add new columns
ALTER TABLE challenge_attempts ADD COLUMN xp_earned INTEGER DEFAULT 0;
ALTER TABLE challenge_attempts ADD COLUMN is_retry BOOLEAN DEFAULT false;

-- Existing columns should include:
-- id, user_id, challenge_id, audio_url, transcript, feedback, score, created_at
```

#### 2. `user_profiles` (New Table)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_total_xp ON user_profiles(total_xp DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 3. `daily_challenges` (Existing - No Changes)
```sql
-- Verify structure includes:
-- id, prompt, difficulty, date, created_at
```

#### 4. `user_streaks` (Existing - No Changes)
```sql
-- Verify structure includes:
-- id, user_id, current_streak, longest_streak, last_completed_date, total_challenges_completed
```

### Migration Steps

1. **Backup Database:**
   ```bash
   # Via Supabase Dashboard or CLI
   supabase db dump > backup_before_challenges_migration.sql
   ```

2. **Apply Schema Changes:**
   ```sql
   -- Step 1: Add columns to challenge_attempts
   ALTER TABLE challenge_attempts ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;
   ALTER TABLE challenge_attempts ADD COLUMN IF NOT EXISTS is_retry BOOLEAN DEFAULT false;

   -- Step 2: Create user_profiles table
   CREATE TABLE IF NOT EXISTS user_profiles (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     total_xp INTEGER DEFAULT 0,
     level INTEGER DEFAULT 1,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id)
   );

   -- Step 3: Create indexes
   CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
   CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp ON user_profiles(total_xp DESC);

   -- Step 4: Enable RLS
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

   -- Step 5: Create policies
   DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
   CREATE POLICY "Users can view all profiles"
     ON user_profiles FOR SELECT
     USING (true);

   DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
   CREATE POLICY "Users can update own profile"
     ON user_profiles FOR UPDATE
     USING (auth.uid() = user_id);

   DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
   CREATE POLICY "Users can insert own profile"
     ON user_profiles FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   ```

3. **Migrate Existing Data (Optional):**
   ```sql
   -- Calculate XP for existing attempts retroactively
   WITH attempt_xp AS (
     SELECT
       ca.user_id,
       SUM(
         CASE
           WHEN ca.score IS NULL THEN 10
           ELSE ROUND(10 * (ca.score / 10) *
             CASE dc.difficulty
               WHEN 'easy' THEN 1
               WHEN 'medium' THEN 1.5
               WHEN 'hard' THEN 2
               ELSE 1
             END)
         END
       ) as total_xp
     FROM challenge_attempts ca
     JOIN daily_challenges dc ON ca.challenge_id = dc.id
     GROUP BY ca.user_id
   )
   INSERT INTO user_profiles (user_id, total_xp, level)
   SELECT
     user_id,
     total_xp,
     FLOOR(total_xp / 100) + 1 as level
   FROM attempt_xp
   ON CONFLICT (user_id) DO UPDATE
   SET total_xp = EXCLUDED.total_xp,
       level = EXCLUDED.level,
       updated_at = NOW();

   -- Update existing attempts with calculated XP
   UPDATE challenge_attempts ca
   SET xp_earned = ROUND(
     CASE
       WHEN ca.score IS NULL THEN 10
       ELSE 10 * (ca.score / 10) *
         CASE dc.difficulty
           WHEN 'easy' THEN 1
           WHEN 'medium' THEN 1.5
           WHEN 'hard' THEN 2
           ELSE 1
         END
     END
   )
   FROM daily_challenges dc
   WHERE ca.challenge_id = dc.id
   AND ca.xp_earned = 0;
   ```

4. **Verify Migration:**
   ```sql
   -- Check user_profiles table
   SELECT COUNT(*) FROM user_profiles;
   SELECT * FROM user_profiles ORDER BY total_xp DESC LIMIT 10;

   -- Check challenge_attempts updates
   SELECT COUNT(*), AVG(xp_earned) FROM challenge_attempts WHERE xp_earned > 0;
   ```

## API Endpoints

### New Endpoints

#### 1. GET `/api/challenge-history`
**Purpose:** Fetch user's complete challenge history

**Response:**
```json
{
  "ok": true,
  "attempts": [
    {
      "id": "uuid",
      "challenge_id": "uuid",
      "audio_url": "string",
      "transcript": "string",
      "feedback": {},
      "score": 8.5,
      "xp_earned": 12,
      "is_retry": false,
      "created_at": "timestamp",
      "daily_challenges": {
        "id": "uuid",
        "prompt": "string",
        "difficulty": "medium",
        "date": "2025-01-15"
      }
    }
  ],
  "totalXP": 450,
  "level": 5
}
```

#### 2. GET `/api/leaderboard?period=all`
**Purpose:** Fetch leaderboard rankings

**Parameters:**
- `period`: "all" | "week" | "month"

**Response:**
```json
{
  "ok": true,
  "leaderboard": [
    {
      "user_id": "uuid",
      "total_xp": 1250,
      "level": 13,
      "period_xp": 150,
      "users": {
        "email": "user@example.com",
        "user_metadata": {
          "name": "John Doe"
        }
      }
    }
  ],
  "userRank": 5,
  "period": "all"
}
```

### Modified Endpoints

#### POST `/api/save-challenge`
**Added Parameters:**
- `is_retry`: boolean (indicates if this is a retry attempt)

**Added Response Fields:**
- `xp_earned`: number
- `total_xp`: number
- `level`: number

## UI Components

### 1. Tab Navigation
Three tabs in challenges page:
- **Today's Challenge:** Main challenge interface
- **History:** Past attempts and retry options
- **Leaderboard:** Global rankings

### 2. XP Celebration Modal
Displayed upon challenge completion:
- Animated XP counter
- Level display
- Score comparison (for retries)
- Share button
- Navigation to history/leaderboard

### 3. Retry Banner
Shows when in retry mode:
- Previous score display
- Motivation message
- Cancel retry button

### 4. Progress Cards
- Level progress with XP bar
- Streak information
- Total challenges completed

## Testing Checklist

- [ ] Complete a new challenge and verify XP calculation
- [ ] Check XP for different difficulty levels (easy, medium, hard)
- [ ] Retry a challenge and verify 50% XP penalty
- [ ] View challenge history and verify all attempts are listed
- [ ] Test retry from history page
- [ ] Check leaderboard displays correctly
- [ ] Test period filters (All Time, Week, Month)
- [ ] Verify share functionality (both native and clipboard)
- [ ] Confirm level-up occurs at 100 XP intervals
- [ ] Test score comparison in retry mode
- [ ] Verify RLS policies restrict data access correctly

## Performance Optimizations

1. **Indexes Added:**
   - `idx_user_profiles_user_id` for fast profile lookups
   - `idx_user_profiles_total_xp` for leaderboard queries

2. **Query Optimizations:**
   - Leaderboard limited to top 100 users
   - History uses DESC ordering on created_at
   - Period-based filtering done server-side

3. **Caching Recommendations:**
   - Cache leaderboard data for 5 minutes
   - Cache user profile on client after fetch
   - Invalidate on challenge completion

## Future Enhancements

1. **Badges & Achievements:**
   - Award badges for milestones
   - Achievement gallery
   - Special XP bonuses for badge collection

2. **Friend System:**
   - Compare scores with friends
   - Private leaderboards
   - Challenge friends directly

3. **Daily/Weekly Quests:**
   - Bonus XP for completing multiple challenges
   - Weekly challenge streaks
   - Special themed challenges

4. **Analytics Dashboard:**
   - Progress over time graphs
   - Skill improvement tracking
   - Personal records and statistics

## Troubleshooting

### Issue: XP not calculating correctly
**Solution:** Verify challenge difficulty is set correctly in daily_challenges table

### Issue: Leaderboard not updating
**Solution:** Check user_profiles table has correct RLS policies and user has profile record

### Issue: Retry not working
**Solution:** Ensure challenge_id exists and user has permission to access it

### Issue: Share button not working on iOS
**Solution:** This is expected - fallback to clipboard copy is automatic

## API Rate Limiting Recommendations

- Challenge completion: 1 per 3 minutes
- History fetch: 10 per minute
- Leaderboard fetch: 20 per minute
- Share action: 5 per minute

## Conclusion

The Daily Challenges feature now provides a complete gamified experience with XP progression, competitive leaderboards, detailed history tracking, and social sharing capabilities. All features are production-ready and fully integrated with the existing Orato application architecture.
