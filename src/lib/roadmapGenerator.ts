// Roadmap Generation Algorithm
// Analyzes user performance and generates personalized 30-day learning plan

interface UserPerformance {
  avg_fluency_score: number;
  avg_confidence_score: number;
  avg_pronunciation_score: number;
  avg_grammar_score: number;
  avg_vocabulary_quiz_score: number;
  total_recordings: number;
  total_grammar_quizzes: number;
  vocabulary_size: number;
  total_challenges_completed: number;
  overall_level: 'beginner' | 'intermediate' | 'advanced';
}

interface RoadmapDay {
  day_number: number;
  task_type: 'speaking' | 'grammar' | 'vocabulary' | 'listening' | 'challenge' | 'review' | 'mixed';
  title: string;
  description: string;
  estimated_minutes: number;
  target_feature: string;
  focus_area: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  motivational_tip: string;
}

interface WeakArea {
  area: string;
  score: number;
  priority: number; // 1-5, higher = more focus needed
}

/**
 * Analyze user performance and identify weak areas
 */
export function analyzeWeakAreas(performance: UserPerformance): WeakArea[] {
  const weakAreas: WeakArea[] = [];

  // Fluency analysis
  if (performance.avg_fluency_score < 60) {
    weakAreas.push({
      area: 'fluency',
      score: performance.avg_fluency_score,
      priority: 5,
    });
  } else if (performance.avg_fluency_score < 75) {
    weakAreas.push({
      area: 'fluency',
      score: performance.avg_fluency_score,
      priority: 3,
    });
  }

  // Grammar analysis
  if (performance.avg_grammar_score < 60) {
    weakAreas.push({
      area: 'grammar',
      score: performance.avg_grammar_score,
      priority: 5,
    });
  } else if (performance.avg_grammar_score < 75) {
    weakAreas.push({
      area: 'grammar',
      score: performance.avg_grammar_score,
      priority: 3,
    });
  }

  // Vocabulary analysis
  if (performance.avg_vocabulary_quiz_score < 60 || performance.vocabulary_size < 100) {
    weakAreas.push({
      area: 'vocabulary',
      score: performance.avg_vocabulary_quiz_score,
      priority: 4,
    });
  }

  // Confidence analysis
  if (performance.avg_confidence_score < 60) {
    weakAreas.push({
      area: 'confidence',
      score: performance.avg_confidence_score,
      priority: 4,
    });
  }

  // Pronunciation analysis
  if (performance.avg_pronunciation_score < 70) {
    weakAreas.push({
      area: 'pronunciation',
      score: performance.avg_pronunciation_score,
      priority: 3,
    });
  }

  // Sort by priority (highest first)
  weakAreas.sort((a, b) => b.priority - a.priority);

  return weakAreas;
}

/**
 * Generate 30 days of personalized tasks
 */
export function generateRoadmap(
  performance: UserPerformance,
  weakAreas: WeakArea[]
): RoadmapDay[] {
  const roadmap: RoadmapDay[] = [];
  const { overall_level } = performance;

  // Calculate task distribution based on weak areas
  const taskDistribution = calculateTaskDistribution(weakAreas, overall_level);

  // Generate Week 1: Introduction & Assessment (Days 1-7)
  roadmap.push(...generateWeek1Tasks(overall_level, weakAreas));

  // Generate Week 2: Focus on Primary Weak Area (Days 8-14)
  roadmap.push(...generateWeek2Tasks(overall_level, weakAreas[0]));

  // Generate Week 3: Secondary Focus & Mixed Practice (Days 15-21)
  roadmap.push(...generateWeek3Tasks(overall_level, weakAreas));

  // Generate Week 4: Integration & Mastery (Days 22-30)
  roadmap.push(...generateWeek4Tasks(overall_level, weakAreas));

  return roadmap;
}

/**
 * Calculate optimal task distribution
 */
function calculateTaskDistribution(
  weakAreas: WeakArea[],
  level: string
): Record<string, number> {
  const distribution: Record<string, number> = {
    speaking: 8,
    grammar: 6,
    vocabulary: 6,
    challenge: 5,
    review: 3,
    mixed: 2,
  };

  // Adjust based on weak areas
  weakAreas.forEach((weak, index) => {
    if (index === 0) {
      // Primary weak area gets more focus
      if (weak.area === 'fluency' || weak.area === 'confidence') {
        distribution.speaking += 3;
      } else if (weak.area === 'grammar') {
        distribution.grammar += 3;
      } else if (weak.area === 'vocabulary') {
        distribution.vocabulary += 3;
      }
    }
  });

  return distribution;
}

