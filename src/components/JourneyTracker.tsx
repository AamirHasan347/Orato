"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CalendarIcon, FlagIcon, ChatBubbleBottomCenterTextIcon } from "@/components/Icons";

export default function JourneyTracker() {
  const router = useRouter();
  const currentDay = 7;
  const totalDays = 30;
  const progressPercentage = (currentDay / totalDays) * 100;
  const todaysFocus = "Practice pronunciation with tongue twisters";
  const motivationalQuote = "Every word you speak is a step towards fluency.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your 30-Day English Journey</h2>
            <p className="text-sm text-gray-600">Day {currentDay} / {totalDays} Completed ✅</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className="h-full bg-blue-500 rounded-full shadow-sm"
          />
        </div>
      </div>

      {/* Today's Focus Card */}
      <div className="bg-blue-50 rounded-xl p-5 mb-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <FlagIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">Today&apos;s Focus</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{todaysFocus}</p>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-orange-50 rounded-xl p-5 mb-6 border-l-4 border-orange-500">
        <div className="flex items-start gap-3">
          <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-700 italic text-sm leading-relaxed">
              &quot;{motivationalQuote}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* View Roadmap Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/roadmap')}
        className="w-full px-6 py-3 bg-[#0088FF] text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
      >
        View Full Roadmap
      </motion.button>
    </motion.div>
  );
}
