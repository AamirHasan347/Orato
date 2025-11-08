# Achievements & Rewards System - Complete Setup Guide

## Overview
A comprehensive gamification system featuring badges, XP, levels, streaks, and trophy animations to motivate users and track their learning progress.

## Features Implemented

### 1. Badge System (25 Pre-defined Achievements)
**Categories:**
- **Streaks** 🔥: 3-day, 7-day, 14-day, 30-day streaks
- **Fluency** 🗣️: 50%, 70%, 80%, 90% fluency milestones
- **Practice** 📚: 5, 25, 50, 100 session milestones
- **Vocabulary** 📝: 50, 100, 250, 500 words learned
- **Levels** ⭐: Level 5, 10, 20, 50 milestones
- **Special** ✨: First quiz, perfect scores, time-based achievements
- **Social** 📱: Sharing achievements

**Badge Tiers:**
- 🥉 Bronze: Beginner achievements
- 🥈 Silver: Intermediate milestones
- 🥇 Gold: Advanced accomplishments
- 💎 Platinum: Elite achievements

### 2. XP & Leveling System
- **Dynamic XP Requirements**: Exponential scaling (Level 1→2: 100 XP, 2→3: 150 XP, etc.)
- **Visual Progress Bar**: Shows current level progress
- **Level-Up Notifications**: Celebratory animations when leveling up
- **Total XP Tracking**: Lifetime experience points

### 3. Trophy Animations
- **Confetti Effect**: 500 pieces on achievement unlock
- **3D Badge Animation**: Rotating, pulsing badge with glow effects
- **Particle Effects**: Radiating sparkles
- **Multi-Achievement Support**: Queue multiple unlocked achievements
- **Smooth Transitions**: Spring-based physics for natural feel

### 4. Share Achievement Feature
- **Native Share API**: Uses device share when available
- **Fallback**: Copies formatted text to clipboard
- **Tracking**: Records when achievements are shared
- **Pre-formatted Text**: Ready-to-share achievement message

### 5. Statistics Dashboard
- Current streak (🔥)
- Total sessions (📚)
- Words learned (📝)
- Best fluency score (🗣️)
- Completion percentage
- New achievements counter

## Database Setup

### Tables Created

1. **achievements**
   - Defines all available achievements
   - Fields: title, description, badge_icon, badge_color, category, requirement_type, requirement_value, xp_reward
   - 25 pre-defined achievements included

2. **user_achievements**
   - Tracks which achievements each user has unlocked
   - Fields: user_id, achievement_id, unlocked_at, is_new, shared_at
   - "NEW!" badge support for recently unlocked

3. **user_progress**
   - Tracks user's XP, level, streaks, and stats
   - Fields: total_xp, current_level, current_streak, longest_streak, total_sessions, total_words_learned, best_fluency_score
   - Automatically created on first activity

4. **achievement_history**
   - Logs all achievement unlocks for analytics
   - Fields: user_id, achievement_id, unlocked_at, user_level_at_unlock, user_xp_at_unlock

### Helper Functions

1. **calculate_xp_for_level(level)**: Returns XP needed for a specific level
2. **calculate_level_from_xp(total_xp)**: Calculates current level from total XP
3. **update_user_streak(user_id)**: Updates daily streak (call on each activity)

### Running the Setup

```sql
-- In your Supabase SQL Editor, run:
-- File: /orato/database/DATABASE_ACHIEVEMENTS.sql
```

This will:
- Create all 4 tables with proper indexes
- Set up Row Level Security policies
- Insert 25 predefined achievements
- Create helper SQL functions
- Enable real-time subscriptions

## API Routes

### 1. `/api/user-progress` (GET)
Fetch user's XP, level, streak, and stats
```typescript
const response = await fetch('/api/user-progress');
const { progress } = await response.json();
// Returns: total_xp, current_level, current_streak, xp_for_next_level, etc.
```

### 2. `/api/user-achievements` (GET)
Fetch all achievements with unlock status
```typescript
const response = await fetch('/api/user-achievements');
const { achievements, groupedAchievements, stats } = await response.json();
```

### 3. `/api/user-achievements` (POST)
Mark achievement as viewed (removes "NEW!" badge)
```typescript
await fetch('/api/user-achievements', {
  method: 'POST',
  body: JSON.stringify({ achievementId: '...' })
});
```

### 4. `/api/check-achievements` (POST)
Check and award any newly earned achievements
```typescript
const response = await fetch('/api/check-achievements', { method: 'POST' });
const { newlyUnlocked } = await response.json();
// Automatically called by add-xp
```

