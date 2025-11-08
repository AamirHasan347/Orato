"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  FireIcon,
  TrophyIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import MilestoneCelebrationModal from "@/components/MilestoneCelebrationModal";

interface RoadmapDay {
  id: string;
  day_number: number;
  task_type: string;
  title: string;
  description: string;
  estimated_minutes: number;
  target_feature: string;
  focus_area: string;
  difficulty: string;
  completed: boolean;
  completed_at: string | null;
  xp_reward: number;
  motivational_tip: string;
}

interface Milestone {
  id: string;
  milestone_day: number;
  reached: boolean;
  reached_at: string | null;
  celebration_shown: boolean;
}

interface Roadmap {
  id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  completed_days: number;
  completion_rate: number;
  current_day: number;
  status: string;
  weak_areas: string[];
  days: RoadmapDay[];
  milestones: Milestone[];
  today_task?: RoadmapDay;
  current_day_number: number;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "today">("all");
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchRoadmap();

    // Set window size for confetti
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const fetchRoadmap = async () => {
    try {
      const response = await fetch("/api/roadmap");
      const data = await response.json();

      if (data.ok && data.roadmap) {
        setRoadmap(data.roadmap);

        // Check for new milestones to celebrate
        const newMilestones = data.roadmap.milestones?.filter(
          (m: Milestone) => m.reached && !m.celebration_shown
        );

        if (newMilestones && newMilestones.length > 0) {
          setCurrentMilestone(newMilestones[0]);
          setShowCelebration(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch("/api/roadmap-complete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();

      if (data.ok) {
        // Check if milestone was reached
        if (data.newMilestones && data.newMilestones.length > 0) {
          setCurrentMilestone(data.newMilestones[0]);
          setShowCelebration(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        // Refresh roadmap
        fetchRoadmap();
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Are you sure you want to regenerate your roadmap? This will create a new 30-day plan.")) {
      return;
    }

    setRegenerating(true);

    try {
      const response = await fetch("/api/roadmap-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate: true }),
      });

      const data = await response.json();

      if (data.ok) {
        setRoadmap(data.roadmap);
      }
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
    } finally {
      setRegenerating(false);
    }
  };

  const getTaskIcon = (taskType: string) => {
    const icons: Record<string, string> = {
      speaking: "🎤",
      grammar: "📚",
      vocabulary: "📝",
      listening: "👂",
      challenge: "🎯",
      review: "🔍",
      mixed: "🌟",
    };
    return icons[taskType] || "📌";
  };

  const getTaskColor = (taskType: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      speaking: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
      grammar: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
      vocabulary: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
      challenge: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
      review: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
      mixed: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
    };
    return colors[taskType] || colors.speaking;
  };

  const filteredDays = roadmap?.days?.filter((day) => {
    if (filter === "completed") return day.completed;
    if (filter === "pending") return !day.completed;
    if (filter === "today") return day.day_number === roadmap.current_day_number;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Roadmap Found</h2>
          <p className="text-gray-600 mb-6">Create your personalized 30-day learning plan!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg"
          >
            Go to Dashboard
          </motion.button>
        </div>
      </div>
    );
  }

  const completionPercent = roadmap.completion_rate || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <MapIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">My 30-Day Roadmap</h1>
                <p className="text-gray-600">
                  Day {roadmap.current_day} • {roadmap.completed_days}/{roadmap.total_days} completed
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium shadow-sm hover:shadow-md transition-all border border-gray-200 flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className="w-5 h-5" />
              {regenerating ? "Regenerating..." : "Regenerate Plan"}
            </motion.button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                <p className="text-3xl font-bold text-purple-600">{completionPercent.toFixed(0)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{roadmap.completed_days}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
                <p className="text-3xl font-bold text-blue-600">{roadmap.total_days - roadmap.completed_days}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Focus Areas</p>
                <div className="flex gap-1 mt-2">
                  {roadmap.weak_areas?.slice(0, 3).map((area, i) => (
                    <span key={i} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All Tasks", count: roadmap.days?.length || 0 },
            { key: "today", label: "Today", count: 1 },
            { key: "completed", label: "Completed", count: roadmap.completed_days },
            {
              key: "pending",
              label: "Pending",
              count: roadmap.days?.filter((d) => !d.completed).length || 0,
            },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === tab.key
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </motion.button>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDays.map((day, index) => {
              const colors = getTaskColor(day.task_type);
              const isToday = day.day_number === roadmap.current_day_number;
              const isLocked = day.day_number > roadmap.current_day_number && !day.completed;
              const isMilestone = [7, 15, 21, 30].includes(day.day_number);

              return (
                <motion.div
                  key={day.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
                    isToday
                      ? "border-purple-400 shadow-lg ring-2 ring-purple-200"
                      : day.completed
                      ? "border-green-200"
                      : isLocked
                      ? "border-gray-200 opacity-60"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  {/* Milestone Badge */}
                  {isMilestone && (
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <TrophyIcon className="w-6 h-6 text-white" />
                    </div>
                  )}

                  {/* Today Badge */}
                  {isToday && !day.completed && (
                    <div className="absolute -top-2 -left-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md">
                      TODAY
                    </div>
                  )}

                  {/* Completed Badge */}
                  {day.completed && (
                    <div className="absolute top-4 right-4">
                      <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                  )}

                  {/* Locked Overlay */}
                  {isLocked && (
                    <div className="absolute top-4 right-4">
                      <LockClosedIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Day Number & Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`text-3xl ${isLocked ? "grayscale" : ""}`}>
                      {getTaskIcon(day.task_type)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500">Day {day.day_number}</div>
                      <div className={`text-xs font-medium ${colors.text}`}>{day.task_type}</div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`font-bold text-lg mb-2 ${isLocked ? "text-gray-400" : "text-gray-900"}`}>
                    {day.title}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-3 ${isLocked ? "text-gray-400" : "text-gray-600"}`}>
                    {day.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{day.estimated_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4 text-yellow-500" />
                        <span>+{day.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!isLocked && !day.completed && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCompleteTask(day.id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow"
                    >
                      {isToday ? "Start Today's Task" : "Complete Task"}
                    </motion.button>
                  )}

                  {day.completed && (
                    <div className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-center">
                      ✓ Completed
                    </div>
                  )}

                  {/* Motivational Tip */}
                  {!isLocked && day.motivational_tip && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                      <p className="text-xs text-purple-700 italic">💡 {day.motivational_tip}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredDays.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found for this filter.</p>
          </div>
        )}
      </div>

      {/* Milestone Celebration Modal */}
      <MilestoneCelebrationModal
        milestone={currentMilestone}
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          // Mark milestone as celebrated
          if (currentMilestone) {
            // You could call an API to mark it as shown
          }
        }}
      />
    </div>
  );
}
