# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orato is a Next.js 15 application that helps users practice English speaking through timed recording sessions with AI-powered feedback. Users record 3-minute speeches on random topics, which are transcribed and analyzed for fluency, grammar, vocabulary, and confidence.

## Tech Stack

- **Framework**: Next.js 15.5.6 with App Router and Turbopack
- **UI**: React 19.1.0, Tailwind CSS 4, Framer Motion
- **Authentication & Database**: Supabase (via @supabase/auth-helpers-nextjs)
- **AI Services**:
  - Groq API (Whisper large-v3) for audio transcription
  - OpenRouter API (DeepSeek R1) for feedback generation
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)

## Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production (with Turbopack)
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Authentication Flow
- Global authentication context via `SupabaseProvider` (src/app/supabase-provider.tsx:14-43)
- Wraps entire app in layout.tsx and provides `useSupabase()` hook
- Auth state managed via `supabase.auth.onAuthStateChange()` listener
- Protected routes check for user and redirect to `/login` if unauthenticated

### Core User Flow
1. **Login/Signup** → `/login` or `/signup` (Supabase email/password auth)
2. **Dashboard** → `/` (page.tsx) - Shows welcome, navigation to record or view history
3. **Recording Session** → `/record` - Main feature:
   - Random topic selection on page load
   - 3-minute countdown timer
   - Browser MediaRecorder API for audio capture (WebM format)
   - On stop: transcribe → generate feedback → upload to Supabase storage → save to DB
4. **History** → `/recordings` - Lists all user's past sessions with audio playback and feedback

### API Routes (src/app/api/)

**POST /api/transcribe** (route.ts:3-64)
- Accepts audio file via FormData
- Converts to Buffer and sends to Groq Whisper API
- Returns transcript text

**POST /api/feedback** (route.ts:9-84)
- Accepts `{ transcript: string }`
- Uses OpenRouter (DeepSeek R1 model) to generate structured feedback JSON
- System prompt requests specific schema: rating, scores (fluency, grammar, vocabulary, confidence), highlights (positives, areas_to_improve), advice
- Attempts to parse JSON response; falls back to raw text if parsing fails

**POST /api/save-session** (route.ts:6-55)
- Server-side route using `createRouteHandlerClient` for auth
- Inserts recording into `recordings` table with: user_id, topic, audio_url, feedback, created_at
- Returns 401 if unauthorized

### Database Schema (Supabase)
**recordings table** (inferred from save-session and recordings page):
- `id` (primary key)
- `user_id` (references auth.users)
- `topic` (text, nullable)
- `audio_url` (text, nullable) - Public URL to Supabase Storage
- `feedback` (text, nullable) - JSON string or plain text
- `created_at` (timestamp, nullable)

**Supabase Storage**:
- Bucket: `recordings` (public)
- Path structure: `{user_id}/{timestamp}.webm`
- Public URL: `{SUPABASE_URL}/storage/v1/object/public/recordings/{path}`

### State Management
- No global state library; uses React Context for Supabase client and user
- Component-level useState for UI state (recording status, timers, transcripts, feedback)

### Key Components

**src/app/record/page.tsx** (22-414)
- Complex recording workflow with MediaRecorder refs and timer management
- Inline topics array (20 topics defined; comment suggests expanding to 100)
- Auto-stops recording when timer hits zero
- Sequential async flow: record → transcribe → feedback → upload → save
- Parses feedback JSON with fallback to raw text
- Uses `useRef` for MediaRecorder, audio chunks, and timer

**src/app/recordings/page.tsx** (17-205)
- Fetches user recordings from Supabase on mount
- Attempts to parse feedback JSON for structured display
- Helper function `getAudioSrc()` handles both full URLs and storage paths

**src/app/supabase-provider.tsx** (14-50)
- Creates `createClientComponentClient()` once in useState
- Subscribes to auth changes in useEffect
- Exports `useSupabase()` hook that throws if used outside provider

### Styling
- Tailwind CSS 4 with custom animations in login page
- Space Grotesk font imported via Google Fonts (login page only)
- Color palette: Blue (#0088FF), Orange (#FDB241), Red (#EA5455), Light blue (#87B6FC)
- Responsive breakpoints used extensively in login (sm, md, lg, xl)

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI Services
GROQ_API_KEY=          # For Whisper transcription
OPENROUTER_API_KEY=    # For feedback generation
```

## Important Notes

- **Client vs Server Components**: Most pages are `"use client"` due to hooks usage. API routes are server-side.
- **Audio Format**: Records as WebM; Groq transcribe endpoint wraps as audio/wav in FormData
- **Feedback Parsing**: Client attempts multiple JSON extraction strategies (strip markdown backticks, regex match first object) due to unpredictable LLM output format
- **Timer Logic**: Uses window.setTimeout with ref cleanup, not setInterval (src/app/record/page.tsx:76-96)
- **No SSR for Auth**: Auth check happens client-side in useEffect; could cause flash of content before redirect
- **Topics Source**: Currently hardcoded in record page; could be extracted to src/lib/topics.ts (file exists but is nearly empty)

## Common Patterns

**Supabase Queries**:
```typescript
const { data, error } = await supabase
  .from('recordings')
  .select('id, topic, audio_url, feedback, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

**Audio Upload**:
```typescript
const fileName = `${user?.id}/${Date.now()}.webm`;
const { data, error } = await supabase.storage
  .from('recordings')
  .upload(fileName, blob, { contentType: 'audio/webm', upsert: false });
```

**Auth Check Pattern**:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) router.push('/login');
```

## Known Limitations

- Topics are hardcoded in record page (only 20 defined, not 100)
- No test suite configured
- Feedback JSON parsing is fragile; depends on LLM following instructions
- No error boundaries or global error handling
- No loading states for page-level navigation
- Audio only saves in WebM (browser-dependent format)