### 5. `/api/add-xp` (POST)
Award XP to user and check achievements
```typescript
const response = await fetch('/api/add-xp', {
  method: 'POST',
  body: JSON.stringify({
    xpAmount: 50,
    activityType: 'session',
    metadata: { fluencyScore: 85 }
  })
});
const { leveledUp, newAchievements } = await response.json();
```

## Integration Guide

### Step 1: Add AchievementsSection to Dashboard

```typescript
// In your dashboard page
import AchievementsSection from "@/components/AchievementsSection";

export default function Dashboard() {
  return (
    <div>
      {/* Other components */}
      <AchievementsSection />
    </div>
  );
}
```

### Step 2: Award XP After Activities

```typescript
import { awardXP, XP_REWARDS } from "@/lib/achievements";

// After completing a practice session
const result = await awardXP({
  xpAmount: XP_REWARDS.PRACTICE_SESSION_COMPLETE,
  activityType: 'session',
});

if (result.leveledUp) {
  console.log(`Level up! Now level ${result.newLevel}`);
}

if (result.newAchievements.length > 0) {
  // Achievement modal will auto-show
  console.log('New achievements unlocked!', result.newAchievements);
}
```

### Step 3: Track Activity-Specific Stats

```typescript
// After a vocabulary quiz
await awardXP({
  xpAmount: XP_REWARDS.QUIZ_COMPLETE,
  activityType: 'vocabulary',
  metadata: {
    wordsLearned: 5, // Updates total_words_learned
  },
});

// After a fluency recording
await awardXP({
  xpAmount: XP_REWARDS.RECORDING_SUBMIT,
  activityType: 'fluency',
  metadata: {
    fluencyScore: 87.5, // Updates best_fluency_score if higher
  },
});
```

## XP Rewards Reference

Use these consistent values throughout your app:

```typescript
// From /lib/achievements.ts
XP_REWARDS = {
  PRACTICE_SESSION_COMPLETE: 50,
  RECORDING_SUBMIT: 30,
  RECORDING_EXCELLENT: 50,
  QUIZ_COMPLETE: 40,
  QUIZ_PERFECT: 100,
  WORD_LEARNED: 5,
  DAILY_CHALLENGE_COMPLETE: 75,
  GRAMMAR_QUIZ_COMPLETE: 50,
  // ... and more
}
```

## Example Integration: Recording Page

