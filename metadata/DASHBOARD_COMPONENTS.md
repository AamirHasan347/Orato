# Orato Dashboard - Components Documentation

## Overview

The new Orato dashboard has been completely redesigned to provide a modern, engaging, and data-rich learning experience for English learners. It features a clean, professional interface with smooth animations, responsive design, and intuitive navigation.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Auth**: Supabase

### Color Palette
- Primary Blue: `#0088FF`
- Light Blue: `#87B6FC`
- Orange: `#FDB241`
- Red/Error: `#EA5455`

## Components

### 1. Sidebar (`src/components/Sidebar.tsx`)

**Purpose**: Fixed navigation sidebar with icon-based menu items.

**Features**:
- Blue gradient background matching Orato brand
- Icon-based navigation with tooltips
- Active state indicators with smooth animations
- Logout button at the bottom
- Responsive hover effects

**Navigation Items**:
- Home (Dashboard)
- SpeakFlow (Recording)
- Challenges
- Practice
- Community (future)
- Grammar Quiz
- History (Recordings)
- Settings/Preferences
- Logout

**Usage**:
```tsx
import Sidebar from "@/components/Sidebar";

<Sidebar />
```

### 2. WelcomeSection (`src/components/WelcomeSection.tsx`)

**Purpose**: Hero section displaying personalized greeting and user progress.

**Features**:
- Time-based greeting (Good morning/afternoon/evening)
- User streak counter with fire emoji
- Current level display
- XP progress bar with smooth animations
- Gradient background with decorative elements

**Props**:
```typescript
interface WelcomeSectionProps {
  userName?: string;
  userEmail?: string;
}
```

**Key Elements**:
- Dynamic greeting based on time of day
- 5-day streak indicator
- Level 3 - Confident Speaker badge
- Progress bar: 740/1000 XP
- Animated transitions on mount

### 3. SkillSummaryCards (`src/components/SkillSummaryCards.tsx`)

**Purpose**: Display user's skill metrics across three key areas.

**Features**:
- Three skill cards: Fluency, Confidence, Grammar
- Score display (out of 10)
- Trend indicators (up/down/stable arrows)
- Animated progress bars
- Personalized tips for each skill
- Hover effects with elevation

**Data Structure**:
```typescript
interface SkillCard {
  title: string;
  score: number;
  maxScore: number;
  trend: "up" | "down" | "stable";
  tip: string;
  icon: string;
  color: string;
}
```

**Example Data**:
- **Fluency**: 7.9/10 (↑) - "Try longer sentences today!"
- **Confidence**: 8.2/10 (↑) - "Great progress this week!"
- **Grammar**: 7.5/10 (→) - "Practice complex tenses."

### 4. PracticeFeatureCard (`src/components/PracticeFeatureCard.tsx`)

**Purpose**: Reusable card component for practice features.

**Features**:
- Icon with gradient background
- Title and description
- Hover scale animations
- Custom onClick handlers or navigation
- "Start now" CTA with arrow

**Props**:
```typescript
interface PracticeFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  href: string;
  delay?: number;
  onClick?: () => void;
}
```

**Usage**:
```tsx
<PracticeFeatureCard
  icon="🎙️"
  title="AI Speech Practice"
  description="Record and get feedback..."
  color="from-green-500 to-green-600"
  href="/record"
  delay={0.1}
/>
```

### 5. CoachCorner (`src/components/CoachCorner.tsx`)

**Purpose**: YouTube video integration for educational content.

**Features**:
- Embedded YouTube video player
- Channel branding
- "View More Lessons" CTA
- Lesson description
- Gradient background matching theme

**Customization**:
Replace the `videoId` variable with your actual YouTube video ID:
```typescript
const videoId = "YOUR_VIDEO_ID"; // Current: dQw4w9WgXcQ
```

**Channel Integration**:
Update the channel URL in the button:
```typescript
onClick={() => window.open('https://youtube.com/@your-channel', '_blank')}
```

### 6. JourneyTracker (`src/components/JourneyTracker.tsx`)

**Purpose**: 30-day learning journey progress tracker.

