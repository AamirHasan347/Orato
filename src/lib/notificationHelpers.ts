/**
 * Notification Helper Functions
 * Used to create various types of notifications for users
 */

import { supabaseAdmin } from '@/lib/supabase';

export interface CreateNotificationParams {
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
  priority?: 1 | 2 | 3;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: params.user_id,
      type: params.type,
      title: params.title,
      message: params.message,
      action_url: params.action_url,
      metadata: params.metadata || {},
      expires_at: params.expires_at,
      priority: params.priority || 1
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  return data;
}

/**
 * Create a challenge reminder notification
 */
export async function createChallengeReminder(user_id: string, challengeType?: string) {
  // Check user's last challenge activity
  const { data: lastChallenge } = await supabaseAdmin
    .from('challenge_history')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const hoursSinceLastChallenge = lastChallenge
    ? (Date.now() - new Date(lastChallenge.created_at).getTime()) / (1000 * 60 * 60)
    : 48;

  // Only send reminder if it's been more than 24 hours
  if (hoursSinceLastChallenge < 24) {
    return null;
  }

  const messages = [
    "Ready to level up? A new speaking challenge is waiting for you!",
    "Keep your streak going! Try today's speaking challenge.",
    "Your communication skills are improving! Take on a new challenge today.",
    "Time to practice! Complete a challenge to earn XP and achievements."
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return createNotification({
    user_id,
    type: 'challenge_reminder',
    title: 'Daily Challenge Available',
    message: randomMessage,
    action_url: '/challenges',
    priority: 2,
    metadata: {
      challenge_type: challengeType || 'daily',
      hours_since_last: Math.floor(hoursSinceLastChallenge)
    }
  });
}

/**
 * Create a weekly summary notification
 */
export async function createWeeklySummary(user_id: string) {
  // Get user's progress for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch challenges completed
  const { data: challenges } = await supabaseAdmin
    .from('challenge_history')
    .select('*')
    .eq('user_id', user_id)
    .gte('created_at', sevenDaysAgo.toISOString());

  // Fetch achievements earned
  const { data: achievements } = await supabaseAdmin
    .from('user_achievements')
    .select('*')
    .eq('user_id', user_id)
    .gte('earned_at', sevenDaysAgo.toISOString());

  // Fetch current progress
  const { data: progress } = await supabaseAdmin
    .from('user_progress')
    .select('total_xp, current_level')
    .eq('user_id', user_id)
    .single();

  const challengeCount = challenges?.length || 0;
  const achievementCount = achievements?.length || 0;
  const currentLevel = progress?.current_level || 1;

  if (challengeCount === 0 && achievementCount === 0) {
    // Send encouragement if no activity
    return createNotification({
      user_id,
      type: 'weekly_summary',
      title: 'We Miss You!',
      message: "It's been a quiet week. Let's get back on track with some challenges!",
      action_url: '/challenges',
      priority: 2,
      metadata: {
        week_start: sevenDaysAgo.toISOString(),
        challenges_completed: 0,
        achievements_earned: 0
      }
    });
  }

  // Create summary message
  let message = `This week you completed ${challengeCount} challenge${challengeCount !== 1 ? 's' : ''}`;
  if (achievementCount > 0) {
    message += ` and earned ${achievementCount} achievement${achievementCount !== 1 ? 's' : ''}`;
  }
  message += `! You're currently Level ${currentLevel}. Keep up the great work!`;

  return createNotification({
    user_id,
    type: 'weekly_summary',
    title: '🎉 Your Weekly Progress',
    message,
    action_url: '/settings',
    priority: 2,
    metadata: {
      week_start: sevenDaysAgo.toISOString(),
      challenges_completed: challengeCount,
      achievements_earned: achievementCount,
      current_level: currentLevel
    }
  });
}

/**
 * Create a coach video recommendation notification
 */
export async function createCoachRecommendation(user_id: string) {
  // Get user's profile and progress
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('native_language, proficiency_level')
    .eq('user_id', user_id)
    .single();

  const { data: progress } = await supabaseAdmin
    .from('user_progress')
    .select('current_level')
    .eq('user_id', user_id)
    .single();

  // Get recent challenge performance
  const { data: recentChallenges } = await supabaseAdmin
    .from('challenge_history')
    .select('challenge_type, score')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Determine recommendation based on user data
  let recommendedTopic = 'Communication Fundamentals';
  let topicSlug = 'communication-fundamentals';

  if (recentChallenges && recentChallenges.length > 0) {
    const avgScore = recentChallenges.reduce((sum, c) => sum + (c.score || 0), 0) / recentChallenges.length;

    if (avgScore < 70) {
      recommendedTopic = 'Building Confidence in Speaking';
      topicSlug = 'building-confidence';
    } else if (avgScore >= 85) {
      recommendedTopic = 'Advanced Communication Techniques';
      topicSlug = 'advanced-techniques';
    }
  }

  const currentLevel = progress?.current_level || 1;
  const proficiencyLevel = profile?.proficiency_level || 'intermediate';

  return createNotification({
    user_id,
    type: 'coach_recommendation',
    title: 'New Video Recommendation',
    message: `Based on your progress (Level ${currentLevel}), we recommend: "${recommendedTopic}". Watch now to level up your skills!`,
    action_url: '/saved-videos',
    priority: 2,
    metadata: {
      recommended_topic: recommendedTopic,
      topic_slug: topicSlug,
      user_level: currentLevel,
      proficiency: proficiencyLevel,
      reason: 'personalized_recommendation'
    }
  });
}

/**
 * Create a Word of the Day notification
 */
export async function createWordOfDayNotification(user_id: string, word: { word: string; definition: string }) {
  return createNotification({
    user_id,
    type: 'word_of_day',
    title: '💡 New Word of the Day',
    message: `Today's word is "${word.word}"! Learn its meaning and usage.`,
    action_url: '/',
    priority: 1,
    metadata: {
      word: word.word,
      definition: word.definition
    },
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expires in 24 hours
  });
}

/**
 * Create an achievement notification
 */
export async function createAchievementNotification(
  user_id: string,
  achievementName: string,
  achievementDescription: string,
  achievementIcon?: string
) {
  return createNotification({
    user_id,
    type: 'achievement',
    title: `🏆 Achievement Unlocked: ${achievementName}`,
    message: achievementDescription,
    action_url: '/settings?tab=achievements',
    priority: 3,
    metadata: {
      achievement_name: achievementName,
      icon: achievementIcon
    }
  });
}

/**
 * Batch create daily reminders for all active users
 * This would typically be called by a cron job or scheduled task
 */
export async function sendDailyRemindersToActiveUsers() {
  // Get users who have daily reminders enabled
  const { data: users } = await supabaseAdmin
    .from('user_preferences')
    .select('user_id, reminder_time')
    .eq('daily_reminder', true);

  if (!users || users.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await createChallengeReminder(user.user_id);
      sent++;
    } catch (error) {
      console.error(`Failed to send reminder to user ${user.user_id}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send weekly summaries to all active users
 * This would typically be called by a cron job on Sunday evening
 */
export async function sendWeeklySummariesToActiveUsers() {
  // Get users who have weekly reports enabled
  const { data: users } = await supabaseAdmin
    .from('user_preferences')
    .select('user_id')
    .eq('weekly_report', true);

  if (!users || users.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await createWeeklySummary(user.user_id);
      sent++;
    } catch (error) {
      console.error(`Failed to send weekly summary to user ${user.user_id}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}
