# AI Mentor Chat Assistant - Setup & Documentation

## Overview

The Orato AI Mentor Chat Assistant is a fully-featured English learning chatbot that provides personalized assistance to users. It integrates seamlessly with the dashboard and uses context from the user's learning history to provide tailored feedback and suggestions.

## Features Implemented ✓

### 1. Chat Interface Component
- **Position Options**: Right-side pane (default) or floating mode
- **Clean UI**: Modern chat interface with gradient styling
- **Real-time Messaging**: Instant responses with loading states
- **Auto-scroll**: Automatically scrolls to latest messages
- **Responsive Design**: Works on mobile and desktop

### 2. Preset Prompts (Quick Actions)
The chat includes 6 preset prompts that users can click to quickly start conversations:

| Icon | Label | Prompt |
|------|-------|--------|
| ✏️ | Correct my sentence | "Please correct this sentence: " |
| 🎤 | Give me a speaking topic | "Give me an interesting speaking topic to practice." |
| 📚 | Explain a grammar rule | "Can you explain the difference between " |
| 📖 | Expand my vocabulary | "Teach me 5 advanced words related to " |
| 📊 | How am I doing? | "Based on my recent performance, what should I focus on improving?" |
| 💬 | Practice conversation | "Let's have a conversation about " |

### 3. Context Memory
The AI automatically includes the user's learning context:
- **Recent Speaking Sessions**: Last 3 recordings with feedback scores
- **Grammar Quiz Performance**: Recent quiz scores and difficulty levels
- **Daily Challenges**: Recent challenge attempts and scores
- **User Profile Stats**: Level, XP, and current streak

This allows the AI to give personalized advice based on actual performance data.

### 4. Voice Input
**Status**: Not yet implemented (marked as optional for future enhancement)

## Architecture

### Frontend Components

#### ChatInterface Component
**Location**: `orato/src/components/ChatInterface.tsx`

**Props**:
```typescript
interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'right' | 'floating'; // Default: 'right'
}
```

**Key Features**:
- Message history management
- Preset prompt system
- Loading states and animations
- Keyboard shortcuts (Enter to send)

#### Dashboard Integration
**Location**: `orato/src/app/page.tsx`

The chat is integrated into the dashboard with:
- State management for open/close
- Button trigger in TopUtilityButtons
- Positioned on the right side of the screen

### Backend API

#### AI Chat Endpoint
**Location**: `orato/src/app/api/ai-chat/route.ts`

**Method**: POST

**Request Body**:
```json
{
  "message": "User's message",
  "conversationHistory": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "includeContext": true
}
```

**Response**:
```json
{
  "ok": true,
  "message": "AI's response",
  "timestamp": "2025-11-05T12:34:56.789Z"
}
```

**Features**:
- Authentication via Supabase
- Fetches user learning context from database
- Uses OpenRouter API with DeepSeek R1 model
- Saves conversation history to database
- Error handling and logging

### Database

#### ai_chat_history Table
**Location**: `orato/database/DATABASE_AI_CHAT.sql`

**Schema**:
```sql
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  included_context BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes**:
- `user_id` - Fast lookups by user
- `created_at` - Time-based queries
- `user_id, created_at DESC` - User's recent conversations

**RLS Policies**:
- Users can view their own chat history
- Users can insert their own messages
- Users can delete their own history

## Setup Instructions

### 1. Database Setup

Run the SQL file in your Supabase SQL Editor:

```bash
# Navigate to your Supabase project
# Go to SQL Editor
# Copy and paste the contents of:
orato/database/DATABASE_AI_CHAT.sql
# Execute the SQL
```

This will create:
- `ai_chat_history` table
- Required indexes for performance
- Row Level Security policies
- Access policies for users

### 2. Environment Variables

Ensure your `.env.local` has the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter API (for AI Chat)
OPENROUTER_API_KEY=your_openrouter_api_key
```

**Getting an OpenRouter API Key**:
1. Go to https://openrouter.ai/
2. Sign up or log in
3. Navigate to Keys section
4. Create a new API key
5. Add it to your `.env.local`

### 3. Test the Integration

1. **Start the development server**:
   ```bash
   cd orato
   npm run dev
   ```

2. **Navigate to dashboard**:
   - Open http://localhost:3000
   - Log in with your credentials

3. **Open the chat**:
   - Look for the blue AI icon button in the top-right corner
   - Click it to open the chat interface

4. **Test preset prompts**:
   - Click any of the Quick Action buttons
   - Complete the prompt and send

5. **Test context awareness**:
   - Try asking: "How am I doing?"
   - The AI should reference your recent activity

## AI Model Configuration

**Current Model**: `deepseek/deepseek-r1`

**Configuration** (in `route.ts:164-169`):
```javascript
model: 'deepseek/deepseek-r1',
temperature: 0.7,
max_tokens: 500,
```

**To change the model**:
Edit `orato/src/app/api/ai-chat/route.ts` line 165:
```javascript
model: 'anthropic/claude-3.5-sonnet', // or any OpenRouter model
```

Popular alternatives:
- `anthropic/claude-3.5-sonnet` - Best quality, more expensive
- `openai/gpt-4-turbo` - GPT-4 with longer context
- `google/gemini-pro-1.5` - Google's latest model
- `meta-llama/llama-3-70b-instruct` - Open source alternative