**Features**:
- Progress bar showing completion (Day 7/30)
- Today's focus card
- Motivational quote
- "View Full Roadmap" button
- Animated progress bar with shine effect

**Data**:
- Current Day: 7
- Total Days: 30
- Progress: 23%
- Today's Focus: "Practice pronunciation with tongue twisters"
- Quote: "Every word you speak is a step towards fluency."

### 7. ExploreSection (`src/components/ExploreSection.tsx`)

**Purpose**: Multi-feature section for exploration and motivation.

**Features**:

#### Tips & Tricks Carousel
- 5 rotating learning tips
- Navigation buttons (Prev/Next)
- Dot indicators for current tip
- Smooth transitions between tips

#### Achievements
- Badge display with icons
- Achievement titles and descriptions
- Hover animations
- Example achievements:
  - First Steps
  - 5-Day Streak
  - Level Up
  - Grammar Master

#### Weekly Report
- Practice session count
- Total minutes practiced
- Improvement percentage
- "View Detailed Report" CTA

#### Community Speak Zone
- Coming Soon placeholder
- Join Waitlist button (disabled)
- Future feature preview

### 8. TopUtilityButtons (`src/components/TopUtilityButtons.tsx`)

**Purpose**: Quick access buttons for key features.

**Features**:
- Notifications (with count badge)
- Word of the Day (with new indicator)
- AI Mentor Chat
- Settings/Profile
- Hover scale animations
- Consistent icon design

**Props**:
```typescript
interface TopUtilityButtonsProps {
  onWordOfDayClick: () => void;
  hasNewWord?: boolean;
}
```

## Main Dashboard Page (`src/app/page.tsx`)

### Layout Structure

```
Dashboard
├── Sidebar (fixed left)
└── Main Content Area
    ├── Top Bar (sticky)
    │   ├── Dashboard title
    │   └── TopUtilityButtons
    ├── WelcomeSection
    ├── Skills Overview
    │   └── SkillSummaryCards
    ├── Start Practicing
    │   └── 6 PracticeFeatureCards (3-column grid)
    ├── Two-column layout
    │   ├── JourneyTracker
    │   └── CoachCorner
    └── ExploreSection
        ├── Tips & Tricks
        ├── Achievements
        ├── Weekly Report
        └── Community (Coming Soon)
```

### Practice Features

The dashboard includes 6 main practice features:

1. **AI Speech Practice** (Green)
   - Route: `/record`
   - Description: Record and get instant AI feedback

2. **Daily Speaking Challenge** (Orange)
   - Route: `/challenges`
   - Description: Complete daily challenges

3. **Real-Life Scenarios** (Purple)
   - Route: `/scenarios`
   - Description: Practice real-world situations

4. **Grammar Quiz** (Blue)
   - Route: `/grammar-quiz`
   - Description: Test grammar knowledge

5. **Word of the Day** (Yellow)
   - Action: Opens modal
   - Description: Learn a new word daily

6. **Vocabulary Builder** (Pink)
   - Route: `/vocabulary`
   - Description: Expand vocabulary with curated lists

### Authentication Flow

The dashboard implements protected routes:

1. Check auth loading state
2. Redirect to `/login` if not authenticated
3. Load dashboard components
4. Check Word of the Day status (localStorage)

### Animations

All components use Framer Motion for:
- Fade-in effects on mount
- Staggered animations (delayed by index)
- Hover scale effects
- Progress bar animations
- Smooth transitions

**Animation Delays**:
- Welcome Section: 0ms
- Skills Overview: 300ms
- Practice Features: 400ms + 50ms per card
- Journey Tracker: 700ms
- Coach Corner: 600ms
- Explore Section: 800ms+

## Responsive Design

### Breakpoints

- **Mobile**: Single column layouts
- **Tablet** (md: 768px): 2-column grids
- **Desktop** (lg: 1024px): 3-column grids
- **Wide** (xl: 1280px): Enhanced spacing

### Responsive Features

1. **Sidebar**: Always visible (80px width)
2. **Main Content**: Adjusts with `ml-20` (margin-left)
3. **Grid Layouts**: Responsive columns
   - Practice Cards: 1 → 2 → 3 columns
   - Explore Section: 1 → 2 columns
