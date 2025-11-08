# 30-Day Personalized Roadmap - Complete Setup Guide

## Overview
An intelligent, adaptive learning companion that creates personalized 30-day learning plans based on user performance data. The roadmap analyzes weak areas and generates daily tasks with motivational tips, celebration milestones, and XP rewards.

## Features Implemented

### 1. Intelligent Roadmap Generation
- **Performance Analysis**: Analyzes fluency, grammar, vocabulary, confidence, and pronunciation scores
- **Weak Area Identification**: Prioritizes areas needing improvement
- **30-Day Plan**: Generates customized daily tasks
- **Adaptive Difficulty**: Adjusts based on user level (beginner/intermediate/advanced)
- **Task Variety**: Mixes speaking, grammar, vocabulary, challenges, and reviews

### 2. Task Types
- **Speaking Practice** 🎤: Recording exercises for fluency
- **Grammar Quizzes** 📚: Targeted grammar improvement
- **Vocabulary Building** 📝: Daily word learning
- **Daily Challenges** 🎯: Integrated challenge system
- **Review Days** 🔍: Reflection and consolidation
- **Mixed Practice** 🌟: Comprehensive skill integration

### 3. Progress Tracking
- **Visual Progress Bar**: Shows completion percentage
- **Current Day Indicator**: Highlights today's task
- **Completed Tasks**: Green checkmarks for finished tasks
- **Streak Counter**: Tracks consecutive days
- **Focus Areas Display**: Shows personalized weak areas

### 4. Milestone Celebrations
- **7-Day Milestone** 🔥: First week celebration
- **15-Day Milestone** ⭐: Halfway point
- **30-Day Completion** 👑: Full journey achievement
- **Confetti Animation**: Visual celebration effect
- **Bonus XP**: Milestone rewards (350 XP, 750 XP, 1500 XP)
- **Motivational Quotes**: Inspiring messages

### 5. Dashboard Integration
- **RoadmapCard**: Quick overview with today's task
- **Generate Button**: Easy roadmap creation
- **Progress Summary**: At-a-glance stats
- **Quick Actions**: Start task directly from dashboard

### 6. User Experience
- **Motivational Tips**: Daily encouragement
- **Task Estimation**: Time estimates for each task
- **XP Rewards**: Gamification with experience points
- **Visual Icons**: Emoji icons for different task types
- **Responsive Design**: Mobile-friendly layout
- **Smooth Animations**: Framer Motion effects

## Database Setup

### Tables Created

1. **roadmaps**
   - Stores user's roadmap metadata
   - Fields: start_date, end_date, total_days, completed_days, completion_rate, current_day, status
   - Tracks performance snapshot and weak areas

2. **roadmap_days**
   - Stores each of the 30 daily tasks
   - Fields: day_number, task_type, title, description, estimated_minutes, focus_area, difficulty, completed, xp_reward, motivational_tip
   - Links to parent roadmap

3. **roadmap_milestones**
   - Tracks milestone achievements (day 7, 15, 30)
   - Fields: milestone_day, reached, reached_at, celebration_shown
   - Auto-created when roadmap is generated

4. **user_performance_summary**
   - Aggregates user performance data
   - Fields: avg_fluency_score, avg_grammar_score, vocabulary_size, total_sessions, etc.
   - Used for roadmap generation

5. **motivational_tips**
   - Library of motivational messages
   - Categorized by type (general, fluency, grammar, vocabulary, confidence)
   - Randomly assigned to tasks

### Triggers & Functions

1. **update_roadmap_progress()**: Automatically updates completion stats when tasks are completed
2. **initialize_roadmap_milestones()**: Creates milestone entries when roadmap is generated
3. **calculate_user_level()**: Determines user's overall level from scores

### Running the Setup

```sql
-- In your Supabase SQL Editor, run:
-- File: /orato/database/DATABASE_ROADMAP.sql
```

This will:
- Create all 5 tables with proper indexes
- Set up Row Level Security policies
- Create triggers for auto-updates
- Insert motivational tips
- Create helper functions

## API Routes

### 1. `/api/roadmap` (GET)
Fetch user's active roadmap with all details

**Response:**
```json
{
  "ok": true,
  "roadmap": {
    "id": "...",
    "completed_days": 5,
    "completion_rate": 16.67,
    "current_day": 6,
    "days": [...],
    "milestones": [...],
    "today_task": {...},
    "upcoming_tasks": [...]
  }
}
```

### 2. `/api/roadmap-generate` (POST)
Generate new personalized roadmap

**Request:**
```json
{
  "forceRegenerate": false // true to replace existing roadmap
}
```

**Response:**
```json
{
  "ok": true,
  "roadmap": {...},
  "weak_areas": [
    { "area": "fluency", "score": 45, "priority": 5 },
    { "area": "grammar", "score": 52, "priority": 4 }
  ],
  "message": "Your personalized 30-day roadmap has been created!"
}
```

