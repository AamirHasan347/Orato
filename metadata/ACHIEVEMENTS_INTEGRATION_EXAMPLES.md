# Achievements System - Integration Examples

Quick reference guide for integrating the achievements system into existing Orato features.

## 1. Grammar Quiz Integration

```typescript
// In: /app/grammar-quiz/page.tsx or wherever quiz results are handled

import { awardXP, XP_REWARDS } from "@/lib/achievements";

async function handleQuizComplete(score: number, totalQuestions: number) {
  const percentage = (score / totalQuestions) * 100;
  const isPerfect = percentage === 100;

  // Determine XP amount based on score
  let xpAmount = XP_REWARDS.GRAMMAR_QUIZ_COMPLETE;
  if (isPerfect) {
    xpAmount = XP_REWARDS.QUIZ_PERFECT;
  } else if (percentage >= 80) {
    xpAmount = XP_REWARDS.QUIZ_GOOD;
  }

  // Award XP
  const result = await awardXP({
    xpAmount,
    activityType: 'quiz',
    metadata: {
      quizScore: percentage,
      isPerfectScore: isPerfect,
    },
  });

  // Show success message
  if (result.success) {
    // Option 1: Toast notification
    toast.success(`Quiz Complete! +${result.xpAdded} XP`);

    // Option 2: Custom notification
    showNotification({
      title: isPerfect ? '🎉 Perfect Score!' : '✅ Quiz Complete',
      message: `You earned ${result.xpAdded} XP!`,
      type: 'success',
    });

    // If leveled up, show special message
    if (result.leveledUp) {
      toast.success(`🎉 Level Up! You're now level ${result.newLevel}!`);
    }
  }

  // Achievement modal auto-shows if new achievements unlocked
}
```

## 2. Daily Challenge Integration

```typescript
// In: /app/challenges/page.tsx or challenge completion handler

import { awardXP, XP_REWARDS } from "@/lib/achievements";

async function handleDailyChallengeComplete(challengeData: {
  score: number;
  maxScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
}) {
  const { score, maxScore, difficulty } = challengeData;
  const isPerfect = score === maxScore;

  // Base XP
  let xpAmount = XP_REWARDS.DAILY_CHALLENGE_COMPLETE;

  // Bonus for perfect
  if (isPerfect) {
    xpAmount = XP_REWARDS.DAILY_CHALLENGE_PERFECT;
  }

  // Difficulty multiplier
  const multipliers = { easy: 1, medium: 1.5, hard: 2 };
  xpAmount = Math.floor(xpAmount * multipliers[difficulty]);

  const result = await awardXP({
    xpAmount,
    activityType: 'challenge',
  });

  // Update UI with results
  setChallengeResults({
    score,
    maxScore,
    xpEarned: result.xpAdded,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
  });
}
```

## 3. Recording/Speaking Practice Integration

```typescript
// In: /app/record/page.tsx

import { awardXP, XP_REWARDS, getTimeBasedBonus } from "@/lib/achievements";

async function handleRecordingSubmit(audioBlob: Blob) {
  try {
    // 1. Submit to transcription API
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: audioBlob,
    });
    const data = await response.json();

    // 2. Calculate fluency score (you might have your own logic)
    const fluencyScore = calculateFluencyScore(data.transcription);

    // 3. Determine XP based on fluency
    let xpAmount = XP_REWARDS.RECORDING_SUBMIT;
    if (fluencyScore >= 85) {
      xpAmount = XP_REWARDS.RECORDING_EXCELLENT;
    }

    // 4. Check for time-based bonuses
    const { isEarlyBird, isNightOwl } = getTimeBasedBonus();
    if (isEarlyBird) {
      xpAmount += XP_REWARDS.EARLY_BIRD;
      toast.info('🌅 Early Bird Bonus! +20 XP');
    } else if (isNightOwl) {
      xpAmount += XP_REWARDS.NIGHT_OWL;
      toast.info('🦉 Night Owl Bonus! +20 XP');
    }

    // 5. Award XP
    const result = await awardXP({
      xpAmount,
      activityType: 'fluency',
      metadata: {
        fluencyScore,
      },
    });

    // 6. Show results
    setResults({
      transcription: data.transcription,
      fluencyScore,
      xpEarned: result.xpAdded,
      feedback: data.feedback,
    });

    if (result.success) {
      toast.success(`+${result.xpAdded} XP! Fluency: ${fluencyScore.toFixed(1)}%`);
    }

  } catch (error) {
    console.error('Recording error:', error);
    toast.error('Failed to process recording');
  }
}
```

## 4. Vocabulary Quiz Integration

```typescript
// In: /app/api/vocabulary-quiz/route.ts or client component