## System Prompt

The AI uses a specialized system prompt for English learning:

**Key Characteristics**:
- Friendly and encouraging tone
- Explains grammar simply with examples
- Corrects mistakes constructively
- Celebrates user progress
- Adapts language level to user proficiency
- Uses emojis sparingly (1-2 max)
- Keeps responses concise (2-4 sentences)

**When Correcting Sentences**:
1. Shows the original sentence
2. Provides the corrected version
3. Explains why the correction is needed
4. Gives a related grammar tip

## Usage Examples

### Example 1: Sentence Correction
**User**: "I go to the store yesterday"
**AI**: "Let me help correct that!

**Original**: I go to the store yesterday
**Corrected**: I went to the store yesterday

The verb 'go' needs to be in past tense 'went' because 'yesterday' indicates a past action. Remember: use past tense verbs with past time markers like yesterday, last week, etc. 😊"

### Example 2: Speaking Topic Request
**User**: "Give me a speaking topic"
**AI**: "Here's a great topic for you! 🎤

**Topic**: 'Describe your ideal vacation destination and explain why you'd like to go there.'

This lets you practice descriptive language, use future tense, and explain your preferences - all essential speaking skills!"

### Example 3: Personalized Feedback
**User**: "How am I doing?"
**AI**: "Looking at your recent progress, you're doing great! 📊

Your grammar quiz scores have improved from 60% to 85%, and your speaking fluency is at 8/10. I'd suggest focusing more on pronunciation variety - try recording yourself reading different types of texts to build this skill!"

## UI Button Location

The AI Mentor Chat button is located in the **top-right corner** of the dashboard:

**Visual Design**:
- Blue background (#0088FF)
- CPU chip icon
- Hover effects (scale up)
- Positioned between Word of the Day and Settings

**Component**: `TopUtilityButtons.tsx:49-58`

## Future Enhancements

### Voice Input (Planned)
- Speech-to-text for chat messages
- Real-time transcription
- Voice commands for preset prompts
- Integration with existing recording features

### Additional Features (Ideas)
- Chat history view/search
- Export conversations
- Share helpful responses
- AI-suggested daily conversation starters
- Integration with vocabulary builder
- Grammar correction highlighting
- Pronunciation feedback via voice

## Troubleshooting

### Chat not opening
- Check that `showChat` state is properly managed
- Verify `onChatClick` prop is passed to TopUtilityButtons
- Check browser console for React errors

### API errors
- Verify OPENROUTER_API_KEY is set in .env.local
- Check API key is valid at https://openrouter.ai/keys
- Review server logs for detailed error messages

### Context not loading
- Ensure database tables exist (recordings, grammar_quiz_attempts, etc.)
- Check RLS policies allow reading user data
- Verify user is authenticated

### Database errors
- Run the DATABASE_AI_CHAT.sql script
- Check that auth.users table exists
- Verify RLS is enabled on ai_chat_history

## File Structure

```
orato/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ai-chat/
│   │   │       └── route.ts              # API endpoint
│   │   └── page.tsx                      # Dashboard integration
│   ├── components/
│   │   ├── ChatInterface.tsx             # Main chat UI component
│   │   └── TopUtilityButtons.tsx         # Button to open chat
├── database/
│   └── DATABASE_AI_CHAT.sql              # Database setup
└── metadata/
    └── AI_MENTOR_CHAT_SETUP.md           # This file
```

## API Integration Details

### OpenRouter Configuration

**Base URL**: `https://openrouter.ai/api/v1/chat/completions`

**Headers**:
```javascript
Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
Content-Type: application/json
```

**Request Format**: OpenAI-compatible chat completions format

### Context Building

The API automatically builds context from:

1. **User Profile** (`user_profiles` table):
   - Level, Total XP, Current Streak

2. **Recent Recordings** (`recordings` table - last 3):
   - Topic, Feedback scores, Rating

3. **Grammar Quizzes** (`grammar_quiz_attempts` - last 3):
   - Score, Difficulty, Percentage

4. **Daily Challenges** (`challenge_attempts` - last 3):
   - Score, Difficulty

This context is appended to the system prompt automatically when `includeContext: true`.

## Cost Considerations

**DeepSeek R1 Pricing** (via OpenRouter):
- Input: ~$0.14 per 1M tokens
- Output: ~$0.28 per 1M tokens

**Average Cost per Conversation**:
- Input (with context): ~500 tokens = $0.00007
- Output (response): ~300 tokens = $0.000084
- **Total: ~$0.000154 per message**

For 1000 messages: ~$0.15

**Optimization Tips**:
- Use `max_tokens: 500` to limit response length
- Set `includeContext: false` for simple queries
- Consider caching system prompts (OpenRouter supports this)

## Credits

**AI Model**: DeepSeek R1 via OpenRouter
**UI Framework**: React + Next.js + Tailwind CSS
**Animations**: Framer Motion
**Icons**: Heroicons
**Database**: Supabase (PostgreSQL)
**Authentication**: Supabase Auth

---

**Status**: ✅ Fully Implemented and Ready to Use

**Last Updated**: November 5, 2025

**Questions or Issues?** Check the troubleshooting section or review the code comments in the implementation files.
