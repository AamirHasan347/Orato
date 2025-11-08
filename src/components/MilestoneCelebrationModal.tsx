"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, TrophyIcon, SparklesIcon, FireIcon } from "@heroicons/react/24/solid";

interface Milestone {
  id: string;
  milestone_day: number;
  reached: boolean;
  reached_at: string | null;
}

interface Props {
  milestone: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MilestoneCelebrationModal({ milestone, isOpen, onClose }: Props) {
  if (!milestone) return null;

  const getMilestoneData = (day: number) => {
    const data: Record<number, { title: string; message: string; icon: string; color: string }> = {
      7: {
        title: "🎉 7-Day Milestone!",
        message: "Incredible! You've completed your first week. You're building an amazing learning habit!",
        icon: "🔥",
        color: "from-orange-400 to-red-500",
      },
      15: {
        title: "🌟 Halfway There!",
        message: "You're at the halfway point! Your dedication is paying off. Keep up the fantastic work!",
        icon: "⭐",
        color: "from-yellow-400 to-orange-500",
      },
      30: {
        title: "🏆 30-Day Champion!",
        message: "Congratulations! You've completed your 30-day journey. You should be incredibly proud of yourself!",
        icon: "👑",
        color: "from-purple-400 to-pink-500",
      },
    };

    return data[day] || data[7];
  };

  const milestoneData = getMilestoneData(milestone.milestone_day);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-100 to-pink-100 opacity-50"></div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>

              {/* Sparkles Decoration */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 left-8 z-0"
              >
                <SparklesIcon className="w-8 h-8 text-yellow-400 opacity-70" />
              </motion.div>
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 right-16 z-0"
              >
                <SparklesIcon className="w-6 h-6 text-purple-400 opacity-70" />
              </motion.div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-8 left-16 z-0"
              >
                <SparklesIcon className="w-7 h-7 text-pink-400 opacity-70" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                {/* Trophy Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="relative my-8"
                >
                  {/* Glow Effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${milestoneData.color} blur-3xl opacity-60`}
                  />

                  {/* Icon */}
                  <div
                    className={`relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${milestoneData.color} flex items-center justify-center text-6xl shadow-2xl`}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {milestoneData.icon}
                    </motion.div>
                  </div>

                  {/* Radiating Particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos((i * Math.PI * 2) / 8) * 120,
                        y: Math.sin((i * Math.PI * 2) / 8) * 120,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full"
                    />
                  ))}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-3xl font-bold text-center mb-3 bg-gradient-to-r ${milestoneData.color} text-transparent bg-clip-text`}
                >
                  {milestoneData.title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-700 text-center mb-6 leading-relaxed"
                >
                  {milestoneData.message}
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6"
                >
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{milestone.milestone_day}</div>
                      <div className="text-sm text-gray-600">Days</div>
                    </div>
                    <div className="w-px h-12 bg-gray-300"></div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FireIcon className="w-8 h-8 text-orange-500" />
                        <span className="text-3xl font-bold text-orange-600">{milestone.milestone_day}</span>
                      </div>
                      <div className="text-sm text-gray-600">Streak</div>
                    </div>
                    <div className="w-px h-12 bg-gray-300"></div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrophyIcon className="w-8 h-8 text-yellow-500" />
                        <span className="text-3xl font-bold text-yellow-600">
                          {milestone.milestone_day * 50}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Bonus XP</div>
                    </div>
                  </div>
                </motion.div>

                {/* Quote */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 bg-white rounded-lg border-l-4 border-purple-400 mb-6"
                >
                  <p className="text-sm text-gray-700 italic">
                    {milestone.milestone_day === 7 && (
                      <>
                        "Success is the sum of small efforts repeated day in and day out." - Robert Collier
                      </>
                    )}
                    {milestone.milestone_day === 15 && (
                      <>
                        "The expert in anything was once a beginner." - Helen Hayes
                      </>
                    )}
                    {milestone.milestone_day === 30 && (
                      <>
                        "The beautiful thing about learning is that no one can take it away from you." - B.B. King
                      </>
                    )}
                  </p>
                </motion.div>

                {/* Continue Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${milestoneData.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow`}
                >
                  {milestone.milestone_day === 30 ? "View Summary" : "Continue Journey"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
