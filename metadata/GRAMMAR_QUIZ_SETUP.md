# Grammar Quiz - Quick Setup Guide

## 🚀 3-Step Setup

### Step 1: Run Database SQL

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open file: `DATABASE_GRAMMAR_QUIZ.sql`
4. Copy ALL the SQL code
5. Paste into SQL Editor
6. Click **"Run"**

✅ You should see: *"25 questions inserted"*

---

### Step 2: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

### Step 3: Test the Feature

1. **Login** to your Orato dashboard
2. **Click** "🧩 Grammar Quiz" button (purple button)
3. **Select** a difficulty level (Easy/Medium/Hard)
4. **Answer** 5 multiple-choice questions
5. **View** your score and review answers with explanations

---

## ✅ Verify Setup

### Check Database
```sql
-- In Supabase SQL Editor
SELECT difficulty, COUNT(*) FROM grammar_quiz_questions GROUP BY difficulty;

-- Expected result:
-- easy: 10
-- medium: 10
-- hard: 5
```

### Check API Endpoint
Open in browser (while logged in):
```
http://localhost:3000/api/grammar-quiz?difficulty=easy&limit=5
```

Should return JSON with 5 questions.

---

## 🎯 Feature Overview

**What it does:**
- Users take a 5-question grammar quiz
- 3 difficulty levels: Easy, Medium, Hard
- 3-minute timer for the entire quiz
- Instant feedback with explanations
- Tracks score, time, and difficulty

**Where users access it:**
- Dashboard → Click "🧩 Grammar Quiz" button

**What gets tracked:**
- User's score and accuracy
- Time taken per question
- Difficulty level attempted
- All saved to `grammar_quiz_attempts` table

---

## 📊 Database Tables

### `grammar_quiz_questions`
- Stores all quiz questions
- Fields: question_text, options (A/B/C/D), correct_answer, explanation, difficulty, category
- Pre-loaded with 25 questions

### `grammar_quiz_attempts`
- Tracks user quiz attempts
- Fields: user_id, score, total_questions, time_taken, questions_data (JSONB), difficulty
- Auto-populated when users complete quizzes

---

## 🎨 UI Design

Inspired by modern quiz apps with:
- **Blue gradient background** (matches Orato theme)
- **Card-based layouts**
- **Progress bar** showing quiz completion
- **Timer badge** in top-right (yellow)
- **Multiple choice buttons** (A, B, C, D)
- **Results screen** with detailed review

**Responsive:**
- Works beautifully on desktop, tablet, and mobile

---

## 🐛 Troubleshooting

### "No questions available"
- Check database has questions: `SELECT COUNT(*) FROM grammar_quiz_questions;`
- Run the SQL file again if needed

### Timer not counting down
- Check browser console for errors
- Refresh the page

### Results not saving
- Verify user is logged in
- Check RLS policies in Supabase
- Look at Network tab in DevTools

### Button doesn't appear on dashboard
- Clear browser cache
- Restart dev server
- Check `/src/app/page.tsx` for the Grammar Quiz button

---

## 📚 Sample Questions

**Easy:**
- "She ___ to school every day." (go/goes/going/gone)
- "___ apple a day keeps the doctor away." (A/An/The/Some)

**Medium:**
- "If I ___ you, I would accept the offer." (am/was/were/be)
- "She has been working here ___ 2020." (for/since/from/at)

**Hard:**
- "Hardly ___ finished when the bell rang." (I have/have I/had I/I had)
- "Not only ___ late, but he also forgot the documents." (he was/was he/he is/is he)

---

## 🎯 What's Next?

After setup, you can:

1. **Add more questions** - See `GRAMMAR_QUIZ_FEATURE.md` for SQL examples
2. **Adjust quiz length** - Change limit from 5 to any number
3. **Modify timer** - Change from 3 minutes to any duration
4. **View analytics** - Query `grammar_quiz_attempts` table

---

## 📁 Files Created

- `DATABASE_GRAMMAR_QUIZ.sql` - Database setup
- `src/app/api/grammar-quiz/route.ts` - Fetch questions API
- `src/app/api/grammar-quiz/submit/route.ts` - Submit quiz API
- `src/app/grammar-quiz/page.tsx` - Main quiz UI
- `src/app/page.tsx` - Dashboard (updated with button)

---

## 📖 Full Documentation

For complete details, customization options, and advanced features, see:
**`GRAMMAR_QUIZ_FEATURE.md`**

---

## ✅ Success!

If you can:
- [x] See the Grammar Quiz button on dashboard
- [x] Select a difficulty level
- [x] Answer 5 questions
- [x] View your score with explanations

**Then the feature is working perfectly!** 🎉

Enjoy testing your grammar skills! 🧩✨
