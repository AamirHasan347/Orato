# Coach's Corner - Complete Setup Guide

## Overview
Coach's Corner is a comprehensive YouTube video integration feature that displays your mother's English coaching videos with advanced navigation, saving, and recommendation capabilities.

## Features Implemented

### 1. Video Navigation
- **Next/Previous Buttons**: Navigate through the entire video playlist
- **Video Counter**: Shows current position (e.g., "1 / 10")
- **Smart Navigation**: Buttons automatically disable when reaching the end/beginning

### 2. Save for Later
- **Bookmark Button**: Click to save videos for later viewing
- **Persistent Storage**: Saves are stored in the database per user
- **Visual Feedback**: Filled bookmark icon when saved, outline when not
- **Status Messages**: "Video saved for later!" / "Video removed from saved list"

### 3. Like Feature
- **Heart Button**: Click to like videos (local state, can be extended to database)
- **Visual Feedback**: Filled heart when liked, outline when not

### 4. Weekly Recommendation System
- **Weekly Focus Banner**: Displays special banner for the featured video of the week
- **Dynamic Topics**: e.g., "This week's focus: Prepositions"
- **Auto-Display**: Shows only when viewing the recommended video

## Database Setup

### Tables Created

1. **coach_videos**
   - Stores all video information from your mother's channel
   - Fields: video_id, title, description, thumbnail_url, order_index, category
   - Ordered by `order_index` for playlist navigation

2. **saved_videos**
   - Stores each user's saved videos
   - Fields: user_id, video_id, video_title
   - Row Level Security: Users can only see their own saved videos

3. **weekly_recommendations**
   - Stores weekly featured videos
   - Fields: video_id, week_start_date, week_end_date, focus_topic, description
   - One active recommendation per week

### Running the Setup

```sql
-- In your Supabase SQL Editor, run:
-- File: /orato/database/DATABASE_COACH_CORNER.sql
```

This will:
- Create all necessary tables
- Set up proper indexes for performance
- Enable Row Level Security
- Insert sample data (update with real videos)

## API Routes

### 1. `/api/coach-videos`
**GET**: Fetch videos with navigation context
- Query param: `currentVideoId` (optional)
- Returns: current, next, previous video info + playlist position

### 2. `/api/saved-videos`
**GET**: Fetch user's saved videos
**POST**: Save a video
- Body: `{ videoId, videoTitle }`
**DELETE**: Unsave a video
- Query param: `videoId`

### 3. `/api/weekly-recommendation`
**GET**: Fetch current week's featured video
- Returns: recommendation with video details

## Adding New Videos

### Method 1: Through Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor → coach_videos
2. Insert new row with:
   - `video_id`: YouTube video ID (e.g., "OLYSBScArl4")
   - `title`: Video title
   - `description`: Brief description
   - `thumbnail_url`: `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg`
   - `order_index`: Next number in sequence
   - `category`: e.g., "Grammar", "Pronunciation", "Storytelling"

### Method 2: SQL Insert
```sql
INSERT INTO coach_videos (video_id, title, description, thumbnail_url, order_index, category)
VALUES (
  'YOUR_VIDEO_ID',
  'Video Title Here',
  'Description here',
  'https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg',
  4, -- next order number
  'Category Name'
);
```

## Setting Weekly Recommendations

### Update via SQL
```sql
-- Deactivate old recommendations
UPDATE weekly_recommendations SET is_active = false WHERE is_active = true;

-- Add new weekly recommendation
INSERT INTO weekly_recommendations (
  video_id,
  week_start_date,
  week_end_date,
  focus_topic,
  description,
  is_active
) VALUES (
  'OLYSBScArl4',
  '2025-01-06', -- Monday of the week
  '2025-01-12', -- Sunday of the week
  'This week''s focus: Storytelling',
  'Master the art of storytelling and make your conversations more engaging!',
  true
);
```

## Future Enhancements

### Potential YouTube Data API Integration
To automatically fetch video data from YouTube:

1. **Get API Key**
   - Go to Google Cloud Console
   - Enable YouTube Data API v3
   - Create credentials (API key)

2. **Create Sync Script**
```typescript
// Example: /scripts/sync-youtube-videos.ts
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'YOUR_CHANNEL_ID';

async function syncVideos() {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=date&type=video&key=${YOUTUBE_API_KEY}`
  );
  // Parse and insert into database
}
```

3. **Auto-Update**
   - Run script via cron job or GitHub Actions
   - Updates database with new videos automatically

### Optional: Saved Videos Page
Create a dedicated page at `/saved-videos` to display all saved videos:

```typescript
// /app/saved-videos/page.tsx
// Display grid of all user's saved videos
// Allow quick navigation back to Coach's Corner
```

## Component Usage

The `CoachCorner` component is already integrated. To use it elsewhere:

```typescript
import CoachCorner from "@/components/CoachCorner";

export default function Page() {
  return <CoachCorner />;
}
```

## Customization

### Update Channel Name
In `CoachCorner.tsx:34`:
```typescript
const channelName = "Your Mother's Actual Channel Name";
```

### Update Channel Link
The "View More Lessons" button links to:
```typescript
https://youtube.com/@channelname
```

Make sure your mother's channel handle matches the format.

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Sample videos appear in Supabase
- [ ] Coach's Corner component loads without errors
- [ ] Next/Previous navigation works
- [ ] Video counter shows correct numbers
- [ ] Save button saves video (check saved_videos table)
- [ ] Unsave button removes video
- [ ] Weekly recommendation banner appears (if set)
- [ ] Clicking "View More Lessons" opens YouTube channel

## Troubleshooting

### Videos Not Loading
- Check Supabase connection in `/api/coach-videos`
- Verify coach_videos table has data
- Check browser console for errors

### Save Button Not Working
- Verify user is authenticated
- Check saved_videos table permissions
- Look at network tab for API errors

### Weekly Recommendation Not Showing
- Verify dates in weekly_recommendations table
- Ensure `is_active = true`
- Check that video_id matches current video

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database tables and RLS policies
3. Test API routes directly in browser
4. Review Supabase logs for backend errors
