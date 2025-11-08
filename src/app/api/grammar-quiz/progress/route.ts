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

    // Get all quiz attempts for the user
    const { data: attempts, error: attemptsError } = await supabase
      .from('grammar_quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (attemptsError) {
      console.error('Error fetching quiz attempts:', attemptsError);
      return NextResponse.json(
        { error: 'Failed to fetch progress', details: attemptsError.message },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalAttempts = attempts?.length || 0;
    const totalCorrect = attempts?.reduce((sum, attempt) => sum + (attempt.score || 0), 0) || 0;
    const totalQuestions = attempts?.reduce((sum, attempt) => sum + (attempt.total_questions || 0), 0) || 0;
    const averageScore = totalAttempts > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Get best score
    const bestScore = attempts && attempts.length > 0
      ? Math.max(...attempts.map(a => Math.round((a.score / a.total_questions) * 100)))
      : 0;

    // Get recent attempts (last 10)
    const recentAttempts = attempts?.slice(0, 10).map(attempt => ({
      id: attempt.id,
      score: attempt.score,
      total: attempt.total_questions,
      percentage: Math.round((attempt.score / attempt.total_questions) * 100),
      difficulty: attempt.difficulty,
      created_at: attempt.created_at,
      time_taken: attempt.time_taken,
    })) || [];

    // Get stats by difficulty
    const statsByDifficulty = {
      easy: { attempts: 0, correct: 0, total: 0, percentage: 0 },
      medium: { attempts: 0, correct: 0, total: 0, percentage: 0 },
      hard: { attempts: 0, correct: 0, total: 0, percentage: 0 },
    };

    attempts?.forEach(attempt => {
      const diff = attempt.difficulty as keyof typeof statsByDifficulty;
      if (statsByDifficulty[diff]) {
        statsByDifficulty[diff].attempts++;
        statsByDifficulty[diff].correct += attempt.score || 0;
        statsByDifficulty[diff].total += attempt.total_questions || 0;
      }
    });

    // Calculate percentages
    Object.keys(statsByDifficulty).forEach(key => {
      const diff = key as keyof typeof statsByDifficulty;
      const stats = statsByDifficulty[diff];
      stats.percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    });

    return NextResponse.json({
      ok: true,
      stats: {
        totalAttempts,
        averageScore,
        bestScore,
        totalCorrect,
        totalQuestions,
      },
      statsByDifficulty,
      recentAttempts,
    });
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
