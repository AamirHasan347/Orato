# Fix: "Could not find the 'audio_url' column" Error

## Problem

The `recordings` table in your Supabase database is missing the `audio_url` column, which causes the save-session API to fail after recording audio.

**Error Message:**
```
Save-session failed: "Could not find the 'audio_url' column of 'recordings' in the schema cache"
```

---

## Solution: Run SQL Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run the Fix Script

1. Open the file: **`FIX_RECORDINGS_TABLE.sql`** (in your orato folder)
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** button

### Step 3: Verify It Worked

After running the script, you should see output like:

```
Added audio_url column to recordings table
Recordings table is now properly configured!
```

And a table showing columns:
```
column_name   | data_type | is_nullable
--------------+-----------+-------------
id            | uuid      | NO
user_id       | uuid      | NO
topic         | text      | YES
audio_url     | text      | YES
feedback      | text      | YES
created_at    | timestamp | YES
```

---

## What the Script Does

1. **Adds `audio_url` column** if it doesn't exist
2. **Creates `recordings` table** if it doesn't exist at all
3. **Sets up Row Level Security (RLS)** policies
4. **Creates indexes** for better performance
5. **Verifies the final structure**

---

## Test After Fix

1. **Restart your dev server:**
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

2. **Try recording again:**
   - Go to "Start SpeakFlow" or "Daily Speaking Challenges"
   - Record audio for 10-15 seconds
   - Stop recording
   - Wait for processing

3. **Expected result:**
   - ✅ Transcript appears
   - ✅ Feedback appears
   - ✅ No error in console
   - ✅ Recording is saved successfully

4. **Verify it saved:**
   - Go to "View My Recordings"
   - You should see your new recording listed

---

## Alternative: Quick SQL (If You're in a Hurry)

If you just want to add the missing column quickly:

```sql
-- Just add the audio_url column
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Verify it was added
SELECT column_name FROM information_schema.columns WHERE table_name = 'recordings';
```

---

## Why This Happened

The original Orato setup likely had the `recordings` table created without the `audio_url` column, or the table schema got out of sync with the application code.

The application expects this structure:
```typescript
{
  id: uuid,
  user_id: uuid,
  topic: text,
  audio_url: text,    // <-- This was missing!
  feedback: text,
  created_at: timestamp
}
```

---

## Troubleshooting

### Issue: "relation 'recordings' does not exist"

This means the entire `recordings` table is missing.

**Solution:** The `FIX_RECORDINGS_TABLE.sql` script will create it for you. Just run the full script.

---

### Issue: Still getting the same error after running SQL

**Possible causes:**
1. SQL didn't run successfully
2. Wrong Supabase project
3. Browser cache

**Solutions:**

**A) Verify the column exists:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'recordings';
```

You should see `audio_url` in the list.

**B) Check you're in the right project:**
- Verify the project URL in `.env.local` matches your Supabase dashboard
- Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

**C) Clear cache and restart:**
```bash
# Stop dev server (Ctrl+C)
rm -rf .next
npm run dev
```

---

### Issue: "permission denied for table recordings"

The RLS policies might not be set up correctly.

**Solution:** Run this SQL:
```sql
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own recordings" ON recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recordings" ON recordings
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Expected Database Schema After Fix

Your `recordings` table should look like this:

```sql
CREATE TABLE recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT,
  audio_url TEXT,           -- Now exists!
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

With these indexes:
- `idx_recordings_user_id` (for faster user queries)
- `idx_recordings_created_at` (for sorting by date)

And these RLS policies:
- Users can SELECT their own recordings
- Users can INSERT their own recordings
- Users can UPDATE their own recordings
- Users can DELETE their own recordings

---

## Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran the SQL from `FIX_RECORDINGS_TABLE.sql`
- [ ] Saw success message
- [ ] Restarted dev server (`npm run dev`)
- [ ] Tested recording again
- [ ] Recording saved successfully
- [ ] Can see recording in "View My Recordings"

---

## Still Not Working?

If you've done all the above and it still doesn't work:

1. **Share the exact error from the terminal** (not browser console)
2. **Run this SQL and share the output:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'recordings';
   ```
3. **Verify your `.env.local` has the correct Supabase URL:**
   ```bash
   cat .env.local | grep SUPABASE_URL
   ```

With this info, I can help you debug further!
