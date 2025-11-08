# 30-Day Roadmap - Quick Start Guide

## ⚡ Setup in 5 Minutes

### 1. Run Database Setup (1 minute)
```sql
-- In Supabase SQL Editor, execute:
-- File: /orato/database/DATABASE_ROADMAP.sql
```

### 2. Add RoadmapCard to Dashboard (1 minute)
```typescript
// In /app/page.tsx or your main dashboard
import RoadmapCard from "@/components/RoadmapCard";

export default function Dashboard() {
  return (
    <div>
      {/* Existing components */}
      <RoadmapCard /> {/* Add this line */}
    </div>
  );
}
```

### 3. Test It! (3 minutes)
1. Refresh your dashboard
2. Click "Generate My Roadmap"
3. See your personalized 30-day plan
4. Click "View Full Roadmap" to see all days
5. Complete a task to test progress tracking

## 🎯 Key Features at a Glance

| Feature | Description |
|---------|-------------|
| **Smart Generation** | Analyzes performance & creates personalized plan |
| **30 Daily Tasks** | Mix of speaking, grammar, vocabulary, challenges |
| **Progress Tracking** | Visual progress bar & completion stats |
| **Milestones** | Celebrations at days 7, 15, 30 with confetti! |
| **XP Integration** | Each task awards 50-500 XP |
| **Motivational Tips** | Daily encouragement messages |
| **Adaptive** | Focuses on weak areas automatically |

## 📊 What Gets Analyzed

The roadmap analyzes:
- Fluency scores from recordings
- Grammar quiz results
- Vocabulary size & quiz scores
- Confidence levels
- Total practice sessions

**Low scores (<60) = More tasks in that area**

## 🗺️ Roadmap Structure

**Week 1 (Days 1-7)**: Introduction & Assessment
- Get to know your level
- Try different activity types
- **Milestone**: 7-day celebration 🔥

**Week 2 (Days 8-14)**: Focus on Primary Weak Area
- Concentrated practice in weakest skill
- **Milestone**: Halfway point ⭐

**Week 3 (Days 15-21)**: Mixed Practice
- Variety of task types
- Integration of skills
- **Milestone**: 21-day achievement 🌟

**Week 4 (Days 22-30)**: Mastery
- Advanced challenges
- Final assessment
- **Milestone**: 30-day champion! 👑

## 💡 Pro Tips

1. **Complete Today's Task First**: Shows as "TODAY" badge
2. **Check Motivational Tips**: Hidden wisdom in each task
3. **Celebrate Milestones**: Confetti & bonuses at days 7, 15, 30
4. **Regenerate Anytime**: Get a fresh plan based on new performance
5. **Track Weak Areas**: Top bar shows your focus areas

## 🔗 Navigation

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Shows RoadmapCard with today's task |
| Full Roadmap | `/roadmap` | All 30 days, filters, progress |
| Task Detail | Click task | Complete or view details |

## ⚙️ Optional: Performance Tracking

For better roadmap personalization, update user performance after activities:

```typescript
// After grammar quiz
await supabase
  .from('user_performance_summary')
  .update({ avg_grammar_score: score })
  .eq('user_id', userId);

// After recording
await supabase
  .from('user_performance_summary')
  .update({ avg_fluency_score: score })
  .eq('user_id', userId);
```

## 🎨 UI Components Created

| Component | Location | Purpose |
|-----------|----------|---------|
| RoadmapCard | `/components/RoadmapCard.tsx` | Dashboard widget |
| RoadmapPage | `/app/roadmap/page.tsx` | Full 30-day view |
| MilestoneCelebrationModal | `/components/MilestoneCelebrationModal.tsx` | Celebration popup |

## 📱 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/roadmap` | GET | Fetch active roadmap |
| `/api/roadmap-generate` | POST | Create new plan |
| `/api/roadmap-complete-task` | POST | Mark task done |

## 🐛 Quick Troubleshooting

**Roadmap not generating?**
- Check if user_performance_summary exists
- Look at browser console for errors

**Tasks not completing?**
- Verify user is authenticated
- Check Network tab in dev tools

**Milestones not showing?**
- Verify roadmap_milestones table created
- Check celebration_shown flag

## 🚀 What's Next?

1. ✅ Generate your first roadmap
2. ✅ Complete Day 1
3. ✅ Reach 7-day milestone
4. ✅ Finish all 30 days!
5. ✅ Regenerate with improved skills

---

**Full documentation**: See `/metadata/ROADMAP_SETUP.md`

**Questions?** Check the troubleshooting section in the full docs.

Happy learning! 🎉
