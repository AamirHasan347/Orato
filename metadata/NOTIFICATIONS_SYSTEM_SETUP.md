# Notifications System - Complete Setup Guide

## Overview

The Orato Notifications System provides a comprehensive solution for user notifications, including:

- **In-app notification dropdown** with real-time updates
- **Challenge reminders** to keep users engaged
- **Weekly progress summaries** celebrating user achievements
- **Coach video recommendations** based on user performance
- **Achievement notifications** when users unlock new badges
- **Word of the Day notifications** for vocabulary learning

---

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Features](#features)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Notification Types](#notification-types)
6. [Usage Examples](#usage-examples)
7. [Scheduled Notifications](#scheduled-notifications)
8. [Customization](#customization)

---

## 🗄️ Database Setup

### Step 1: Run the Database Schema

Execute the SQL file to create all necessary tables:

```bash
# In Supabase SQL Editor, run:
/orato/database/DATABASE_NOTIFICATIONS.sql
```

This creates:
- `notifications` - Main notification storage
- `scheduled_notifications` - Recurring/scheduled notifications
- `notification_type_preferences` - User preferences per notification type
- `notification_delivery_log` - Track sent emails/push notifications

### Step 2: Tables Created

#### notifications
```sql
- id (bigserial, primary key)
- user_id (uuid, foreign key)
- type (varchar) - notification type
- title (varchar) - notification title
- message (text) - notification message
- action_url (varchar) - where to navigate on click
- metadata (jsonb) - additional data
- is_read (boolean) - read status
- created_at, read_at - timestamps
- expires_at - optional expiration
- priority (1-3) - notification priority
```

#### scheduled_notifications
```sql
- id (bigserial, primary key)
- user_id (uuid)
- type (varchar)
- schedule_type (once/daily/weekly/monthly)
- next_send_at - when to send next
- is_active (boolean)
- title_template, message_template - notification content
```

### Step 3: Row Level Security (RLS)

All tables have RLS enabled and appropriate policies:
- Users can only view their own notifications
- Service role can create notifications for any user
- Users can update/delete their own notifications

---

## ✨ Features

### 1. Real-time Notification Dropdown

- Displays all user notifications in a beautiful dropdown
- Shows unread count badge on bell icon
- Filter between "All" and "Unread" notifications
- Mark individual notifications as read
- Mark all notifications as read at once
- Delete individual notifications
- Click notifications to navigate to relevant pages
- Auto-refreshes count every 30 seconds

### 2. Challenge Reminders

Automatically reminds users to complete daily challenges if:
- They haven't completed a challenge in 24+ hours
- Notification includes motivational messages
- Links directly to `/challenges` page

### 3. Weekly Progress Summary

Sent weekly (typically Sunday evening) with:
- Number of challenges completed
- Achievements earned
- Current level and XP
- Personalized encouragement messages

### 4. Coach Video Recommendations

Personalized recommendations based on:
- User's proficiency level
- Recent challenge performance
- Current level progress
- Suggests relevant Coach Corner videos

### 5. Achievement Notifications

Automatically created when users:
- Unlock new achievements
- Includes achievement name and description
- High priority (shows with red accent)
- Links to achievements page

### 6. Word of the Day

Daily vocabulary notifications:
- Shows new word with definition
- 24-hour expiration
- Integrates with existing Word of Day modal

---

## 🔌 API Endpoints

### GET /api/notifications

Fetch user's notifications with filtering and pagination.

**Query Parameters:**
- `limit` (default: 20) - Number of notifications to return
- `offset` (default: 0) - Pagination offset
- `unread_only` (boolean) - Only return unread notifications
- `type` (string) - Filter by notification type

**Response:**
```json
{
  "notifications": [...],
  "total": 25,
  "unread_count": 5,
  "limit": 20,
  "offset": 0
}
```

### POST /api/notifications

Create a new notification.

**Body:**
```json
{
  "user_id": "uuid",
  "type": "challenge_reminder",
  "title": "Daily Challenge Available",
  "message": "Complete today's challenge!",
  "action_url": "/challenges",
  "priority": 2,
  "metadata": {}
}
```

### PATCH /api/notifications

Mark a notification as read.

**Body:**
```json
{
  "notification_id": 123,
  "is_read": true
}
```

### DELETE /api/notifications?id={id}

Delete a notification.

### GET /api/notifications/unread-count

Get count of unread notifications.

**Response:**
```json
{
  "unread_count": 5
}
```

### POST /api/notifications/mark-all-read

Mark all user's notifications as read.

**Response:**
```json
{
  "success": true,
  "updated_count": 5
}
```

### POST /api/notifications/generate

Generate specific notification types.

**Body (Single User):**
```json
{
  "type": "challenge_reminder",
  "user_id": "uuid" // optional if authenticated
}
```

**Body (Batch):**
```json
{
  "type": "daily_reminders",
  "batch": true
}
```

Types: `challenge_reminder`, `weekly_summary`, `coach_recommendation`

---

## 🧩 Frontend Components

### NotificationDropdown Component

Located: `/src/components/NotificationDropdown.tsx`

**Features:**
- Beautiful animated dropdown
- Filter tabs (All / Unread)
- Icon per notification type
- Time ago formatting
- Mark as read / Delete actions
- Click to navigate

**Usage:**
```tsx
<NotificationDropdown
  isOpen={isNotificationOpen}
  onClose={() => setIsNotificationOpen(false)}
  unreadCount={unreadCount}
  onUnreadCountChange={setUnreadCount}
/>
```

### TopUtilityButtons Integration

The notification bell is integrated into the top utility buttons:

- Shows unread count badge
- Polls for new notifications every 30 seconds
- Animated badge appearance
- Opens dropdown on click

---

## 🔔 Notification Types

### Available Types

1. **word_of_day** - Daily vocabulary word
   - Icon: Book (orange)
   - Priority: Low (1)
   - Expires: 24 hours

2. **challenge_reminder** - Daily challenge reminder
   - Icon: Clock (blue)
   - Priority: Medium (2)
   - Action: `/challenges`

3. **weekly_summary** - Weekly progress report
   - Icon: Sparkles (purple)
   - Priority: Medium (2)
   - Action: `/settings`

4. **coach_recommendation** - Video recommendation
   - Icon: Video Camera (green)
   - Priority: Medium (2)
   - Action: `/saved-videos`

5. **achievement** - Achievement unlocked
   - Icon: Trophy (yellow)
   - Priority: High (3)
   - Action: `/settings?tab=achievements`

6. **general** - Generic notification
   - Icon: Bell (gray)
   - Priority: Low (1)

---

## 💻 Usage Examples

### Create a Challenge Reminder

```typescript
import { createChallengeReminder } from '@/lib/notificationHelpers';

// For current user
await createChallengeReminder(userId);
```

### Create Weekly Summary

```typescript
import { createWeeklySummary } from '@/lib/notificationHelpers';

await createWeeklySummary(userId);
```

### Create Coach Recommendation

```typescript
import { createCoachRecommendation } from '@/lib/notificationHelpers';

await createCoachRecommendation(userId);
```

### Create Achievement Notification

```typescript
import { createAchievementNotification } from '@/lib/notificationHelpers';

await createAchievementNotification(
  userId,
  "First Challenge",
  "You completed your first challenge!",
  "🏆"
);
```

### Create Custom Notification

```typescript
import { createNotification } from '@/lib/notificationHelpers';

await createNotification({
  user_id: userId,
  type: 'general',
  title: 'Welcome!',
  message: 'Thanks for joining Orato!',
  action_url: '/settings',
  priority: 2,
  metadata: { custom_field: 'value' }
});
```

---

## ⏰ Scheduled Notifications

### Setting Up Daily Reminders

Daily reminders can be sent to all users who have them enabled in preferences.

**Manual Trigger:**
```bash
curl -X POST https://your-domain.com/api/notifications/generate \
  -H "Content-Type: application/json" \
  -d '{"type": "daily_reminders", "batch": true}'
```

**Response:**
```json
{
  "success": true,
  "message": "Daily reminders sent",
  "sent": 150,
  "failed": 2
}
```

### Setting Up Weekly Summaries

Weekly summaries are sent to users with `weekly_report` enabled.

**Manual Trigger:**
```bash
curl -X POST https://your-domain.com/api/notifications/generate \
  -H "Content-Type: application/json" \
  -d '{"type": "weekly_summaries", "batch": true}'
```

### Automated Scheduling (Recommended)

Set up cron jobs or Supabase Edge Functions to run these automatically:

**Supabase Edge Function Example:**
```typescript
// functions/daily-notifications/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const response = await fetch('https://your-domain.com/api/notifications/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'daily_reminders',
      batch: true
    })
  });

  return new Response(JSON.stringify(await response.json()), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**Cron Schedule:**
```
# Daily reminders at 9 AM
0 9 * * * curl -X POST https://your-domain.com/api/notifications/generate -d '{"type":"daily_reminders","batch":true}'

# Weekly summaries on Sunday at 8 PM
0 20 * * 0 curl -X POST https://your-domain.com/api/notifications/generate -d '{"type":"weekly_summaries","batch":true}'
```

---

## 🎨 Customization

### Adding New Notification Types

1. **Add to notification type enum:**
   ```typescript
   // In NotificationDropdown.tsx
   case 'new_type':
     return <NewIcon className="w-5 h-5 text-custom-color" />;
   ```

2. **Create helper function:**
   ```typescript
   // In notificationHelpers.ts
   export async function createNewTypeNotification(user_id: string) {
     return createNotification({
       user_id,
       type: 'new_type',
       title: 'New Type Notification',
       message: 'Custom message',
       action_url: '/custom-page',
       priority: 2
     });
   }
   ```

3. **Add to generate endpoint:**
   ```typescript
   // In /api/notifications/generate/route.ts
   case 'new_type':
     notification = await createNewTypeNotification(targetUserId);
     break;
   ```

### Styling the Dropdown

Edit `/src/components/NotificationDropdown.tsx`:

```tsx
// Change colors, sizes, animations
className="w-96 bg-white rounded-2xl..." // Modify here

// Change notification card styles
className="p-4 hover:bg-gray-50..." // Modify here
```

### Customizing Notification Messages

Edit templates in `/src/lib/notificationHelpers.ts`:

```typescript
const messages = [
  "Your custom message 1",
  "Your custom message 2",
  // Add more variations
];
```

---

## 🚀 Quick Start Checklist

- [ ] Run `DATABASE_NOTIFICATIONS.sql` in Supabase
- [ ] Verify all tables created successfully
- [ ] Test creating a notification via API
- [ ] Check notification dropdown appears in UI
- [ ] Test marking notifications as read
- [ ] Set up scheduled notifications (optional)
- [ ] Configure user preferences for notifications
- [ ] Test achievement notifications
- [ ] Set up daily reminder cron job (optional)
- [ ] Set up weekly summary cron job (optional)

---

## 🐛 Troubleshooting

### Notifications not appearing?

1. Check RLS policies are enabled
2. Verify user is authenticated
3. Check browser console for errors
4. Verify notification was created in database

### Unread count not updating?

1. Check `/api/notifications/unread-count` endpoint
2. Verify polling interval (30 seconds default)
3. Clear browser cache

### Achievement notifications not working?

1. Verify `createAchievementNotification` import in check-achievements
2. Check database for notification creation errors
3. Verify user has unlocked achievements

---

## 📚 Related Files

- Database: `/orato/database/DATABASE_NOTIFICATIONS.sql`
- Components: `/orato/src/components/NotificationDropdown.tsx`
- Components: `/orato/src/components/TopUtilityButtons.tsx`
- Helpers: `/orato/src/lib/notificationHelpers.ts`
- API: `/orato/src/app/api/notifications/route.ts`
- API: `/orato/src/app/api/notifications/mark-all-read/route.ts`
- API: `/orato/src/app/api/notifications/unread-count/route.ts`
- API: `/orato/src/app/api/notifications/generate/route.ts`
- API: `/orato/src/app/api/notifications/scheduled/route.ts`

---

## 🎉 Conclusion

You now have a complete, production-ready notification system! Users will receive:

- Real-time in-app notifications
- Challenge reminders to stay engaged
- Weekly summaries of their progress
- Personalized coach recommendations
- Achievement unlock celebrations
- Daily vocabulary words

The system is extensible, customizable, and ready for future enhancements like email and push notifications.