import { awardXP, XP_REWARDS } from "@/lib/achievements";

async function handleVocabularyQuizComplete(results: {
  correctAnswers: number;
  totalQuestions: number;
  newWordsLearned: number;
}) {
  const { correctAnswers, totalQuestions, newWordsLearned } = results;
  const percentage = (correctAnswers / totalQuestions) * 100;

  // Base quiz XP
  let xpAmount = XP_REWARDS.QUIZ_COMPLETE;

  // Bonus for high score
  if (percentage === 100) {
    xpAmount = XP_REWARDS.QUIZ_PERFECT;
  } else if (percentage >= 80) {
    xpAmount = XP_REWARDS.QUIZ_GOOD;
  }

  // Bonus for words learned
  xpAmount += (newWordsLearned * XP_REWARDS.WORD_LEARNED);

  const result = await awardXP({
    xpAmount,
    activityType: 'vocabulary',
    metadata: {
      wordsLearned: newWordsLearned,
      quizScore: percentage,
    },
  });

  return {
    xpEarned: result.xpAdded,
    leveledUp: result.leveledUp,
    newAchievements: result.newAchievements,
  };
}
```

## 5. Word of the Day Integration

```typescript
// In: Word of the Day component when user marks word as learned

import { awardXP, XP_REWARDS } from "@/lib/achievements";

async function handleWordLearned(wordId: string) {
  // Mark word as learned in database
  await markWordAsLearned(wordId);

  // Award XP
  const result = await awardXP({
    xpAmount: XP_REWARDS.WORD_LEARNED,
    activityType: 'vocabulary',
    metadata: {
      wordsLearned: 1,
    },
  });

  if (result.success) {
    // Subtle notification
    toast.success(`Word learned! +${result.xpAdded} XP`, {
      duration: 2000,
      position: 'bottom-right',
    });
  }
}
```

## 6. AI Mentor Chat Integration

```typescript
// In: /app/api/ai-chat/route.ts or chat component

import { awardXP, XP_REWARDS } from "@/lib/achievements";

async function handleChatSessionComplete(sessionData: {
  messageCount: number;
  wordsUsed: number;
  sessionDurationMinutes: number;
}) {
  // Award XP based on engagement
  let xpAmount = 0;

  // Base XP for completing a session (5+ messages)
  if (sessionData.messageCount >= 5) {
    xpAmount += XP_REWARDS.PRACTICE_SESSION_COMPLETE;
  }

  // Bonus for longer sessions
  if (sessionData.sessionDurationMinutes >= 10) {
    xpAmount += 25;
  }

  if (xpAmount > 0) {
    await awardXP({
      xpAmount,
      activityType: 'session',
    });
  }
}
```

## 7. Streak Tracking (Automatic)

The streak system updates automatically when you call `awardXP` with `activityType: 'session'`:

```typescript
// Any daily activity should increment streak
await awardXP({
  xpAmount: 50,
  activityType: 'session', // This triggers streak update
});

// The API automatically:
// - Checks if it's a new day
// - Increments streak if consecutive
// - Resets streak if a day was missed
// - Updates longest_streak if broken record
```

## 8. Custom Achievement Example: "First Time" Bonuses

```typescript
// Track first-time activities in user_progress or separate table

import { supabase } from '@/lib/supabase';

