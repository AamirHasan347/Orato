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

    // Get today's date in YYYY-MM-DD format (UTC)
    const today = new Date().toISOString().split('T')[0];

    console.log('Word of Day API: Fetching word for date:', today);

    // Fetch today's word
    const { data: wordData, error: wordError } = await supabase
      .from('word_of_the_day')
      .select('*')
      .eq('date', today)
      .single();

    if (wordError) {
      console.error('Word of Day API: Error fetching word:', wordError);
      return NextResponse.json(
        { error: 'Could not fetch word of the day', details: wordError.message },
        { status: 500 }
      );
    }

    if (!wordData) {
      console.warn('Word of Day API: No word found for today');
      return NextResponse.json(
        { error: 'No word available for today' },
        { status: 404 }
      );
    }

    console.log('Word of Day API: Successfully fetched word:', wordData.word);

    return NextResponse.json({
      ok: true,
      word: {
        id: wordData.id,
        word: wordData.word,
        pronunciation: wordData.pronunciation,
        partOfSpeech: wordData.part_of_speech,
        definition: wordData.definition,
        example: wordData.example_sentence,
        examples: wordData.examples || [],
        funFact: wordData.fun_fact,
        synonyms: wordData.synonyms || [],
        date: wordData.date,
      },
    });
  } catch (error) {
    console.error('Word of Day API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