/**
 * Week 1: Introduction & Assessment
 */
function generateWeek1Tasks(
  level: string,
  weakAreas: WeakArea[]
): RoadmapDay[] {
  const tips = getMotivationalTips('general');

  return [
    {
      day_number: 1,
      task_type: 'speaking',
      title: 'Welcome! Introduce Yourself',
      description: 'Record a 1-minute introduction about yourself. Tell us your name, where you\'re from, and why you want to improve your English.',
      estimated_minutes: 10,
      target_feature: 'record',
      focus_area: 'confidence',
      difficulty: 'easy',
      xp_reward: 50,
      motivational_tip: tips[0],
    },
    {
      day_number: 2,
      task_type: 'grammar',
      title: 'Grammar Diagnostic Quiz',
      description: 'Take a comprehensive grammar quiz to help us understand your current level and create a better plan for you.',
      estimated_minutes: 15,
      target_feature: 'grammar-quiz',
      focus_area: 'grammar',
      difficulty: 'medium',
      xp_reward: 75,
      motivational_tip: tips[1],
    },
    {
      day_number: 3,
      task_type: 'vocabulary',
      title: 'Learn Today\'s Word',
      description: 'Check out the Word of the Day and use it in 3 different sentences. Record yourself saying each sentence.',
      estimated_minutes: 10,
      target_feature: 'word-of-day',
      focus_area: 'vocabulary',
      difficulty: 'easy',
      xp_reward: 50,
      motivational_tip: tips[2],
    },
    {
      day_number: 4,
      task_type: 'challenge',
      title: 'Daily Speaking Challenge',
      description: 'Complete today\'s speaking challenge. Focus on speaking clearly and confidently, even if you make mistakes!',
      estimated_minutes: 12,
      target_feature: 'daily-challenge',
      focus_area: 'fluency',
      difficulty: 'medium',
      xp_reward: 75,
      motivational_tip: tips[3],
    },
    {
      day_number: 5,
      task_type: 'speaking',
      title: 'Describe Your Day',
      description: 'Record a 2-minute description of your typical day. Use simple present tense and try to be as detailed as possible.',
      estimated_minutes: 12,
      target_feature: 'record',
      focus_area: 'fluency',
      difficulty: 'medium',
      xp_reward: 60,
      motivational_tip: tips[4],
    },
    {
      day_number: 6,
      task_type: 'vocabulary',
      title: 'Vocabulary Building Exercise',
      description: 'Learn 5 new words related to daily life. Practice using each word in context.',
      estimated_minutes: 15,
      target_feature: 'vocabulary-quiz',
      focus_area: 'vocabulary',
      difficulty: 'medium',
      xp_reward: 70,
      motivational_tip: tips[5],
    },
    {
      day_number: 7,
      task_type: 'review',
      title: '🎉 Week 1 Review',
      description: 'Congratulations on completing Week 1! Review what you\'ve learned and reflect on your progress. You\'re building great habits!',
      estimated_minutes: 10,
      target_feature: 'review',
      focus_area: 'general',
      difficulty: 'easy',
      xp_reward: 100,
      motivational_tip: 'Amazing work! You\'ve completed your first week. Keep this momentum going!',
    },
  ];
}

/**
 * Week 2: Focus on Primary Weak Area
 */
function generateWeek2Tasks(
  level: string,
  primaryWeakArea?: WeakArea
): RoadmapDay[] {
  const focusArea = primaryWeakArea?.area || 'fluency';
  const tips = getMotivationalTips(focusArea);

  const tasks: RoadmapDay[] = [];

  for (let day = 8; day <= 14; day++) {
    const task = generateFocusedTask(day, focusArea, level, tips[(day - 8) % tips.length]);
    tasks.push(task);
  }

  // Day 14 is always a review
  tasks[tasks.length - 1] = {
    day_number: 14,
    task_type: 'review',
    title: '🌟 Week 2 Milestone',
    description: `Great progress on ${focusArea}! This week you focused on improving this skill. Take a moment to celebrate your growth!`,
    estimated_minutes: 10,
    target_feature: 'review',
    focus_area: 'general',
    difficulty: 'easy',
    xp_reward: 150,
    motivational_tip: 'Two weeks done! You\'re halfway to forming a lasting habit. Keep going!',
  };

  return tasks;
}

/**
 * Week 3: Secondary Focus & Mixed Practice
 */
