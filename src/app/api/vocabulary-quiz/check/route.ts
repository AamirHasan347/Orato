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

    // Count how many words user has viewed
    const { count: wordCount } = await supabase
      .from('user_vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Check last quiz date
    const { data: lastQuiz } = await supabase
      .from('vocabulary_quiz_results')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const today = new Date();
    const lastQuizDate = lastQuiz ? new Date(lastQuiz.created_at) : null;
    const daysSinceLastQuiz = lastQuizDate
      ? Math.floor((today.getTime() - lastQuizDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Show quiz if user has viewed 7 or more words and hasn't taken quiz in last 7 days
    const shouldShowQuiz = (wordCount || 0) >= 7 && daysSinceLastQuiz >= 7;

    return NextResponse.json({
      ok: true,
      shouldShowQuiz,
      wordCount: wordCount || 0,
      daysSinceLastQuiz,
    });
  } catch (error) {
    console.error('Error checking quiz eligibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
