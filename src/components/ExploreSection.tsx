"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  LightBulbIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ChatBubbleOvalLeftIcon,
  RocketLaunchIcon,
  FireIcon,
  StarIcon,
  CheckCircleIcon
} from "@/components/Icons";

const tips = [
  "Record yourself daily to track your improvement over time.",
  "Focus on one grammar rule per day for better retention.",
  "Practice with native speakers to improve pronunciation.",
  "Use new vocabulary words in 3 different sentences.",
  "Listen to English podcasts during your commute."
];

const achievements = [
  { icon: TrophyIcon, title: "First Steps", description: "Completed your first session", color: "text-yellow-600", borderColor: "border-yellow-500" },
  { icon: FireIcon, title: "5-Day Streak", description: "Practiced 5 days in a row", color: "text-orange-600", borderColor: "border-orange-500" },
  { icon: StarIcon, title: "Level Up", description: "Reached Level 3", color: "text-blue-600", borderColor: "border-blue-500" },
  { icon: CheckCircleIcon, title: "Grammar Master", description: "100% on Grammar Quiz", color: "text-green-600", borderColor: "border-green-500" },
];

export default function ExploreSection() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-3xl font-bold text-gray-900"
      >
        Explore & Grow
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tips & Tricks Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-purple-500 rounded-xl flex items-center justify-center text-purple-600">
              <LightBulbIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tips & Tricks</h3>
          </div>

          {/* Carousel */}
          <div className="bg-purple-50 rounded-xl p-6 mb-4 min-h-[120px] flex items-center justify-center relative overflow-hidden border border-purple-100">
            <motion.p
              key={currentTipIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-gray-700 text-center leading-relaxed font-medium"
            >
              {tips[currentTipIndex]}
            </motion.p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevTip}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium shadow-sm hover:shadow-md transition-all border border-purple-200 hover:border-purple-300"
            >
              ← Prev
            </button>
            <div className="flex gap-2">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentTipIndex ? "bg-purple-600 w-6" : "bg-purple-300 w-2"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextTip}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium shadow-sm hover:shadow-md transition-all border border-purple-200 hover:border-purple-300"
            >
              Next →
            </button>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-yellow-500 rounded-xl flex items-center justify-center text-yellow-600">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
          </div>

          <div className="space-y-3">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;

              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  className="bg-yellow-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-yellow-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 border-2 ${achievement.borderColor} rounded-xl flex items-center justify-center ${achievement.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Weekly Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-green-500 rounded-xl flex items-center justify-center text-green-600">
              <ArrowTrendingUpIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Weekly Report</h3>
          </div>

          <div className="bg-green-50 rounded-xl p-5 space-y-4 border border-green-100">
            {/* Simple Stats */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Practice Sessions</span>
              <span className="text-2xl font-bold text-green-600">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Minutes</span>
              <span className="text-2xl font-bold text-green-600">84</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Improvement</span>
              <span className="text-2xl font-bold text-green-600">+15%</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 px-4 py-3 bg-[#0088FF] text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all"
            >
              View Detailed Report
            </motion.button>
          </div>
        </motion.div>

        {/* Community Speak Zone (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-pink-500 rounded-xl flex items-center justify-center text-pink-600">
              <ChatBubbleOvalLeftIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Community Speak Zone</h3>
          </div>

          <div className="bg-pink-50 rounded-xl p-6 text-center border border-pink-100">
            <RocketLaunchIcon className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-2">Coming Soon!</h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Connect with fellow learners, practice together, and share your progress in our global community.
            </p>
            <button className="px-6 py-2 bg-pink-100 text-pink-600 rounded-lg font-medium border border-pink-200 cursor-not-allowed">
              Join Waitlist
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
