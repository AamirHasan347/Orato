# Notifications System - Testing Guide

## Quick Test Commands

Use these commands to quickly test the notification system.

---

## 🧪 Testing API Endpoints

### 1. Create Test Notification (via Browser Console)

Open your browser console on the Orato app and run:

```javascript
// Create a test notification
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'YOUR_USER_ID', // Replace with your user ID
    type: 'general',
    title: 'Test Notification',
    message: 'This is a test notification!',
    action_url: '/settings',
    priority: 2
  })
})
  .then(res => res.json())
  .then(data => console.log('Created:', data));
```

### 2. Generate Challenge Reminder

```javascript
fetch('/api/notifications/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'challenge_reminder'
  })
})
  .then(res => res.json())
  .then(data => console.log('Reminder:', data));
```

### 3. Generate Weekly Summary

```javascript
fetch('/api/notifications/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'weekly_summary'
  })
})
  .then(res => res.json())
  .then(data => console.log('Summary:', data));
```

### 4. Generate Coach Recommendation

```javascript
fetch('/api/notifications/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'coach_recommendation'
  })
})
  .then(res => res.json())
  .then(data => console.log('Recommendation:', data));
```

### 5. Get Unread Count

```javascript
fetch('/api/notifications/unread-count')
  .then(res => res.json())
  .then(data => console.log('Unread count:', data));
```

### 6. Get All Notifications

```javascript
fetch('/api/notifications')
  .then(res => res.json())
  .then(data => console.log('All notifications:', data));
```

### 7. Mark All as Read

```javascript
fetch('/api/notifications/mark-all-read', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log('Marked all read:', data));
```

---

## 🗄️ Testing Database Directly (Supabase)

### 1. Create Test Notifications Directly

Run in Supabase SQL Editor:

```sql
-- Insert test notification
INSERT INTO notifications (user_id, type, title, message, action_url, priority)
VALUES (
  'YOUR_USER_ID', -- Replace with your user ID
  'general',
  'Test Notification',
  'This is a test message from the database',
  '/settings',
  2
);

-- Insert multiple test notifications
INSERT INTO notifications (user_id, type, title, message, action_url, priority)
VALUES
  ('YOUR_USER_ID', 'challenge_reminder', 'Challenge Time!', 'Complete today''s challenge', '/challenges', 2),
  ('YOUR_USER_ID', 'weekly_summary', 'Your Progress', 'Great week! You completed 5 challenges', '/settings', 2),
  ('YOUR_USER_ID', 'coach_recommendation', 'New Video', 'Check out this recommended video', '/saved-videos', 2),
  ('YOUR_USER_ID', 'achievement', 'Achievement Unlocked!', 'You earned the First Steps badge', '/settings', 3);
```

### 2. Check Created Notifications

```sql
-- View all notifications for a user
SELECT * FROM notifications
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;

-- View unread count
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = 'YOUR_USER_ID'
  AND is_read = false;
```

### 3. Mark Notifications as Read

```sql
-- Mark specific notification as read
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE id = 1 AND user_id = 'YOUR_USER_ID';

-- Mark all as read
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE user_id = 'YOUR_USER_ID' AND is_read = false;
```

### 4. Delete Test Notifications

```sql
-- Delete all test notifications
DELETE FROM notifications
WHERE user_id = 'YOUR_USER_ID';
```

---

## 📱 Testing UI Features

### 1. Test Notification Bell

- [ ] Bell icon shows in top-right corner
- [ ] Unread count badge appears when notifications exist
- [ ] Badge shows "9+" for 10+ notifications
- [ ] Badge animates in when count changes
- [ ] Clicking bell opens dropdown

### 2. Test Notification Dropdown

- [ ] Dropdown appears below bell icon
- [ ] Shows all notifications in chronological order
- [ ] Clicking outside closes dropdown
- [ ] "All" and "Unread" filter tabs work
- [ ] "Mark all read" button appears when unread exist
- [ ] Unread notifications have blue background
- [ ] Blue dot appears on unread notifications

### 3. Test Notification Cards

- [ ] Correct icon shows for each notification type
- [ ] Title and message display correctly
- [ ] Time ago formatting works ("just now", "5m ago", "2h ago")
- [ ] Hover shows action buttons (mark read, delete)
- [ ] Clicking notification navigates to action_url
- [ ] Clicking notification marks it as read
- [ ] Delete button removes notification

### 4. Test Notification Types

Create one of each type and verify:

- [ ] Word of Day - Orange book icon
- [ ] Challenge Reminder - Blue clock icon
- [ ] Weekly Summary - Purple sparkles icon
- [ ] Coach Recommendation - Green video icon
- [ ] Achievement - Yellow trophy icon
- [ ] High priority shows red left border

---

## 🔄 Testing Real-time Updates

### 1. Test Polling

1. Open app in browser
2. Note current unread count
3. Add notification via database/API
4. Wait up to 30 seconds
5. Verify count updates automatically

