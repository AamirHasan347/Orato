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

    // Get today's date
    const today = new Date();

    // Fetch active weekly recommendation where today falls between week_start_date and week_end_date
    const { data: recommendation, error: recError } = await supabase
      .from('weekly_recommendations')
      .select('*')
      .eq('is_active', true)
      .lte('week_start_date', today.toISOString().split('T')[0])
      .gte('week_end_date', today.toISOString().split('T')[0])
      .single();

    if (recError) {
      // If no recommendation found, that's okay - we'll use the current video
      if (recError.code === 'PGRST116') {
        return NextResponse.json({
          ok: true,
          recommendation: null,
          message: 'No weekly recommendation set',
        });
      }

      console.error('Weekly Recommendation API: Error fetching recommendation:', recError);
      return NextResponse.json(
        { error: 'Could not fetch weekly recommendation', details: recError.message },
        { status: 500 }
      );
    }

    // If we have a recommendation, fetch the video details
    if (recommendation) {
      const { data: video, error: videoError } = await supabase
        .from('coach_videos')
        .select('*')
        .eq('video_id', recommendation.video_id)
        .single();

      if (videoError) {
        console.error('Weekly Recommendation API: Error fetching video:', videoError);
      }

      return NextResponse.json({
        ok: true,
        recommendation: {
          ...recommendation,
          video: video || null,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      recommendation: null,
    });
  } catch (error) {
    console.error('Weekly Recommendation API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
