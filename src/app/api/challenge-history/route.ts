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

    // Fetch all challenge attempts for the user with challenge details
    const { data: attempts, error: attemptsError } = await supabase
      .from('challenge_attempts')
      .select(`
        id,
        challenge_id,
        audio_url,
        transcript,
        feedback,
        score,
        xp_earned,
        created_at,
        daily_challenges (
          id,
          prompt,
          difficulty,
          date
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (attemptsError) {
      console.error('Error fetching challenge history:', attemptsError);
      return NextResponse.json(
        { error: 'Failed to fetch challenge history', details: attemptsError.message },
        { status: 500 }
      );
    }

    // Get user's total XP
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('total_xp, level')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      ok: true,
      attempts: attempts || [],
      totalXP: userProfile?.total_xp || 0,
      level: userProfile?.level || 1,
    });
  } catch (error) {
    console.error('Unexpected error in challenge-history API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
