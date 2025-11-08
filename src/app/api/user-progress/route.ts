import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Fetch or create user progress
    let { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressError && progressError.code === 'PGRST116') {
      // User progress doesn't exist, create it
      const { data: newProgress, error: createError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          total_xp: 0,
          current_level: 1,
          current_streak: 0,
          longest_streak: 0,
          total_sessions: 0,
          total_words_learned: 0,
          best_fluency_score: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('User Progress API: Error creating progress:', createError);
        return NextResponse.json(
          { error: 'Could not create user progress', details: createError.message },
          { status: 500 }
        );
      }

      progress = newProgress;
    } else if (progressError) {
      console.error('User Progress API: Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Could not fetch user progress', details: progressError.message },
        { status: 500 }
      );
    }

    // Calculate XP needed for next level
    const currentLevel = progress.current_level;
    const xpForNextLevel = Math.floor(100 * Math.pow(1.5, currentLevel - 1));

    // Calculate XP progress in current level
    let cumulativeXp = 0;
    for (let i = 1; i < currentLevel; i++) {
      cumulativeXp += Math.floor(100 * Math.pow(1.5, i - 1));
    }
    const xpInCurrentLevel = progress.total_xp - cumulativeXp;
    const progressPercentage = Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100);

    return NextResponse.json({
      ok: true,
      progress: {
        ...progress,
        xp_for_next_level: xpForNextLevel,
        xp_in_current_level: xpInCurrentLevel,
        level_progress_percentage: Math.round(progressPercentage),
      },
    });
  } catch (error) {
    console.error('User Progress API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
