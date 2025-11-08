import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET endpoint to fetch user's scheduled notifications
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch scheduled notifications
    const { data: scheduledNotifications, error } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('next_send_at', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scheduled_notifications: scheduledNotifications || []
    });

  } catch (error) {
    console.error('Error in scheduled notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to create a scheduled notification
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      schedule_type,
      scheduled_for,
      title_template,
      message_template,
      action_url,
      metadata
    } = body;

    // Validate required fields
    if (!type || !schedule_type || !scheduled_for || !title_template || !message_template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate next_send_at based on schedule_type
    const next_send_at = new Date(scheduled_for);

    // Insert scheduled notification
    const { data: scheduledNotification, error } = await supabase
      .from('scheduled_notifications')
      .insert({
        user_id: user.id,
        type,
        schedule_type,
        scheduled_for,
        next_send_at: next_send_at.toISOString(),
        title_template,
        message_template,
        action_url,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scheduled notification:', error);
      return NextResponse.json(
        { error: 'Failed to create scheduled notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scheduled_notification: scheduledNotification
    }, { status: 201 });

  } catch (error) {
    console.error('Error in scheduled notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH endpoint to update/cancel a scheduled notification
 */
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { scheduled_notification_id, is_active } = body;

    if (!scheduled_notification_id) {
      return NextResponse.json(
        { error: 'scheduled_notification_id is required' },
        { status: 400 }
      );
    }

    // Update scheduled notification
    const { data: scheduledNotification, error } = await supabase
      .from('scheduled_notifications')
      .update({ is_active })
      .eq('id', scheduled_notification_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scheduled notification:', error);
      return NextResponse.json(
        { error: 'Failed to update scheduled notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scheduled_notification: scheduledNotification
    });

  } catch (error) {
    console.error('Error in scheduled notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
