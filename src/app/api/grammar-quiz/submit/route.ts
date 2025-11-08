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
    const { answers, time_taken, difficulty } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request: answers array is required' },
        { status: 400 }
      );
    }

    console.log(`Grammar Quiz Submit: Processing ${answers.length} answers from user ${user.id}`);

    // Fetch correct answers for submitted questions
    const questionIds = answers.map((a) => a.question_id);
    const { data: questions, error: questionsError } = await supabase
      .from('grammar_quiz_questions')
      .select('id, correct_answer, explanation')
      .in('id', questionIds);

    if (questionsError || !questions) {
      console.error('Grammar Quiz Submit: Error fetching answers:', questionsError);
      return NextResponse.json(
        { error: 'Could not verify answers', details: questionsError?.message },
        { status: 500 }
      );
    }

    // Create a map for quick lookup
    const correctAnswersMap = new Map(
      questions.map((q) => [q.id, { correct_answer: q.correct_answer, explanation: q.explanation }])
    );

    // Fetch full question data to get options
    const { data: fullQuestions, error: fullQuestionsError } = await supabase
      .from('grammar_quiz_questions')
      .select('id, option_a, option_b, option_c, option_d, correct_answer')
      .in('id', questionIds);

    if (fullQuestionsError) {
      console.error('Error fetching full questions:', fullQuestionsError);
    }

    // Create question options map
    const questionOptionsMap = new Map(
      fullQuestions?.map((q) => [
        q.id,
        {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
          correct_answer: q.correct_answer,
        },
      ]) || []
    );

    // Grade the answers
    let score = 0;
    const gradedAnswers = answers.map((answer) => {
      const correctData = correctAnswersMap.get(answer.question_id);
      const questionOptions = questionOptionsMap.get(answer.question_id);

      if (!correctData || !questionOptions) {
        return {
          question_id: answer.question_id,
          user_answer: answer.user_answer,
          correct_answer: '',
          is_correct: false,
          explanation: 'Question data not found',
          time_taken: answer.time_taken || 0,
        };
      }

      // Normalize answers for comparison
      const userAnswer = answer.user_answer?.toString().trim().toUpperCase();
      let dbCorrectAnswer = correctData.correct_answer?.toString().trim().toUpperCase();

      // Check if database has text instead of letter
      // If so, find which option matches
      let correctAnswerLetter = dbCorrectAnswer;

      if (dbCorrectAnswer && !['A', 'B', 'C', 'D'].includes(dbCorrectAnswer)) {
        // Database has text, find matching option
        const normalizedDbAnswer = dbCorrectAnswer.toLowerCase();
        if (questionOptions.A?.toLowerCase().trim() === normalizedDbAnswer) {
          correctAnswerLetter = 'A';
        } else if (questionOptions.B?.toLowerCase().trim() === normalizedDbAnswer) {
          correctAnswerLetter = 'B';
        } else if (questionOptions.C?.toLowerCase().trim() === normalizedDbAnswer) {
          correctAnswerLetter = 'C';
        } else if (questionOptions.D?.toLowerCase().trim() === normalizedDbAnswer) {
          correctAnswerLetter = 'D';
        }
      }

      const isCorrect = userAnswer === correctAnswerLetter;

      if (isCorrect) {
        score++;
      }

      console.log(`Question ${answer.question_id}: User=${userAnswer}, Correct=${correctAnswerLetter}, Match=${isCorrect}`);

      return {
        question_id: answer.question_id,
        user_answer: answer.user_answer,
        correct_answer: correctAnswerLetter, // Always return the letter
        is_correct: !!isCorrect,
        explanation: correctData?.explanation || '',
        time_taken: answer.time_taken || 0,
      };
    });

    const totalQuestions = answers.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    console.log(`Grammar Quiz Submit: User scored ${score}/${totalQuestions} (${percentage}%)`);

    // Save attempt to database
    const { data: attempt, error: insertError } = await supabase
      .from('grammar_quiz_attempts')
      .insert({
        user_id: user.id,
        score: score,
        total_questions: totalQuestions,
        time_taken: time_taken || 0,
        questions_data: gradedAnswers,
        difficulty: difficulty || 'easy',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Grammar Quiz Submit: Error saving attempt:', insertError);
      // Don't fail the request, just log the error
      console.warn('Could not save attempt to database, but returning results to user');
    }

    console.log('Grammar Quiz Submit: Successfully processed and saved quiz attempt');

    return NextResponse.json({
      ok: true,
      score: score,
      total: totalQuestions,
      percentage: percentage,
      answers: gradedAnswers,
      attempt_id: attempt?.id,
    });
  } catch (error) {
    console.error('Grammar Quiz Submit: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