function generateWeek3Tasks(
  level: string,
  weakAreas: WeakArea[]
): RoadmapDay[] {
  const tasks: RoadmapDay[] = [];
  const tips = getMotivationalTips('general');

  // Mix different task types
  const taskTypes = ['speaking', 'grammar', 'vocabulary', 'challenge', 'speaking', 'grammar', 'review'];

  for (let i = 0; i < 7; i++) {
    const day = 15 + i;
    const taskType = taskTypes[i] as RoadmapDay['task_type'];
    const focusArea = weakAreas[i % weakAreas.length]?.area || 'fluency';

    tasks.push(generateVariedTask(day, taskType, focusArea, level, tips[i]));
  }

  // Day 21 is a special milestone
  tasks[tasks.length - 1] = {
    day_number: 21,
    task_type: 'mixed',
    title: '🏆 Three Week Achievement!',
    description: 'You\'ve completed 3 weeks! Today, do a comprehensive practice: speak for 3 minutes about any topic, then review your grammar and vocabulary.',
    estimated_minutes: 20,
    target_feature: 'mixed',
    focus_area: 'general',
    difficulty: 'medium',
    xp_reward: 200,
    motivational_tip: 'Three weeks of consistent effort! You should be proud of yourself!',
  };

  return tasks;
}

/**
 * Week 4: Integration & Mastery
 */
function generateWeek4Tasks(
  level: string,
  weakAreas: WeakArea[]
): RoadmapDay[] {
  const tasks: RoadmapDay[] = [];
  const tips = getMotivationalTips('general');

  // Progressive difficulty, integrating all skills
  for (let day = 22; day <= 30; day++) {
    const focusArea = weakAreas[(day - 22) % weakAreas.length]?.area || 'fluency';

    if (day === 30) {
      // Final day - comprehensive challenge
      tasks.push({
        day_number: 30,
        task_type: 'mixed',
        title: '🎊 30-Day Completion Challenge!',
        description: 'Final day! Record a 5-minute presentation on a topic you\'re passionate about. Show off all the skills you\'ve developed!',
        estimated_minutes: 25,
        target_feature: 'record',
        focus_area: 'general',
        difficulty: 'hard',
        xp_reward: 500,
        motivational_tip: 'You did it! 30 days of dedication and growth. You should be incredibly proud!',
      });
    } else if (day === 28) {
      // Pre-final review
      tasks.push({
        day_number: 28,
        task_type: 'review',
        title: 'Final Week Review',
        description: 'Review all the skills you\'ve practiced. Look back at your Day 1 recording and see how far you\'ve come!',
        estimated_minutes: 15,
        target_feature: 'review',
        focus_area: 'general',
        difficulty: 'easy',
        xp_reward: 150,
        motivational_tip: 'Almost there! Just a few more days to complete your journey!',
      });
    } else {
      tasks.push(generateAdvancedTask(day, focusArea, level, tips[(day - 22) % tips.length]));
    }
  }

  return tasks;
}

/**
 * Generate task focused on specific area
 */
function generateFocusedTask(
  day: number,
  focusArea: string,
  level: string,
  tip: string
): RoadmapDay {
  const tasksByFocus: Record<string, Partial<RoadmapDay>> = {
    fluency: {
      task_type: 'speaking',
      title: `Fluency Practice Day ${day - 7}`,
      description: 'Practice speaking continuously for 3 minutes without stopping. Topic: Describe your favorite hobby or interest.',
      target_feature: 'record',
      estimated_minutes: 12,
      xp_reward: 70,
    },
    grammar: {
      task_type: 'grammar',
      title: `Grammar Deep Dive`,
      description: 'Complete a focused grammar quiz on your weak areas. Pay attention to the explanations!',
      target_feature: 'grammar-quiz',
      estimated_minutes: 15,
      xp_reward: 75,
    },
    vocabulary: {
      task_type: 'vocabulary',
      title: `Vocabulary Expansion`,
      description: 'Learn 10 new words and create example sentences. Focus on words you can use in daily conversation.',
      target_feature: 'vocabulary-quiz',
      estimated_minutes: 15,
      xp_reward: 75,
    },
    confidence: {
      task_type: 'speaking',
      title: `Confidence Building`,
      description: 'Record yourself speaking about a topic you know well. Focus on speaking loudly and clearly.',
      target_feature: 'record',
      estimated_minutes: 10,
      xp_reward: 65,
    },
    pronunciation: {
      task_type: 'speaking',
      title: `Pronunciation Practice`,
      description: 'Practice difficult sounds and words. Record yourself and listen back to identify areas to improve.',
      target_feature: 'record',
      estimated_minutes: 12,
      xp_reward: 70,
    },
  };

  const baseTask = tasksByFocus[focusArea] || tasksByFocus.fluency;

  return {
    day_number: day,
    task_type: baseTask.task_type as RoadmapDay['task_type'],
    title: baseTask.title!,
    description: baseTask.description!,
    estimated_minutes: baseTask.estimated_minutes!,
    target_feature: baseTask.target_feature!,
    focus_area: focusArea,
    difficulty: level === 'beginner' ? 'easy' : 'medium',
    xp_reward: baseTask.xp_reward!,
    motivational_tip: tip,
  };
}

