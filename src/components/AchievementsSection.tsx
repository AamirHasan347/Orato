"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrophyIcon, SparklesIcon, LockClosedIcon, ShareIcon } from "@heroicons/react/24/solid";
import AchievementUnlockedModal from "./AchievementUnlockedModal";

interface Achievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  is_unlocked: boolean;
  is_new: boolean;
  unlocked_at: string | null;
}

interface UserProgress {
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  total_sessions: number;
  total_words_learned: number;
  best_fluency_score: number;
  xp_for_next_level: number;
  xp_in_current_level: number;
  level_progress_percentage: number;
}

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [groupedAchievements, setGroupedAchievements] = useState<Record<string, Achievement[]>>({});
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, locked: 0, new: 0, completionPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showUnlockedModal, setShowUnlockedModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [achievementsRes, progressRes] = await Promise.all([
        fetch("/api/user-achievements"),
        fetch("/api/user-progress"),
      ]);

      const achievementsData = await achievementsRes.json();
      const progressData = await progressRes.json();

      if (achievementsData.ok) {
        setAchievements(achievementsData.achievements);
        setGroupedAchievements(achievementsData.groupedAchievements);
        setStats(achievementsData.stats);

        // Check for new achievements to show
        const newOnes = achievementsData.achievements.filter((a: Achievement) => a.is_new);
        if (newOnes.length > 0) {
          setNewAchievements(newOnes);
          setShowUnlockedModal(true);
        }
      }

      if (progressData.ok) {
        setProgress(progressData.progress);
      }
    } catch (error) {
      console.error("Error fetching achievements data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (achievement: Achievement) => {
    const shareText = `🏆 I just unlocked "${achievement.title}" on Orato! ${achievement.badge_icon}\n\n${achievement.description}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Achievement Unlocked: ${achievement.title}`,
          text: shareText,
        });

        // Mark as shared
        await fetch("/api/user-achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ achievementId: achievement.id }),
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert("Achievement copied to clipboard!");
    }
  };

  const getBadgeColor = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
      bronze: {
        bg: "bg-gradient-to-br from-amber-600 to-amber-800",
        border: "border-amber-500",
        text: "text-amber-900",
        glow: "shadow-amber-500/50",
      },
      silver: {
        bg: "bg-gradient-to-br from-gray-300 to-gray-500",
        border: "border-gray-400",
        text: "text-gray-700",
        glow: "shadow-gray-400/50",
      },
      gold: {
        bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        border: "border-yellow-500",
        text: "text-yellow-900",
        glow: "shadow-yellow-500/50",
      },
      platinum: {
        bg: "bg-gradient-to-br from-purple-400 to-purple-600",
        border: "border-purple-500",
        text: "text-purple-900",
        glow: "shadow-purple-500/50",
      },
    };
    return colors[color] || colors.bronze;
  };

  const categories = [
    { key: "all", label: "All", icon: "🏆" },
    { key: "streak", label: "Streaks", icon: "🔥" },
    { key: "fluency", label: "Fluency", icon: "🗣️" },
    { key: "practice", label: "Practice", icon: "📚" },
    { key: "vocabulary", label: "Vocabulary", icon: "📝" },
    { key: "level", label: "Levels", icon: "⭐" },
    { key: "special", label: "Special", icon: "✨" },
  ];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrophyIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
              <p className="text-sm text-gray-600">
                {stats.unlocked} / {stats.total} unlocked ({stats.completionPercentage}%)
              </p>
            </div>
          </div>

          {stats.new > 0 && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-sm shadow-lg"
            >
              {stats.new} NEW! ✨
            </motion.div>
          )}
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Level {progress.current_level}</h3>
                <p className="text-sm text-gray-600">
                  {progress.xp_in_current_level} / {progress.xp_for_next_level} XP
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                  {progress.total_xp}
                </div>
                <p className="text-sm text-gray-600">Total XP</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.level_progress_percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">🔥 {progress.current_streak}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">📚 {progress.total_sessions}</div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">📝 {progress.total_words_learned}</div>
                <div className="text-xs text-gray-600">Words Learned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  🗣️ {progress.best_fluency_score.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">Best Fluency</div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <motion.button
              key={cat.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.icon} {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement, index) => {
              const colors = getBadgeColor(achievement.badge_color);
              const isLocked = !achievement.is_unlocked;

              return (
                <motion.div
                  key={achievement.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 rounded-xl border-2 ${
                    isLocked
                      ? "bg-gray-50 border-gray-200"
                      : `bg-gradient-to-br from-white to-${achievement.badge_color}-50 border-${achievement.badge_color}-200 ${colors.glow} shadow-lg`
                  }`}
                >
                  {/* NEW Badge */}
                  {achievement.is_new && (
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg"
                    >
                      NEW!
                    </motion.div>
                  )}

                  {/* Badge Icon */}
                  <div
                    className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
                      isLocked ? "bg-gray-300 opacity-40" : colors.bg + " shadow-lg"
                    }`}
                  >
                    {isLocked ? <LockClosedIcon className="w-8 h-8 text-gray-500" /> : achievement.badge_icon}
                  </div>

                  {/* Title */}
                  <h3
                    className={`font-bold text-sm text-center mb-1 ${
                      isLocked ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {achievement.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-xs text-center mb-2 ${
                      isLocked ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {achievement.description}
                  </p>

                  {/* XP Reward */}
                  <div
                    className={`text-center text-xs font-semibold ${
                      isLocked ? "text-gray-400" : "text-blue-600"
                    }`}
                  >
                    +{achievement.xp_reward} XP
                  </div>

                  {/* Share Button */}
                  {!isLocked && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShare(achievement)}
                      className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No achievements in this category yet.</p>
          </div>
        )}
      </motion.div>

      {/* Achievement Unlocked Modal */}
      <AchievementUnlockedModal
        achievements={newAchievements}
        isOpen={showUnlockedModal}
        onClose={() => {
          setShowUnlockedModal(false);
          // Mark as viewed
          newAchievements.forEach((a) => {
            fetch("/api/user-achievements", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ achievementId: a.id }),
            });
          });
          fetchData(); // Refresh to clear "NEW" badges
        }}
        onShare={handleShare}
      />
    </>
  );
}
