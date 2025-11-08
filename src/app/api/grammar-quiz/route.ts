import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') || 'easy';
    const category = searchParams.get('category') || null;
    const limit = parseInt(searchParams.get('limit') || '5');

    console.log(`Grammar Quiz API: Fetching ${limit} ${difficulty} questions${category ? ` in category ${category}` : ''}`);

    // Build query
    let query = supabase
      .from('grammar_quiz_questions')
      .select('*')
      .eq('difficulty', difficulty);

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Fetch random questions based on difficulty and category
    const { data: questions, error: questionsError } = await query.limit(limit * 3); // Get more for better randomization

    if (questionsError) {
      console.error('Grammar Quiz API: Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Could not fetch questions', details: questionsError.message },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      console.warn('Grammar Quiz API: No questions found');
      return NextResponse.json(
        { error: 'No questions available for this difficulty level' },
        { status: 404 }
      );
    }

    // Shuffle and limit to requested number
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(limit, questions.length));

    // Format questions (remove correct_answer and explanation from response)
    const formattedQuestions = selectedQuestions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      category: q.category,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
      },
    }));

    console.log(`Grammar Quiz API: Successfully fetched ${formattedQuestions.length} questions`);

    return NextResponse.json({
      ok: true,
      questions: formattedQuestions,
      total: formattedQuestions.length,
      difficulty: difficulty,
    });
  } catch (error) {
    console.error('Grammar Quiz API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
