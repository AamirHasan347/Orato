"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, SparklesIcon, ShareIcon } from "@heroicons/react/24/solid";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  xp_reward: number;
}

interface Props {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
  onShare: (achievement: Achievement) => void;
}

export default function AchievementUnlockedModal({ achievements, isOpen, onClose, onShare }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen && achievements.length > 0) {
      setCurrentIndex(0);
      setShowConfetti(true);

      // Set window size for confetti
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, achievements]);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      onClose();
    }
  };

  const handleShare = () => {
    onShare(achievements[currentIndex]);
  };

  if (!isOpen || achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      bronze: "from-amber-600 to-amber-800",
      silver: "from-gray-300 to-gray-500",
      gold: "from-yellow-400 to-yellow-600",
      platinum: "from-purple-400 to-purple-600",
    };
    return colors[color] || colors.bronze;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
            />
          )}

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
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>

              {/* Achievement Count */}
              {achievements.length > 1 && (
                <div className="text-center mb-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    {currentIndex + 1} / {achievements.length}
                  </span>
                </div>
              )}

              {/* Sparkles */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-8 left-8"
              >
                <SparklesIcon className="w-8 h-8 text-yellow-400" />
              </motion.div>
              <motion.div
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-8 right-16"
              >
                <SparklesIcon className="w-6 h-6 text-purple-400" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text"
              >
                Achievement Unlocked!
              </motion.h2>

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
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${getBadgeColor(
                    currentAchievement.badge_color
                  )} blur-2xl opacity-60`}
                />

                {/* Badge */}
                <div
                  className={`relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getBadgeColor(
                    currentAchievement.badge_color
                  )} flex items-center justify-center text-6xl shadow-2xl`}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {currentAchievement.badge_icon}
                  </motion.div>
                </div>

                {/* Particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * Math.PI * 2) / 8) * 100,
                      y: Math.sin((i * Math.PI * 2) / 8) * 100,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
              </motion.div>

              {/* Achievement Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentAchievement.title}</h3>
                <p className="text-gray-600 mb-4">{currentAchievement.description}</p>

                {/* XP Reward */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    delay: 0.7,
                  }}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg shadow-lg"
                >
                  +{currentAchievement.xp_reward} XP
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ShareIcon className="w-5 h-5" />
                  Share
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  {currentIndex < achievements.length - 1 ? "Next" : "Awesome!"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
