import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  createChallengeReminder,
  createWeeklySummary,
  createCoachRecommendation,
  sendDailyRemindersToActiveUsers,
  sendWeeklySummariesToActiveUsers
} from '@/lib/notificationHelpers';

export const dynamic = 'force-dynamic';

/**
 * POST endpoint to generate notifications
 * This can be called manually or by scheduled tasks (cron jobs)
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user (for single-user notifications)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { type, user_id, batch } = body;

    // Batch operations (for scheduled tasks)
    if (batch) {
      if (type === 'daily_reminders') {
        const result = await sendDailyRemindersToActiveUsers();
        return NextResponse.json({
          success: true,
          message: 'Daily reminders sent',
          ...result
        });
      }

      if (type === 'weekly_summaries') {
        const result = await sendWeeklySummariesToActiveUsers();
        return NextResponse.json({
          success: true,
          message: 'Weekly summaries sent',
          ...result
        });
      }

      return NextResponse.json(
        { error: 'Invalid batch type' },
        { status: 400 }
      );
    }

    // Single user operations
    if (!user && !user_id) {
      return NextResponse.json(
        { error: 'Unauthorized or missing user_id' },
        { status: 401 }
      );
    }

    const targetUserId = user_id || user?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    let notification;

    switch (type) {
      case 'challenge_reminder':
        notification = await createChallengeReminder(targetUserId);
        break;

      case 'weekly_summary':
        notification = await createWeeklySummary(targetUserId);
        break;

      case 'coach_recommendation':
        notification = await createCoachRecommendation(targetUserId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    if (!notification) {
      return NextResponse.json({
        success: true,
        message: 'Notification not created (criteria not met)',
        notification: null
      });
    }

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error generating notification:', error);
    return NextResponse.json(
      { error: 'Failed to generate notification' },
      { status: 500 }
    );
  }
}
