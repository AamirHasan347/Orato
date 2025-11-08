import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';

// PUT: Update user preferences
export async function PUT(request: NextRequest) {
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
    const {
      target_accent,
      learning_focus,
      difficulty_preference,
      daily_goal_minutes,
      theme,
      language,
      timezone,
      email_notifications,
      push_notifications,
      daily_reminder,
      reminder_time,
      weekly_report,
      profile_visibility,
      show_progress,
      allow_leaderboard,
    } = body;

    // Build update object (only include provided fields)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (target_accent !== undefined) updateData.target_accent = target_accent;
    if (learning_focus !== undefined) updateData.learning_focus = learning_focus;
    if (difficulty_preference !== undefined) updateData.difficulty_preference = difficulty_preference;
    if (daily_goal_minutes !== undefined) updateData.daily_goal_minutes = daily_goal_minutes;
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (daily_reminder !== undefined) updateData.daily_reminder = daily_reminder;
    if (reminder_time !== undefined) updateData.reminder_time = reminder_time;
    if (weekly_report !== undefined) updateData.weekly_report = weekly_report;
    if (profile_visibility !== undefined) updateData.profile_visibility = profile_visibility;
    if (show_progress !== undefined) updateData.show_progress = show_progress;
    if (allow_leaderboard !== undefined) updateData.allow_leaderboard = allow_leaderboard;

    // Update preferences
    const { data: updatedPreferences, error: updateError } = await supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Preferences API: Error updating preferences:', updateError);
      return NextResponse.json(
        { error: 'Could not update preferences', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      preferences: updatedPreferences,
      message: 'Preferences updated successfully!',
    });
  } catch (error) {
    console.error('Preferences API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