### 2. Test Mark as Read

1. Open notification dropdown
2. Click "Mark all read"
3. Verify badge disappears
4. Verify all notifications show as read

### 3. Test Delete

1. Open notification dropdown
2. Hover over a notification
3. Click delete button
4. Verify notification disappears
5. Verify count decreases

---

## 🎯 End-to-End Test Scenarios

### Scenario 1: New User Journey

1. User signs up
2. System creates welcome notification (manual or automated)
3. User sees notification badge
4. User clicks bell, sees welcome notification
5. User clicks notification, navigates to tour/settings
6. Notification marked as read

### Scenario 2: Challenge Completion

1. User completes challenge
2. If achievement unlocked, notification created automatically
3. User sees badge update
4. User opens dropdown, sees achievement notification
5. High priority notification shows red accent
6. Clicking navigates to achievements page

### Scenario 3: Daily Reminder

1. User hasn't completed challenge in 24 hours
2. System generates challenge reminder
3. User receives notification
4. User clicks notification
5. Navigates to /challenges page
6. User completes challenge

### Scenario 4: Weekly Summary

1. Week ends (Sunday evening)
2. System generates weekly summary with stats
3. User sees notification next login
4. Summary shows challenges completed, achievements earned
5. User celebrates progress

---

## 🐛 Common Issues & Solutions

### Issue: Notifications not appearing

**Check:**
```sql
-- Verify notifications exist
SELECT * FROM notifications WHERE user_id = 'YOUR_USER_ID';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

**Solution:**
- Verify user is authenticated
- Check RLS policies are enabled
- Ensure notifications table has data

### Issue: Unread count shows wrong number

**Check:**
```sql
-- Manual count
SELECT COUNT(*) FROM notifications
WHERE user_id = 'YOUR_USER_ID' AND is_read = false;
```

**Solution:**
- Clear browser cache
- Verify API returns correct count
- Check expired notifications filter

### Issue: Dropdown doesn't open

**Solution:**
- Check browser console for errors
- Verify NotificationDropdown component imported
- Check z-index conflicts with other elements

### Issue: Icons not showing

**Solution:**
- Verify all icons imported in Icons.tsx
- Check icon component names match
- Verify icon color classes are valid Tailwind

---

## 📊 Performance Testing

### 1. Test with Many Notifications

```sql
-- Create 100 test notifications
INSERT INTO notifications (user_id, type, title, message, priority)
SELECT
  'YOUR_USER_ID',
  CASE (random() * 5)::int
    WHEN 0 THEN 'word_of_day'
    WHEN 1 THEN 'challenge_reminder'
    WHEN 2 THEN 'weekly_summary'
    WHEN 3 THEN 'coach_recommendation'
    ELSE 'achievement'
  END,
  'Test Notification ' || generate_series,
  'This is test notification #' || generate_series,
  (random() * 2 + 1)::int
FROM generate_series(1, 100);
```

**Verify:**
- [ ] Dropdown loads quickly
- [ ] Scrolling is smooth
- [ ] Badge shows "9+" for 100 notifications
- [ ] Pagination works (limit/offset)

### 2. Test Cleanup

```sql
-- Run cleanup function
SELECT cleanup_old_notifications();

-- Verify old read notifications deleted
SELECT COUNT(*) FROM notifications
WHERE is_read = true
  AND created_at < NOW() - INTERVAL '30 days';
```

---

## ✅ Pre-Launch Checklist

- [ ] Database schema deployed
- [ ] All RLS policies enabled
- [ ] API endpoints tested and working
- [ ] UI components rendering correctly
- [ ] Notification icons displaying properly
- [ ] Mark as read functionality works
- [ ] Delete functionality works
- [ ] Unread count updates correctly
- [ ] Polling for new notifications works
- [ ] Achievement notifications auto-create
- [ ] Helper functions tested
- [ ] Error handling in place
- [ ] Performance tested with many notifications

---

## 🎓 Best Practices

1. **Don't Over-Notify**
   - Respect user preferences
   - Don't send reminders more than once per day
   - Weekly summaries should be weekly, not daily

2. **Prioritize Correctly**
   - Priority 1: General info (Word of Day)
   - Priority 2: Engagement (Reminders, Summaries)
   - Priority 3: Achievements, Important alerts

3. **Keep Messages Short**
   - Titles: Max 50 characters
   - Messages: Max 150 characters
   - Use action_url for full details

4. **Test Before Batch Sending**
   - Always test with single user first
   - Verify notification looks good
   - Then send to batch

5. **Monitor Notification Fatigue**
   - Track notification open rates
   - Track delete rates
   - Adjust frequency if users ignore/delete many

---

## 📞 Support

If you encounter issues:

1. Check this testing guide
2. Review the main setup documentation
3. Check browser console for errors
4. Verify database tables and RLS policies
5. Test API endpoints directly

Happy testing! 🎉
