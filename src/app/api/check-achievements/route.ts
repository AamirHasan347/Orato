import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAchievementNotification } from '@/lib/notificationHelpers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressError) {
      console.error('Check Achievements API: Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Could not fetch user progress', details: progressError.message },
        { status: 500 }
      );
    }

    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (achievementsError) {
      console.error('Check Achievements API: Error fetching achievements:', achievementsError);
      return NextResponse.json(
        { error: 'Could not fetch achievements', details: achievementsError.message },
        { status: 500 }
      );
    }

    // Get already unlocked achievements
    const { data: unlocked, error: unlockedError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    if (unlockedError) {
      console.error('Check Achievements API: Error fetching unlocked:', unlockedError);
      return NextResponse.json(
        { error: 'Could not fetch unlocked achievements', details: unlockedError.message },
        { status: 500 }
      );
    }

    const unlockedIds = new Set(unlocked.map((u) => u.achievement_id));
    const newlyUnlocked = [];

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      // Check requirement
      switch (achievement.requirement_type) {
        case 'streak_days':
          shouldUnlock = progress.current_streak >= achievement.requirement_value;
          break;
        case 'fluency_score':
          shouldUnlock = progress.best_fluency_score >= achievement.requirement_value;
          break;
        case 'total_sessions':
          shouldUnlock = progress.total_sessions >= achievement.requirement_value;
          break;
        case 'words_learned':
          shouldUnlock = progress.total_words_learned >= achievement.requirement_value;
          break;
        case 'current_level':
          shouldUnlock = progress.current_level >= achievement.requirement_value;
          break;
        case 'custom':
          // Custom achievements handled elsewhere
          break;
      }

      if (shouldUnlock) {
        // Unlock the achievement
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            is_new: true,
          });

        if (insertError) {
          console.error('Check Achievements API: Error unlocking achievement:', insertError);
          continue;
        }

        // Log to history
        await supabase.from('achievement_history').insert({
          user_id: user.id,
          achievement_id: achievement.id,
          user_level_at_unlock: progress.current_level,
          user_xp_at_unlock: progress.total_xp,
        });

        // Award XP
        if (achievement.xp_reward > 0) {
          const newTotalXp = progress.total_xp + achievement.xp_reward;
          const newLevel = calculateLevelFromXp(newTotalXp);

          await supabase
            .from('user_progress')
            .update({
              total_xp: newTotalXp,
              current_level: newLevel,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);
        }

        newlyUnlocked.push({
          ...achievement,
          xp_awarded: achievement.xp_reward,
        });

        // Create notification for achievement unlock
        try {
          await createAchievementNotification(
            user.id,
            achievement.name,
            achievement.description,
            achievement.icon_url
          );
        } catch (notifError) {
          console.error('Failed to create achievement notification:', notifError);
          // Don't fail the achievement unlock if notification fails
        }
      }
    }

    return NextResponse.json({
      ok: true,
      newlyUnlocked,
      count: newlyUnlocked.length,
    });
  } catch (error) {
    console.error('Check Achievements API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate level from XP
function calculateLevelFromXp(totalXp: number): number {
  let level = 1;
  let cumulativeXp = 0;

  while (cumulativeXp <= totalXp) {
    const xpNeeded = Math.floor(100 * Math.pow(1.5, level - 1));
    cumulativeXp += xpNeeded;
    if (cumulativeXp <= totalXp) {
      level++;
    }
  }

  return level;
}