```typescript
// In your recording submission handler
async function handleSubmitRecording(audioBlob: Blob) {
  // 1. Submit recording to API
  const transcription = await submitRecording(audioBlob);

  // 2. Calculate fluency score
  const fluencyScore = calculateFluencyScore(transcription);

  // 3. Award XP
  const xpAmount = fluencyScore > 80
    ? XP_REWARDS.RECORDING_EXCELLENT
    : XP_REWARDS.RECORDING_SUBMIT;

  const result = await awardXP({
    xpAmount,
    activityType: 'fluency',
    metadata: { fluencyScore },
  });

  // 4. Show results to user
  if (result.success) {
    toast.success(`+${result.xpAdded} XP! Fluency: ${fluencyScore}%`);

    if (result.leveledUp) {
      toast.success(`🎉 Level Up! You're now level ${result.newLevel}!`);
    }
  }

  // Achievement modal shows automatically if new achievements unlocked
}
```

## Example Integration: Daily Challenge

```typescript
async function handleChallengeComplete(score: number, isPerfect: boolean) {
  const xpAmount = isPerfect
    ? XP_REWARDS.DAILY_CHALLENGE_PERFECT
    : XP_REWARDS.DAILY_CHALLENGE_COMPLETE;

  const result = await awardXP({
    xpAmount,
    activityType: 'challenge',
  });

  // Show completion screen with XP gained
  showCompletionScreen({
    score,
    xpGained: result.xpAdded,
    leveledUp: result.leveledUp,
    newAchievements: result.newAchievements,
  });
}
```

## Adding New Achievements

### Via SQL
```sql
INSERT INTO achievements (
  achievement_key,
  title,
  description,
  badge_icon,
  badge_color,
  category,
  requirement_type,
  requirement_value,
  xp_reward
) VALUES (
  'new_achievement',
  'Achievement Title',
  'Description of what this unlocks',
  '🎯', -- emoji or icon
  'gold', -- bronze, silver, gold, platinum
  'special', -- category
  'custom', -- or streak_days, fluency_score, etc.
  1,
  200 -- XP reward
);
```

### Via Supabase Dashboard
1. Go to Table Editor → achievements
2. Insert new row with all required fields
3. Achievement will automatically appear in user's achievement list

## Custom Achievement Types

For achievements that don't fit standard types (like "first quiz", "early bird"), use the `requirement_type: 'custom'` and award them manually:

```typescript
// In your quiz completion handler
if (isFirstQuiz) {
  // Award the "first quiz" achievement directly
  const { data } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: 'FIRST_QUIZ_ACHIEVEMENT_ID',
      is_new: true,
    });

  // Check achievements to trigger modal
  await fetch('/api/check-achievements', { method: 'POST' });
}
```

## Customization

### Modify XP Requirements
Edit the formula in `/api/add-xp/route.ts` and `/api/user-progress/route.ts`:
```typescript
// Current: 100 * (1.5 ^ (level - 1))
// Make easier: 100 * (1.3 ^ (level - 1))
// Make harder: 100 * (1.7 ^ (level - 1))
```

### Add New Badge Colors
In `AchievementsSection.tsx`, add to `getBadgeColor()`:
```typescript
diamond: {
  bg: "bg-gradient-to-br from-cyan-400 to-blue-600",
  border: "border-cyan-500",
  text: "text-cyan-900",
  glow: "shadow-cyan-500/50",
}
```

### Customize Achievement Modal
Edit `AchievementUnlockedModal.tsx`:
- Change confetti amount (line 67: `numberOfPieces={500}`)
- Modify animation timing
- Customize colors and styles

## Streak System

The streak system auto-updates when activities are completed:

```typescript
// Automatically called in add-xp when activityType is 'session'
await supabase.rpc('update_user_streak', { p_user_id: userId });
```

**Streak Logic:**
- First activity ever: Start 1-day streak
- Same day activity: No change
- Consecutive day: Increment streak
- Missed a day: Reset to 1

## Testing Checklist

- [ ] Database tables created successfully
- [ ] AchievementsSection displays on dashboard
- [ ] User progress shows correct XP and level
- [ ] XP awards correctly after completing activity
- [ ] Level-up notification appears when leveling up
- [ ] Achievement unlocks when requirement met
- [ ] Trophy modal shows with confetti
- [ ] Share button works (native or clipboard)
- [ ] "NEW!" badge appears on new achievements
- [ ] "NEW!" badge disappears after viewing
- [ ] Streak increments daily
- [ ] All 25 achievements visible and categorized

## Performance Notes

- **Lazy Loading**: Achievement modal only loads when needed
- **Caching**: User progress cached client-side
- **Batch Checks**: Achievements checked once per XP award
- **Indexed Queries**: All database queries use proper indexes
- **Optimistic Updates**: UI updates immediately, syncs in background

## Troubleshooting

### Achievements Not Unlocking
- Check user_progress values match requirements
- Verify achievement requirement_type and requirement_value
- Run `/api/check-achievements` manually to force check
- Check browser console for errors

### XP Not Adding
- Verify user authenticated
- Check add-xp API route response
- Ensure user_progress row exists
- Check Supabase logs for database errors

### Modal Not Showing
- Verify react-confetti is installed
- Check for console errors
- Ensure achievements have `is_new: true`
- Test with browser dev tools

### Streak Not Updating
- Check that update_user_streak function exists in database
- Verify activityType is 'session' when calling awardXP
- Check last_activity_date in user_progress table

## Analytics Ideas

Query achievement_history for insights:
```sql
-- Most popular achievements
SELECT achievement_id, COUNT(*) as unlock_count
FROM achievement_history
GROUP BY achievement_id
ORDER BY unlock_count DESC;

-- Average level when unlocking achievements
SELECT a.title, AVG(ah.user_level_at_unlock) as avg_level
FROM achievement_history ah
JOIN achievements a ON a.id = ah.achievement_id
GROUP BY a.title;

-- User engagement over time
SELECT DATE(unlocked_at) as date, COUNT(*) as achievements_unlocked
FROM achievement_history
GROUP BY DATE(unlocked_at)
ORDER BY date DESC;
```

## Future Enhancements

1. **Leaderboards**: Show top XP earners
2. **Achievement Sharing Images**: Generate images for social media
3. **Weekly Challenges**: Special time-limited achievements
4. **Achievement Paths**: Unlock higher tiers after completing lower ones
5. **Custom Badges**: Let users design their own achievement icons
6. **Achievement Trading**: Social features (if applicable)
7. **Seasonal Events**: Holiday-themed achievements
8. **Team Achievements**: Collaborative goals

## Support

For issues:
1. Check browser console for errors
2. Verify database tables and functions exist
3. Test API routes directly
4. Review Supabase logs
5. Check that react-confetti is installed

Enjoy your new achievements system! 🏆
