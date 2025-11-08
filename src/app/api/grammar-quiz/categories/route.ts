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

    // Get unique categories with question counts
    const { data: questions, error: questionsError } = await supabase
      .from('grammar_quiz_questions')
      .select('category, difficulty');

    if (questionsError) {
      console.error('Error fetching categories:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: questionsError.message },
        { status: 500 }
      );
    }

    // Count questions by category and difficulty
    const categoryStats: Record<string, any> = {};

    questions?.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = {
          name: q.category,
          total: 0,
          easy: 0,
          medium: 0,
          hard: 0,
        };
      }
      categoryStats[q.category].total++;
      categoryStats[q.category][q.difficulty]++;
    });

    const categories = Object.values(categoryStats).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({
      ok: true,
      categories,
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
