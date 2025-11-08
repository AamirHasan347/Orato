import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import {
  analyzeWeakAreas,
  generateRoadmap,
  getDefaultPerformance,
} from '@/lib/roadmapGenerator';

export async function POST(request: NextRequest) {
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
    const { forceRegenerate } = body;

    // Check if user already has an active roadmap
    if (!forceRegenerate) {
      const { data: existingRoadmap } = await supabase
        .from('roadmaps')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (existingRoadmap) {
        return NextResponse.json({
          ok: false,
          error: 'User already has an active roadmap',
          message: 'Please complete or regenerate your existing roadmap',
        }, { status: 409 });
      }
    }

    // If force regenerate, mark old roadmap as regenerated
    if (forceRegenerate) {
      await supabase
        .from('roadmaps')
        .update({ status: 'regenerated' })
        .eq('user_id', user.id)
        .eq('status', 'active');
    }

    // Fetch user performance data
    let { data: performance, error: perfError } = await supabase
      .from('user_performance_summary')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (perfError || !performance) {
      // Create default performance for new users
      performance = getDefaultPerformance();

      // Insert default performance
      await supabase
        .from('user_performance_summary')
        .insert({
          user_id: user.id,
          ...performance,
        });
    }

    // Analyze weak areas
    const weakAreas = analyzeWeakAreas(performance);

    // Generate 30-day roadmap
    const roadmapDays = generateRoadmap(performance, weakAreas);

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create roadmap
    const { data: newRoadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert({
        user_id: user.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_days: 30,
        completed_days: 0,
        completion_rate: 0,
        current_day: 1,
        status: 'active',
        performance_snapshot: performance,
        weak_areas: weakAreas.map(w => w.area),
      })
      .select()
      .single();

    if (roadmapError) {
      console.error('Roadmap Generate API: Error creating roadmap:', roadmapError);
      return NextResponse.json(
        { error: 'Could not create roadmap', details: roadmapError.message },
        { status: 500 }
      );
    }

    // Insert roadmap days
    const daysToInsert = roadmapDays.map(day => ({
      roadmap_id: newRoadmap.id,
      user_id: user.id,
      ...day,
    }));

    const { error: daysError } = await supabase
      .from('roadmap_days')
      .insert(daysToInsert);

    if (daysError) {
      console.error('Roadmap Generate API: Error inserting days:', daysError);
      // Rollback: delete roadmap
      await supabase
        .from('roadmaps')
        .delete()
        .eq('id', newRoadmap.id);

      return NextResponse.json(
        { error: 'Could not create roadmap days', details: daysError.message },
        { status: 500 }
      );
    }

    // Fetch the complete roadmap with days
    const { data: completeRoadmap } = await supabase
      .from('roadmaps')
      .select(`
        *,
        days:roadmap_days(*),
        milestones:roadmap_milestones(*)
      `)
      .eq('id', newRoadmap.id)
      .single();

    return NextResponse.json({
      ok: true,
      roadmap: completeRoadmap,
      message: 'Your personalized 30-day roadmap has been created!',
      weak_areas: weakAreas,
    });
  } catch (error) {
    console.error('Roadmap Generate API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
