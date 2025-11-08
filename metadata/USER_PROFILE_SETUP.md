# User Profile & Settings System - Complete Setup Guide

## Overview
A comprehensive user profile and settings management system featuring profile photos, CEFR level tracking, learning preferences, dark/light theme support, and PDF progress reports.

## Features Implemented

### 1. Profile Management
- **Profile Photo Upload**: Upload, change, or remove profile photos
- **Personal Information**: Full name, display name, bio, date of birth, country
- **Native Language**: Track user's native language
- **Profile Visibility**: Public, friends-only, or private profiles

### 2. CEFR Level Tracking
- **Automatic Level Calculation**: Based on fluency, grammar, vocabulary, confidence scores
- **6 CEFR Levels**: A1 (Beginner) through C2 (Proficient)
- **Visual Display**: Color-coded badges with progress bars
- **Skill Breakdown**: Detailed scores for each skill area
- **"Can Do" Statements**: What users can achieve at their level

### 3. Learning Preferences
- **Target Accent**: American, British, Australian, or Neutral
- **Learning Focus**: Fluency, Grammar, Vocabulary, Pronunciation, or Balanced
- **Difficulty**: Easy, Medium, Hard, or Adaptive
- **Daily Goal**: Customizable practice time (5-180 minutes)
- **Language**: Interface language selection

### 4. Theme System
- **Light Mode**: Traditional bright theme
- **Dark Mode**: Easy on the eyes
- **System**: Auto-matches device preference
- **Persistent**: Saves across sessions

### 5. Notification Settings
- **Email Notifications**: Toggle email updates
- **Push Notifications**: Browser notifications
- **Daily Reminders**: Custom time for practice reminders
- **Weekly Reports**: Progress summary emails

### 6. Privacy Controls
- **Profile Visibility**: Who can see your profile
- **Progress Display**: Show/hide learning progress
- **Leaderboard**: Opt in/out of leaderboards

### 7. PDF Progress Reports
- **One-Click Download**: Generate comprehensive PDF
- **Includes**: Profile info, CEFR level, performance metrics, achievements, roadmap progress
- **Professional Format**: Well-formatted with tables and charts
- **Timestamped**: Generated date included

## Database Setup

### Tables Created

1. **user_profiles**
   - Personal information (name, bio, photo, DOB, country, language)
   - Links to auth.users
   - Tracks profile updates

2. **user_preferences**
   - Learning preferences (accent, focus, difficulty, daily goal)
   - UI preferences (theme, language, timezone)
   - Notification settings
   - Privacy settings

3. **cefr_levels**
   - CEFR level history tracking
   - Overall and skill-specific scores
   - Current vs. historical levels
   - Timestamped entries

4. **profile_activity_log**
   - Audit trail of profile changes
   - Photo uploads, preference updates
   - Report downloads

5. **cefr_descriptions**
   - Official CEFR level descriptions
   - "Can do" statements for each level
   - Reference data

### Triggers & Functions

1. **initialize_user_profile()**: Auto-creates profile on signup
2. **calculate_cefr_level()**: Determines CEFR level from scores
3. **update_cefr_level()**: Updates user's current CEFR level
4. **log_profile_activity()**: Logs all profile changes

### Running the Setup

```sql
-- In Supabase SQL Editor, run:
-- File: /orato/database/DATABASE_USER_PROFILE.sql
```

### Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create new bucket named `avatars`
3. Set as Public
4. Configure policies:
   - Allow authenticated users to upload to `profile-photos/`
   - Allow public read access

## API Routes

### 1. `/api/profile` (GET)
Fetch user profile, preferences, and CEFR level

**Response:**
```json
{
  "ok": true,
  "profile": {...},
  "preferences": {...},
  "cefrLevel": {...},
  "user": {...}
}
```

### 2. `/api/profile` (PUT)
Update user profile

**Request:**
```json
{
  "full_name": "John Doe",
  "display_name": "Johnny",
  "bio": "Learning English!",
  "date_of_birth": "1990-01-01",
  "country": "Spain",
  "native_language": "Spanish"
}
```

### 3. `/api/preferences` (PUT)
Update user preferences

**Request:**
```json
{
  "target_accent": "american",
  "learning_focus": "fluency",
  "theme": "dark",
  "daily_goal_minutes": 30
}
```

### 4. `/api/upload-photo` (POST)
Upload profile photo

**Request:** FormData with `photo` file

**Response:**
```json
{
  "ok": true,
  "photoUrl": "https://...",
  "message": "Profile photo uploaded successfully!"
}
```

### 5. `/api/upload-photo` (DELETE)
Remove profile photo

### 6. `/api/generate-report` (GET)
Generate and download PDF progress report

**Response:** PDF file download

## CEFR Level System

### Level Calculation Formula

```typescript
overall_score = (
  fluency_score * 0.30 +
  grammar_score * 0.30 +
  vocabulary_score * 0.25 +
  confidence_score * 0.15
)
```

### Level Thresholds

| Score Range | CEFR Level | Title |
|-------------|------------|-------|
| 0-29 | A1 | Beginner |
| 30-44 | A2 | Elementary |
| 45-59 | B1 | Intermediate |
| 60-74 | B2 | Upper Intermediate |
| 75-89 | C1 | Advanced |
| 90-100 | C2 | Proficient |

### Update CEFR Level

Call after performance changes:

```typescript
// SQL
SELECT update_cefr_level('user_id_here');

// Or trigger automatically after activities
```

## Theme Implementation

### 1. Wrap App with Theme Provider