4. **Welcome Section**: Stacks vertically on mobile
5. **Top Bar**: Hides text on small screens (icons only)

## Customization Guide

### Changing Colors

Update gradient colors in component files:
```tsx
className="bg-gradient-to-br from-[#0088FF] to-[#0066CC]"
```

### Adding New Practice Features

Edit `src/app/page.tsx`:
```typescript
const practiceFeatures = [
  // Add new feature
  {
    icon: "🎯",
    title: "New Feature",
    description: "Description here",
    color: "from-indigo-500 to-indigo-600",
    href: "/new-feature"
  }
];
```

### Updating User Stats

Components use mock data. To integrate real data:

1. Fetch from Supabase in `page.tsx`
2. Pass as props to components
3. Update component interfaces

Example:
```typescript
const [userStats, setUserStats] = useState(null);

useEffect(() => {
  // Fetch user stats from Supabase
  const fetchStats = async () => {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setUserStats(data);
  };
  fetchStats();
}, [user]);

// Pass to components
<SkillSummaryCards data={userStats} />
```

### YouTube Integration

Update CoachCorner component:
```typescript
const videoId = "YOUR_VIDEO_ID";
const channelName = "Your Channel Name";
const channelUrl = "https://youtube.com/@your-channel";
```

## Future Enhancements

### Planned Features

1. **Real-time Data Integration**
   - Connect to Supabase for live stats
   - User progress tracking
   - Achievement system

2. **Community Speak Zone**
   - Social features
   - Group practice sessions
   - Leaderboards

3. **Advanced Analytics**
   - Detailed weekly/monthly reports
   - Performance charts
   - Trend analysis

4. **Gamification**
   - More achievements
   - Rewards system
   - Challenges

5. **Personalization**
   - Theme customization
   - Custom learning paths
   - Adaptive content

## Performance Optimization

### Current Optimizations

1. **Lazy Loading**: Components load on mount
2. **Staggered Animations**: Prevent layout shift
3. **Optimized Images**: Use Next.js Image component
4. **Code Splitting**: Automatic by Next.js

### Recommendations

1. Implement `React.memo()` for static components
2. Use `useMemo()` for expensive calculations
3. Add loading skeletons
4. Implement virtual scrolling for long lists
5. Optimize YouTube embed (lazy load)

## Testing

### Manual Testing Checklist

- [ ] Dashboard loads without errors
- [ ] All animations play smoothly
- [ ] Sidebar navigation works
- [ ] Practice cards navigate correctly
- [ ] Word of Day modal opens/closes
- [ ] Utility buttons respond to clicks
- [ ] Responsive design works on mobile
- [ ] Loading state displays properly
- [ ] Auth redirect works when logged out

### Browser Compatibility

Tested on:
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **Animations not working**
   - Check Framer Motion installation
   - Verify `"use client"` directive

2. **Styles not applying**
   - Ensure Tailwind CSS 4 is configured
   - Check `globals.css` import

3. **Navigation not working**
   - Verify routes exist
   - Check Next.js router import

4. **Modal not showing**
   - Check localStorage for `wordOfDayLastSeen`
   - Verify modal component import

## File Structure

```
orato/
├── src/
│   ├── app/
│   │   ├── page.tsx (Main Dashboard)
│   │   └── supabase-provider.tsx
│   └── components/
│       ├── Sidebar.tsx
│       ├── WelcomeSection.tsx
│       ├── SkillSummaryCards.tsx
│       ├── PracticeFeatureCard.tsx
│       ├── CoachCorner.tsx
│       ├── JourneyTracker.tsx
│       ├── ExploreSection.tsx
│       ├── TopUtilityButtons.tsx
│       └── WordOfDayModal.tsx
```

## Conclusion

The new Orato dashboard provides a comprehensive, modern interface for English learners. It combines functionality with beautiful design, smooth animations, and responsive layouts. The modular component architecture makes it easy to maintain and extend with new features.

For questions or contributions, refer to the main CLAUDE.md file for project guidelines.
