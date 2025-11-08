import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    const body = await request.json();
    const { challenge_id, audio_url, transcript, feedback, score, is_retry } = body;

    if (!challenge_id || !audio_url) {
      return NextResponse.json(
        { error: 'Missing required fields: challenge_id and audio_url are required' },
        { status: 400 }
      );
    }

    // Get challenge details for difficulty
    const { data: challengeData } = await supabase
      .from('daily_challenges')
      .select('difficulty')
      .eq('id', challenge_id)
      .single();

    // Calculate XP based on score and difficulty
    const calculateXP = (score: number | null, difficulty: string, isRetry: boolean): number => {
      if (!score) return 10; // Base XP for completion

      let baseXP = 10;
      const scoreMultiplier = score / 10; // Score is out of 10

      // Difficulty multiplier
      const difficultyMultipliers: Record<string, number> = {
        easy: 1,
        medium: 1.5,
        hard: 2,
      };

      const difficultyBonus = difficultyMultipliers[difficulty] || 1;
      const xp = Math.round(baseXP * scoreMultiplier * difficultyBonus);

      // Retry gives 50% XP
      return isRetry ? Math.round(xp * 0.5) : xp;
    };

    const xpEarned = calculateXP(score, challengeData?.difficulty || 'easy', is_retry || false);

    // Save the challenge attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('challenge_attempts')
      .insert({
        user_id: user.id,
        challenge_id,
        audio_url,
        transcript: transcript || null,
        feedback: feedback || null,
        score: score || null,
        xp_earned: xpEarned,
        is_retry: is_retry || false,
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error saving challenge attempt:', attemptError);
      return NextResponse.json(
        { error: 'Failed to save challenge attempt', details: attemptError.message },
        { status: 500 }
      );
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get or create user streak record
    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let newStreak = 1;
    let longestStreak = 1;

    if (existingStreak) {
      const lastCompletedDate = existingStreak.last_completed_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if the last completed date was yesterday (continue streak)
      if (lastCompletedDate === yesterdayStr) {
        newStreak = existingStreak.current_streak + 1;
      } else if (lastCompletedDate === today) {
        // Already completed today, keep current streak
        newStreak = existingStreak.current_streak;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }

      longestStreak = Math.max(newStreak, existingStreak.longest_streak);

      // Update existing streak
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_completed_date: today,
          total_challenges_completed: existingStreak.total_challenges_completed + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating streak:', updateError);
      }
    } else {
      // Create new streak record
      const { error: insertError } = await supabase.from('user_streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_completed_date: today,
        total_challenges_completed: 1,
      });

      if (insertError) {
        console.error('Error creating streak:', insertError);
      }
    }

    // Fetch updated streak
    const { data: updatedStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Update user profile with XP
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const newTotalXP = (existingProfile?.total_xp || 0) + xpEarned;

    // Calculate level (every 100 XP = 1 level)
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    if (existingProfile) {
      // Update existing profile
      await supabase
        .from('user_profiles')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      // Create new profile
      await supabase.from('user_profiles').insert({
        user_id: user.id,
        total_xp: newTotalXP,
        level: newLevel,
      });
    }

    return NextResponse.json({
      ok: true,
      attempt,
      streak: updatedStreak || {
        current_streak: newStreak,
        longest_streak: longestStreak,
        total_challenges_completed: existingStreak
          ? existingStreak.total_challenges_completed + 1
          : 1,
      },
      xp_earned: xpEarned,
      total_xp: newTotalXP,
      level: newLevel,
    });
  } catch (error) {
    console.error('Unexpected error in save-challenge API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