In your root layout (`app/layout.tsx`):

```typescript
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Add Tailwind Dark Mode Support

In `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: 'class',
  // ... rest of config
}
```

### 3. Use Dark Mode Classes

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### 4. Theme Toggle Component

```typescript
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

## Components

### 1. Settings Page (`/settings`)

**Features:**
- Tabbed interface (Profile, Preferences, Notifications, Privacy)
- Auto-saving with success messages
- Responsive design
- Form validation

**Usage:**
```typescript
// Navigate to /settings
router.push('/settings');
```

### 2. ProfilePhotoUpload

**Props:**
```typescript
{
  currentPhotoUrl: string | null;
  onPhotoUpdate: (url: string | null) => void;
}
```

**Features:**
- Drag & drop or click to upload
- Image preview
- File type validation (JPEG, PNG, WebP, GIF)
- Size limit (5MB)
- Remove photo option

### 3. CEFRLevelDisplay

**Props:**
```typescript
{
  cefrLevel: {
    level: string;
    overall_score: number;
    fluency_score?: number;
    grammar_score?: number;
    vocabulary_score?: number;
    cefr_descriptions?: {...};
  }
}
```

**Features:**
- Color-coded badges per level
- Progress bars
- Skill breakdown
- "Can do" statements

### 4. ThemeProvider

**Usage:**
```typescript
import { ThemeProvider } from "@/components/ThemeProvider";

<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

## PDF Report Contents

The generated PDF includes:

1. **Header**
   - Report title
   - Generation date

2. **Personal Information**
   - Name, email, member since
   - Current CEFR level

3. **CEFR Level Assessment**
   - Level description
   - Overall score with progress bar

4. **Performance Metrics**
   - Fluency, grammar, vocabulary, confidence scores
   - Total recordings, quizzes completed
   - Vocabulary size

5. **Learning Progress**
   - Current level and XP
   - Streak information
   - Total sessions
   - Words learned

6. **Achievements**
   - List of unlocked achievements (top 10)
   - Unlock dates

7. **Roadmap Progress**
   - Start date, current day
   - Completion rate
   - Status

## Integration Guide

### Step 1: Run Database Setup

```sql
-- Execute in Supabase SQL Editor
-- File: /orato/database/DATABASE_USER_PROFILE.sql
```

### Step 2: Create Storage Bucket

1. Supabase Dashboard → Storage
2. Create bucket: `avatars`
3. Set as public
4. Add RLS policies for uploads

### Step 3: Wrap App with Theme Provider

```typescript
// app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 4: Add Settings Link to Navigation

```typescript
<Link href="/settings" className="nav-link">
  Settings
</Link>
```

### Step 5: Update Performance to Calculate CEFR

After performance changes:

```typescript
// After recording, quiz, etc.
await supabase.rpc('update_cefr_level', { p_user_id: userId });
```

## Accent Options

| Accent | Description |
|--------|-------------|
| American | General American pronunciation |
| British | Received Pronunciation (RP) |
| Australian | Australian English |
| Neutral | International/neutral accent |

## Learning Focus Options

| Focus | Description |
|-------|-------------|
| Fluency | Speaking smoothly and naturally |
| Grammar | Correct sentence structure |
| Vocabulary | Expanding word knowledge |
| Pronunciation | Clear speech sounds |
| Balanced | Equal focus on all areas (recommended) |

## Privacy Levels

| Level | Description |
|-------|-------------|
| Public | Anyone can see your profile |
| Friends | Only friends can see |
| Private | Only you can see |

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Storage bucket configured
- [ ] Settings page loads without errors
- [ ] Profile information saves correctly
- [ ] Profile photo uploads successfully
- [ ] Photo appears on profile
- [ ] Photo deletion works
- [ ] CEFR level displays correctly
- [ ] Theme toggle changes appearance
- [ ] Theme persists across sessions
- [ ] Preferences save correctly
- [ ] Notification toggles work
- [ ] Privacy settings save
- [ ] PDF report downloads
- [ ] PDF contains all sections
- [ ] Mobile responsive layout

## Troubleshooting

### Photo Upload Fails
- Check storage bucket exists and is public
- Verify RLS policies allow uploads
- Check file size and type
- Look at browser console errors

### Theme Not Working
- Verify ThemeProvider wraps app
- Check Tailwind config has `darkMode: 'class'`
- Ensure `suppressHydrationWarning` on html tag
- Clear browser cache

### CEFR Level Not Calculating
- Check user_performance_summary has data
- Run update_cefr_level function manually
- Verify function exists in database
- Check score values are valid (0-100)

### PDF Generation Errors
- Verify jspdf and jspdf-autotable installed
- Check all data sources exist (profile, performance, etc.)
- Look at server logs for errors
- Test with minimal data first

## Future Enhancements

1. **Social Features**: Friend system, profile sharing
2. **Avatar Customization**: Pre-made avatars if no photo
3. **Profile Badges**: Display achievements on profile
4. **Advanced Reports**: Charts, graphs, trends
5. **Export Data**: JSON export of all user data
6. **Two-Factor Auth**: Enhanced security
7. **Profile Verification**: Verified learner badge
8. **Custom Themes**: Create your own color schemes
9. **Profile Stats Widget**: Embeddable stats for websites
10. **Learning Streaks**: Visual streak calendar

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database tables and functions exist
3. Test API routes directly in browser/Postman
4. Review Supabase logs for backend errors
5. Ensure all packages installed (jspdf, next-themes)
6. Check storage bucket permissions

Your complete profile & settings system is ready! 🎉
