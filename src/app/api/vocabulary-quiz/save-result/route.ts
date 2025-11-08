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
    const { score, total } = body;

    if (typeof score !== 'number' || typeof total !== 'number') {
      return NextResponse.json(
        { error: 'Score and total are required' },
        { status: 400 }
      );
    }

    // Save quiz result
    const { data, error } = await supabase
      .from('vocabulary_quiz_results')
      .insert({
        user_id: user.id,
        score,
        total_questions: total,
        percentage: Math.round((score / total) * 100),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz result:', error);
      return NextResponse.json(
        { error: 'Failed to save quiz result', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      result: data,
    });
  } catch (error) {
    console.error('Error in save quiz result API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
