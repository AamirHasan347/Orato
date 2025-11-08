// Helper utilities for awarding XP and checking achievements

/**
 * Award XP to the user and check for new achievements
 * Call this after completing any activity that should grant XP
 */
export async function awardXP(params: {
  xpAmount: number;
  activityType: 'session' | 'vocabulary' | 'fluency' | 'quiz' | 'challenge';
  metadata?: {
    wordsLearned?: number;
    fluencyScore?: number;
    quizScore?: number;
    isPerfectScore?: boolean;
  };
}) {
  try {
    const response = await fetch('/api/add-xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.ok) {
      return {
        success: true,
        xpAdded: data.xpAdded,
        totalXp: data.totalXp,
        leveledUp: data.leveledUp,
        oldLevel: data.oldLevel,
        newLevel: data.newLevel,
        newAchievements: data.newAchievements || [],
        message: data.message,
      };
    }

    return { success: false, error: data.error };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { success: false, error: 'Failed to award XP' };
  }
}

/**
 * Award a custom achievement (for special cases like "first quiz", "early bird", etc.)
 */
export async function awardCustomAchievement(achievementKey: string) {
  try {
    // You'll need to create a custom endpoint for this
    // For now, this is a placeholder
    console.log('Custom achievement:', achievementKey);
    return { success: true };
  } catch (error) {
    console.error('Error awarding custom achievement:', error);
    return { success: false, error: 'Failed to award achievement' };
  }
}

/**
 * XP Rewards Reference
 * Use these values consistently across the app
 */
export const XP_REWARDS = {
  // Practice Sessions
  PRACTICE_SESSION_COMPLETE: 50,
  PRACTICE_SESSION_STREAK: 25, // Bonus for consecutive days

  // Recording/Speaking
  RECORDING_SUBMIT: 30,
  RECORDING_EXCELLENT: 50, // For high fluency scores

  // Quizzes
  QUIZ_COMPLETE: 40,
  QUIZ_PERFECT: 100, // 100% score
  QUIZ_GOOD: 60, // 80%+ score

  // Vocabulary
  WORD_LEARNED: 5,
  WORD_MASTERED: 15, // After multiple correct uses

  // Daily Challenges
  DAILY_CHALLENGE_COMPLETE: 75,
  DAILY_CHALLENGE_PERFECT: 150,

  // Grammar
  GRAMMAR_QUIZ_COMPLETE: 50,
  GRAMMAR_QUIZ_PERFECT: 100,

  // Special
  FIRST_TIME_BONUS: 25, // First time doing any activity
  SHARE_ACHIEVEMENT: 10,
  EARLY_BIRD: 20, // Practice before 8 AM
  NIGHT_OWL: 20, // Practice after 10 PM
};

/**
 * Example usage in your components:
 *
 * // After completing a practice session
 * const result = await awardXP({
 *   xpAmount: XP_REWARDS.PRACTICE_SESSION_COMPLETE,
 *   activityType: 'session',
 * });
 *
 * if (result.success && result.newAchievements.length > 0) {
 *   // Show achievement modal
 *   showAchievementModal(result.newAchievements);
 * }
 *
 * // After completing a quiz with vocabulary
 * const result = await awardXP({
 *   xpAmount: XP_REWARDS.QUIZ_COMPLETE,
 *   activityType: 'quiz',
 *   metadata: {
 *     wordsLearned: 5,
 *     quizScore: 85,
 *     isPerfectScore: false,
 *   },
 * });
 *
 * // After a recording with fluency score
 * const result = await awardXP({
 *   xpAmount: XP_REWARDS.RECORDING_SUBMIT,
 *   activityType: 'fluency',
 *   metadata: {
 *     fluencyScore: 82.5,
 *   },
 * });
 */

/**
 * Check if it's early bird or night owl time
 */
export function getTimeBasedBonus(): { isEarlyBird: boolean; isNightOwl: boolean } {
  const hour = new Date().getHours();
  return {
    isEarlyBird: hour >= 5 && hour < 8,
    isNightOwl: hour >= 22 || hour < 5,
  };
}

/**
 * Format XP number with commas
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Calculate completion percentage for progress bars
 */
export function calculateProgress(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}
