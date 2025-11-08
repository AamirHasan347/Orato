"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface TodayTask {
  id: string;
  day_number: number;
  title: string;
  description: string;
  estimated_minutes: number;
  task_type: string;
  focus_area: string;
  completed: boolean;
  xp_reward: number;
}

interface Roadmap {
  id: string;
  start_date: string;
  total_days: number;
  completed_days: number;
  completion_rate: number;
  current_day: number;
  today_task?: TodayTask;
}

export default function RoadmapCard() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const response = await fetch("/api/roadmap");
      const data = await response.json();

      if (data.ok) {
        setRoadmap(data.roadmap);
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);

    try {
      const response = await fetch("/api/roadmap-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate: false }),
      });

      const data = await response.json();

      if (data.ok) {
        setRoadmap(data.roadmap);
        router.push("/roadmap");
      } else {
        console.error("Error generating roadmap:", data.error);
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
    } finally {
      setGenerating(false);
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
        // Refresh roadmap
        fetchRoadmap();
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </motion.div>
    );
  }

  // No roadmap - show generation prompt
  if (!roadmap) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border-2 border-purple-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <MapIcon className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready for Your 30-Day Journey?
            </h2>
            <p className="text-gray-700 mb-4">
              Get a personalized roadmap tailored to your English learning goals.
              We'll analyze your performance and create a custom 30-day plan to help you improve!
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <SparklesIcon className="w-5 h-5 text-purple-500" />
                <span>Personalized tasks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon className="w-5 h-5 text-purple-500" />
                <span>10-20 min/day</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircleIcon className="w-5 h-5 text-purple-500" />
                <span>Track progress</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateRoadmap}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Generate My Roadmap
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Has roadmap - show progress and today's task
  const todayTask = roadmap.today_task;
  const progressPercentage = roadmap.completion_rate || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <MapIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Roadmap</h2>
            <p className="text-sm text-gray-600">
              Day {roadmap.current_day} of {roadmap.total_days}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/roadmap")}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
        >
          View Full Roadmap
          <ArrowRightIcon className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-purple-600">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {roadmap.completed_days} of {roadmap.total_days} days completed
          </span>
          <span className="text-xs text-gray-500">
            {roadmap.total_days - roadmap.completed_days} days remaining
          </span>
        </div>
      </div>

      {/* Today's Task */}
      {todayTask && !todayTask.completed && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Today's Task</h3>
              <p className="text-sm text-purple-700 font-medium">{todayTask.title}</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              Day {todayTask.day_number}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4">{todayTask.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{todayTask.estimated_minutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <SparklesIcon className="w-4 h-4 text-yellow-500" />
                <span>+{todayTask.xp_reward} XP</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCompleteTask(todayTask.id)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow"
            >
              Start Task
            </motion.button>
          </div>
        </div>
      )}

      {todayTask && todayTask.completed && (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Task Completed! 🎉</h3>
              <p className="text-sm text-gray-600">Great job! See you tomorrow for Day {roadmap.current_day + 1}.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
