import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // 'all', 'week', 'month'

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('user_profiles')
      .select(`
        user_id,
        total_xp,
        level,
        users (
          email,
          user_metadata
        )
      `)
      .order('total_xp', { ascending: false })
      .limit(100);

    // If weekly or monthly, filter by recent activity
    if (period === 'week' || period === 'month') {
      const daysBack = period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Get users who have attempted challenges in the period
      const { data: recentUsers } = await supabase
        .from('challenge_attempts')
        .select('user_id, xp_earned')
        .gte('created_at', startDate.toISOString());

      if (recentUsers && recentUsers.length > 0) {
        // Calculate XP per user for the period
        const userXP = recentUsers.reduce((acc: Record<string, number>, attempt) => {
          acc[attempt.user_id] = (acc[attempt.user_id] || 0) + (attempt.xp_earned || 0);
          return acc;
        }, {});

        const periodLeaderboard = Object.entries(userXP)
          .map(([userId, xp]) => ({ user_id: userId, period_xp: xp }))
          .sort((a, b) => b.period_xp - a.period_xp)
          .slice(0, 100);

        // Get user details for period leaderboard
        const userIds = periodLeaderboard.map(u => u.user_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select(`
            user_id,
            total_xp,
            level,
            users (
              email,
              user_metadata
            )
          `)
          .in('user_id', userIds);

        const leaderboardData = periodLeaderboard.map(entry => {
          const profile = profiles?.find(p => p.user_id === entry.user_id);
          return {
            ...profile,
            period_xp: entry.period_xp,
          };
        });

        // Get current user's rank
        const userRank = leaderboardData.findIndex(u => u.user_id === user.id) + 1;

        return NextResponse.json({
          ok: true,
          leaderboard: leaderboardData,
          userRank: userRank || null,
          period,
        });
      }
    }

    // All-time leaderboard
    const { data: leaderboard, error: leaderboardError } = await query;

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard', details: leaderboardError.message },
        { status: 500 }
      );
    }

    // Get current user's rank
    const userRank = leaderboard?.findIndex((u: any) => u.user_id === user.id) + 1;

    return NextResponse.json({
      ok: true,
      leaderboard: leaderboard || [],
      userRank: userRank || null,
      period,
    });
  } catch (error) {
    console.error('Unexpected error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
