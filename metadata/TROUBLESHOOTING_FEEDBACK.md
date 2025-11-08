# Troubleshooting: "Could not get feedback from AI" Error

## What I Fixed

### 1. **Switched to More Reliable AI Model** ✅
- **Before:** `deepseek/deepseek-r1:free` (unstable, often unavailable)
- **After:** `openai/gpt-3.5-turbo` (stable, widely available, fast)

### 2. **Added Comprehensive Error Logging** ✅
- Every step now logs to terminal
- Error messages show exactly what went wrong
- Easier to debug API issues

### 3. **Simplified System Prompt** ✅
- Reduced token usage from ~200 to ~100 tokens
- Clearer instructions for the AI
- Better JSON parsing reliability

### 4. **Added API Key Validation** ✅
- Checks if `OPENROUTER_API_KEY` exists before making request
- Returns clear error if key is missing

---

## How to Test the Fix

### Step 1: Start the Development Server

```bash
cd /Users/aamirhassan/Desktop/Orato/orato
npm run dev
```

### Step 2: Check Terminal Logs

After starting the server, you should see logs like:
```
▲ Next.js 15.5.6 (Turbopack)
- Local:        http://localhost:3000
```

### Step 3: Test Recording

1. Open http://localhost:3000 in your browser
2. Login to your account
3. Go to "Start SpeakFlow" or "Daily Speaking Challenges"
4. Record audio (speak for 10-15 seconds)
5. Stop recording

### Step 4: Watch Terminal and Browser Console

**Terminal (Server Logs):**
You should see logs like:
```
Feedback API: Transcript received, length: 156
Feedback API: Calling OpenRouter with gpt-3.5-turbo
Feedback API: Received response from OpenRouter
Feedback API: Raw response: {"rating":"Good","scores":...
Feedback API: Successfully parsed JSON feedback
```

**Browser Console (F12):**
You should see:
```
Transcribe API response: {ok: true, transcript: "..."}
Feedback API response: {ok: true, feedback: {...}}
```

---

## Common Issues & Solutions

### Issue 1: "Could not get feedback from AI" (Still Happening)

**Check Terminal Logs First!** The error message will tell you exactly what's wrong.

#### Possible Cause A: Invalid API Key

**Terminal shows:**
```
Feedback API: Error occurred
Error message: Invalid API key
```

**Solution:**
1. Verify your OpenRouter API key at https://openrouter.ai/keys
2. Update `.env.local`:
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```
3. Restart the dev server (Ctrl+C, then `npm run dev`)

#### Possible Cause B: API Key Not Set

**Terminal shows:**
```
Feedback API: OPENROUTER_API_KEY is not set
```

**Solution:**
1. Create or edit `.env.local` file:
   ```bash
   # In /Users/aamirhassan/Desktop/Orato/orato/.env.local
   OPENROUTER_API_KEY=your_key_here
   GROQ_API_KEY=your_groq_key_here
   ```
2. Restart dev server

#### Possible Cause C: Rate Limit / Quota Exceeded

**Terminal shows:**
```
Error message: Rate limit exceeded
```

**Solution:**
- Wait a few minutes and try again
- Check your OpenRouter dashboard for usage limits
- Upgrade your OpenRouter plan if needed

#### Possible Cause D: Network/Connection Issue

**Terminal shows:**
```
Error message: ECONNREFUSED or timeout
```

**Solution:**
- Check your internet connection
- Check if OpenRouter API is down: https://status.openrouter.ai/
- Try again in a few minutes

---

### Issue 2: Feedback Shows as Raw Text (Not Structured)

**This is normal!** If the AI doesn't return valid JSON, the system gracefully falls back to showing the feedback as plain text. The feedback is still useful, just not as pretty.

If you want to see structured feedback:
- The new GPT-3.5-turbo model is much better at returning JSON
- If it still happens, it's just a formatting issue - the content is still good

---

### Issue 3: "Failed to transcribe audio"

**This is a different issue** (not related to feedback). Check:

1. **Groq API key is set:**
   ```bash
   # In .env.local
   GROQ_API_KEY=your_groq_key_here
   ```

2. **Audio is being recorded:**
   - Check microphone permissions in browser
   - Make sure you speak loud enough
   - Record for at least 5 seconds

---

## Testing the API Directly (Advanced)

### Option 1: Use the Test Script

I created a test script to check if the API works:

```bash
# Make sure dev server is running first (npm run dev)
# Then in a new terminal:
cd /Users/aamirhassan/Desktop/Orato/orato
node test-feedback-api.js
```

You should see:
```
Testing feedback API...
Transcript: Hello, my name is John...

Response status: 200
Response status text: OK

Response data:
{
  "ok": true,
  "feedback": {
    "rating": "Good",
    "scores": { ... },
    ...
  }
}

✅ Feedback API is working!
✅ Response is properly structured JSON
```

### Option 2: Use curl

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Hello, this is a test. I am practicing my English speaking skills."}'
```

### Option 3: Use Thunder Client / Postman

1. Create new POST request to `http://localhost:3000/api/feedback`
2. Set header: `Content-Type: application/json`
3. Set body:
   ```json
   {
     "transcript": "Hello, this is a test. I am practicing my English speaking skills."
   }
   ```
4. Send request
5. Check response

---

## What Changed in the Code

### Feedback API (`src/app/api/feedback/route.ts`)

**Key Changes:**
1. **Model:** `deepseek/deepseek-r1:free` → `openai/gpt-3.5-turbo`
2. **Added logging at every step** to help debug
3. **Check API key exists** before making request
4. **Better error handling** with detailed error messages
5. **Simplified prompt** for better reliability

**Why GPT-3.5-turbo?**
- ✅ Highly reliable (99.9% uptime)
- ✅ Fast response times (<2 seconds)
- ✅ Good at following JSON format instructions
- ✅ Affordable pricing on OpenRouter
- ✅ Well-tested and stable

---

## Expected Feedback Format

When working correctly, you'll see feedback like this:

```json
{
  "rating": "Good",
  "scores": {
    "fluency": 8,
    "grammar": 7,
    "vocabulary": 8,
    "confidence": 9
  },
  "highlights": {
    "positives": [
      "Clear pronunciation",
      "Good pace and rhythm"
    ],
    "areas_to_improve": [
      "Use more varied vocabulary",
      "Practice complex sentence structures"
    ]
  },
  "advice": "Try incorporating transition words like 'however' and 'furthermore' to connect your ideas more smoothly."
}
```

---

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Share the exact error message from the terminal**
   - Copy the full error log including stack trace

2. **Check these files exist and have content:**
   ```bash
   ls -la .env.local
   cat .env.local | grep OPENROUTER
   ```

3. **Verify the server is running:**
   ```bash
   curl http://localhost:3000/api/test
   ```

4. **Check Node.js version:**
   ```bash
   node --version  # Should be v18 or higher
   ```

5. **Try reinstalling dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

---

## Quick Checklist

- [ ] `.env.local` file exists with `OPENROUTER_API_KEY`
- [ ] API key is valid (test at https://openrouter.ai/)
- [ ] Dev server is running (`npm run dev`)
- [ ] No errors in terminal when starting server
- [ ] Browser console shows no CORS errors
- [ ] Internet connection is working
- [ ] OpenRouter API is not down (check status page)
- [ ] You have credits/quota on your OpenRouter account

---

## Need More Help?

If you're still stuck, provide:
1. The **exact error message** from terminal
2. The **exact error message** from browser console (F12)
3. Output of: `node test-feedback-api.js`
4. Confirmation that `.env.local` has `OPENROUTER_API_KEY` set

With this information, I can help you debug further!