/**
 * Generate varied task for mixed practice week
 */
function generateVariedTask(
  day: number,
  taskType: RoadmapDay['task_type'],
  focusArea: string,
  level: string,
  tip: string
): RoadmapDay {
  const templates: Record<string, Partial<RoadmapDay>> = {
    speaking: {
      title: 'Conversational Speaking',
      description: 'Have a conversation with yourself! Pick a topic and speak for 3 minutes as if explaining it to a friend.',
      target_feature: 'record',
      estimated_minutes: 12,
      xp_reward: 70,
    },
    grammar: {
      title: 'Grammar Challenge',
      description: 'Take a timed grammar quiz. Focus on accuracy and understanding why each answer is correct.',
      target_feature: 'grammar-quiz',
      estimated_minutes: 15,
      xp_reward: 75,
    },
    vocabulary: {
      title: 'Contextual Vocabulary',
      description: 'Learn new words by reading a short passage and identifying unfamiliar words. Use them in your own sentences.',
      target_feature: 'vocabulary-quiz',
      estimated_minutes: 15,
      xp_reward: 75,
    },
    challenge: {
      title: 'Daily Challenge',
      description: 'Complete today\'s speaking or grammar challenge. Push yourself to do better than yesterday!',
      target_feature: 'daily-challenge',
      estimated_minutes: 12,
      xp_reward: 80,
    },
  };

  const template = templates[taskType] || templates.speaking;

  return {
    day_number: day,
    task_type: taskType,
    title: template.title!,
    description: template.description!,
    estimated_minutes: template.estimated_minutes!,
    target_feature: template.target_feature!,
    focus_area: focusArea,
    difficulty: 'medium',
    xp_reward: template.xp_reward!,
    motivational_tip: tip,
  };
}

/**
 * Generate advanced task for final week
 */
function generateAdvancedTask(
  day: number,
  focusArea: string,
  level: string,
  tip: string
): RoadmapDay {
  const difficulty = level === 'advanced' ? 'hard' : 'medium';

  return {
    day_number: day,
    task_type: 'mixed',
    title: `Advanced Practice - Day ${day}`,
    description: `Integrate all your skills! Speak for 4 minutes on a challenging topic, using advanced vocabulary and proper grammar.`,
    estimated_minutes: 18,
    target_feature: 'record',
    focus_area: focusArea,
    difficulty,
    xp_reward: 100,
    motivational_tip: tip,
  };
}

/**
 * Get motivational tips for specific category
 */
function getMotivationalTips(category: string): string[] {
  const allTips: Record<string, string[]> = {
    general: [
      'Every expert was once a beginner. Keep going!',
      'Progress, not perfection, is the goal.',
      'You\'re doing great! Consistency is key.',
      'Small daily improvements lead to stunning results.',
      'Believe in yourself - you\'re capable of more than you think!',
    ],
    fluency: [
      'Fluency comes from practice, not perfection.',
      'Speak more, hesitate less. You\'ve got this!',
      'The more you speak, the more natural it becomes.',
      'Don\'t worry about mistakes - they\'re part of learning!',
    ],
    grammar: [
      'Grammar is a tool to help you communicate better.',
      'Every grammar rule you learn makes you more precise.',
      'Understanding grammar gives you confidence!',
    ],
    vocabulary: [
      'Every word you learn opens new doors.',
      'Rich vocabulary makes you a more interesting speaker.',
      'Use new words regularly to make them stick!',
    ],
    confidence: [
      'Confidence grows with every practice session.',
      'Your voice matters. Speak up!',
      'Confidence is built through action, not thought.',
    ],
  };

  return allTips[category] || allTips.general;
}

/**
 * Generate default performance for new users
 */
export function getDefaultPerformance(): UserPerformance {
  return {
    avg_fluency_score: 50,
    avg_confidence_score: 50,
    avg_pronunciation_score: 50,
    avg_grammar_score: 50,
    avg_vocabulary_quiz_score: 50,
    total_recordings: 0,
    total_grammar_quizzes: 0,
    vocabulary_size: 0,
    total_challenges_completed: 0,
    overall_level: 'beginner',
  };
}
