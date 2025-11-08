"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChatBubbleOvalLeftIcon, FlagIcon, DocumentTextIcon, LightBulbIcon, MicrophoneIcon, BookOpenIcon, InformationCircleIcon, SparklesIcon } from "@/components/Icons";
import Link from "next/link";

interface SkillCard {
  title: string;
  score: number;
  maxScore: number;
  lastWeekScore: number;
  trend: "up" | "down" | "stable";
  tip: string;
  explanation: string;
  improveLink: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  progressColor: string;
  circleColor: string;
}

const skillsData: SkillCard[] = [
  {
    title: "Fluency",
    score: 7.9,
    maxScore: 10,
    lastWeekScore: 7.6,
    trend: "up",
    tip: "Try longer sentences today!",
    explanation: "Fluency measures how smoothly and naturally you speak without long pauses or hesitations.",
    improveLink: "/record",
    icon: ChatBubbleOvalLeftIcon,
    color: "text-blue-600",
    borderColor: "border-blue-500",
    progressColor: "bg-blue-500",
    circleColor: "stroke-blue-500"
  },
  {
    title: "Confidence",
    score: 8.2,
    maxScore: 10,
    lastWeekScore: 7.8,
    trend: "up",
    tip: "Great progress this week!",
    explanation: "Confidence reflects your self-assurance and clarity when speaking, measured through tone and delivery.",
    improveLink: "/challenges",
    icon: FlagIcon,
    color: "text-orange-600",
    borderColor: "border-orange-500",
    progressColor: "bg-orange-500",
    circleColor: "stroke-orange-500"
  },
  {
    title: "Grammar",
    score: 7.5,
    maxScore: 10,
    lastWeekScore: 7.5,
    trend: "stable",
    tip: "Practice complex tenses.",
    explanation: "Grammar accuracy tracks how correctly you use sentence structures, verb tenses, and word forms.",
    improveLink: "/grammar-quiz",
    icon: DocumentTextIcon,
    color: "text-purple-600",
    borderColor: "border-purple-500",
    progressColor: "bg-purple-500",
    circleColor: "stroke-purple-500"
  },
  {
    title: "Vocabulary",
    score: 6.8,
    maxScore: 10,
    lastWeekScore: 7.2,
    trend: "down",
    tip: "Learn 5 new words daily.",
    explanation: "Vocabulary measures the range and appropriateness of words you use in conversation.",
    improveLink: "/vocabulary",
    icon: BookOpenIcon,
    color: "text-green-600",
    borderColor: "border-green-500",
    progressColor: "bg-green-500",
    circleColor: "stroke-green-500"
  },
  {
    title: "Pronunciation",
    score: 8.5,
    maxScore: 10,
    lastWeekScore: 8.3,
    trend: "up",
    tip: "Excellent clarity!",
    explanation: "Pronunciation evaluates how clearly you articulate sounds, words, and intonation patterns.",
    improveLink: "/record",
    icon: MicrophoneIcon,
    color: "text-pink-600",
    borderColor: "border-pink-500",
    progressColor: "bg-pink-500",
    circleColor: "stroke-pink-500"
  }
];

// Circular Progress Component
function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 8,
  circleColor = "stroke-blue-500"
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={circleColor}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Percentage text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-800">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// Tooltip Component
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg"
        >
          <div className="text-center">{text}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </motion.div>
      )}
    </div>
  );
}

export default function SkillSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {skillsData.map((skill, index) => {
        const IconComponent = skill.icon;
        const percentage = (skill.score / skill.maxScore) * 100;
        const weekChange = skill.score - skill.lastWeekScore;
        const weekChangePercent = ((weekChange / skill.lastWeekScore) * 100).toFixed(0);

        return (
          <motion.div
            key={skill.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            {/* Header with Tooltip */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-11 h-11 border-2 ${skill.borderColor} rounded-xl flex items-center justify-center ${skill.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-base font-bold text-gray-800">{skill.title}</h3>
                    <Tooltip text={skill.explanation}>
                      <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Progress and Score */}
            <div className="flex items-center justify-center mb-4">
              <CircularProgress
                percentage={percentage}
                size={90}
                strokeWidth={8}
                circleColor={skill.circleColor}
              />
            </div>

            {/* Score Detail */}
            <div className="text-center mb-3">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold text-gray-900">{skill.score}</span>
                <span className="text-base text-gray-400">/ {skill.maxScore}</span>
              </div>
            </div>

            {/* Week-over-Week Comparison */}
            <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-gray-100">
              {weekChange !== 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    weekChange > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {weekChange > 0 ? (
                    <>
                      <span>↑</span>
                      <span>+{Math.abs(weekChange).toFixed(1)}</span>
                    </>
                  ) : (
                    <>
                      <span>↓</span>
                      <span>-{Math.abs(weekChange).toFixed(1)}</span>
                    </>
                  )}
                  <span className="text-gray-500">vs last week</span>
                </motion.div>
              )}
              {weekChange === 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600">
                  <span>→</span>
                  <span>No change</span>
                </div>
              )}
            </div>

            {/* Tip */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-start gap-2">
              <LightBulbIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                {skill.tip}
              </p>
            </div>

            {/* Improve Button */}
            <Link href={skill.improveLink}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all border-2 ${skill.borderColor} ${skill.color} bg-white hover:${skill.progressColor} hover:text-white`}
              >
                <SparklesIcon className="w-4 h-4" />
                Improve {skill.title}
              </motion.button>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