### 3. `/api/roadmap-complete-task` (POST)
Mark a task as completed

**Request:**
```json
{
  "taskId": "...",
  // OR
  "dayNumber": 5,
  "roadmapId": "..."
}
```

**Response:**
```json
{
  "ok": true,
  "task": {...},
  "roadmap": {...},
  "newMilestones": [...],
  "xpAwarded": 75
}
```

## Roadmap Generation Algorithm

### Analysis Process

1. **Fetch Performance Data**
   - Fluency, grammar, vocabulary, confidence scores
   - Total sessions, challenges completed
   - Vocabulary size

2. **Identify Weak Areas**
   - Score thresholds: <60 = high priority, <75 = medium priority
   - Priority ranking (1-5, higher = more focus)
   - Areas: fluency, grammar, vocabulary, confidence, pronunciation

3. **Generate Task Distribution**
   ```
   Week 1 (Days 1-7): Introduction & Assessment
   Week 2 (Days 8-14): Focus on Primary Weak Area
   Week 3 (Days 15-21): Secondary Focus & Mixed Practice
   Week 4 (Days 22-30): Integration & Mastery
   ```

4. **Task Assignment**
   - More tasks in weak areas
   - Variety for engagement
   - Progressive difficulty
   - Milestones at days 7, 15, 21, 30

### Customization Logic

**Beginner Level** (avg score <50):
- Easier tasks with more guidance
- Shorter time estimates (10-12 min)
- Focus on confidence building

**Intermediate Level** (avg score 50-75):
- Balanced difficulty
- Standard time estimates (15 min)
- Mix of all task types

**Advanced Level** (avg score >75):
- Harder challenges
- Longer tasks (18-20 min)
- Integration focus

### Example Roadmap Structure

**Day 1**: "Welcome! Introduce Yourself" (Speaking, 10 min, +50 XP)
**Day 2**: "Grammar Diagnostic Quiz" (Grammar, 15 min, +75 XP)
**Day 7**: "Week 1 Review" (Review, 10 min, +100 XP) ⭐ Milestone
**Day 14**: "Week 2 Milestone" (Review, 10 min, +150 XP) ⭐ Milestone
**Day 21**: "Three Week Achievement!" (Mixed, 20 min, +200 XP) ⭐ Milestone
**Day 30**: "30-Day Completion Challenge!" (Mixed, 25 min, +500 XP) 👑 Final

## UI Components

### 1. RoadmapCard (Dashboard)

```typescript
import RoadmapCard from "@/components/RoadmapCard";

export default function Dashboard() {
  return (
    <div>
      {/* Other components */}
      <RoadmapCard />
    </div>
  );
}
```

**Features:**
- Shows today's task if roadmap exists
- Generate button if no roadmap
- Progress bar and stats
- "Start Task" quick action
- Links to full roadmap page

### 2. Full Roadmap Page (`/roadmap`)

**Features:**
- All 30 days displayed as cards
- Filter tabs (All/Today/Completed/Pending)
- Progress overview with stats
- Complete task buttons
- Motivational tips per task
- Milestone badges
- "TODAY" highlight
- Locked future tasks
- Regenerate option

### 3. Milestone Celebration Modal

**Appears When:**
- Day 7 completed (First Week)
- Day 15 completed (Halfway)
- Day 30 completed (Champion!)

**Features:**
- Confetti animation
- Trophy icon with glow
- Celebration message
- Stats display
- Bonus XP notification
- Inspirational quote
- Continue button

## Integration Guide

### Step 1: Add RoadmapCard to Dashboard

```typescript
// In your main dashboard page
import RoadmapCard from "@/components/RoadmapCard";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Existing components */}
      <CoachCorner />
      <AchievementsSection />

      {/* Add Roadmap Card */}
      <RoadmapCard />
    </div>
  );
}
```

### Step 2: Update Navigation (Optional)

Add link to roadmap in your navigation:

```typescript
<Link href="/roadmap" className="nav-link">
  My Roadmap
</Link>
```

### Step 3: Initialize User Performance Summary

When a user first signs up or completes their first activity:

```typescript
// Create default performance summary
await supabase
  .from('user_performance_summary')
  .insert({
    user_id: userId,
    avg_fluency_score: 50,
    avg_grammar_score: 50,
    avg_vocabulary_quiz_score: 50,
    overall_level: 'beginner',
  });
```

### Step 4: Update Performance Data

After user completes activities, update their performance:

```typescript
// After grammar quiz
await supabase
  .from('user_performance_summary')
  .update({
    avg_grammar_score: newAverage,
    total_grammar_quizzes: count + 1,
    updated_at: new Date().toISOString(),
  })
  .eq('user_id', userId);

// After recording
await supabase
  .from('user_performance_summary')
  .update({
    avg_fluency_score: newAverage,
    total_recordings: count + 1,
    updated_at: new Date().toISOString(),
  })
  .eq('user_id', userId);
```