async function handleFirstQuiz(userId: string) {
  // Check if this is first quiz
  const { data: progress } = await supabase
    .from('user_progress')
    .select('total_sessions')
    .eq('user_id', userId)
    .single();

  if (progress && progress.total_sessions === 0) {
    // First time! Award bonus XP
    await awardXP({
      xpAmount: XP_REWARDS.FIRST_TIME_BONUS + XP_REWARDS.QUIZ_COMPLETE,
      activityType: 'quiz',
    });

    toast.success('🎉 First Quiz Bonus! +25 XP');
  }
}
```

## 9. Share Achievement Integration

Already built into the AchievementsSection component! But if you want to trigger sharing elsewhere:

```typescript
async function shareAchievement(achievement: Achievement) {
  const shareText = `🏆 I just unlocked "${achievement.title}" on Orato! ${achievement.badge_icon}\n\n${achievement.description}`;

  if (navigator.share) {
    await navigator.share({
      title: `Achievement Unlocked: ${achievement.title}`,
      text: shareText,
    });
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(shareText);
    toast.success('Achievement copied to clipboard!');
  }

  // Award XP for sharing
  await awardXP({
    xpAmount: XP_REWARDS.SHARE_ACHIEVEMENT,
    activityType: 'session',
  });
}
```

## 10. Dashboard Integration Example

```typescript
// In: /app/page.tsx (main dashboard)

import AchievementsSection from "@/components/AchievementsSection";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    // Fetch user progress to show in header
    fetchUserProgress();
  }, []);

  async function fetchUserProgress() {
    const response = await fetch('/api/user-progress');
    const data = await response.json();
    if (data.ok) {
      setUserProgress(data.progress);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      {/* Header with XP/Level */}
      {userProgress && (
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Level {userProgress.current_level}</div>
              <div className="text-lg font-bold text-purple-600">{userProgress.total_xp} XP</div>
            </div>
            <div className="text-3xl">🔥 {userProgress.current_streak}</div>
          </div>
        </div>
      )}

      {/* Other dashboard components */}
      <CoachCorner />
      <DailyChallenges />
      <WordOfTheDay />

      {/* Achievements Section */}
      <AchievementsSection />
    </div>
  );
}
```

## Quick Reference: When to Award XP

| Activity | When to Award | XP Amount | Activity Type |
|----------|---------------|-----------|---------------|
| Grammar Quiz | On completion | 50 (100 if perfect) | 'quiz' |
| Daily Challenge | On completion | 75 (150 if perfect) | 'challenge' |
| Recording | After submission | 30-50 based on fluency | 'fluency' |
| Vocabulary Quiz | On completion | 40 + words learned | 'vocabulary' |
| AI Chat Session | After 5+ messages | 50 | 'session' |
| Word Learned | When marked as learned | 5 per word | 'vocabulary' |
| Any Daily Activity | First activity of day | Base + streak bonus | 'session' |

## Tips for Best Integration

1. **Always use activityType: 'session'** for activities that should count toward daily streaks
2. **Include metadata** when relevant (fluencyScore, wordsLearned, etc.)
3. **Show user feedback** immediately after XP award
4. **Don't double-award** - check if XP was already given for an activity
5. **Handle errors gracefully** - XP system failure shouldn't break your feature
6. **Test achievement unlocking** - manually set progress values to test thresholds

## Error Handling Pattern

```typescript
async function safeAwardXP(params: AwardXPParams) {
  try {
    const result = await awardXP(params);

    if (!result.success) {
      console.error('XP award failed:', result.error);
      // Don't show error to user - fail silently for gamification
      return;
    }

    // Show success feedback
    toast.success(`+${result.xpAdded} XP`);

    return result;
  } catch (error) {
    console.error('XP system error:', error);
    // Continue with app flow - gamification is enhancement, not critical
  }
}
```

## Testing Your Integration

1. Complete an activity in your feature
2. Check browser Network tab for `/api/add-xp` call
3. Verify response includes `xpAdded`, `totalXp`, `newLevel`
4. Check Supabase `user_progress` table for updated values
5. Trigger achievement by setting progress manually:
   ```sql
   UPDATE user_progress
   SET current_streak = 7
   WHERE user_id = 'YOUR_USER_ID';
   ```
6. Complete an activity to trigger achievement check

Happy integrating! 🚀