## Task Completion Integration

When a user completes a task (e.g., finishes a quiz, submits a recording), automatically mark the roadmap task as complete:

```typescript
// After completing a grammar quiz
const result = await completeActivity('grammar-quiz', quizScore);

if (result.success) {
  // Check if this completes a roadmap task
  await fetch('/api/roadmap-complete-task', {
    method: 'POST',
    body: JSON.stringify({
      dayNumber: currentDay,
      roadmapId: roadmapId,
    }),
  });
}
```

## XP Integration

The roadmap system integrates with the achievements system:

```typescript
// When a task is completed, XP is automatically awarded
// See: /api/roadmap-complete-task

// Each task has an xp_reward field (50-500 XP)
// Milestones award bonus XP (350/750/1500)
```

## Regeneration Feature

Users can regenerate their roadmap anytime:

```typescript
// On roadmap page, click "Regenerate Plan"
// Confirms with user
// Marks old roadmap as 'regenerated'
// Generates new 30-day plan based on current performance
```

## Customization Options

### Add New Task Types

In `/lib/roadmapGenerator.ts`, add to task templates:

```typescript
const templates: Record<string, Partial<RoadmapDay>> = {
  // Add new type
  listening: {
    title: 'Listening Comprehension',
    description: 'Listen to an English audio clip and answer questions.',
    target_feature: 'listening-exercise',
    estimated_minutes: 15,
    xp_reward: 70,
  },
};
```

### Modify Week Structure

Edit the week generation functions:

```typescript
function generateWeek1Tasks() {
  // Customize first week tasks
  // Add more assessment tasks
  // Change difficulty levels
}
```

### Add More Milestones

In database setup, add to milestone initialization:

```sql
INSERT INTO roadmap_milestones (roadmap_id, user_id, milestone_day)
VALUES
  (NEW.id, NEW.user_id, 10), -- Add 10-day milestone
  (NEW.id, NEW.user_id, 20); -- Add 20-day milestone
```

### Customize Motivational Tips

Add more tips to the database:

```sql
INSERT INTO motivational_tips (tip_text, category) VALUES
('Your custom motivational message here', 'fluency');
```

## Performance Optimization

1. **Lazy Loading**: Roadmap page only loads when accessed
2. **Pagination**: Can implement pagination for large roadmaps
3. **Caching**: User progress cached client-side
4. **Indexed Queries**: All database queries use proper indexes
5. **Optimistic Updates**: UI updates immediately

## Testing Checklist

- [ ] Database tables created successfully
- [ ] RoadmapCard displays on dashboard
- [ ] "Generate Roadmap" button works
- [ ] 30 days of tasks are created
- [ ] Tasks have appropriate types and descriptions
- [ ] Today's task is highlighted
- [ ] Completing a task updates progress
- [ ] Progress bar reflects completion
- [ ] Milestone modal appears at days 7, 15, 30
- [ ] Confetti plays on milestones
- [ ] XP is awarded for completed tasks
- [ ] Regenerate creates new roadmap
- [ ] Filters work (All/Today/Completed/Pending)
- [ ] Motivational tips display
- [ ] Mobile responsive layout works

## Troubleshooting

### Roadmap Not Generating
- Check user_performance_summary exists for user
- Verify roadmap generation API route
- Check browser console for errors
- Ensure Supabase connection is working

### Tasks Not Completing
- Verify task ID is correct
- Check user authentication
- Look at API response in Network tab
- Ensure triggers are set up in database

### Milestones Not Showing
- Check roadmap_milestones table
- Verify milestone_day values (7, 15, 30)
- Check celebration_shown flag
- Look for console errors

### Performance Data Not Updating
- Verify user_performance_summary updates after activities
- Check if functions are being called
- Look at Supabase logs for errors

## Future Enhancements

1. **AI-Powered Generation**: Use ML to better predict optimal task sequences
2. **7-Day & 60-Day Plans**: Additional roadmap durations
3. **Custom Goals**: Let users set specific learning objectives
4. **Social Features**: Share roadmaps with friends
5. **Coach Integration**: Link to Coach's Corner videos
6. **Voice Reminders**: Daily task notifications
7. **Progress Reports**: Weekly email summaries
8. **Adaptive Rescheduling**: Adjust plan if user misses days
9. **Skill Trees**: Visual representation of progress
10. **Certificates**: Downloadable completion certificates

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all database tables and triggers exist
3. Test API routes directly in browser/Postman
4. Review Supabase logs for backend errors
5. Ensure react-confetti is installed

Enjoy your personalized learning journey! 🗺️✨

